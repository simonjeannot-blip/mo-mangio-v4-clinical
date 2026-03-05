import { useState, useMemo, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { X, History, CheckCircle, ShoppingCart, ChevronUp, Printer, Save } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- 1. SOVEREIGN CONFIGURATION ---
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "", 
  import.meta.env.VITE_SUPABASE_ANON_KEY || ""
);

const TABLES = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
const DOJO_GREEN = "#00CC66";
const CHARCOAL = "#1A1A1A";

// --- 2. HARDENED TYPES ---
interface MenuItem {
  id: string;
  name: string;
  price: number;
  profile: 'hot_food' | 'cold_food' | 'zero_rated';
  category: string;
  qty?: number;
  orderId?: string;
  sent?: boolean;
}

interface TableState {
  id: string;
  transaction_id: string;
  table_status: string;
  orders: MenuItem[];
}

const INITIAL_MENU: MenuItem[] = [
  { id: 's1', name: 'BRUSCHETTA', price: 4.40, profile: 'cold_food', category: 'STARTERS' },
  { id: 's2', name: "MO' MANGIO! (VG)", price: 4.95, profile: 'cold_food', category: 'STARTERS' },
  { id: 's3', name: 'PANZANELLA (V)', price: 4.95, profile: 'cold_food', category: 'STARTERS' },
  { id: 's4', name: 'DA NORD A SUD', price: 5.45, profile: 'cold_food', category: 'STARTERS' },
  { id: 's5', name: 'ROCKET SALAD (VG)', price: 6.50, profile: 'cold_food', category: 'STARTERS' },
  { id: 's6', name: 'BURRATA (V)', price: 8.50, profile: 'cold_food', category: 'STARTERS' },
  { id: 'p1', name: 'RAGÚ NAPOLETANO', price: 12.50, profile: 'hot_food', category: 'PASTA' },
  { id: 'p2', name: 'PICI CARBONARA', price: 12.50, profile: 'hot_food', category: 'PASTA' },
  { id: 'p3', name: "PICI AMATRICIANA", price: 12.50, profile: 'hot_food', category: 'PASTA' },
  { id: 'p4', name: 'GRICIA', price: 12.50, profile: 'hot_food', category: 'PASTA' },
  { id: 'p5', name: 'PUTTANESCA', price: 12.00, profile: 'hot_food', category: 'PASTA' },
  { id: 'p6', name: 'CACIO E PEPE (V)', price: 11.80, profile: 'hot_food', category: 'PASTA' },
  { id: 'p7', name: 'ORECCHIETTE PUGLIESI', price: 12.00, profile: 'hot_food', category: 'PASTA' },
  { id: 'p8', name: 'PICI DI MEZZANOTTE (V)', price: 9.50, profile: 'hot_food', category: 'PASTA' },
  { id: 'p9', name: 'POMODORO (V)', price: 9.50, profile: 'hot_food', category: 'PASTA' },
  { id: 'p10', name: 'ARRABBIATA (V)', price: 9.50, profile: 'hot_food', category: 'PASTA' },
  { id: 'p11', name: 'LA DELICATA (V)', price: 13.00, profile: 'hot_food', category: 'PASTA' },
  { id: 'kids1', name: 'KIDS MEAL DEAL', price: 13.00, profile: 'cold_food', category: 'KIDS MENU' },
  { id: 'dss1', name: 'TIRAMISU', price: 7.00, profile: 'cold_food', category: 'DESSERTS' },
  { id: 'dss2', name: 'PANNA COTTA', price: 6.50, profile: 'cold_food', category: 'DESSERTS' },
  { id: 'hd1', name: 'ESPRESSO', price: 1.50, profile: 'hot_food', category: 'HOT DRINKS' },
  { id: 'hd2', name: 'MACCHIATO', price: 1.50, profile: 'hot_food', category: 'HOT DRINKS' },
  { id: 'hd3', name: 'CAPPUCCINO', price: 2.50, profile: 'hot_food', category: 'HOT DRINKS' },
  { id: 'sd1', name: 'STILL WATER (S)', price: 2.00, profile: 'zero_rated', category: 'SOFT DRINKS' },
  { id: 'sd2', name: 'STILL WATER (L)', price: 3.00, profile: 'zero_rated', category: 'SOFT DRINKS' },
  { id: 'sd3', name: 'SPARKLING WATER (S)', price: 2.00, profile: 'zero_rated', category: 'SOFT DRINKS' },
  { id: 'sd4', name: 'SPARKLING WATER (L)', price: 3.00, profile: 'zero_rated', category: 'SOFT DRINKS' },
  { id: 'sd5', name: 'SAN PELLEGRINO', price: 2.50, profile: 'hot_food', category: 'SOFT DRINKS' },
  { id: 'sd6', name: 'COCA COLA', price: 2.50, profile: 'hot_food', category: 'SOFT DRINKS' },
  { id: 'sd7', name: 'FOLKINGSTON APPLE JUICE', price: 3.00, profile: 'zero_rated', category: 'SOFT DRINKS' },
  { id: 'ex1', name: 'LARGE PORTION', price: 4.00, profile: 'hot_food', category: 'EXTRAS' },
  { id: 'ex2', name: 'EXTRA PARMESAN', price: 1.00, profile: 'hot_food', category: 'EXTRAS' },
  { id: 'ex3', name: 'GLUTEN FREE PASTA', price: 3.00, profile: 'hot_food', category: 'EXTRAS' },
  { id: 'ex5', name: 'EXTRA PECORINO', price: 1.50, profile: 'hot_food', category: 'EXTRAS' },
  { id: 'open', name: '⊕ OPEN FOOD', price: 0, profile: 'hot_food', category: 'EXTRAS' }
];

export default function App() {
  const [activeTable, setActiveTable] = useState("01");
  const [v4Tables, setV4Tables] = useState<TableState[]>([]);
  const [menu] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('mm_menu_v11');
    return saved ? JSON.parse(saved) : INITIAL_MENU;
  });
  
  const [activeCat, setActiveCat] = useState("PASTA");
  const [showSettle, setShowSettle] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [splitPay, setSplitPay] = useState({ card: 0, cash: 0, atoa: 0, tips: 0 });
  const [orderType] = useState<'dine-in'|'takeaway'>('dine-in');

  useEffect(() => {
    const syncV4 = async () => {
      const { data } = await supabase.from('active_tables').select('*');
      if (data) {
        const synced = TABLES.map(tNum => {
          const dbRow = data.find(r => r.table_number === tNum);
          return {
            id: tNum,
            transaction_id: dbRow?.transaction_id || crypto.randomUUID(),
            table_status: dbRow?.table_status || 'open',
            orders: dbRow?.orders || []
          };
        });
        setV4Tables(synced);
      }
    };
    syncV4();

    const channel = supabase.channel('table-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'active_tables' }, syncV4)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const currentTable = v4Tables.find(t => t.id === activeTable) || { id: activeTable, orders: [], transaction_id: '', table_status: 'open' };
  const currentCart = currentTable.orders;
  const categories = Array.from(new Set(menu.map(m => m.category)));

  const totals = useMemo(() => {
    let gross = 0, vat_amount = 0;
    currentCart.forEach(item => {
      const lineTotal = item.price * (item.qty || 1);
      gross += lineTotal;
      const isTaxable = item.profile === 'hot_food' || (item.profile === 'cold_food' && orderType === 'dine-in');
      if (isTaxable) vat_amount += (lineTotal - (lineTotal / 1.2));
    });
    return { gross, vat_amount };
  }, [currentCart, orderType]);

  const triggerPrint = () => {
    const receiptContent = `
MO' MANGIO!
T${activeTable} | ${new Date().toLocaleTimeString()}
--------------------------------
${currentCart.map(i => `${i.qty}x ${i.name.slice(0,18).padEnd(18)} £${(i.price * (i.qty || 1)).toFixed(2)}`).join('\n')}
--------------------------------
TOTAL: £${totals.gross.toFixed(2)}
VAT (Inc): £${totals.vat_amount.toFixed(2)}
TIPS: £${splitPay.tips.toFixed(2)}
--------------------------------
GRAZIE MILLE!
    `;
    const scheme = `starpassprnt://v1/print/silent?size=3&data=${encodeURIComponent(receiptContent)}`;
    window.location.href = scheme;
    toast.success("THERMAL COMMAND DISPATCHED");
  };

  const triggerAtoa = async () => {
    const amount = totals.gross;
    if (amount <= 0) return toast.error("CANNOT SETTLE ZERO BALANCE");
    toast.loading("SECURING ATOA VAULT...");
    const { error: vaultError } = await supabase
      .from('atoa_payments')
      .insert({ transaction_id: currentTable.transaction_id, amount: amount, status: 'PENDING' });
    if (vaultError) return toast.error("VAULT LOCK FAILED");
    toast.dismiss();
    const sandboxSim = confirm(`ATOA HANDSHAKE: Pay £${amount.toFixed(2)}?\nRef: ${currentTable.transaction_id}`);
    if (sandboxSim) {
      setSplitPay({ ...splitPay, atoa: amount });
      toast.success("ATOA: PAYMENT COMPLETED");
    }
  };

  const addToCart = (item: MenuItem) => {
    const price = item.id === 'open' ? parseFloat(prompt("Enter Open Price:") || "0") : item.price;
    const existing = currentCart.find(i => i.id === item.id && i.price === price && !i.sent);
    const newOrders = existing 
      ? currentCart.map(i => (i.id === item.id && i.price === price && !i.sent) ? { ...i, qty: (i.qty || 1) + 1 } : i)
      : [...currentCart, { ...item, qty: 1, price, orderId: crypto.randomUUID(), sent: false }];
    setV4Tables(prev => prev.map(t => t.id === activeTable ? { ...t, orders: newOrders } : t));
  };

  const saveToTable = async () => {
    const hardenedOrders = currentCart.map(item => ({ ...item, sent: true }));
    const { error } = await supabase.from('active_tables').upsert({ 
      table_number: activeTable, orders: hardenedOrders, transaction_id: currentTable.transaction_id, table_status: 'open' 
    });
    if (!error) toast.success(`T${activeTable} HARDENED`);
  };

  const finalize = async () => {
    const { gross, vat_amount } = totals;
    const payment_method = splitPay.cash > 0 ? 'cash' : (splitPay.atoa > 0 ? 'atoa' : 'card');
    const { error } = await supabase.from('financial_ledger').insert([{ 
      gross_amount: gross,
      vat_amount: vat_amount,
      payment_method: payment_method,
      metadata: { 
        items: currentCart, 
        split: splitPay, 
        table: activeTable, 
        transaction_id: currentTable.transaction_id 
      }
    }]);

    if (!error) {
      await supabase.from('active_tables').update({ 
        orders: [], 
        transaction_id: crypto.randomUUID() 
      }).eq('table_number', activeTable);
      
      setV4Tables(prev => prev.map(t => t.id === activeTable ? { ...t, orders: [], transaction_id: crypto.randomUUID() } : t));
      setSplitPay({ card: 0, cash: 0, atoa: 0, tips: 0 });
      setShowSettle(false);
      triggerPrint();
      toast.success("SALE HARDENED: GOLD SECURED");
    } else {
      console.error("Schema Rift Details:", error);
      toast.error(`VAULT WRITE FAILED: ${error.message}`);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: CHARCOAL, color: 'white', fontFamily: 'monospace', overflow: 'hidden', touchAction: 'none' }}>
      <Toaster theme="dark" position="top-center" richColors />
      
      <header style={{ background: '#000', borderBottom: '1px solid #333', zIndex: 10, paddingTop: 'env(safe-area-inset-top)' }}>
        <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', padding: '10px' }}>
          {TABLES.map(t => (
            <button key={t} onClick={() => setActiveTable(t)} style={{ height: '44px', minWidth: '55px', border: `1px solid ${activeTable === t ? DOJO_GREEN : '#222'}`, color: activeTable === t ? DOJO_GREEN : '#666', background: activeTable === t ? 'rgba(0,204,102,0.1)' : 'transparent', fontWeight: '900' }}>T{t}</button>
          ))}
          <button onClick={async () => {
            const { data } = await supabase.from('financial_ledger').select('*').order('created_at', { ascending: false }).limit(15);
            setHistory(data || []);
            setShowHistory(true);
          }} style={{ minWidth: '55px', border: '1px solid #333' }}><History size={20} color={DOJO_GREEN}/></button>
        </div>
        <div style={{ display: 'flex', overflowX: 'auto', background: '#111', borderTop: '1px solid #222' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCat(cat)} style={{ padding: '12px 20px', borderRight: '1px solid #222', background: activeCat === cat ? DOJO_GREEN : 'transparent', color: activeCat === cat ? '#000' : '#fff', fontWeight: '900', fontSize: '11px', whiteSpace: 'nowrap' }}>{cat}</button>
          ))}
        </div>
      </header>

      <main style={{ flexGrow: 1, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', padding: '8px', overflowY: 'auto', alignContent: 'start', WebkitOverflowScrolling: 'touch' }}>
        {menu.filter(m => m.category === activeCat).map(item => (
          <button key={item.id} onClick={() => addToCart(item)} style={{ height: '110px', background: '#222', border: '1px solid #333', padding: '12px', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: '0' }}>
            <span style={{ fontWeight: 'bold', fontSize: '11px', color: '#ccc', textTransform: 'uppercase', lineHeight: '1.2' }}>{item.name}</span>
            <span style={{ textAlign: 'right', color: DOJO_GREEN, fontWeight: '900', fontSize: '18px' }}>£{item.price.toFixed(2)}</span>
          </button>
        ))}
      </main>

      {/* HARDENED FOOTER WITH PRINT & SAVE */}
      <footer style={{ background: '#000', borderTop: `2px solid ${DOJO_GREEN}`, padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'center', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
        <div onClick={() => setShowCart(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}>
          <ShoppingCart size={22} color={DOJO_GREEN} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '18px', fontWeight: '900' }}>£{totals.gross.toFixed(2)}</span>
            <span style={{ fontSize: '9px', opacity: 0.5 }}>T{activeTable} CART <ChevronUp size={8} style={{ display: 'inline' }} /></span>
          </div>
        </div>
        
        <button onClick={saveToTable} style={{ background: '#111', border: `1px solid ${DOJO_GREEN}`, color: DOJO_GREEN, padding: '10px', borderRadius: '4px' }}>
          <Save size={20} />
        </button>

        <button onClick={triggerPrint} style={{ background: '#111', border: `1px solid ${DOJO_GREEN}`, color: DOJO_GREEN, padding: '10px', borderRadius: '4px' }}>
          <Printer size={20} />
        </button>
        
        <button onClick={() => setShowSettle(true)} style={{ background: DOJO_GREEN, color: '#000', padding: '14px 28px', fontWeight: '900', fontSize: '14px', border: 'none', borderRadius: '4px' }}>SETTLE</button>
      </footer>

      {showCart && (
        <div style={{ position: 'fixed', inset: 0, background: CHARCOAL, zIndex: 100, display: 'flex', flexDirection: 'column', paddingTop: 'env(safe-area-inset-top)' }}>
          <header style={{ padding: '20px', background: '#000', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '900', color: DOJO_GREEN }}>T{activeTable} LEDGER</span>
            <X onClick={() => setShowCart(false)} />
          </header>
          <div style={{ flexGrow: 1, padding: '16px', overflowY: 'auto' }}>
            {currentCart.map((i, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px', opacity: i.sent ? 0.4 : 1 }}>
                <span>{i.sent && <CheckCircle size={10} color={DOJO_GREEN} style={{ display: 'inline', marginRight: '4px' }} />} {i.qty}x {i.name}</span>
                <span>£{(i.price * (i.qty || 1)).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '16px', borderTop: '1px solid #333', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}>
            <button onClick={saveToTable} style={{ background: '#222', color: DOJO_GREEN, padding: '18px', fontWeight: 'bold', border: `1px solid ${DOJO_GREEN}` }}>SAVE TAB</button>
            <button onClick={() => setShowCart(false)} style={{ background: DOJO_GREEN, color: '#000', padding: '18px', fontWeight: 'bold' }}>BACK</button>
          </div>
        </div>
      )}

      {showSettle && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.97)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}>
          <div style={{ background: '#111', width: '100%', maxWidth: '400px', border: `1px solid ${DOJO_GREEN}`, padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}><span style={{ fontWeight: '900' }}>T{activeTable} SETTLEMENT</span><X onClick={() => setShowSettle(false)} /></div>
            <div style={{ background: '#000', padding: '20px', textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '36px', color: DOJO_GREEN, fontWeight: '900' }}>£{(totals.gross - (splitPay.card + splitPay.cash + splitPay.atoa)).toFixed(2)}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <PaymentLine label="CASH" val={splitPay.cash} set={v => setSplitPay({...splitPay, cash: v})} />
              <PaymentLine label="CARD" val={splitPay.card} set={v => setSplitPay({...splitPay, card: v})} />
              <PaymentLine label="TIPS" val={splitPay.tips} set={v => setSplitPay({...splitPay, tips: v})} />
              <button onClick={triggerAtoa} style={{ background: '#000', border: `1px solid ${DOJO_GREEN}`, color: DOJO_GREEN, padding: '15px', fontWeight: '900' }}>ATOA PAY</button>
            </div>
            <button onClick={finalize} style={{ width: '100%', background: DOJO_GREEN, color: '#000', padding: '18px', marginTop: '20px', fontWeight: '900' }}>FINALIZE SALE</button>
          </div>
        </div>
      )}

      {showHistory && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.97)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '20px' }}>
          <div style={{ background: '#111', width: '100%', maxWidth: '500px', border: `1px solid ${DOJO_GREEN}`, padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}><span>VAULT HISTORY</span><X onClick={() => setShowHistory(false)}/></div>
            <div style={{ maxHeight: '60dvh', overflowY: 'auto' }}>
              {history.map(tx => (
                <div key={tx.id} style={{ padding: '12px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between' }}>
                  <span>T{tx.metadata?.table || '?'} - £{tx.gross_amount?.toFixed(2)}</span>
                  <span style={{ opacity: 0.3 }}>{tx.created_at ? new Date(tx.created_at).toLocaleTimeString() : ''}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentLine({ label, val, set }: { label: string, val: number, set: (v: number) => void }) {
    return (<div style={{ display: 'flex', alignItems: 'center', background: '#000', border: '1px solid #333', padding: '12px' }}><span style={{ fontSize: '10px', width: '70px', fontWeight: 'bold' }}>{label}</span><input type="number" inputMode="decimal" value={val || ''} onChange={e => set(parseFloat(e.target.value) || 0)} style={{ flexGrow: 1, background: 'transparent', border: 'none', color: DOJO_GREEN, textAlign: 'right', fontSize: '20px', fontWeight: '900', outline: 'none' }} /></div>);
}