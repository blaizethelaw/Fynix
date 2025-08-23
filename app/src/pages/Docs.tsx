import { useParams } from 'react-router-dom'

export default function Docs() {
  const { slug } = useParams()
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">{slug ? `Docs: ${slug}` : 'Docs'}</h1>
    </div>
  )
}
