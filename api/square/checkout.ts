import { Client, Environment } from '@square/square'

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment: (process.env.SQUARE_ENVIRONMENT === 'sandbox' ? Environment.Sandbox : Environment.Production)
})

export default async function handler(req: Request){
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const { amount, name, email } = await req.json()
  if (!amount || !name) return new Response('Missing amount or name', { status: 400 })

  const idempotencyKey = crypto.randomUUID()
  const locationId = process.env.SQUARE_LOCATION_ID!

  const { result } = await client.checkoutApi.createPaymentLink({
    idempotencyKey,
    quickPay: {
      name: name,
      priceMoney: { amount: BigInt(amount), currency: 'USD' },
      locationId,
      // optional: add customer email for receipts
      customerEmail: email
    }
  })

  return Response.json({ url: result.paymentLink?.url })
}
