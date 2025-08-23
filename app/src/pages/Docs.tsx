import DocsContent from '../content/Financial Recovery and Credit Rebuilding.md'

export default function Docs() {
  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Docs</h1>
      <article className="prose dark:prose-invert max-w-none">
        <DocsContent />
      </article>
    </main>
  )
}
