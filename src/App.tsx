import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import { X, Printer, CreditCard, Banknote, QrCode, ShieldCheck, Trash2, Utensils, ShoppingBag } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const DOJO_GREEN = "#00CC66";
const CHARCOAL = "#1A1A1A";
const SB_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(SB_URL, SB_KEY);

const TABLES = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
type HMRCTag = 'Revenue_Sales' | 'Revenue_Other' | 'Excluded_Tips';

interface MenuItem { id: string; name: string; price: number; profile: 'hot_food' | 'cold_food' | 'zero_rated'; category: string; hmrc_tag: HMRCTag; qty?: number; orderId?: string; }
interface TableState { id: string; transaction_id: string; table_status: string; orders: MenuItem[]; covers?: number; order_type: 'dine-in' | 'take-away'; }

const INITIAL_MENU: MenuItem[] = [
  { id: 's1', name: 'BRUSCHETTA', price: 4.40, profile: 'cold_food', category: 'STARTERS', hmrc_tag: 'Revenue_Sales' },
  { id: 's2', name: "MO' MANGIO! (VG)", price: 4.95, profile: 'cold_food', category: 'STARTERS', hmrc_tag: 'Revenue_Sales' },
  { id: 's3', name: 'PANZANELLA (V)', price: 4.95, profile: 'cold_food', category: 'STARTERS', hmrc_tag: 'Revenue_Sales' },
  { id: 's4', name: 'DA NORD A SUD', price: 5.45, profile: 'cold_food', category: 'STARTERS', hmrc_tag: 'Revenue_Sales' },
  { id: 's5', name: 'ROCKET SALAD (VG)', price: 6.50, profile: 'cold_food', category: 'STARTERS', hmrc_tag: 'Revenue_Sales' },
  { id: 's6', name: 'BURRATA (V)', price: 8.50, profile: 'cold_food', category: 'STARTERS', hmrc_tag: 'Revenue_Sales' },
  { id: 'p1', name: 'RAGÚ NAPO Napoletano', price: 12.50, profile: 'hot_food', category: 'PASTA', hmrc_tag: 'Revenue_Sales' },
  { id: 'p2', name: 'PICI CARBONARA', price: 12.50, profile: 'hot_food', category: 'PASTA', hmrc_tag: 'Revenue_Sales' },
  { id: 'p3', name: "PICI AMATRICIANA", price: 12.50, profile: 'hot_food', category: 'PASTA', hmrc_tag: 'Revenue_Sales' },
  { id: 'p4', name: 'GRICIA', price: 12.50, profile: 'hot_food', category: 'PASTA', hmrc_tag: 'Revenue_Sales' },
  { id: 'p5', name: 'PUTTANESCA', price: 12.00, profile: 'hot_food', category: 'PASTA', hmrc_tag: 'Revenue_Sales' },
  { id: 'p6', name: 'CACIO E PEPE (V)', price: 11.80, profile: 'hot_food', category: 'PASTA', hmrc_tag: 'Revenue_Sales' },
  { id: 'p7', name: 'ORECCHIETTE PUGLIESI', price: 12.00, profile: 'hot_food', category: 'PASTA', hmrc_tag: 'Revenue_Sales' },
  { id: 'p8', name: 'PICI DI MEZZANOTTE (V)', price: 9.50, profile: 'hot_food', category: 'PASTA', hmrc_tag: 'Revenue_Sales' },
  { id: 'p9', name: 'POMODORO (V)', price: 9.50, profile: 'hot_food', category: 'PASTA', hmrc_tag: 'Revenue_Sales' },
  { id: 'p10', name: 'ARRABBIATA (V)', price: 9.50, profile: 'hot_food', category: 'PASTA', hmrc_tag: 'Revenue_Sales' },
  { id: 'p11', name: 'LA DELICATA (V)', price: 13.00, profile: 'hot_food', category: 'PASTA', hmrc_tag: 'Revenue_Sales' },
  { id: 'kids1', name: 'KIDS MEAL DEAL', price: 13.00, profile: 'hot_food', category: 'KIDS MENU', hmrc_tag: 'Revenue_Sales' },
  { id: 'dss1', name: 'TIRAMISU', price: 7.00, profile: 'cold_food', category: 'DESSERTS', hmrc_tag: 'Revenue_Sales' },
  { id: 'dss2', name: 'PANNA COTTA', price: 6.50, profile: 'cold_food', category: 'DESSERTS', hmrc_tag: 'Revenue_Sales' },
  { id: 'hd1', name: 'ESPRESSO', price: 1.50, profile: 'hot_food', category: 'HOT DRINKS', hmrc_tag: 'Revenue_Sales' },
  { id: 'hd2', name: 'MACCHIATO', price: 1.50, profile: 'hot_food', category: 'HOT DRINKS', hmrc_tag: 'Revenue_Sales' },
  { id: 'hd3', name: 'CAPPUCCINO', price: 2.50, profile: 'hot_food', category: 'HOT DRINKS', hmrc_tag: 'Revenue_Sales' },
  { id: 'sd1', name: 'STILL WATER (S)', price: 2.00, profile: 'zero_rated', category: 'SOFT DRINKS', hmrc_tag: 'Revenue_Sales' },
  { id: 'sd2', name: 'STILL WATER (L)', price: 3.00, profile: 'zero_rated', category: 'SOFT DRINKS', hmrc_tag: 'Revenue_Sales' },
  { id: 'sd3', name: 'SPARKLING WATER (S)', price: 2.00, profile: 'zero_rated', category: 'SOFT DRINKS', hmrc_tag: 'Revenue_Sales' },
  { id: 'sd4', name: 'SPARKLING WATER (L)', price: 3.00, profile: 'zero_rated', category: 'SOFT DRINKS', hmrc_tag: 'Revenue_Sales' },
  { id: 'sd5', name: 'SAN PELLEGRINO', price: 2.50, profile: 'hot_food', category: 'SOFT DRINKS', hmrc_tag: 'Revenue_Sales' },
  { id: 'sd6', name: 'COCA COLA', price: 2.50, profile: 'hot_food', category: 'SOFT DRINKS', hmrc_tag: 'Revenue_Sales' },
  { id: 'sd7', name: 'FOLKINGSTON APPLE JUICE', price: 3.00, profile: 'zero_rated', category: 'SOFT DRINKS', hmrc_tag: 'Revenue_Sales' },
  { id: 'ex1', name: 'LARGE PORTION', price: 4.00, profile: 'hot_food', category: 'EXTRAS', hmrc_tag: 'Revenue_Other' },
  { id: 'ex2', name: 'EXTRA PARMESAN', price: 1.00, profile: 'hot_food', category: 'EXTRAS', hmrc_tag: 'Revenue_Other' },
  { id: 'ex3', name: 'GLUTEN FREE PASTA', price: 3.00, profile: 'hot_food', category: 'EXTRAS', hmrc_tag: 'Revenue_Other' },
  { id: 'ex5', name: 'EXTRA PECORINO', price: 1.50, profile: 'hot_food', category: 'EXTRAS', hmrc_tag: 'Revenue_Other' },
  { id: 'open', name: '⊕ OPEN FOOD', price: 0, profile: 'hot_food', category: 'EXTRAS', hmrc_tag: 'Revenue_Other' }
];

export default function App() {
  const [activeTable, setActiveTable] = useState("01");
  const [v4Tables, setV4Tables] = useState<TableState[]>([]);
  const [hudStats, setHudStats] = useState({ hotTables: 0, lastGold: 0 });
  const [activeCat, setActiveCat] = useState("PASTA");
  const [showSettle, setShowSettle] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [splitPay, setSplitPay] = useState({ card: 0, cash: 0, atoa: 0, tips: 0 });
  const isLocalAction = useRef(false);

  const syncV4 = useCallback(async () => {
    if (isLocalAction.current) return; 
    const { data } = await supabase.from('active_tables').select('*');
    const synced = TABLES.map(tNum => {
      const dbRow = data?.find(r => r.table_number === tNum);
      return { 
        id: tNum, 
        transaction_id: dbRow?.transaction_id || crypto.randomUUID(), 
        table_status: dbRow?.table_status || 'open', 
        orders: dbRow?.orders || [], 
        covers: dbRow?.covers || 0,
        order_type: dbRow?.order_type || 'dine-in'
      };
    });
    setV4Tables(synced);
    const { data: ledger } = await supabase.from('financial_ledger').select('gross_amount').order('created_at', { ascending: false }).limit(1);
    setHudStats({ hotTables: data?.filter(t => (t.orders?.length || 0) > 0).length || 0, lastGold: Number(ledger?.[0]?.gross_amount) || 0 });
  }, []);

  useEffect(() => {
    syncV4();
    const channel = supabase.channel('realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'active_tables' }, syncV4).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [syncV4]);

  const currentTable = useMemo(() => v4Tables.find(t => t.id === activeTable) || { id: activeTable, orders: [], transaction_id: crypto.randomUUID(), table_status: 'open', covers: 0, order_type: 'dine-in' }, [activeTable, v4Tables]);

  const orderTotal = useMemo(() => currentTable.orders.reduce((s, i) => s + i.price, 0), [currentTable.orders]);

  // VAT CALCULATION (20% Fractional)
  const vatAmount = useMemo(() => {
    return currentTable.orders.reduce((acc, item) => {
      if (item.profile !== 'zero_rated') return acc + (item.price / 6);
      return acc;
    }, 0);
  }, [currentTable.orders]);

  useEffect(() => {
    if (currentTable.orders.length === 0 && (!currentTable.covers || currentTable.covers === 0)) setShowCoverModal(true);
    else setShowCoverModal(false);
  }, [activeTable, currentTable.orders.length, currentTable.covers]);

  const persistTable = async (tableId: string, updatedOrders: MenuItem[], updatedCovers: number, updatedType?: 'dine-in' | 'take-away') => {
    isLocalAction.current = true;
    const payload = { 
        table_number: tableId, 
        orders: updatedOrders, 
        transaction_id: currentTable.transaction_id, 
        table_status: 'open', 
        covers: updatedCovers,
        order_type: updatedType || currentTable.order_type 
    };
    setV4Tables(prev => prev.map(t => t.id === tableId ? { ...t, orders: updatedOrders, covers: updatedCovers, order_type: updatedType || t.order_type } : t));
    await supabase.from('active_tables').upsert(payload, { onConflict: 'table_number' });
    setTimeout(() => { isLocalAction.current = false; }, 1500);
  };

  const finalize = async () => {
    const payMethod = splitPay.atoa > 0 ? 'atoa' : (splitPay.cash > 0 ? 'cash' : 'card');
    const grossVal = orderTotal;
    const mtdMetaData = {
      items: currentTable.orders, tips: splitPay.tips, build: "v8.3-FINAL-LOCK",
      vat_amount: vatAmount,
      tax_summary: currentTable.orders.reduce((acc, item) => { acc[item.hmrc_tag] = (acc[item.hmrc_tag] || 0) + item.price; return acc; }, {} as any)
    };
    const { error } = await supabase.rpc('settle_and_clear_v3', { 
      target_table_id: parseInt(activeTable), gross_val: grossVal, vat_val: vatAmount, 
      pay_method: payMethod, order_type_val: currentTable.order_type, covers_val: currentTable.covers || 0, meta_data: mtdMetaData
    });
    if (!error) {
      window.print();
      await supabase.from('active_tables').delete().eq('table_number', activeTable);
      setShowSettle(false); setSplitPay({ card: 0, cash: 0, atoa: 0, tips: 0 });
      toast.success("GOLD CAPTURED");
    } else {
      toast.error("SIPHON FAILURE: " + error.message);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: CHARCOAL, color: 'white', fontFamily: 'monospace' }}>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #thermal-receipt, #thermal-receipt * { 
            visibility: visible !important; 
            color: black !important; 
            display: block !important;
          }
          #thermal-receipt { 
            position: absolute; left: 0; top: 0; width: 72mm; 
            background: white !important; padding: 0; margin: 0;
            font-size: 11pt; line-height: 1.2;
          }
          .no-print { display: none !important; }
          table { width: 100%; border-collapse: collapse; }
        }
        #thermal-receipt { display: none; }
      `}</style>
      <Toaster theme="dark" position="top-center" richColors />
      
      <div id="thermal-receipt">
         <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14pt' }}>MO' MANGIO!</div>
         <div style={{ textAlign: 'center', fontSize: '9pt', marginBottom: '10px' }}>
            VAT NO: GB 510 239 533<br/>
            238 Haggerston Rd, London E8 4HT
         </div>
         <div style={{ borderBottom: '1px dashed black', margin: '5px 0' }}>
            T{activeTable} | {currentTable.order_type.toUpperCase()} | {new Date().toLocaleTimeString()}
         </div>
         
         <table style={{ width: '100%' }}>
            <tbody>
               {currentTable.orders.map((item, idx) => (
                 <tr key={idx}>
                    <td style={{ textAlign: 'left', verticalAlign: 'top' }}>1x {item.name.toUpperCase()}</td>
                    <td style={{ textAlign: 'right', verticalAlign: 'top' }}>£{item.price.toFixed(2)}</td>
                 </tr>
               ))}
               <tr>
                  <td style={{ borderTop: '2px solid black', paddingTop: '8px', fontWeight: 'bold', fontSize: '13pt' }}>TOTAL</td>
                  <td style={{ borderTop: '2px solid black', paddingTop: '8px', fontWeight: 'bold', fontSize: '13pt', textAlign: 'right' }}>£{orderTotal.toFixed(2)}</td>
               </tr>
               <tr>
                  <td style={{ fontSize: '8pt', paddingTop: '5px' }}>Includes VAT (20%)</td>
                  <td style={{ fontSize: '8pt', paddingTop: '5px', textAlign: 'right' }}>£{vatAmount.toFixed(2)}</td>
               </tr>
            </tbody>
         </table>

         <div style={{ textAlign: 'center', marginTop: '20px', fontWeight: 'bold' }}>
           Grazie Mille!
           <br/><br/><br/><br/><br/><br/><br/>
         </div>
      </div>

      <header style={{ background: '#000', borderBottom: `2px solid ${DOJO_GREEN}`, padding: '10px' }} className="no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ShieldCheck size={20} color={DOJO_GREEN} /><span style={{ fontWeight: 'bold' }}>SENTINEL V8.3-COMPLIANT</span></div>
          <div style={{ color: DOJO_GREEN, fontWeight: '900' }}>LAST: £{hudStats.lastGold.toFixed(2)} | HOT: {hudStats.hotTables}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px' }}>
          {TABLES.map(t => {
            const isHot = (v4Tables.find(vt => vt.id === t)?.orders?.length || 0) > 0;
            return (
              <button key={t} onClick={() => setActiveTable(t)} style={{ height: '50px', minWidth: '60px', border: `2px solid ${activeTable === t ? DOJO_GREEN : (isHot ? '#444' : '#222')}`, color: activeTable === t ? DOJO_GREEN : (isHot ? '#fff' : '#444'), background: activeTable === t ? '#001a0d' : 'transparent', fontWeight: 'bold' }}>T{t}</button>
            );
          })}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', flexGrow: 1, overflow: 'hidden' }} className="no-print">
        <main style={{ padding: '15px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', background: '#0A0A0A' }}>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginBottom: '10px' }}>
             {Array.from(new Set(INITIAL_MENU.map(m => m.category))).map(cat => (<button key={cat} onClick={() => setActiveCat(cat)} style={{ padding: '10px 20px', background: activeCat === cat ? DOJO_GREEN : '#111', color: activeCat === cat ? '#000' : '#fff', border: 'none', fontWeight: 'bold', fontSize: '11px' }}>{cat}</button>))}
          </div>
          {INITIAL_MENU.filter(m => m.category === activeCat).map(item => (
            <button key={item.id} onClick={() => { const p = item.id === 'open' ? (parseFloat(prompt("Price:") || "0")) : item.price; persistTable(activeTable, [...currentTable.orders, { ...item, price: p, orderId: crypto.randomUUID() }], currentTable.covers || 0); }} style={{ background: '#1A1A1A', border: '1px solid #333', padding: '20px', textAlign: 'left', minHeight: '110px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '10px', opacity: 0.5 }}>{item.hmrc_tag}</div><div style={{ fontSize: '15px', fontWeight: 'bold' }}>{item.name}</div><div style={{ color: DOJO_GREEN, fontWeight: '900', fontSize: '18px' }}>£{item.price.toFixed(2)}</div>
            </button>
          ))}
        </main>

        <aside style={{ background: '#000', borderLeft: '2px solid #222', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #222' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontWeight: '900', fontSize: '18px' }}>T{activeTable} ({currentTable.covers || 0})</span>
                <div style={{ display: 'flex', gap: '20px' }}><Printer size={22} color={DOJO_GREEN} style={{ cursor: 'pointer' }} onClick={() => window.print()} /><Trash2 size={22} color="#ff4444" style={{ cursor: 'pointer' }} onClick={() => window.confirm('VOID TABLE?') && persistTable(activeTable, [], 0)} /></div>
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => persistTable(activeTable, currentTable.orders, currentTable.covers || 0, 'dine-in')} style={{ flex: 1, padding: '12px', background: currentTable.order_type === 'dine-in' ? DOJO_GREEN : '#111', color: currentTable.order_type === 'dine-in' ? '#000' : '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}><Utensils size={16}/> EAT IN</button>
                <button onClick={() => persistTable(activeTable, currentTable.orders, currentTable.covers || 0, 'take-away')} style={{ flex: 1, padding: '12px', background: currentTable.order_type === 'take-away' ? DOJO_GREEN : '#111', color: currentTable.order_type === 'take-away' ? '#000' : '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}><ShoppingBag size={16}/> TAKE AWAY</button>
            </div>
          </div>
          <div style={{ flexGrow: 1, overflowY: 'auto', padding: '15px' }}>
            {currentTable.orders.map((item) => (
              <div key={item.orderId} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #111' }}><span style={{ fontSize: '14px' }}>1x {item.name}</span><div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}><span style={{ fontWeight: 'bold' }}>£{item.price.toFixed(2)}</span><X size={16} color="#666" style={{ cursor: 'pointer' }} onClick={() => persistTable(activeTable, currentTable.orders.filter(o => o.orderId !== item.orderId), currentTable.covers || 0)} /></div></div>
            ))}
          </div>
          <div style={{ padding: '25px', background: '#050505', borderTop: '2px solid #222' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '28px', fontWeight: '900', marginBottom: '25px' }}><span>TOTAL</span><span style={{ color: DOJO_GREEN }}>£{orderTotal.toFixed(2)}</span></div>
            <button onClick={() => setShowSettle(true)} disabled={currentTable.orders.length === 0} style={{ width: '100%', background: currentTable.orders.length === 0 ? '#333' : DOJO_GREEN, color: '#000', padding: '20px', fontWeight: '900', border: 'none', fontSize: '18px' }}>SETTLE</button>
          </div>
        </aside>
      </div>

      {showSettle && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.98)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="no-print">
          <div style={{ background: '#111', width: '450px', padding: '40px', border: `2px solid ${DOJO_GREEN}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}><span style={{ fontSize: '24px', fontWeight: '900' }}>SETTLE T{activeTable}</span><X size={30} onClick={() => setShowSettle(false)} style={{ cursor: 'pointer' }} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '30px' }}>
               <button onClick={() => setSplitPay({...splitPay, card: 1, cash: 0, atoa: 0})} style={{ background: '#1A1A1A', padding: '25px 10px', border: splitPay.card ? `2px solid ${DOJO_GREEN}` : '1px solid #333', color: splitPay.card ? DOJO_GREEN : '#fff' }}><CreditCard /><br/>CARD</button>
               <button onClick={() => setSplitPay({...splitPay, card: 0, cash: 1, atoa: 0})} style={{ background: '#1A1A1A', padding: '25px 10px', border: splitPay.cash ? `2px solid ${DOJO_GREEN}` : '1px solid #333', color: splitPay.cash ? DOJO_GREEN : '#fff' }}><Banknote /><br/>CASH</button>
               <button onClick={() => setSplitPay({...splitPay, card: 0, cash: 0, atoa: 1})} style={{ background: '#1A1A1A', padding: '25px 10px', border: splitPay.atoa ? `2px solid ${DOJO_GREEN}` : '1px solid #333', color: splitPay.atoa ? DOJO_GREEN : '#fff' }}><QrCode /><br/>ATOA</button>
            </div>
            <button onClick={finalize} style={{ width: '100%', background: DOJO_GREEN, color: '#000', padding: '25px', fontWeight: '900', border: 'none', fontSize: '20px' }}>FINALIZE £{orderTotal.toFixed(2)}</button>
          </div>
        </div>
      )}

      {showCoverModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="no-print">
            <div style={{ textAlign: 'center' }}><div style={{ color: DOJO_GREEN, marginBottom: '40px', fontSize: '28px', fontWeight: '900' }}>GUESTS - T{activeTable}</div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>{[1,2,3,4,5,6,7,8].map(num => (<button key={num} onClick={() => { persistTable(activeTable, [], num); setShowCoverModal(false); }} style={{ height: '100px', width: '100px', background: '#000', border: `2px solid ${DOJO_GREEN}`, color: 'white', fontSize: '30px', fontWeight: '900' }}>{num}</button>))}</div></div>
        </div>
      )}
    </div>
  );
}