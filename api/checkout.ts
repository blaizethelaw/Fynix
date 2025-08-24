import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export default async function handler(req: Request) {
  const { priceId = process.env.STRIPE_PRICE_BASIC, customerEmail } = await req.json()
  if (!priceId) return new Response('Missing priceId', { status: 400 })
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    success_url: `${process.env.SITE_URL}/?success=1`,
    cancel_url: `${process.env.SITE_URL}/?canceled=1`,
    customer_email: customerEmail,
    line_items: [{ price: priceId, quantity: 1 }]
  })
  return Response.json({ url: session.url })
}
