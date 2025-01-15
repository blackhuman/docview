import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function getCookies() {
  try {
    return await cookies()
  } catch {
    console.warn('first build, cookies not available')
  }
}

export async function createClient() {
  const cookieStore = await getCookies()
  if (!cookieStore) return

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function getUserId() {
  const supabase = await createClient()
  if (!supabase) return
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id
}