import { createClient, SupabaseClient } from '@supabase/supabase-js'


export const getSupabaseServiceClient = (): SupabaseClient => {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ?? "");
}

export const addActivityLogs = async (message: string, ref: string, refId: string) => {
    const supabase = getSupabaseServiceClient();
    await supabase.from("activity_logs").insert({
        message,
        ref,
        ref_id: refId
    });
}
