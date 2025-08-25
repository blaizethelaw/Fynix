import { useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Seo from '@/seo/Seo'
import { getAllPosts } from '@/lib/blog'

export default function BlogPost(){
  const { slug } = useParams()
  const post = getAllPosts().find(p => p.slug === slug)
  if (!post) return <main className="container-padded py-10">Not Found</main>
  return (
    <main className="container-padded py-10">
      <Seo title={post.title} description={post.excerpt} />
      <h1 className="text-3xl font-bold">{post.title}</h1>
      <div className="text-slate-400 text-sm mb-4">{post.date ? new Date(post.date).toLocaleDateString() : ''}</div>
      <article className="prose prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </article>
    </main>
  )
}
