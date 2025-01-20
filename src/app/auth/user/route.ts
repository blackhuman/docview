import { createClient } from '@/app/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data } = await supabase!.auth.getUser()
  return NextResponse.json(data)
}