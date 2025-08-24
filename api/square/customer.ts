import { Client, Environment } from '@square/square'

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment: (process.env.SQUARE_ENVIRONMENT === 'sandbox' ? Environment.Sandbox : Environment.Production)
})

export default async function handler(req: Request){
  const url = new URL(req.url)
  const email = url.searchParams.get('email')
  if (!email) return new Response('Missing email', { status: 400 })

  // Search existing
  const search = await client.customersApi.searchCustomers({ query: { filter: { emailAddress: { exact: email } } } })
  const found = search.result.customers?.[0]
  if (found) return Response.json(found)

  const created = await client.customersApi.createCustomer({ emailAddress: email })
  return Response.json(created.result.customer)
}
