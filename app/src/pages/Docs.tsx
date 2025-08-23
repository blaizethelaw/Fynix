import { Link, useParams, Navigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { useMemo } from 'react'

// Raw‑load both docs from the monorepo root docs/ folder
import planning from '../../../docs/financial-planning-for-difficult-situations.mdx?raw'
import recovery from '../../../docs/financial-recovery-and-credit-rebuilding.mdx?raw'

type Doc = { slug: string; title: string; content: string }

const docs: Doc[] = [
  {
    slug: 'financial-planning-for-difficult-situations',
    title: 'Financial Planning for Difficult Situations',
    content: planning
  },
  {
    slug: 'financial-recovery-and-credit-rebuilding',
    title: 'Financial Recovery and Credit Rebuilding',
    content: recovery
  }
]

const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/\*+/g, '')
    .replace(/[`~]+/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // [text](url) → text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // ![alt](url) → alt
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export default function Docs() {
  const { slug } = useParams()
  const current = docs.find((d) => d.slug === slug) ?? docs[0]

  const toc = useMemo(() => {
    const regex = /^(##|###)\s+(.*)$/gm
    const items: { id: string; text: string; level: number }[] = []
    let match: RegExpExecArray | null
    while ((match = regex.exec(current.content)) !== null) {
      const level = match[1] === '##' ? 2 : 3
      const raw = match[2].trim()
      const text = raw
        .replace(/^\*{1,3}(.*?)\*{1,3}$/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/`/g, '')
      items.push({ id: slugify(text), text, level })
    }
    return items
  }, [current.content])

  if (!slug || !docs.find((d) => d.slug === slug)) {
    return <Navigate to={`/docs/${current.slug}`} replace />
  }

  return (
    <div className="flex">
      <aside className="w-64 p-4 border-r">
        <h2 className="font-semibold mb-2">Docs</h2>
        <nav className="flex flex-col gap-2 text-sm">
          {docs.map((d) => (
            <Link
              key={d.slug}
              to={`/docs/${d.slug}`}
              className={d.slug === current.slug ? 'font-semibold' : ''}
            >
              {d.title}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-4">
        <nav className="mb-6">
          <h3 className="font-semibold mb-2">On this page</h3>
          <ul className="text-sm space-y-1">
            {toc.map((item) => (
              <li key={item.id} className={item.level === 3 ? 'ml-4' : ''}>
                <a href={`#${item.id}`} className="hover:underline">
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <article className="prose dark:prose-invert max-w-none prose-img:rounded-lg prose-img:shadow-md">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[
              rehypeSlug,
              [
                rehypeAutolinkHeadings,
                { behavior: 'wrap', properties: { className: ['no-underline'] } }
              ]
            ]}
          >
            {current.content}
          </ReactMarkdown>
        </article>
      </main>
    </div>
  )
}
