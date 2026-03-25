import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import { X, Printer, CreditCard, Banknote, QrCode, ShieldCheck, Trash2, Save } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const DOJO_GREEN = "#00CC66";
const CHARCOAL = "#1A1A1A";
const SB_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(SB_URL, SB_KEY);

const TABLES = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
type HMRCTag = 'Revenue_Sales' | 'Revenue_Other' | 'Excluded_Tips';

interface MenuItem { id: string; name: string; price: number; profile: 'hot_food' | 'cold_food' | 'zero_rated'; category: string; hmrc_tag: HMRCTag; qty?: number; orderId?: string; }
interface TableState { id: string; transaction_id: string; table_status: string; orders: MenuItem[]; covers?: number; }

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
      return { id: tNum, transaction_id: dbRow?.transaction_id || crypto.randomUUID(), table_status: dbRow?.table_status || 'open', orders: dbRow?.orders || [], covers: dbRow?.covers || 0 };
    });
    setV4Tables(synced);
    const { data: ledger } = await supabase.from('financial_ledger').select('gross_amount').order('created_at', { ascending: false }).limit(1);
    setHudStats({ hotTables: data?.filter(t => t.orders?.length > 0).length || 0, lastGold: Number(ledger?.[0]?.gross_amount) || 0 });
  }, []);

  useEffect(() => {
    syncV4();
    const channel = supabase.channel('realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'active_tables' }, syncV4).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [syncV4]);

  const currentTable = useMemo(() => v4Tables.find(t => t.id === activeTable) || { id: activeTable, orders: [], transaction_id: crypto.randomUUID(), table_status: 'open', covers: 0 }, [activeTable, v4Tables]);

  useEffect(() => {
    if (currentTable.orders.length === 0 && (!currentTable.covers || currentTable.covers === 0)) setShowCoverModal(true);
    else setShowCoverModal(false);
  }, [activeTable, currentTable.orders.length, currentTable.covers]);

  const persistTable = async (tableId: string, updatedOrders: MenuItem[], updatedCovers: number) => {
    isLocalAction.current = true;
    const payload = { table_number: tableId, orders: updatedOrders, transaction_id: currentTable.transaction_id, table_status: 'open', covers: updatedCovers };
    setV4Tables(prev => prev.map(t => t.id === tableId ? { ...t, orders: updatedOrders, covers: updatedCovers } : t));
    await supabase.from('active_tables').upsert(payload, { onConflict: 'table_number' });
    setTimeout(() => { isLocalAction.current = false; }, 1500);
  };

  const finalize = async () => {
    const payMethod = splitPay.atoa > 0 ? 'atoa' : (splitPay.cash > 0 ? 'cash' : 'card');
    const grossVal = currentTable.orders.reduce((s, i) => s + i.price, 0);
    const mtdMetaData = {
      items: currentTable.orders, tips: splitPay.tips, build: "v7.5-FINAL-SITE",
      tax_summary: currentTable.orders.reduce((acc, item) => { acc[item.hmrc_tag] = (acc[item.hmrc_tag] || 0) + item.price; return acc; }, {} as any)
    };
    const { error } = await supabase.rpc('settle_and_clear_v3', { 
      target_table_id: parseInt(activeTable), gross_val: grossVal, vat_val: 0, 
      pay_method: payMethod, order_type_val: 'dine-in', covers_val: currentTable.covers || 0, meta_data: mtdMetaData
    });
    if (!error) {
      window.print();
      await supabase.from('active_tables').delete().eq('table_number', activeTable);
      setShowSettle(false); setSplitPay({ card: 0, cash: 0, atoa: 0, tips: 0 });
      toast.success("GOLD CAPTURED");
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: CHARCOAL, color: 'white', fontFamily: 'monospace' }}>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #thermal-receipt, #thermal-receipt * { visibility: visible !important; }
          #thermal-receipt { position: fixed; left: 0; top: 0; width: 80mm; background: white !important; color: black !important; padding: 10px; font-size: 11pt; display: block !important; }
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
         <div style={{ borderBottom: '1px dashed black', margin: '5px 0' }}>T{activeTable} | {new Date().toLocaleTimeString()}</div>
         {currentTable.orders.map((item, idx) => (
           <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}><span>1x {item.name}</span><span>£{item.price.toFixed(2)}</span></div>
         ))}
         <div style={{ borderTop: '1px solid black', marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}><span>TOTAL</span><span>£{currentTable.orders.reduce((s, i) => s + i.price, 0).toFixed(2)}</span></div>
         {splitPay.tips > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>TIPS</span><span>£{splitPay.tips.toFixed(2)}</span></div>}
         <div style={{ textAlign: 'center', marginTop: '20px' }}>Grazie Mille!</div>
      </div>

      <header style={{ background: '#000', borderBottom: `2px solid ${DOJO_GREEN}`, padding: '10px' }} className="no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ShieldCheck size={20} color={DOJO_GREEN} /><span style={{ fontWeight: 'bold' }}>SENTINEL V7.5-FINAL-SITE</span></div>
          <div style={{ color: DOJO_GREEN, fontWeight: '900' }}>LAST: £{hudStats.lastGold.toFixed(2)} | HOT: {hudStats.hotTables}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
          {TABLES.map(t => (<button key={t} onClick={() => setActiveTable(t)} style={{ height: '44px', minWidth: '55px', border: `1px solid ${activeTable === t ? DOJO_GREEN : '#222'}`, color: activeTable === t ? DOJO_GREEN : '#666', background: 'transparent' }}>T{t}</button>))}
        </div>
        <div style={{ display: 'flex', background: '#111', overflowX: 'auto' }}>
            {Array.from(new Set(INITIAL_MENU.map(m => m.category))).map(cat => (<button key={cat} onClick={() => setActiveCat(cat)} style={{ padding: '12px 20px', background: activeCat === cat ? DOJO_GREEN : 'transparent', color: activeCat === cat ? '#000' : '#fff', border: 'none', fontWeight: 'bold' }}>{cat}</button>))}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', flexGrow: 1, overflow: 'hidden' }} className="no-print">
        <main style={{ padding: '10px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', background: '#0A0A0A' }}>
          {INITIAL_MENU.filter(m => m.category === activeCat).map(item => (
            <button key={item.id} onClick={() => { const p = item.id === 'open' ? (parseFloat(prompt("Price:") || "0")) : item.price; persistTable(activeTable, [...currentTable.orders, { ...item, price: p, orderId: crypto.randomUUID() }], currentTable.covers || 0); }} style={{ background: '#1A1A1A', border: '1px solid #333', padding: '15px', textAlign: 'left', minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '10px', opacity: 0.5 }}>{item.hmrc_tag}</div><div style={{ fontSize: '14px', fontWeight: 'bold' }}>{item.name}</div><div style={{ color: DOJO_GREEN, fontWeight: '900' }}>£{item.price.toFixed(2)}</div>
            </button>
          ))}
        </main>

        <aside style={{ background: '#000', borderLeft: '2px solid #222', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '15px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '900' }}>T{activeTable} ({currentTable.covers || 0} GUESTS)</span>
            <div style={{ display: 'flex', gap: '15px' }}><Printer size={18} color={DOJO_GREEN} style={{ cursor: 'pointer' }} onClick={() => window.print()} /><Trash2 size={18} color="#ff4444" style={{ cursor: 'pointer' }} onClick={() => window.confirm('VOID?') && persistTable(activeTable, [], 0)} /></div>
          </div>
          <div style={{ flexGrow: 1, overflowY: 'auto', padding: '15px' }}>
            {currentTable.orders.map((item) => (
              <div key={item.orderId} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #111' }}><span style={{ fontSize: '14px' }}>1x {item.name}</span><div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><span>£{item.price.toFixed(2)}</span><X size={14} color="#666" style={{ cursor: 'pointer' }} onClick={() => persistTable(activeTable, currentTable.orders.filter(o => o.orderId !== item.orderId), currentTable.covers || 0)} /></div></div>
            ))}
          </div>
          <div style={{ padding: '20px', background: '#050505', borderTop: '2px solid #222' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '24px', fontWeight: '900', marginBottom: '20px' }}><span>TOTAL</span><span style={{ color: DOJO_GREEN }}>£{currentTable.orders.reduce((s, i) => s + i.price, 0).toFixed(2)}</span></div>
            <button onClick={() => setShowSettle(true)} style={{ width: '100%', background: DOJO_GREEN, color: '#000', padding: '15px', fontWeight: '900', border: 'none', fontSize: '16px' }}>SETTLE</button>
          </div>
        </aside>
      </div>

      {showSettle && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.98)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="no-print">
          <div style={{ background: '#111', width: '400px', padding: '30px', border: `2px solid ${DOJO_GREEN}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}><span style={{ fontSize: '20px', fontWeight: '900' }}>SETTLE T{activeTable}</span><X onClick={() => setShowSettle(false)} style={{ cursor: 'pointer' }} /></div>
            <div style={{ background: '#000', padding: '15px', marginBottom: '20px', border: '1px solid #333' }}>
               <div style={{ fontSize: '12px', opacity: 0.5, marginBottom: '5px' }}>ADD TIPS</div>
               <input type="number" onChange={(e) => setSplitPay({...splitPay, tips: parseFloat(e.target.value) || 0})} style={{ width: '100%', background: 'transparent', border: 'none', color: DOJO_GREEN, fontSize: '30px', fontWeight: 'bold', outline: 'none' }} />
            </div>
            <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
               <button onClick={() => setSplitPay({...splitPay, card: 1, cash: 0, atoa: 0})} style={{ background: '#222', padding: '20px', border: splitPay.card ? `2px solid ${DOJO_GREEN}` : '1px solid #444' }}><CreditCard /> CARD</button>
               <button onClick={() => setSplitPay({...splitPay, card: 0, cash: 1, atoa: 0})} style={{ background: '#222', padding: '20px', border: splitPay.cash ? `2px solid ${DOJO_GREEN}` : '1px solid #444' }}><Banknote /> CASH</button>
               <button onClick={() => setSplitPay({...splitPay, card: 0, cash: 0, atoa: 1})} style={{ background: '#222', padding: '20px', border: splitPay.atoa ? `2px solid ${DOJO_GREEN}` : '1px solid #444' }}><QrCode /> ATOA</button>
            </div>
            <button onClick={finalize} style={{ width: '100%', background: DOJO_GREEN, color: '#000', padding: '20px', fontWeight: '900', border: 'none', fontSize: '18px' }}>FINALIZE £{(currentTable.orders.reduce((s, i) => s + i.price, 0) + splitPay.tips).toFixed(2)}</button>
          </div>
        </div>
      )}

      {showCoverModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.98)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="no-print">
            <div style={{ textAlign: 'center' }}><div style={{ color: DOJO_GREEN, marginBottom: '30px', fontSize: '24px', fontWeight: '900' }}>GUEST COUNT - T{activeTable}</div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>{[1,2,3,4,5,6,7,8].map(num => (<button key={num} onClick={() => { persistTable(activeTable, [], num); setShowCoverModal(false); }} style={{ padding: '30px', background: '#111', border: `2px solid ${DOJO_GREEN}`, color: 'white', fontSize: '24px', fontWeight: '900' }}>{num}</button>))}</div></div>
        </div>
      )}
    </div>
  );
}
