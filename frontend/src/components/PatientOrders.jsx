import { useState, useEffect } from 'react';
import { ShoppingBag, Eye, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import medicineService from '../services/medicineService';
import { useToast } from '../context/ToastContext';
import { formatDateTime } from '../utils/formatters';
import Badge from './ui/Badge';
import EmptyState from './ui/EmptyState';

export default function PatientOrders() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await medicineService.getOrders();
      setOrders(data.orders || []);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing': return <Package size={14}/>;
      case 'shipped': return <Truck size={14}/>;
      case 'delivered': return <CheckCircle size={14}/>;
      default: return <Clock size={14}/>;
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'processing': return 'warning';
      case 'shipped': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'neutral';
    }
  };

  const parseMedicines = (itemsJson) => {
    try {
      const items = JSON.parse(itemsJson);
      return items.map(i => `${i.medicine_id} (x${i.quantity})`).join(', ');
    } catch (e) {
      return 'N/A';
    }
  };

  if (loading) return <div className="space-y-4">{[1,2,3].map(i=><div key={i} className="skeleton h-16 rounded-xl"/>)}</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center"><ShoppingBag size={24}/></div>
        <div><h2 className="text-xl font-bold">My Medicine Orders</h2><p className="text-sm text-slate-500">Track your pharmacy orders</p></div>
      </div>

      {orders.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Order Number</th>
                  <th className="px-6 py-4">Order Date</th>
                  <th className="px-6 py-4">Medicines</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Payment Status</th>
                  <th className="px-6 py-4">Delivery Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">#{order.id}</td>
                    <td className="px-6 py-4">{formatDateTime(order.created_at)}</td>
                    <td className="px-6 py-4 max-w-xs truncate" title={parseMedicines(order.items_json)}>
                      {parseMedicines(order.items_json)}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">₹{order.total_price}</td>
                    <td className="px-6 py-4">
                      <Badge variant="success">Paid</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusVariant(order.status)} className="flex items-center gap-1 w-max">
                        {getStatusIcon(order.status)} {order.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <button className="btn btn-secondary btn-sm p-2" title="View Order Details">
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState icon={<ShoppingBag size={48}/>} title="No orders found." description="Your pharmacy orders will appear here." />
      )}
    </div>
  );
}
