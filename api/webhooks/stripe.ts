import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export const config = { runtime: 'edge' } as const

export default async function handler(req: Request) {
  const sig = req.headers.get('stripe-signature')
  if (!sig) return new Response('Missing signature', { status: 400 })
  const body = await req.text()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
  // Handle events
  switch (event.type) {
    case 'checkout.session.completed':
      // TODO: mark user as active in your DB (customer id in event.data)
      break
  }
  return new Response('ok')
}
