import Seo from '@/seo/Seo'

export default function Contact(){
  return (
    <main className="container-padded py-10">
      <Seo title="Contact" description="Get in touch with the Fynix team." />
      <h1 className="text-3xl font-bold mb-4">Contact</h1>
      <p className="text-slate-300">Email: support@fynix.app</p>
    </main>
  )
}
