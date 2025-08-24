import { Helmet } from 'react-helmet-async'

export default function Seo({ title, description, image = '/marketing/og-hero.svg', url }: {
  title: string
  description: string
  image?: string
  url?: string
}){
  const t = title ? `${title} — Fynix` : 'Fynix'
  return (
    <Helmet>
      <title>{t}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={t} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      {url && <meta property="og:url" content={url} />}
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  )
}
