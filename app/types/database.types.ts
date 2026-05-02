/**
 * Supabase database types stub.
 * Replace with auto-generated types from `supabase gen types typescript`.
 */
export type Database = {
  public: {
    Tables: {
      darwin_events: {
        Row: {
          id: string
          darwin_id: string
          session_id: string
          neuron_id: string | null
          parent_event_id: string | null
          event_type: string
          payload: Record<string, unknown>
          timestamp_ms: number
          token_cost: number | null
          fiat_cost: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['darwin_events']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['darwin_events']['Row']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
