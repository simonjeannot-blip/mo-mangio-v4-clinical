import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 1. ANCHOR: Filter for the full 24h cycle (The Lunch + Dinner Gold)
  const today = new Date().toISOString().split('T')[0];
  
  const { data: sales, error } = await supabase
    .from('financial_ledger')
    .select('*')
    .gte('created_at', `${today}T00:00:00Z`)
    .lte('created_at', `${today}T23:59:59Z`);

  if (error || !sales || sales.length === 0) {
    return new Response(JSON.stringify({ message: 'Refinery Empty: No Sales Recorded Today' }), { status: 200 });
  }

  // 2. AGGREGATION: The Absolute Truth Protocol
  const totals = sales.reduce((acc, sale) => {
    acc.gross += Number(sale.gross_amount || 0);
    acc.vat += Number(sale.vat_amount || 0);
    // Directly extraction of Atoa/Card/Cash from the V4.3 metadata split
    acc.atoa += Number(sale.metadata?.split?.atoa || 0);
    acc.card += Number(sale.metadata?.split?.card || 0);
    acc.cash += Number(sale.metadata?.split?.cash || 0);
    acc.tips += Number(sale.metadata?.split?.tips || 0);
    return acc;
  }, { gross: 0, vat: 0, atoa: 0, card: 0, cash: 0, tips: 0 });

  // 3. DISPATCH: The Sovereign Courier via Verified Resend Pipe
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
    },
    body: JSON.stringify({
      from: 'Mo Mangio Sentinel <reports@contact.momangio.co.uk>',
      to: [Deno.env.get('REPORT_RECIPIENT') || 'director@momangio.co.uk'], 
      subject: `Z-REPORT: ${today} | GOLD SECURED`,
      html: `
        <div style="font-family: monospace; background: #1A1A1A; color: white; padding: 30px; border: 1px solid #00CC66;">
          <h2 style="color: #00CC66; margin-top: 0;">DAILY REFINERY SUMMARY</h2>
          <p style="color: #666; font-size: 12px;">DATE: ${today}</p>
          <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;" />
          
          <div style="font-size: 16px; margin-bottom: 20px;">
            <p>GROSS REVENUE: <span style="color: #00CC66; font-weight: bold;">£${totals.gross.toFixed(2)}</span></p>
            <p>VAT COLLECTED: £${totals.vat.toFixed(2)}</p>
            <p>TIPS RECORDED: £${totals.tips.toFixed(2)}</p>
          </div>
          
          <div style="background: #000; padding: 15px; border-left: 3px solid #00CC66;">
            <p style="margin: 5px 0;">ATOA (OIL): £${totals.atoa.toFixed(2)}</p>
            <p style="margin: 5px 0;">CARD: £${totals.card.toFixed(2)}</p>
            <p style="margin: 5px 0;">CASH: £${totals.cash.toFixed(2)}</p>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;" />
          <p style="font-size: 10px; color: #444;">ABSOLUTE TRUTH PROTOCOL V4.3-CLINICAL | LOCAL-FIRST | GDPR COMPLIANT</p>
        </div>
      `,
    }),
  })

  return new Response(JSON.stringify({ sent: res.ok }), { headers: { 'Content-Type': 'application/json' } })
})