import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { getAllPosts } from '@/lib/blog'

function fmtDate(d: string) {
  const dt = new Date(d)
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function BlogPost() {
  const { slug } = useParams()
  const post = getAllPosts().find(p => p.slug === slug)

  if (!post) {
    return (
      <main className="container-padded py-10">
        <h1 className="text-2xl font-bold mb-2">Post not found</h1>
        <p className="opacity-80">We couldn’t find that article.</p>
        <Link to="/blog" className="btn mt-4">Back to Blog</Link>
      </main>
    )
  }

  return (
    <main className="container-padded py-10 prose prose-invert max-w-3xl">
      <h1 className="!mb-2">{post.title}</h1>

      {/* Only render <time> if a date exists; TS narrows to string here */}
      {post.date && (
        <p className="text-sm opacity-70 !mt-0">
          <time dateTime={post.date}>{fmtDate(post.date)}</time>
        </p>
      )}

      {post.excerpt && <p className="lead">{post.excerpt}</p>}

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap', properties: { className: ['no-underline'] } }]
        ]}
      >
        {post.content}
      </ReactMarkdown>
    </main>
  )
}

