import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!)

export default async function handler(req: Request) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return new Response('Missing id', { status: 400 })
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
  if (error) return new Response(error.message, { status: 400 })
  return Response.json(data)
}
