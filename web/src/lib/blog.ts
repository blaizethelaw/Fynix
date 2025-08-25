import matter from 'gray-matter'

export type Post = {
  slug: string
  title: string
  date?: string
  excerpt?: string
  content: string
}

export function getAllPosts(): Post[] {
  const files = import.meta.glob('../content/blog/**/*.{md,mdx}', {
    eager: true,
    query: '?raw',
    import: 'default'
  }) as Record<string, string>

  const rows: Post[] = []
  for (const [path, raw] of Object.entries(files)) {
    if (typeof raw !== 'string') continue
    const slug = path.split('/').pop()!.replace(/\.(md|mdx)$/i, '')
    const { data, content } = matter(raw)
    rows.push({
      slug,
      title: String((data as any)?.title ?? slug),
      date: (data as any)?.date ? String((data as any).date) : undefined,
      excerpt: (data as any)?.excerpt ? String((data as any).excerpt) : undefined,
      content
    })
  }
  return rows.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}

