import { Link, useParams, Navigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import planning from '../../../docs/financial-planning-for-difficult-situations.mdx?raw'
import recovery from '../../../docs/financial-recovery-and-credit-rebuilding.mdx?raw'
import { useMemo, type ReactNode, type ElementType } from 'react'

const docs = [
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
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

function Heading({ level, children }: { level: number; children?: ReactNode }) {
  const Tag = (`h${level}` as ElementType)
  const id = slugify(String(children))
  return <Tag id={id}>{children}</Tag>
}

export default function Docs() {
  const { slug } = useParams()
  const current = docs.find((d) => d.slug === slug) ?? docs[0]
  const toc = useMemo(() => {
    const regex = /^(##|###)\s+(.*)$/gm
    const items: { id: string; text: string; level: number }[] = []
    let match
    while ((match = regex.exec(current.content)) !== null) {
      const level = match[1] === '##' ? 2 : 3
      const text = match[2].trim()
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
        <article className="prose max-w-none">
          <ReactMarkdown
            components={{
              h2: (props) => <Heading level={2} {...props} />,
              h3: (props) => <Heading level={3} {...props} />
            }}
          >
            {current.content}
          </ReactMarkdown>
        </article>
      </main>
    </div>
  )
}

