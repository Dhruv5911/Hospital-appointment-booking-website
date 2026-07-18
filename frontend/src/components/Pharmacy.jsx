import { useState, useEffect } from 'react';
import { Pill, Search, ShoppingCart, Heart, Plus, Minus, Trash2, Check, AlertTriangle, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import medicineService from '../services/medicineService';
import { MEDICINE_CATEGORIES } from '../utils/constants';

export default function Pharmacy() {
  const toast = useToast();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('med_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => { loadMedicines(); }, [category]);
  useEffect(() => { localStorage.setItem('med_cart', JSON.stringify(cart)); }, [cart]);

  const loadMedicines = async () => {
    setLoading(true);
    try {
      const data = await medicineService.getAll(search, category);
      setMedicines(data.medicines || []);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => { e.preventDefault(); loadMedicines(); };

  const addToCart = (med) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === med.id);
      if (existing) {
        if (existing.quantity >= med.stock) { toast.warning('Max stock reached'); return prev; }
        toast.success(`Added another ${med.name}`);
        return prev.map(i => i.id === med.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      toast.success(`${med.name} added to cart`);
      return [...prev, { ...med, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        if (newQ > item.stock) { toast.warning('Max stock reached'); return item; }
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const totalCart = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const placeOrder = async () => {
    if (!address.trim()) { toast.warning('Please enter delivery address'); return; }
    setPlacingOrder(true);
    try {
      const items = cart.map(i => ({ medicine_id: i.id, quantity: i.quantity, price: i.price }));
      await medicineService.placeOrder(items, address);
      toast.success('Order placed successfully!');
      setCart([]);
      setIsCartOpen(false);
      setAddress('');
      loadMedicines(); // Refresh stock
    } catch (e) { toast.error(e.message); }
    finally { setPlacingOrder(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="glass-card p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0"><Pill size={24}/></div>
          <div><h2 className="text-xl font-bold">Online Pharmacy</h2><p className="text-sm text-slate-500">Genuine medicines delivered to you</p></div>
        </div>
        <form onSubmit={handleSearch} className="flex-1 max-w-xl w-full flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)} className="form-input pl-10" placeholder="Search medicines..."/>
          </div>
          <button type="submit" className="btn btn-primary"><Search size={16}/></button>
          <button type="button" onClick={()=>setIsCartOpen(true)} className="btn btn-secondary relative">
            <ShoppingCart size={18}/>
            {cart.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">{cart.length}</span>}
          </button>
        </form>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button onClick={() => setCategory('')} className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition ${!category ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-50'}`}>All</button>
        {MEDICINE_CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition ${category === c ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-50'}`}>{c}</button>
        ))}
      </div>

      {/* Medicine Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i=><div key={i} className="skeleton h-64 rounded-2xl"/>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {medicines.map(m => (
            <div key={m.id} className="glass-card p-4 flex flex-col group relative overflow-hidden">
              {m.discount > 0 && <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">{m.discount}% OFF</div>}
              {m.requires_prescription && <div className="absolute top-2 left-2 text-rose-500" title="Prescription Required"><FileText size={14}/></div>}
              <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl mb-3 flex items-center justify-center relative group-hover:bg-slate-200 transition">
                {m.image_url ? <img src={m.image_url} alt={m.name} className="h-full w-full object-contain p-2"/> : <Pill size={40} className="text-slate-300"/>}
                <button className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition"><Heart size={16}/></button>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white line-clamp-1" title={m.name}>{m.name}</h3>
                <p className="text-[11px] text-slate-500 mb-2">{m.category} • {m.unit}</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-lg text-emerald-600">₹{m.price}</span>
                  {m.discount > 0 && <span className="text-xs text-slate-400 line-through">₹{Math.round(m.price * (1 + m.discount/100))}</span>}
                </div>
              </div>
              {m.stock > 0 ? (
                <button onClick={() => addToCart(m)} className="btn btn-primary w-full btn-sm">Add to Cart</button>
              ) : (
                <button disabled className="btn btn-secondary w-full btn-sm">Out of Stock</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Cart Drawer Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end animate-fade-in" onClick={()=>setIsCartOpen(false)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-slide-in-right" onClick={e=>e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart size={20}/> Your Cart</h2>
              <button onClick={()=>setIsCartOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">×</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="text-center py-10"><ShoppingCart size={48} className="mx-auto text-slate-200 mb-3"/><p className="text-slate-500">Your cart is empty</p></div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4 p-3 border rounded-xl dark:border-slate-800">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                        {item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-contain p-1"/> : <Pill size={24} className="text-slate-400"/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate">{item.name}</h4>
                        <p className="text-emerald-600 font-bold text-sm mt-1">₹{item.price}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                            <button onClick={()=>updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center rounded bg-white shadow-sm hover:text-emerald-600"><Minus size={12}/></button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={()=>updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center rounded bg-white shadow-sm hover:text-emerald-600"><Plus size={12}/></button>
                          </div>
                          <button onClick={()=>removeFromCart(item.id)} className="text-rose-400 hover:text-rose-600 p-1"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-6 space-y-3">
                    <label className="form-label">Delivery Address</label>
                    <textarea value={address} onChange={e=>setAddress(e.target.value)} className="form-input" rows="3" placeholder="Enter complete address"/>
                    {cart.some(i => i.requires_prescription) && (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2">
                        <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5"/>
                        <p className="text-xs text-amber-700">Some items require a prescription. You will need to show it at delivery.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <div className="flex justify-between mb-4"><span className="text-slate-500">Total Amount:</span><span className="font-bold text-xl">₹{totalCart}</span></div>
                <button onClick={placeOrder} disabled={placingOrder} className="btn btn-primary w-full btn-lg">
                  {placingOrder ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Check size={18}/>}
                  {placingOrder ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
