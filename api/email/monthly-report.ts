import { Resend } from 'resend'
import { renderToStaticMarkup } from 'react-dom/server'
import { ReportEmail } from '../../emails/Report'

const resend = new Resend(process.env.RESEND_API_KEY!)

export default async function handler(req: Request) {
  const { to, title, summary } = await req.json()
  const html = renderToStaticMarkup(ReportEmail({ title, summary }))
  const { error } = await resend.emails.send({ from: 'Fynix <reports@fynix.app>', to, subject: title, html })
  if (error) return new Response(error.message, { status: 400 })
  return new Response('sent')
}
