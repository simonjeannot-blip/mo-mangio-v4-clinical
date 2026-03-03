import { createClient } from '@supabase/supabase-js';

// These must match your Supabase Project Settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function logSaleToSentinel(payload: any) {
  const { error } = await supabase
    .from('sales_ledger') // Ensure this table exists in your DB
    .insert([{
      id: crypto.randomUUID(),
      table_id: payload.tableId,
      items: payload.items,
      gross_total: payload.gross,
      vat_total: payload.vat,
      tips: payload.tips || 0,
      order_type: payload.orderType,
      timestamp: new Date().toISOString()
    }]);

  if (error) {
    console.error("SENTINEL SYNC FAILURE:", error);
    // FALLBACK: Save to a 'pending_sync' bucket in LocalStorage
    const pending = JSON.parse(localStorage.getItem('mm_pending_sync') || '[]');
    localStorage.setItem('mm_pending_sync', JSON.stringify([...pending, payload]));
    return false;
  }
  return true;
}