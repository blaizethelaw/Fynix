import matter from 'gray-matter'

export type Post = { slug: string; title: string; description: string; date: string; content: string }

const md = import.meta.glob('../content/blog/**/*.md', { as: 'raw', eager: true }) as Record<string, string>

export const posts: Post[] = Object.entries(md).map(([path, raw]) => {
  const { data, content } = matter(raw)
  const file = path.split('/').pop() || ''
  const slug = file.replace(/\.md$/i, '')
  return {
    slug,
    title: data.title || slug,
    description: data.description || '',
    date: data.date || new Date().toISOString(),
    content
  }
}).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
