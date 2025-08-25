import { Link } from 'react-router-dom'
import Seo from '@/seo/Seo'
import { getAllPosts } from '@/lib/blog'

export default function Blog() {
  const posts = getAllPosts()
  return (
    <main className="container-padded py-10">
      <Seo title="Blog" description="Insights and tactics for financial transformation." />
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      <div className="space-y-4">
        {posts.map(p => (
          <article key={p.slug} className="card p-6">
            <h2 className="text-xl font-semibold"><Link to={`/blog/${p.slug}`}>{p.title}</Link></h2>
            <div className="text-slate-400 text-sm">{p.date ? new Date(p.date).toLocaleDateString() : ''}</div>
            <p className="text-slate-300 mt-1">{p.excerpt}</p>
            <Link className="btn-muted mt-3 inline-flex" to={`/blog/${p.slug}`}>Read →</Link>
          </article>
        ))}
      </div>
    </main>
  )
}
