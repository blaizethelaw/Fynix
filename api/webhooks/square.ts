import crypto from 'node:crypto'

// Square signs with HMAC-SHA1 of (notificationUrl + body) using the signature key
function verifySquareSignature(signature: string, body: string, url: string, key: string){
  const hmac = crypto.createHmac('sha1', key)
  hmac.update(url + body)
  const expected = hmac.digest('base64')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

export default async function handler(req: Request){
  const signature = req.headers.get('x-square-signature')
  const body = await req.text()
  if (!signature) return new Response('Missing signature', { status: 400 })

  const notifUrl = `${process.env.SITE_URL}/api/webhooks/square`
  const ok = verifySquareSignature(signature, body, notifUrl, process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!)
  if (!ok) return new Response('Invalid signature', { status: 400 })

  const evt = JSON.parse(body)
  // Handle a few common event types
  switch (evt.type) {
    case 'payment.created':
      // TODO: link to user via email or customer id if you store it
      break
    case 'payment.updated':
      break
  }
  return new Response('ok')
}
