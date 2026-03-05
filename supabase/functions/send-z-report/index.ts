import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 1. Pull the "Gold" from our Midnight View
  const { data: report, error } = await supabase
    .from('daily_z_report')
    .select('*')
    .single()

  if (error || !report) return new Response('Refinery Empty or No Sales Today', { status: 404 })

  // 2. The Resend Dispatch (The Courier)
  // UPDATED: Using verified contact.momangio.co.uk domain to bypass sandbox restrictions
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
    },
    body: JSON.stringify({
      from: 'Mo Mangio Reports <reports@contact.momangio.co.uk>',
      to: ['director@momangio.co.uk'], 
      subject: `Z-Report: ${report.shift_date}`,
      text: `
        MO' MANGIO! - MIDNIGHT Z-REPORT [${report.shift_date}]
        -------------------------------------------
        GROSS REVENUE:   £${report.gross_revenue.toFixed(2)}
        VAT (20%):       £${report.vat_collected.toFixed(2)}
        TIPS:            £${report.tips_total.toFixed(2)}
        -------------------------------------------
        CASH IN DRAWER:  £${report.total_cash.toFixed(2)}
        CARD TERMINAL:   £${report.total_card.toFixed(2)}
        ATOA (0.7%):     £${report.total_atoa.toFixed(2)}
        -------------------------------------------
        MARGIN RECAPTURED: £${report.margin_recaptured.toFixed(2)}
      `,
    }),
  })

  return new Response(JSON.stringify({ sent: res.ok }), { headers: { 'Content-Type': 'application/json' } })
})