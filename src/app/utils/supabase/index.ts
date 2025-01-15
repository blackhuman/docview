import { createClient as createServerClient } from './server'
import { createClient as createBrowserClient } from './client'
export { createServerClient, createBrowserClient }

export const supabaseBrowserClient = createBrowserClient()
export const supabaseServerClient = createServerClient()
