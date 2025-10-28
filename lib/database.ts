import { createClient, SupabaseClient } from '@supabase/supabase-js'


export const getSupabaseServiceClient = (): SupabaseClient => {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ?? "");
}
