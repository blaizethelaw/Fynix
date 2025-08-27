import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  useParams,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

// ---------- Load markdown content ----------
const md = import.meta.glob("../content/**/*.md", {
  as: "raw",
  eager: true,
}) as Record<string, string>;
const mdx = import.meta.glob("../content/**/*.mdx", {
  as: "raw",
  eager: true,
}) as Record<string, string>;
const files = { ...md, ...mdx };

type Doc = {
  slug: string;
  title: string;
  content: string;
  headings: Heading[];
};
type Heading = { level: 2 | 3; text: string; id: string; line: number };

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[“”"']/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const toDocs = (m: Record<string, string>): Doc[] =>
  Object.entries(m)
    .map(([path, content]) => {
      const file = path.split("/").pop() ?? "";
      const slug = file.replace(/\.(md|mdx)$/i, "");
      const title = content.match(/^#\s+(.+?)\s*$/m)?.[1] ?? slug;
      const headings: Heading[] = content
        .split("\n")
        .map((line, i) => ({ line: i, raw: line }))
        .filter(({ raw }) => /^#{2,3}\s+/.test(raw))
        .map(({ raw, line }) => {
          const level = (raw.startsWith("###") ? 3 : 2) as 2 | 3;
          const text = raw.replace(/^#{2,3}\s+/, "").trim();
          return { level, text, id: slugify(text), line };
        });
      return { slug, title, content, headings };
    })
    .sort((a, b) => a.title.localeCompare(b.title));

const docs: Doc[] = toDocs(files);

// ---------- Lightweight Search ----------
type SearchHit = {
  slug: string;
  title: string;
  score: number;
  anchor?: string;
  snippetHtml: string;
};

const tokenize = (q: string) =>
  q
    .toLowerCase()
    .trim()
    .split(/[\s\/\\-]+/)
    .filter(Boolean);

function searchDocs(query: string, limit = 20): SearchHit[] {
  const terms = tokenize(query);
  if (!terms.length) return [];
  const hits: SearchHit[] = [];

  for (const d of docs) {
    const titleLower = d.title.toLowerCase();
    const body = d.content;
    const lower = body.toLowerCase();

    let score = 0;
    let bestIdx = -1;

    // term scoring
    for (const t of terms) {
      const inTitle = titleLower.includes(t);
      if (inTitle) score += 5;

      // count occurrences in body
      let idx = lower.indexOf(t);
      while (idx !== -1) {
        score += 1;
        if (bestIdx === -1) bestIdx = idx;
        idx = lower.indexOf(t, idx + t.length);
      }
    }

    // phrase boost
    const phrase = terms.join(" ");
    const phraseIdx = lower.indexOf(phrase);
    if (phraseIdx !== -1) {
      score += 10;
      bestIdx = phraseIdx;
    }

    if (score <= 0) continue;

    // Find nearest previous heading for anchor
    const { anchor, snippetHtml } = buildSnippetAndAnchor(d, bestIdx, terms);

    hits.push({
      slug: d.slug,
      title: d.title,
      score,
      anchor,
      snippetHtml,
    });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

function buildSnippetAndAnchor(doc: Doc, bestIdx: number, terms: string[]) {
  const content = doc.content;
  const lower = content.toLowerCase();

  const start = Math.max(0, bestIdx - 120);
  const end = Math.min(content.length, bestIdx + 240);
  let snippet = content.slice(start, end).replace(/\n+/g, " ");
  if (start > 0) snippet = "\u2026 " + snippet;
  if (end < content.length) snippet = snippet + " \u2026";

  // Highlight terms in snippet (safe subset)
  const esc = (s: string) =>
    s.replace(
      /[&<>"']/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[m]!,
    );
  let snippetHtml = esc(snippet);
  for (const t of [...new Set(terms)]) {
    const re = new RegExp(
      `(${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    snippetHtml = snippetHtml.replace(re, "<mark>$1</mark>");
  }

  // Anchor: find nearest heading above the match
  const pre = lower.slice(0, bestIdx);
  const linesBefore = pre.split("\n").length - 1;
  const h = [...doc.headings]
    .filter((hh) => hh.line <= linesBefore)
    .sort((a, b) => b.line - a.line)[0];
  const anchor = h ? h.id : undefined;

  return { anchor, snippetHtml };
}

// ---------- Component ----------
type TocItem = { id: string; text: string; level: 2 | 3 };

export default function DocsPage() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  if (!docs.length)
    return (
      <main className="p-6">
        No docs found in <code>src/content</code>.
      </main>
    );

  const current = docs.find((d) => d.slug === slug) ?? docs[0];

  const articleRef = useRef<HTMLElement | null>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [active, setActive] = useState<string>("");

  // Mobile panes: 'none' | 'list' | 'toc'
  const [mobilePane, setMobilePane] = useState<"none" | "list" | "toc">("none");

  // Local sidebar filter (left column list)
  const [filter, setFilter] = useState("");

  // Global Search overlay
  const [showSearch, setShowSearch] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);

  // Build ToC and scroll-spy
  useEffect(() => {
    const el = articleRef.current;
    if (!el) return;

    const headings = Array.from(
      el.querySelectorAll("h2, h3"),
    ) as HTMLHeadingElement[];
    const items = headings
      .filter((h) => h.id)
      .map((h) => ({
        id: h.id,
        text: h.textContent?.trim() || "",
        level: (h.tagName === "H2" ? 2 : 3) as 2 | 3,
      }));
    setToc(items);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).id;
            if (id) setActive(id);
          }
        });
      },
      { rootMargin: "-64px 0px -70% 0px", threshold: [0, 1.0] },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [current.slug, current.content]);

  // CMD/CTRL+K opens Search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Run search
  useEffect(() => {
    if (!showSearch) return;
    const q = searchQ.trim();
    if (!q) {
      setResults([]);
      return;
    }
    setResults(searchDocs(q));
  }, [showSearch, searchQ]);

  // Highlight terms in-page if ?q= is present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q");
    const el = articleRef.current;
    if (!el) return;

    // clear previous <mark>
    el.querySelectorAll('mark[data-hl="1"]').forEach((mk) => {
      const parent = mk.parentNode;
      if (!parent) return;
      parent.replaceChild(document.createTextNode(mk.textContent || ""), mk);
      parent.normalize();
    });

    if (!q) return;
    const terms = tokenize(q);
    if (!terms.length) return;

    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);

    for (const node of nodes) {
      const txt = node.nodeValue || "";
      let mutated = false;
      let frag = document.createDocumentFragment();
      let lastIndex = 0;

      const re = new RegExp(
        `(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
        "gi",
      );
      let m: RegExpExecArray | null;
      while ((m = re.exec(txt)) !== null) {
        mutated = true;
        const before = txt.slice(lastIndex, m.index);
        if (before) frag.appendChild(document.createTextNode(before));

        const mk = document.createElement("mark");
        mk.setAttribute("data-hl", "1");
        mk.textContent = m[0];
        frag.appendChild(mk);

        lastIndex = m.index + m[0].length;
      }
      if (!mutated) continue;

      const after = txt.slice(lastIndex);
      if (after) frag.appendChild(document.createTextNode(after));
      node.replaceWith(frag);
    }
  }, [location.search, current.slug]);

  // Redirect /docs -> first doc
  if (!slug || !docs.find((d) => d.slug === slug)) {
    return <Navigate to={`/docs/${current.slug}`} replace />;
  }

  const filteredDocs = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) || d.slug.toLowerCase().includes(q),
    );
  }, [filter]);

  // Open a search result
  const openResult = (hit: SearchHit) => {
    setShowSearch(false);
    const q = encodeURIComponent(searchQ.trim());
    const anchor = hit.anchor ? `#${hit.anchor}` : "";
    navigate(`/docs/${hit.slug}${anchor}?q=${q}`);
    setTimeout(() => {
      const targetId = hit.anchor;
      if (targetId) {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 60);
  };

  return (
    <div className="flex">
      {/* Left sidebar (docs list) */}
      <aside className="w-72 shrink-0 border-r hidden lg:block">
        <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="font-semibold">Docs</h2>
            <button
              onClick={() => setShowSearch(true)}
              className="ml-auto rounded-lg border border-white/15 bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
              title="Search (Ctrl/Cmd+K)"
            >
              Search
            </button>
          </div>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter list…"
            className="mb-3 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm outline-none focus:ring focus:ring-amber-400/20"
          />
          <nav className="flex flex-col gap-1 text-sm">
            {filteredDocs.map((d) => (
              <Link
                key={d.slug}
                to={`/docs/${d.slug}`}
                className={`rounded-lg px-2 py-1 hover:bg-white/5 ${d.slug === current.slug ? "bg-white/10 font-semibold" : ""}`}
              >
                {d.title}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 lg:p-6 lg:pl-8">
        {/* Mobile toolbar */}
        <div className="lg:hidden mb-4 flex gap-2">
          <button
            onClick={() =>
              setMobilePane((p) => (p === "list" ? "none" : "list"))
            }
            className={`rounded-xl border px-3 py-2 text-sm ${mobilePane === "list" ? "bg-white/15" : "bg-white/5"} border-white/15`}
          >
            Docs
          </button>
          <button
            onClick={() => setMobilePane((p) => (p === "toc" ? "none" : "toc"))}
            className={`rounded-xl border px-3 py-2 text-sm ${mobilePane === "toc" ? "bg-white/15" : "bg-white/5"} border-white/15`}
          >
            On this page
          </button>
          <button
            onClick={() => setShowSearch(true)}
            className="ml-auto rounded-xl border px-3 py-2 text-sm bg-white/5 border-white/15"
          >
            Search
          </button>
        </div>

        {/* Mobile panes (overlay) */}
        {mobilePane !== "none" && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60"
            onClick={() => setMobilePane("none")}
          >
            <div
              className="absolute bottom-0 left-0 right-0 rounded-t-2xl border-t border-white/15 bg-neutral-900 p-4 max-h-[70vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {mobilePane === "list" ? (
                <>
                  <div className="mb-3 flex items-center gap-2">
                    <h3 className="font-semibold">Docs</h3>
                    <button
                      onClick={() => setMobilePane("none")}
                      className="ml-auto rounded-lg border border-white/15 bg-white/10 px-2 py-1 text-xs"
                    >
                      Close
                    </button>
                  </div>
                  <input
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Filter list…"
                    className="mb-3 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm outline-none"
                  />
                  <nav className="flex flex-col gap-1 text-sm">
                    {filteredDocs.map((d) => (
                      <Link
                        key={d.slug}
                        to={`/docs/${d.slug}`}
                        onClick={() => setMobilePane("none")}
                        className={`rounded-lg px-2 py-1 hover:bg-white/5 ${d.slug === current.slug ? "bg-white/10 font-semibold" : ""}`}
                      >
                        {d.title}
                      </Link>
                    ))}
                  </nav>
                </>
              ) : (
                <>
                  <div className="mb-3 flex items-center gap-2">
                    <h3 className="font-semibold">On this page</h3>
                    <button
                      onClick={() => setMobilePane("none")}
                      className="ml-auto rounded-lg border border-white/15 bg-white/10 px-2 py-1 text-xs"
                    >
                      Close
                    </button>
                  </div>
                  {toc.length === 0 ? (
                    <p className="text-sm opacity-70">No sections.</p>
                  ) : (
                    <ul className="text-sm space-y-1">
                      {toc.map((item) => (
                        <li
                          key={item.id}
                          className={item.level === 3 ? "ml-4" : ""}
                        >
                          <a
                            href={`#${item.id}`}
                            onClick={() => setMobilePane("none")}
                            className={`inline-block rounded px-1 hover:underline ${active === item.id ? "font-semibold text-amber-200" : ""}`}
                          >
                            {item.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Desktop "On this page" */}
        <nav className="hidden lg:block mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold">On this page</h3>
            <button
              onClick={() => setShowSearch(true)}
              className="ml-auto rounded-lg border border-white/15 bg-white/10 px-2 py-1 text-xs"
            >
              Search (Ctrl/Cmd+K)
            </button>
          </div>
          {toc.length === 0 ? (
            <p className="text-sm opacity-70">No sections found.</p>
          ) : (
            <ul className="text-sm space-y-1">
              {toc.map((item) => (
                <li key={item.id} className={item.level === 3 ? "ml-4" : ""}>
                  <a
                    href={`#${item.id}`}
                    className={`inline-block rounded px-1 hover:underline ${active === item.id ? "font-semibold text-amber-200" : ""}`}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </nav>

        {/* Article */}
        <article
          ref={articleRef}
          className="prose dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-img:rounded-lg prose-img:shadow-md"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[
              rehypeSlug,
              [
                rehypeAutolinkHeadings,
                {
                  behavior: "wrap",
                  properties: { className: ["no-underline"], tabIndex: -1 },
                },
              ],
            ]}
          >
            {current.content}
          </ReactMarkdown>
        </article>
      </main>

      {/* ----- Global Search Overlay ----- */}
      {showSearch && (
        <div
          className="fixed inset-0 z-50 bg-black/70 p-4"
          onClick={() => setShowSearch(false)}
        >
          <div
            className="mx-auto max-w-3xl rounded-2xl border border-white/15 bg-neutral-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-white/10 p-3">
              <input
                autoFocus
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search all docs (title + body)…"
                className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm outline-none"
              />
              <button
                onClick={() => setShowSearch(false)}
                className="rounded-lg border border-white/15 bg-white/10 px-2 py-1 text-xs"
              >
                Esc
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-3">
              {!searchQ.trim() && (
                <p className="px-2 py-6 text-sm opacity-70">
                  Type to search across all documents. Use{" "}
                  <kbd className="rounded bg-white/10 px-1">Enter</kbd> to open.
                </p>
              )}
              {searchQ.trim() && results.length === 0 && (
                <p className="px-2 py-6 text-sm opacity-70">No results.</p>
              )}
              <ul className="space-y-3">
                {results.map((hit) => (
                  <li
                    key={`${hit.slug}-${hit.anchor ?? ""}`}
                    className="rounded-lg border border-white/10 bg-white/5 p-3 hover:bg-white/10"
                  >
                    <button
                      onClick={() => openResult(hit)}
                      className="text-left w-full"
                    >
                      <div className="text-sm font-semibold">
                        {hit.title}
                        {hit.anchor && (
                          <span className="opacity-70"> · #{hit.anchor}</span>
                        )}
                      </div>
                      <div
                        className="mt-1 text-sm opacity-90"
                        // snippet already escaped + marked
                        dangerouslySetInnerHTML={{ __html: hit.snippetHtml }}
                      />
                      <div className="mt-2 text-xs opacity-60">
                        /docs/{hit.slug}
                        {hit.anchor ? `#${hit.anchor}` : ""}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
