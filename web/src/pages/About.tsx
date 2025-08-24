import Seo from '@/seo/Seo'

export default function About(){
  return (
    <main className="container-padded py-10">
      <Seo title="About" description="The mission and principles behind Fynix." />
      <h1 className="text-3xl font-bold mb-4">About Fynix</h1>
      <p className="text-slate-300 max-w-3xl">Fynix helps people transform their financial lives with practical tools and clear guidance. We focus on clarity, control, and momentum.</p>
    </main>
  )
}
