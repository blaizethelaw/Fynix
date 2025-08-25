import matter from 'gray-matter'

export type Post = {
  slug: string
  title: string
  date?: string
  excerpt?: string
  content: string
}

/**
 * Loads markdown/MDX files as raw strings and parses front-matter.
 * Works entirely in the browser (no Node Buffer/vfile).
 * If the blog folder doesn’t exist yet, returns [].
 */
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
      title: (data?.title as string) || slug,
      date: data?.date as string | undefined,
      excerpt: data?.excerpt as string | undefined,
      content
    })
  }
  return rows.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}
