import { useState, useMemo, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { Printer, Trash2, Settings, X, Save, History, CheckCircle, RotateCcw, Copy, CreditCard } from 'lucide-react';
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
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('mm_menu_v11');
    return saved ? JSON.parse(saved) : INITIAL_MENU;
  });
  
  const [activeCat, setActiveCat] = useState("PASTA");
  const [showSettle, setShowSettle] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [splitPay, setSplitPay] = useState({ card: 0, cash: 0, atoa: 0, tips: 0 });
  const [orderType, setOrderType] = useState<'dine-in'|'takeaway'>('dine-in');

  // --- 3. V4 STATE SYNC ENGINE ---
  useEffect(() => {
    const syncV4 = async () => {
      const { data, error } = await supabase
        .from('active_tables')
        .select('*');
      
      if (data) {
        // Map legacy table names to the V4 state
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
  }, []);

  const currentTable = v4Tables.find(t => t.id === activeTable) || { id: activeTable, orders: [], transaction_id: '', table_status: 'open' };
  const currentCart = currentTable.orders;
  const categories = Array.from(new Set(menu.map(m => m.category)));

  const totals = useMemo(() => {
    let gross = 0, vat20 = 0;
    currentCart.forEach(item => {
      const lineTotal = item.price * (item.qty || 1);
      gross += lineTotal;
      const isTaxableAt20 = item.profile === 'hot_food' || (item.profile === 'cold_food' && orderType === 'dine-in');
      if (isTaxableAt20) vat20 += (lineTotal - (lineTotal / 1.2));
    });
    return { gross, vat20, net: gross - vat20 };
  }, [currentCart, orderType]);

  // --- 4. ATOA SANDBOX BRIDGE ---
  const triggerAtoa = async () => {
    const amount = totals.gross;
    if (amount <= 0) return toast.error("CANNOT SETTLE ZERO BALANCE");

    toast.loading("SECURING ATOA VAULT...");

    // 1. Log Intent in atoa_payments
    const { error: vaultError } = await supabase
      .from('atoa_payments')
      .insert({
        transaction_id: currentTable.transaction_id,
        amount: amount,
        status: 'PENDING'
      });

    if (vaultError) return toast.error("VAULT LOCK FAILED");

    // 2. Open Atoa Sandbox (Simulated for this build)
    toast.dismiss();
    const sandboxSim = confirm(`ATOA SANDBOX: Pay £${amount.toFixed(2)}?\nRef: ${currentTable.transaction_id}`);
    
    if (sandboxSim) {
      setSplitPay({ ...splitPay, atoa: amount });
      toast.success("SANDBOX: PAYMENT COMPLETED");
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
    
    const { error } = await supabase
      .from('active_tables')
      .upsert({ 
        table_number: activeTable, 
        orders: hardenedOrders,
        transaction_id: currentTable.transaction_id,
        table_status: 'open'
      }, { onConflict: 'table_number' });

    if (!error) {
      setV4Tables(prev => prev.map(t => t.id === activeTable ? { ...t, orders: hardenedOrders } : t));
      toast.success(`T${activeTable} HARDENED TO LEDGER`);
    } else {
      toast.error("LEDGER SYNC FAILED");
    }
  };

  const finalize = async () => {
    const totalPaid = splitPay.card + splitPay.cash + splitPay.atoa;
    if (totalPaid < totals.gross && totalPaid > 0) {
      if (!confirm("Payment is partial. Proceed with closing?")) return;
    }

    const tx = { 
      id: crypto.randomUUID(), 
      table_id: activeTable, 
      items: currentCart, 
      gross_sales: totals.gross,
      vat_total: totals.vat20, 
      tips_total: splitPay.tips, 
      payment_split: splitPay,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('sales_ledger').insert([tx]);
    
    if (!error) {
      // Clear local and remote table
      await supabase.from('active_tables').update({ orders: [], table_status: 'open', transaction_id: crypto.randomUUID() }).eq('table_number', activeTable);
      setV4Tables(prev => prev.map(t => t.id === activeTable ? { ...t, orders: [], transaction_id: crypto.randomUUID() } : t));
      setSplitPay({ card: 0, cash: 0, atoa: 0, tips: 0 });
      setShowSettle(false);
      toast.success("SALE HARDENED: GOLD SECURED");
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: CHARCOAL, color: 'white', fontFamily: 'monospace', overflow: 'hidden' }}>
      
      {/* 1. RAIL */}
      <aside style={{ width: '85px', background: '#000', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', padding: '10px', gap: '8px' }}>
        {TABLES.map(t => {
          const tData = v4Tables.find(v => v.id === t);
          const hasOrders = (tData?.orders?.length || 0) > 0;
          return (
            <button key={t} onClick={() => setActiveTable(t)} 
              style={{ 
                height: '50px', 
                border: `1px solid ${activeTable === t ? DOJO_GREEN : (hasOrders ? '#555' : '#222')}`, 
                color: activeTable === t ? DOJO_GREEN : '#666', 
                background: activeTable === t ? 'rgba(0,204,102,0.1)' : 'transparent', 
                fontWeight: 'bold' 
              }}>T{t}</button>
          );
        })}
        <button onClick={async () => {
          const { data } = await supabase.from('sales_ledger').select('*').order('created_at', { ascending: false }).limit(15);
          setHistory(data || []);
          setShowHistory(true);
        }} style={{ marginTop: 'auto', height: '55px', border: '1px solid #333' }}><History size={22} color={DOJO_GREEN}/></button>
        <button onClick={() => setShowAdmin(!showAdmin)} style={{ height: '55px', border: '1px solid #333' }}><Settings size={22} color={showAdmin ? DOJO_GREEN : '#444'} /></button>
      </aside>

      {/* 2. MAIN ENGINE */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', background: '#161616' }}>
        {showAdmin ? (
          <div style={{ padding: '40px', overflowY: 'auto' }}>
            <h2 style={{ color: DOJO_GREEN, letterSpacing: '2px', marginBottom: '30px' }}>SYSTEM_ADMIN</h2>
            <button onClick={() => {
                const name = prompt("Item Name:");
                const price = parseFloat(prompt("Price:") || "0");
                const cat = prompt("Category:") || "EXTRAS";
                if(name) setMenu([...menu, { id: crypto.randomUUID(), name, price, category: cat.toUpperCase(), profile: 'hot_food' }]);
            }} style={{ background: DOJO_GREEN, color: '#000', padding: '15px 30px', fontWeight: 'bold', marginBottom: '30px' }}>+ ADD MENU ITEM</button>
            <div style={{ display: 'grid', gap: '10px' }}>{menu.map(m => (<div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', background: '#000', padding: '15px', border: '1px solid #333' }}><span>{m.name} <small style={{ opacity: 0.4 }}>[{m.category}]</small></span><span style={{ color: DOJO_GREEN }}>£{m.price.toFixed(2)}</span></div>))}</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', background: '#000', borderBottom: '1px solid #333', overflowX: 'auto' }}>
              {categories.map(cat => (<button key={cat} onClick={() => setActiveCat(cat)} style={{ padding: '20px 35px', borderRight: '1px solid #333', background: activeCat === cat ? DOJO_GREEN : 'transparent', color: activeCat === cat ? '#000' : '#fff', fontWeight: '900' }}>{cat}</button>))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', padding: '20px', overflowY: 'auto' }}>
              {menu.filter(m => m.category === activeCat).map(item => (<button key={item.id} onClick={() => addToCart(item)} style={{ height: '110px', background: '#222', border: '1px solid #333', padding: '15px', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}><span style={{ fontWeight: 'bold', fontSize: '11px', color: '#ccc' }}>{item.name}</span><span style={{ textAlign: 'right', color: DOJO_GREEN, fontWeight: 'bold', fontSize: '20px' }}>£{item.price.toFixed(2)}</span></button>))}
            </div>
          </>
        )}
      </main>

      {/* 3. SIDEBAR */}
      <aside style={{ width: '380px', background: '#0a0a0a', borderLeft: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', background: '#000', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: DOJO_GREEN, fontWeight: '900', fontSize: '18px' }}>T{activeTable} ACTIVE</span>
            <span style={{ fontSize: '8px', opacity: 0.3 }}>ID: {currentTable.transaction_id}</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setOrderType(orderType === 'dine-in' ? 'takeaway' : 'dine-in')} style={{ fontSize: '10px', border: `1px solid ${DOJO_GREEN}`, padding: '4px 8px', color: DOJO_GREEN }}>{orderType.toUpperCase()}</button>
            <button onClick={() => setV4Tables(prev => prev.map(t => t.id === activeTable ? { ...t, orders: [] } : t))}><Trash2 size={18} opacity={0.3}/></button>
          </div>
        </div>
        <div style={{ flexGrow: 1, padding: '20px', overflowY: 'auto' }}>
          {currentCart.map((i, idx) => (<div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12px', opacity: i.sent ? 0.4 : 1 }}><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{i.sent && <CheckCircle size={12} color={DOJO_GREEN} />}{i.qty}x {i.name}</span><span>£{(i.price * (i.qty || 1)).toFixed(2)}</span></div>))}
        </div>
        <div style={{ padding: '20px', background: '#000', borderTop: '1px solid #333' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '26px', fontWeight: '900', color: DOJO_GREEN, marginBottom: '20px' }}><span style={{ color: 'white', opacity: 0.3 }}>TOTAL</span><span>£{totals.gross.toFixed(2)}</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <button onClick={saveToTable} style={{ background: '#222', color: DOJO_GREEN, padding: '18px', fontWeight: 'bold', border: `1px solid ${DOJO_GREEN}` }}><Save size={20} /><br/>SAVE TAB</button>
            <button onClick={() => {
                const receiptWindow = window.open('', '_blank');
                if (!receiptWindow) return;
                receiptWindow.document.write(`<pre style="font-family: monospace; font-size: 14px; padding: 20px;">MO' MANGIO! - AUTHENTIC ITALIAN\nDate: ${new Date().toLocaleString()}\nTable: ${activeTable}\n----------------------------------------\n${currentCart.map(i => `${i.qty}x ${i.name.padEnd(22)} £${(i.price * (i.qty || 1)).toFixed(2)}`).join('\n')}\n----------------------------------------\nTOTAL: £${totals.gross.toFixed(2)}\nVAT: £${totals.vat20.toFixed(2)}\n----------------------------------------\nGRAZIE MILLE!</pre>`);
                receiptWindow.print();
                receiptWindow.close();
            }} style={{ background: '#222', color: '#fff', padding: '18px', fontWeight: 'bold' }}><Printer size={20} /><br/>RECEIPT</button>
          </div>
          <button onClick={() => setShowSettle(true)} style={{ width: '100%', background: DOJO_GREEN, color: '#000', padding: '20px', fontWeight: '900', fontSize: '18px' }}>SETTLE TRANSACTION</button>
        </div>
      </aside>

      {/* 4. OVERLAYS */}
      {showSettle && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.97)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#111', width: '420px', border: `1px solid ${DOJO_GREEN}`, padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '15px' }}><span style={{ fontWeight: 'bold' }}>SETTLEMENT: TABLE {activeTable}</span><X onClick={() => setShowSettle(false)} style={{ cursor: 'pointer' }} /></div>
            <div style={{ background: '#000', padding: '25px', textAlign: 'center', marginBottom: '25px' }}><span style={{ fontSize: '10px', opacity: 0.5 }}>REMAINING</span><div style={{ fontSize: '42px', color: DOJO_GREEN, fontWeight: '900' }}>£{(totals.gross - (splitPay.card + splitPay.cash + splitPay.atoa)).toFixed(2)}</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <PaymentLine label="CARD" val={splitPay.card} set={v => setSplitPay({...splitPay, card: v})} />
              <PaymentLine label="CASH" val={splitPay.cash} set={v => setSplitPay({...splitPay, cash: v})} />
              <button onClick={triggerAtoa} style={{ background: '#000', border: `1px solid ${DOJO_GREEN}`, color: DOJO_GREEN, padding: '15px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>ATOA (0.7%)</span>
                <span style={{ fontSize: '20px' }}>£{splitPay.atoa.toFixed(2)}</span>
              </button>
              <PaymentLine label="TIPS" val={splitPay.tips} set={v => setSplitPay({...splitPay, tips: v})} />
            </div>
            <button onClick={finalize} style={{ width: '100%', background: DOJO_GREEN, color: '#000', padding: '20px', marginTop: '30px', fontWeight: '900', fontSize: '18px' }}>FINALIZE SALE</button>
          </div>
        </div>
      )}

      {showHistory && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.97)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#111', width: '500px', border: `1px solid ${DOJO_GREEN}`, padding: '40px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}><span>HISTORY</span><X onClick={() => setShowHistory(false)}/></div>
             <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {history.map(tx => (
                  <div key={tx.id} style={{ padding: '10px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between' }}>
                    <span>T{tx.table_id} - £{tx.gross_sales.toFixed(2)}</span>
                    <span style={{ opacity: 0.3 }}>{new Date(tx.created_at).toLocaleTimeString()}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}

      <Toaster theme="dark" position="top-center" richColors />
    </div>
  );
}

function PaymentLine({ label, val, set }: { label: string, val: number, set: (v: number) => void }) {
    return (<div style={{ display: 'flex', alignItems: 'center', background: '#000', border: '1px solid #333', padding: '12px' }}><span style={{ fontSize: '10px', width: '90px', fontWeight: 'bold' }}>{label}</span><input type="number" value={val || ''} onChange={e => set(parseFloat(e.target.value) || 0)} style={{ flexGrow: 1, background: 'transparent', border: 'none', color: DOJO_GREEN, textAlign: 'right', fontSize: '24px', fontWeight: '900', outline: 'none' }} /></div>);
}