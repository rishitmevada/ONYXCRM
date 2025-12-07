import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  Settings, 
  Plus, 
  Search, 
  Trash2, 
  Save, 
  X, 
  Printer, 
  Mail, 
  Share2, 
  Phone, 
  DollarSign, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  Calendar as CalendarIcon, 
  Filter, 
  Upload, 
  Image as ImageIcon, 
  Info, 
  Edit, 
  Download, 
  FileSpreadsheet, 
  Database, 
  RefreshCw, 
  Globe, 
  User, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Send, 
  FilePlus, 
  ArrowLeft,
  MoreVertical,
  BookOpen,
  MessageCircle,
  Activity,
  BarChart, 
  LogOut,
  Lock,
  UserCircle,
  Shield,
  Key,
  CircleDollarSign
} from 'lucide-react';

// --- Mock Users (Initial Data - Fallback) ---
const INITIAL_USERS = [
  { id: 1, username: 'admin', password: '123', role: 'admin', name: 'Administrator' },
];

// --- Mock Data (Fallback) ---
const INITIAL_PRODUCTS = [
  { id: 1, name: 'OM-200 Hydraulic Press', price: 15000, currency: 'USD', category: 'Hydraulic', sku: 'HP-200', hsn: '8462', details: 'High pressure hydraulic press for industrial use.\n- Capacity: 200 Tons\n- Stroke: 500mm\n- Motor: 15HP', optionalDetails: 'Includes 1 year onsite warranty.', image: null },
];

const INITIAL_CUSTOMERS = [];
const INITIAL_QUOTES = [];
const INITIAL_CATEGORIES = [
  'WET PROCESS MACHINES', 
  'DRY PROCESS MACHINES', 
  'AUXILIARY MACHINES', 
  'Hydraulic', 
  'CNC', 
  'Logistics', 
  'Parts'
];

const STATUS_OPTIONS = [
  { value: 'Draft', label: 'Draft', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  { value: 'Sent', label: 'Sent', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { value: 'Follow Up', label: 'Follow Up', color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { value: 'Order Confirmed', label: 'Order Confirmed', color: 'bg-green-50 text-green-600 border-green-200' },
  { value: 'Rejected', label: 'Rejected', color: 'bg-red-50 text-red-600 border-red-200' },
];

const DEFAULT_RATES = {
  USD: 84.00,
  EUR: 90.00,
  GBP: 105.00,
  AED: 22.80
};

const COMPANY_INFO = {
  name: 'ONYX MACHINERY PRIVATE LIMITED',
  address: '40, UDAY INDUSTRIAL ESTATE, OPP.GIDC, ODHAV',
  city: 'AHMEDABAD - 382 415. GUJARAT, INDIA.',
  email: 'sales@onyxmachinery.com',
  website: 'www.onyxmachinery.in',
  phone: '+91 70 41 40 35 91 | +91 72 27 82 82 84',
  taxId: 'GSTIN: 24AACCO7920N1Z6'
};

const DEFAULT_TERMS = "1. Validity: This quotation is valid for 30 days from the date of issue.\n2. Payment: 50% advance along with purchase order, balance before dispatch.\n3. Delivery: Ex-works our factory. Shipping charges extra at actuals.\n4. Taxes: GST as applicable will be charged extra.\n5. Warranty: 12 months against manufacturing defects from the date of supply.";

// --- Helper Components ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', onClick, className = "", type="button", ...props }) => {
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    secondary: "bg-orange-500 text-white hover:bg-orange-600",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-500 hover:bg-slate-100",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
  };
  
  return (
    <button 
      type={type}
      onClick={onClick} 
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Badge = ({ status }) => {
  const style = STATUS_OPTIONS.find(s => s.value === status)?.color || "bg-slate-100 text-slate-600";
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${style}`}>
      {status}
    </span>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

const formatCurrency = (amount, currency) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount);
};

// --- Utilities ---

// API Service for Server Communication
const apiService = {
  loadData: async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed to load data');
      return await response.json();
    } catch (error) {
      console.error("API Load Error:", error);
      return null;
    }
  },
  saveData: async (key, data) => {
    try {
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, data })
      });
    } catch (error) {
      console.error(`API Save Error (${key}):`, error);
    }
  }
};

const downloadCSV = (data, filename) => {
  if (!data || !data.length) {
    console.error("No data to export");
    return;
  }
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','), 
    ...data.map(row => headers.map(fieldName => {
      let value = row[fieldName];
      if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value).replace(/"/g, '""');
      } else if (typeof value === 'string') {
        value = value.replace(/"/g, '""');
      }
      return `"${value}"`;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// --- Login Component ---

const LoginView = ({ onLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-900">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-slate-800 mb-2 tracking-tighter">ONYX <span className="text-orange-500">CRM</span></div>
          <p className="text-slate-500 text-sm">Please sign in to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
            <input 
              type="text" 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              placeholder="Enter username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input 
              type="password" 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
          
          <button type="submit" className="w-full py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors">
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs text-center text-slate-400">Default Accounts (if unchanged):</p>
          <div className="flex justify-center gap-4 mt-2 text-xs text-slate-500">
            <span className="bg-slate-100 px-2 py-1 rounded">admin / 123</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Components ---

const CurrencyView = ({ exchangeRates, setExchangeRates, currentUser }) => {
  const [rates, setRates] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Local editing state for rates (buffer)
  const [editingRates, setEditingRates] = useState(exchangeRates);

  // Sync editingRates when props change (e.g. initial load)
  useEffect(() => {
    setEditingRates(exchangeRates);
  }, [exchangeRates]);
  
  // Calculator State
  const [amount, setAmount] = useState(1);
  const [fromCurr, setFromCurr] = useState('USD');
  const [toCurr, setToCurr] = useState('INR');

  useEffect(() => {
    // Fetch live rates from open API (Base INR)
    const fetchRates = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/INR');
        const data = await response.json();
        if (data.result === 'success') {
          setRates(data.rates);
          setLastUpdated(new Date(data.time_last_update_utc).toLocaleString());
        } else {
          setError('Failed to fetch rates');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  const majorCurrencies = ['USD', 'EUR', 'GBP', 'AED', 'JPY', 'AUD', 'CAD', 'CNY'];

  const convert = (val, from, to) => {
    if (!rates) return 0;
    const amountInINR = val / rates[from];
    const amountInTo = amountInINR * rates[to];
    return amountInTo;
  };
  
  // Update local editing state
  const handleRateChange = (currency, value) => {
      setEditingRates(prev => ({
          ...prev,
          [currency]: parseFloat(value) || 0
      }));
  };

  // Save to global state (persisted in App)
  const handleSaveRates = () => {
      setExchangeRates(editingRates);
      alert("Official exchange rates have been saved successfully.");
  };

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
       <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Currency Rates</h2>
        {lastUpdated && <span className="text-xs text-slate-400">Updated: {lastUpdated}</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Set Currency Rates (Manual) - Only for Admin */}
        {isAdmin && (
          <Card className="p-6 h-full flex flex-col">
              <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                  <Settings size={20} className="text-slate-600" /> Set Official Exchange Rates
              </h3>
              <p className="text-xs text-slate-500 mb-4">Define internal rates for quotation generation (Base: INR).</p>
              
              <div className="space-y-4 flex-1">
                  {['USD', 'EUR', 'GBP', 'AED'].map(curr => (
                      <div key={curr} className="flex items-center gap-3">
                          <div className="w-16 font-bold text-slate-700">{curr}</div>
                          <div className="text-slate-400 text-sm">=</div>
                          <div className="flex-1 relative">
                              <span className="absolute left-3 top-2 text-slate-400 text-xs">₹</span>
                              <input 
                                  type="number" 
                                  step="0.01"
                                  className="w-full pl-6 pr-3 py-1.5 border border-slate-200 rounded text-sm font-medium focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                  value={editingRates[curr]}
                                  onChange={(e) => handleRateChange(curr, e.target.value)}
                              />
                          </div>
                          <div className="text-xs text-slate-400">INR</div>
                      </div>
                  ))}
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                  <Button className="w-full justify-center" onClick={handleSaveRates}>
                      <Save size={16} /> Save Official Rates
                  </Button>
              </div>
          </Card>
        )}

        {/* Live Rates Card */}
        <Card className="p-6 h-full">
          <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <Globe size={20} className="text-blue-500" /> Live Market Rates
          </h3>
          {loading ? (
             <div className="text-center py-10 text-slate-400">Loading live rates...</div>
          ) : error ? (
             <div className="text-center py-10 text-red-400">{error}</div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 text-xs font-bold text-slate-400 uppercase border-b pb-2 mb-2">
                <span>Currency</span>
                <span className="text-right">Rate (INR)</span>
                <span className="text-right">Inv (1 INR)</span>
              </div>
              {majorCurrencies.map(curr => {
                const rate = rates[curr];
                const inrValue = 1 / rate;
                return (
                  <div key={curr} className="grid grid-cols-3 items-center text-sm py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50 rounded px-2 -mx-2">
                    <div className="font-bold text-slate-700 flex items-center gap-2">
                      <span className="w-6 h-4 bg-slate-200 rounded inline-block"></span> {/* Placeholder flag */}
                      {curr}
                    </div>
                    <div className="text-right font-mono text-slate-800">
                      ₹{inrValue.toFixed(2)}
                    </div>
                    <div className="text-right font-mono text-slate-400 text-xs">
                      {rate.toFixed(4)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Calculator Card */}
        <Card className="p-6 h-fit">
           <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <RefreshCw size={20} className="text-orange-500" /> Quick Converter
           </h3>
           <div className="space-y-4">
             <div>
               <label className="block text-xs font-medium text-slate-500 mb-1">Amount</label>
               <input 
                 type="number" 
                 className="w-full p-2 border border-slate-200 rounded-lg"
                 value={amount}
                 onChange={e => setAmount(parseFloat(e.target.value))}
               />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
                  <select 
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                    value={fromCurr}
                    onChange={e => setFromCurr(e.target.value)}
                  >
                     <option value="INR">INR</option>
                     {majorCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
                  <select 
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                    value={toCurr}
                    onChange={e => setToCurr(e.target.value)}
                  >
                     <option value="INR">INR</option>
                     {majorCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </div>
             </div>
             
             {rates && (
               <div className="mt-6 p-4 bg-slate-900 rounded-lg text-center">
                 <p className="text-slate-400 text-xs mb-1">{amount} {fromCurr} =</p>
                 <p className="text-2xl font-bold text-white">
                   {convert(amount, fromCurr, toCurr).toFixed(2)} <span className="text-base font-normal text-slate-400">{toCurr}</span>
                 </p>
               </div>
             )}
           </div>
        </Card>
      </div>
    </div>
  );
};

const CustomersView = ({ customers, setCustomers, currentUser, users }) => {
  // ... existing CustomersView logic ...
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', contactPerson: '', email: '', phone: '', website: '', address: '', state: '', country: ''
  });

  const visibleCustomers = customers.filter(c => 
    currentUser.role === 'admin' || c.userId === currentUser.id
  );

  const filteredCustomers = visibleCustomers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setCustomers(customers.map(c => c.id === editingId ? { ...formData, id: editingId, userId: c.userId } : c));
    } else {
      setCustomers([...customers, { ...formData, id: Date.now(), userId: currentUser.id }]);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', contactPerson: '', email: '', phone: '', website: '', address: '', state: '', country: '' });
  };

  const handleEdit = (customer) => {
    setFormData(customer);
    setEditingId(customer.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ name: '', contactPerson: '', email: '', phone: '', website: '', address: '', state: '', country: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Customers</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="secondary" onClick={handleAddNew}><Plus size={16} /> Add Customer</Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
            <tr>
              <th className="p-4 font-medium">Company Name</th>
              <th className="p-4 font-medium">Contact Person</th>
              <th className="p-4 font-medium">Contact Info</th>
              <th className="p-4 font-medium">Location</th>
              {currentUser.role === 'admin' && <th className="p-4 font-medium">Owner</th>}
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCustomers.length > 0 ? filteredCustomers.map(customer => {
              const owner = users?.find(u => u.id === customer.userId);
              const ownerName = owner ? owner.name : `User #${customer.userId}`;
              return (
              <tr key={customer.id} className="hover:bg-slate-50 group">
                <td className="p-4 font-medium text-slate-800">{customer.name}</td>
                <td className="p-4 text-slate-600">{customer.contactPerson}</td>
                <td className="p-4 text-slate-600">
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="flex items-center gap-1"><Mail size={12}/> {customer.email}</span>
                    <span className="flex items-center gap-1"><Phone size={12}/> {customer.phone}</span>
                  </div>
                </td>
                <td className="p-4 text-slate-600">
                  {customer.state}, {customer.country}
                </td>
                {currentUser.role === 'admin' && (
                  <td className="p-4 text-xs text-slate-500">
                    <span className="bg-slate-100 px-2 py-1 rounded">{ownerName}</span>
                  </td>
                )}
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(customer)} className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded"><Edit size={16}/></button>
                    <button onClick={() => handleDelete(customer.id)} className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            )}) : (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-400">No customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Customer" : "Add New Customer"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form Content */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Company Name</label>
            <input required type="text" className="w-full p-2 border rounded-md text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Contact Person</label>
              <input type="text" className="w-full p-2 border rounded-md text-sm" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
              <input type="text" className="w-full p-2 border rounded-md text-sm" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
            <input type="email" className="w-full p-2 border rounded-md text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Address</label>
            <textarea rows="2" className="w-full p-2 border rounded-md text-sm" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
              <input type="text" className="w-full p-2 border rounded-md text-sm" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Country</label>
              <input type="text" className="w-full p-2 border rounded-md text-sm" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Customer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const ProductsView = ({ products, setProducts, categories, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Changed default currency to INR here
  const [formData, setFormData] = useState({
    name: '', price: '', currency: 'INR', category: categories[0] || '', sku: '', hsn: '', details: '', optionalDetails: '', image: null
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 800000) { 
        console.warn("Image too large"); 
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const productData = { 
      ...formData, 
      price: parseFloat(formData.price) 
    };
    
    if (editingId) {
      setProducts(products.map(p => p.id === editingId ? { ...productData, id: editingId } : p));
    } else {
      setProducts([...products, { ...productData, id: Date.now() }]);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', price: '', currency: 'USD', category: categories[0] || '', sku: '', hsn: '', details: '', optionalDetails: '', image: null });
  };

  const handleEdit = (product) => {
    // Ensure currency defaults to INR if missing
    setFormData({ ...product, currency: product.currency || 'INR' });
    setEditingId(product.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this product?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleAddNew = () => {
    setEditingId(null);
    // Changed default currency to INR here as well
    setFormData({ name: '', price: '', currency: 'INR', category: categories[0] || '', sku: '', hsn: '', details: '', optionalDetails: '', image: null });
    setIsModalOpen(true);
  };

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Product Catalog</h2>
        {isAdmin && (
          <Button variant="secondary" onClick={handleAddNew}><Plus size={16} /> Add Product</Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-lg border border-slate-200">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by name or SKU..." 
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="p-2 border border-slate-200 rounded-lg text-sm bg-white min-w-[200px]"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <Card key={product.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow group">
            <div className="h-32 bg-slate-100 flex items-center justify-center border-b border-slate-100 relative">
               {product.image ? (
                 <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
               ) : (
                 <Package size={40} className="text-slate-300" />
               )}
               {isAdmin && (
                 <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                   <button onClick={() => handleEdit(product)} className="p-2 bg-white rounded-full shadow-sm hover:text-blue-600"><Edit size={14}/></button>
                   <button onClick={() => handleDelete(product.id)} className="p-2 bg-white rounded-full shadow-sm hover:text-red-600"><Trash2 size={14}/></button>
                 </div>
               )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{product.category}</span>
                <span className="text-xs text-slate-400 font-mono">{product.sku}</span>
              </div>
              <h3 className="font-bold text-slate-800 mb-1 line-clamp-1" title={product.name}>{product.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">{product.details}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <span className="font-bold text-slate-900">{formatCurrency(product.price, product.currency)}</span>
              </div>
            </div>
          </Card>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">
            No products found matching your criteria.
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Product" : "Add New Product"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Product Image</label>
            <div className="flex items-center gap-4">
              {formData.image && (
                <div className="w-16 h-16 rounded-md overflow-hidden border border-slate-200 bg-slate-50">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <label className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-md text-sm text-slate-600 transition-colors border border-slate-200">
                <Upload size={16} />
                <span>{formData.image ? 'Change Image' : 'Upload Image'}</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
              {formData.image && (
                 <button type="button" onClick={() => setFormData({...formData, image: null})} className="text-red-500 text-xs hover:underline">Remove</button>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Recommended: JPG/PNG under 800KB.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Product Name</label>
            <input required type="text" className="w-full p-2 border rounded-md text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">SKU</label>
              <input type="text" className="w-full p-2 border rounded-md text-sm" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">HSN Code</label>
              <input type="text" className="w-full p-2 border rounded-md text-sm" value={formData.hsn} onChange={e => setFormData({...formData, hsn: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Price</label>
              <input required type="number" className="w-full p-2 border rounded-md text-sm" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Currency</label>
              <select className="w-full p-2 border rounded-md text-sm bg-white" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}>
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
            <select className="w-full p-2 border rounded-md text-sm bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
            <textarea rows="3" className="w-full p-2 border rounded-md text-sm" value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})} />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Product</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const SettingsView = ({ products, customers, quotes, categories, setProducts, setCustomers, setQuotes, setCategories, users, setUsers, currentUser }) => {
  // ... existing SettingsView logic ...
  const [importStatus, setImportStatus] = useState('');
  
  // User Management State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userData, setUserData] = useState({ name: '', username: '', password: '', role: 'user' });

  const handleBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      products,
      customers,
      quotes,
      categories,
      users
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "onyx_crm_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleRestore = (e) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (json.products && json.customers && json.quotes) {
          if(window.confirm("This will overwrite your current data. Are you sure?")) {
            setProducts(json.products);
            setCustomers(json.customers);
            setQuotes(json.quotes);
            if(json.categories) setCategories(json.categories);
            if(json.users) setUsers(json.users);
            setImportStatus('Data restored successfully!');
            setTimeout(() => setImportStatus(''), 3000);
          }
        } else {
          setImportStatus('Error: Invalid backup file format.');
        }
      } catch (err) {
        setImportStatus('Error: Could not parse file.');
      }
    };
  };

  // User Management Functions
  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...userData, id: u.id } : u));
    } else {
      // Check username uniqueness
      if (users.some(u => u.username === userData.username)) {
        alert("Username already exists.");
        return;
      }
      setUsers([...users, { ...userData, id: Date.now() }]);
    }
    setIsUserModalOpen(false);
    setEditingUser(null);
    setUserData({ name: '', username: '', password: '', role: 'user' });
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserData({ name: user.name, username: user.username, password: user.password, role: user.role });
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = (id) => {
    if (id === currentUser.id) {
      alert("You cannot delete your own account.");
      return;
    }
    if (window.confirm("Are you sure? This user will lose access immediately.")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const openNewUserModal = () => {
    setEditingUser(null);
    setUserData({ name: '', username: '', password: '', role: 'user' });
    setIsUserModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">System Settings</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* User Management Card */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 text-slate-800">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">User Management</h3>
                <p className="text-sm text-slate-500">Manage access credentials and roles.</p>
              </div>
            </div>
            <Button variant="secondary" onClick={openNewUserModal}><Plus size={16} /> Add User</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Username</th>
                  <th className="p-3 font-medium">Role</th>
                  <th className="p-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="group hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-800">{u.name} {u.id === currentUser.id && '(You)'}</td>
                    <td className="p-3 text-slate-600">{u.username}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                        {u.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEditUser(u)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50"><Edit size={16}/></button>
                        <button onClick={() => handleDeleteUser(u.id)} className={`p-1.5 text-slate-400 rounded hover:bg-red-50 ${u.id === currentUser.id ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-600'}`}><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Export Data Card */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4 text-slate-800">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Export Data</h3>
              <p className="text-sm text-slate-500">Download system data as CSV.</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <button onClick={() => downloadCSV(customers, 'onyx_customers.csv')} className="w-full flex items-center justify-between p-3 border border-slate-200 rounded hover:bg-slate-50 transition-colors group">
              <span className="flex items-center gap-2 font-medium text-slate-700">
                <Users size={18} className="text-slate-400 group-hover:text-green-600" /> Customers
              </span>
              <Download size={16} className="text-slate-400" />
            </button>
            <button onClick={() => downloadCSV(products, 'onyx_products.csv')} className="w-full flex items-center justify-between p-3 border border-slate-200 rounded hover:bg-slate-50 transition-colors group">
              <span className="flex items-center gap-2 font-medium text-slate-700">
                <Package size={18} className="text-slate-400 group-hover:text-green-600" /> Products
              </span>
              <Download size={16} className="text-slate-400" />
            </button>
            <button onClick={() => downloadCSV(quotes, 'onyx_quotes.csv')} className="w-full flex items-center justify-between p-3 border border-slate-200 rounded hover:bg-slate-50 transition-colors group">
              <span className="flex items-center gap-2 font-medium text-slate-700">
                <FileText size={18} className="text-slate-400 group-hover:text-green-600" /> Quotations
              </span>
              <Download size={16} className="text-slate-400" />
            </button>
          </div>
        </Card>

        {/* Backup Card */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4 text-slate-800">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <Database size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">System Backup</h3>
              <p className="text-sm text-slate-500">Create snapshot or restore data.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <h4 className="font-medium text-slate-800 mb-2 flex items-center gap-2">
                <Download size={16} /> Backup Data
              </h4>
              <p className="text-xs text-slate-500 mb-3">Creates a .json file with all app data.</p>
              <Button onClick={handleBackup} variant="primary" className="w-full justify-center">
                Download Backup
              </Button>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 relative">
              <h4 className="font-medium text-slate-800 mb-2 flex items-center gap-2">
                <RefreshCw size={16} /> Restore Data
              </h4>
              <p className="text-xs text-slate-500 mb-3">Upload a previously saved backup file.</p>
              <label className="flex items-center justify-center w-full px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                <span>Select File</span>
                <input type="file" className="hidden" accept=".json" onChange={handleRestore} />
              </label>
              {importStatus && (
                <p className={`text-xs mt-2 text-center ${importStatus.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
                  {importStatus}
                </p>
              )}
            </div>
          </div>
        </Card>

      </div>

      {/* User Modal */}
      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title={editingUser ? "Edit User" : "Add New User"}>
        <form onSubmit={handleUserSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
            <input required type="text" className="w-full p-2 border rounded-md text-sm" value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Username</label>
            <input required type="text" className="w-full p-2 border rounded-md text-sm" value={userData.username} onChange={e => setUserData({...userData, username: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
               <input required type="text" className="w-full p-2 border rounded-md text-sm pr-8" value={userData.password} onChange={e => setUserData({...userData, password: e.target.value})} />
               <Key size={14} className="absolute right-3 top-2.5 text-slate-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Role (Permission Level)</label>
            <select className="w-full p-2 border rounded-md text-sm bg-white" value={userData.role} onChange={e => setUserData({...userData, role: e.target.value})}>
              <option value="user">User (Restricted Access)</option>
              <option value="admin">Admin (Full Access)</option>
            </select>
            <p className="text-[10px] text-slate-500 mt-1">
              {userData.role === 'admin' ? 'Admins can manage users, modify product catalog, and view all data.' : 'Users can only view/edit their own customers and quotations.'}
            </p>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const DashboardView = ({ quotes, customers, setActiveTab, onQuoteClick, currentUser, onCreateNew }) => {
  const [filters, setFilters] = useState({ customerId: '', state: '', country: '', startDate: '', endDate: '', status: '' });
  const [calendarDate, setCalendarDate] = useState(new Date());
  
  // State for the new Chart Card
  const [chartMonth, setChartMonth] = useState(new Date().getMonth());
  const [chartYear, setChartYear] = useState(new Date().getFullYear());

  // Filter customers first based on user role
  const visibleCustomers = useMemo(() => {
    return customers.filter(c => currentUser.role === 'admin' || c.userId === currentUser.id);
  }, [customers, currentUser]);

  const uniqueStates = useMemo(() => [...new Set(visibleCustomers.map(c => c.state).filter(Boolean))], [visibleCustomers]);
  const uniqueCountries = useMemo(() => [...new Set(visibleCustomers.map(c => c.country).filter(Boolean))], [visibleCustomers]);

  // Filter quotes based on user role + UI filters
  const filteredQuotes = useMemo(() => {
    return quotes.filter(q => {
      // 1. Role Filter
      if (currentUser.role !== 'admin' && q.userId !== currentUser.id) return false;

      // 2. UI Filters
      const customer = customers.find(c => c.id === q.customerId);
      if (!customer) return false;
      if (filters.customerId && q.customerId !== parseInt(filters.customerId)) return false;
      if (filters.state && customer.state !== filters.state) return false;
      if (filters.country && customer.country !== filters.country) return false;
      if (filters.startDate && new Date(q.date) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(q.date) > new Date(filters.endDate)) return false;
      if (filters.status && q.status !== filters.status) return false;
      return true;
    });
  }, [quotes, customers, filters, currentUser]);

  // Chart Data Calculation
  const chartData = useMemo(() => {
    const daysInMonth = new Date(chartYear, chartMonth + 1, 0).getDate();
    const data = new Array(daysInMonth).fill(0);
    
    // Only use visible quotes for calculations
    filteredQuotes.forEach(q => {
      const [y, m, d] = q.date.split('-').map(Number);
      if (m - 1 === chartMonth && y === chartYear) {
        data[d - 1] += q.total;
      }
    });
    
    return data.map((val, idx) => ({ day: idx + 1, value: val }));
  }, [filteredQuotes, chartMonth, chartYear]);

  const maxChartValue = Math.max(...chartData.map(d => d.value), 1); // Avoid division by zero
  
  const chartTotal = useMemo(() => chartData.reduce((acc, item) => acc + item.value, 0), [chartData]);

  const totalSales = filteredQuotes.reduce((acc, q) => acc + q.total, 0);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-slate-50 border border-slate-100"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayQuotes = filteredQuotes.filter(q => q.date === dateStr);
      const isToday = dateStr === new Date().toISOString().split('T')[0];

      days.push(
        <div key={day} className={`h-24 border border-slate-200 p-2 relative group hover:bg-slate-50 transition-colors ${isToday ? 'bg-orange-50' : 'bg-white'}`}>
          <span className={`text-sm font-semibold ${isToday ? 'text-orange-600' : 'text-slate-500'}`}>{day}</span>
          <div className="mt-1 space-y-1 overflow-y-auto max-h-[60px] scrollbar-hide">
            {dayQuotes.map(q => {
              const customerName = customers.find(c => c.id === q.customerId)?.name || 'Unknown';
              // Color coding based on status
              let statusColor = 'bg-slate-800'; // Default
              if (q.status === 'Order Confirmed') statusColor = 'bg-green-600';
              if (q.status === 'Follow Up') statusColor = 'bg-orange-500';
              if (q.status === 'Rejected') statusColor = 'bg-red-500';
              if (q.status === 'Sent') statusColor = 'bg-blue-600';

              return (
                <div 
                  key={q.id} 
                  onClick={(e) => { e.stopPropagation(); onQuoteClick(q.id); }}
                  className={`text-xs p-1 rounded ${statusColor} text-white truncate mb-1 cursor-pointer hover:opacity-80 transition-opacity shadow-sm`} 
                  title={`${customerName} - $${q.total.toLocaleString()} (${q.status})`}
                >
                  <span className="font-medium">{customerName}</span>
                  <span className="opacity-90 ml-1 text-[10px]">(${q.total.toLocaleString()})</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return days;
  };

  const changeMonth = (delta) => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + delta, 1));
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <Button variant="secondary" onClick={onCreateNew}>
          <Plus size={16} /> New Quote
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-bold text-slate-700">
          <Filter size={16} /> Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <select className="p-2 border rounded text-sm bg-white" value={filters.customerId} onChange={(e) => setFilters({...filters, customerId: e.target.value})}>
            <option value="">All Customers</option>
            {visibleCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="p-2 border rounded text-sm bg-white" value={filters.state} onChange={(e) => setFilters({...filters, state: e.target.value})}>
            <option value="">All States</option>
            {uniqueStates.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="p-2 border rounded text-sm bg-white" value={filters.country} onChange={(e) => setFilters({...filters, country: e.target.value})}>
            <option value="">All Countries</option>
            {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="p-2 border rounded text-sm bg-white" value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <input type="date" className="p-2 border rounded text-sm" placeholder="Start Date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} />
           <input type="date" className="p-2 border rounded text-sm" placeholder="End Date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} />
        </div>
        {(filters.customerId || filters.state || filters.country || filters.status || filters.startDate) && (
          <div className="mt-3 flex justify-end">
            <button onClick={() => setFilters({customerId: '', state: '', country: '', startDate: '', endDate: '', status: ''})} className="text-xs text-red-500 hover:text-red-700 underline">
              Clear Filters
            </button>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { 
            label: 'Visible Quotes', 
            value: filteredQuotes.length, 
            icon: FileText, 
            color: 'text-blue-600',
            action: () => setActiveTab('quotes') // Link to Quotations page
          },
          { 
            label: 'Total Customers', 
            value: visibleCustomers.length, 
            icon: Users, 
            color: 'text-orange-600',
            action: () => setActiveTab('customers') // Link to Customers page
          }
        ].map((stat, i) => (
          <div 
            key={i} 
            onClick={stat.action}
            className="cursor-pointer transition-transform hover:scale-[1.01]"
          >
            <Card className="p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`p-4 rounded-full bg-slate-50 ${stat.color}`}>
                <BarChart size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium hover:text-blue-600 transition-colors flex items-center gap-1">
                  {stat.label} <ChevronRight size={14} className="opacity-50" />
                </p>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6 h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <CalendarIcon size={18} /> Calendar View
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-100 rounded"><ChevronLeft size={20}/></button>
                <span className="font-medium text-slate-700 w-32 text-center">
                  {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-100 rounded"><ChevronRight size={20}/></button>
              </div>
            </div>
            <div className="grid grid-cols-7 text-center mb-2 text-xs font-bold text-slate-400 uppercase">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 bg-slate-200 border border-slate-200 gap-px">
              {renderCalendar()}
            </div>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="p-6 h-full flex flex-col">
            <h3 className="font-bold text-slate-800 mb-4">Filtered List</h3>
            <div className="flex-1 overflow-y-auto space-y-3 max-h-[500px] pr-2">
              {filteredQuotes.length > 0 ? (
                filteredQuotes.map(q => (
                  <div 
                    key={q.id} 
                    onClick={() => onQuoteClick(q.id)}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-orange-200 transition-colors cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-slate-800 text-sm group-hover:text-orange-600 transition-colors">{q.id}</span>
                      <Badge status={q.status} />
                    </div>
                    <p className="text-xs text-slate-500 mb-1">{customers.find(c => c.id === q.customerId)?.name}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">{q.date}</span>
                      <span className="font-bold text-slate-700">${q.total.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm text-center py-10">No quotes match the selected filters.</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* New Chart Card at the bottom of Dashboard */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex flex-col">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Activity size={20} className="text-blue-600" /> Monthly Sales Performance
                </h3>
                <p className="text-sm text-slate-500 ml-7 mt-1">
                    Total Generated: <span className="font-bold text-slate-900">{formatCurrency(chartTotal, 'USD')}</span>
                </p>
            </div>
            <div className="flex gap-2">
                <select 
                    className="p-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                    value={chartMonth}
                    onChange={(e) => setChartMonth(parseInt(e.target.value))}
                >
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>
                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </option>
                    ))}
                </select>
                <select
                    className="p-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                    value={chartYear}
                    onChange={(e) => setChartYear(parseInt(e.target.value))}
                >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>
        </div>
        
        <div className="h-64 flex items-end gap-1 sm:gap-2 border-b border-slate-200 pb-2">
            {chartData.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    <div 
                        className="w-full bg-blue-500 hover:bg-blue-600 rounded-t transition-all relative min-h-[4px]"
                        style={{ height: `${(d.value / maxChartValue) * 100}%` }}
                    >
                        {d.value > 0 && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 animate-in fade-in zoom-in duration-200">
                                <div className="bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap font-medium after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-slate-800">
                                    {formatCurrency(d.value, 'USD').replace('$', '')} {/* Simple formatting */}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2 font-medium">{d.day}</div>
                </div>
            ))}
        </div>
        <div className="mt-2 text-center text-xs text-slate-400 font-medium uppercase tracking-wider">Day of Month</div>
      </Card>
    </div>
  );
};

const QuotationBuilder = ({ quotes, setQuotes, customers, products, viewMode, setViewMode, activeQuoteId, setActiveQuoteId, currentUser, users, draftQuote, setDraftQuote, onCreateNew, exchangeRates }) => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  // draftQuote is now a prop, not local state
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Helper: Convert Amount based on Exchange Rates (Base INR)
  const convertAmount = (amount, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return amount;
    
    // Helper to get rate relative to INR (1 Unit = X INR)
    const getRate = (curr) => {
      if (curr === 'INR') return 1;
      return exchangeRates[curr] || 1; // Default to 1 if rate missing
    };

    const rateFrom = getRate(fromCurrency);
    const rateTo = getRate(toCurrency);

    // Convert to INR first, then to target currency
    // Amount in INR = Amount * RateFrom
    // Amount in Target = Amount in INR / RateTo
    return (amount * rateFrom) / rateTo;
  };

  // Visible customers for dropdown
  const visibleCustomers = useMemo(() => {
    return customers.filter(c => currentUser.role === 'admin' || c.userId === currentUser.id);
  }, [customers, currentUser]);

  const filteredQuotes = useMemo(() => {
    let result = quotes;
    // 1. Role Filter
    if (currentUser.role !== 'admin') {
      result = result.filter(q => q.userId === currentUser.id);
    }

    if (statusFilter !== 'All') {
      result = result.filter(q => q.status === statusFilter);
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(q => 
        q.id.toLowerCase().includes(lower) || 
        customers.find(c => c.id === q.customerId)?.name.toLowerCase().includes(lower)
      );
    }
    return result;
  }, [quotes, statusFilter, searchTerm, customers, currentUser]);

  const stats = useMemo(() => {
    // Stats also need to respect role visibility
    const visible = quotes.filter(q => currentUser.role === 'admin' || q.userId === currentUser.id);
    return {
      total: visible.length,
      draft: visible.filter(q => q.status === 'Draft').length,
      sent: visible.filter(q => q.status === 'Sent').length,
      confirmed: visible.filter(q => q.status === 'Order Confirmed').length,
    };
  }, [quotes, currentUser]);

  useEffect(() => {
    if (viewMode === 'create' && !draftQuote) {
      setViewMode('list');
    }
  }, [viewMode, draftQuote, setViewMode]);

  // Enhanced Tax Calculation Logic
  const calculateTaxDetails = (subtotal, customerId) => {
    const customer = customers.find(c => c.id === customerId);
    let tax = 0;
    let taxType = 'inter'; 
    let label = 'Tax';
    let taxBreakdown = [];

    if (customer) {
        const country = customer.country?.toLowerCase().trim();
        const state = customer.state?.toLowerCase().trim();

        if (country !== 'india') {
            tax = 0;
            taxType = 'none';
            label = 'Export (No Tax)';
            taxBreakdown = [{ label: 'Tax (0%)', amount: 0 }];
        } else if (state === 'gujarat') {
            // SGST 8% + CGST 8% = 16%
            const halfTax = subtotal * 0.08;
            tax = halfTax * 2;
            taxType = 'intra';
            label = 'GST (Intra-state)';
            taxBreakdown = [
                { label: 'CGST (8%)', amount: halfTax },
                { label: 'SGST (8%)', amount: halfTax }
            ];
        } else {
            // IGST 18%
            tax = subtotal * 0.18;
            taxType = 'inter';
            label = 'IGST (Inter-state)';
            taxBreakdown = [
                { label: 'IGST (18%)', amount: tax }
            ];
        }
    } else {
        taxType = 'none';
        tax = 0;
        label = 'Tax';
        taxBreakdown = [{ label: 'Tax (0%)', amount: 0 }];
    }
    return { tax, taxType, label, taxBreakdown };
  };

  // handleCreateNew logic moved to App, but we can keep a local wrapper or use prop
  // We use onCreateNew prop for consistency

  const handleEditDraft = (quote) => {
    const currency = quote.currency || (quote.items.length > 0 ? quote.items[0].currency : 'INR');
    setDraftQuote({ ...quote, terms: quote.terms || DEFAULT_TERMS, currency });
    setViewMode('create');
  };

  const handleStatusChange = (id, newStatus) => {
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status: newStatus } : q));
  };

  const handleDeleteQuote = (id) => {
    if (window.confirm("Are you sure you want to delete this quotation? This action cannot be undone.")) {
      setQuotes(prev => prev.filter(q => q.id !== id));
    }
  };

  const handleView = (quote) => {
    setActiveQuoteId(quote.id);
    setViewMode('view');
  };

  const updateDraft = (items, customerId, currency) => {
    // Calculate subtotal using converted prices
    const subtotal = items.reduce((acc, item) => {
      const convertedPrice = convertAmount(item.price, item.currency, currency);
      return acc + (convertedPrice * item.qty);
    }, 0);

    const { tax, taxType } = calculateTaxDetails(subtotal, customerId);
    const total = subtotal + tax;
    
    setDraftQuote(prev => ({ ...prev, items, customerId, subtotal, tax, taxType, total, currency }));
  };

  const handleCurrencyChange = (newCurrency) => {
    if (!draftQuote) return;
    updateDraft(draftQuote.items, draftQuote.customerId, newCurrency);
  };

  const addItemToDraft = (product) => {
    if (!draftQuote) return;
    const existing = draftQuote.items.find(i => i.id === product.id);
    let newItems;
    if (existing) {
      newItems = draftQuote.items.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
    } else {
      newItems = [...draftQuote.items, { ...product, qty: 1 }];
    }
    updateDraft(newItems, draftQuote.customerId, draftQuote.currency);
    setIsProductPickerOpen(false);
  };

  const removeItemFromDraft = (itemId) => {
    const newItems = draftQuote.items.filter(i => i.id !== itemId);
    updateDraft(newItems, draftQuote.customerId, draftQuote.currency);
  };

  const updateItemQty = (itemId, delta) => {
    const newItems = draftQuote.items.map(i => {
      if (i.id === itemId) {
        return { ...i, qty: Math.max(1, i.qty + delta) };
      }
      return i;
    });
    updateDraft(newItems, draftQuote.customerId, draftQuote.currency);
  };

  const handleCustomerChange = (newCustomerId) => {
      updateDraft(draftQuote.items, newCustomerId, draftQuote.currency);
  };

  const saveDraft = () => {
    if (!draftQuote.customerId) {
      // Avoid alert
      return;
    }
    const existingIndex = quotes.findIndex(q => q.id === draftQuote.id);
    if (existingIndex >= 0) {
      const newQuotes = [...quotes];
      newQuotes[existingIndex] = draftQuote;
      setQuotes(newQuotes);
    } else {
      setQuotes([draftQuote, ...quotes]);
    }
    setViewMode('list');
  };

  if (viewMode === 'create') {
    if (!draftQuote) return <div className="p-8 text-center text-slate-500">Loading editor...</div>;
    
    // Calculate display values dynamically based on current draft state
    const { taxBreakdown, label: taxLabel } = calculateTaxDetails(draftQuote.subtotal, draftQuote.customerId);
    const currency = draftQuote.currency || 'INR'; // Use draft currency

    return (
      <div className="h-full flex flex-col bg-slate-100 -m-6 animate-in slide-in-from-right duration-300">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setViewMode('list')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                {draftQuote.id} <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">DRAFT</span>
              </h2>
              <p className="text-xs text-slate-500">Created on {draftQuote.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 mr-2">Total: <strong className="text-slate-900 text-lg">{formatCurrency(draftQuote.total, currency)}</strong></span>
            <Button variant="ghost" onClick={() => setViewMode('list')}>Cancel</Button>
            <Button variant="primary" onClick={saveDraft}>Save Quote</Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Top Section: Customer & Meta */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Customer Selector Card */}
              <Card className="p-6 md:col-span-2 flex flex-col justify-center min-h-[160px]">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <User size={14} /> Customer Details
                </h3>
                {draftQuote.customerId ? (
                  <div className="relative group p-3 border border-slate-200 rounded-lg hover:border-orange-300 transition-colors bg-slate-50">
                      <button 
                        onClick={() => handleCustomerChange('')}
                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                      <div className="font-bold text-slate-800 text-lg">{customers.find(c => c.id === parseInt(draftQuote.customerId))?.name}</div>
                      <div className="text-sm text-slate-600">
                        {customers.find(c => c.id === parseInt(draftQuote.customerId))?.address}, {customers.find(c => c.id === parseInt(draftQuote.customerId))?.state}
                      </div>
                      <div className="text-xs text-slate-400 mt-2">
                        {customers.find(c => c.id === parseInt(draftQuote.customerId))?.email}
                      </div>
                  </div>
                ) : (
                  <select 
                    className="w-full p-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all cursor-pointer"
                    onChange={(e) => handleCustomerChange(parseInt(e.target.value))}
                    value=""
                  >
                    <option value="" disabled>+ Select a Customer</option>
                    {/* Only show visible customers in dropdown */}
                    {visibleCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                )}
              </Card>

              {/* Meta Details Card */}
              <Card className="p-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <Settings size={14} /> Quote Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Issue Date</label>
                    <input 
                      type="date" 
                      className="w-full p-2 border border-slate-200 rounded text-sm"
                      value={draftQuote.date}
                      onChange={(e) => setDraftQuote({...draftQuote, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                    <select 
                      className="w-full p-2 border border-slate-200 rounded text-sm bg-white"
                      value={draftQuote.status}
                      onChange={(e) => setDraftQuote({...draftQuote, status: e.target.value})}
                    >
                        {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  {/* Currency Selector */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Currency</label>
                    <select 
                      className="w-full p-2 border border-slate-200 rounded text-sm bg-white"
                      value={draftQuote.currency}
                      onChange={(e) => handleCurrencyChange(e.target.value)}
                    >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="AED">AED (Dh)</option>
                    </select>
                  </div>
                </div>
              </Card>
            </div>

            {/* Items Section */}
            <Card className="overflow-hidden min-h-[400px] flex flex-col">
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <Package size={18} /> Line Items
                </h3>
                <Button variant="secondary" onClick={() => setIsProductPickerOpen(true)} className="py-1 px-3 text-xs">
                  <Plus size={14} /> Add Item
                </Button>
              </div>
              
              <div className="flex-1 p-0">
                <table className="w-full text-left">
                  <thead className="bg-white text-slate-500 text-xs uppercase border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3 font-medium">Item Description</th>
                      <th className="px-6 py-3 font-medium text-right w-32">Price ({currency})</th>
                      <th className="px-6 py-3 font-medium text-center w-32">Qty</th>
                      <th className="px-6 py-3 font-medium text-right w-32">Total ({currency})</th>
                      <th className="px-6 py-3 w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {draftQuote.items.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-20 text-center text-slate-400">
                          <div className="flex flex-col items-center gap-2">
                            <FilePlus size={40} className="opacity-20" />
                            <span>No items added. Click "Add Item" to start.</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      draftQuote.items.map(item => {
                        const convertedPrice = convertAmount(item.price, item.currency, currency);
                        return (
                        <tr key={item.id} className="group hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-800 text-sm">{item.name}</div>
                            <div className="text-xs text-slate-500">{item.sku}</div>
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-slate-600">
                            {formatCurrency(convertedPrice, currency)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2 border border-slate-200 rounded-md py-1 bg-white">
                                <button className="px-2 text-slate-400 hover:text-slate-800" onClick={() => updateItemQty(item.id, -1)}>-</button>
                                <span className="text-sm font-semibold w-6 text-center">{item.qty}</span>
                                <button className="px-2 text-slate-400 hover:text-slate-800" onClick={() => updateItemQty(item.id, 1)}>+</button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-slate-800">
                              {formatCurrency(convertedPrice * item.qty, currency)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button onClick={() => removeItemFromDraft(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      )})
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-end">
                <div className="w-72 space-y-3">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Subtotal</span>
                    <span>{formatCurrency(draftQuote.subtotal, currency)}</span>
                  </div>
                  
                  {/* Dynamic Tax Rows */}
                  {taxBreakdown.map((taxItem, index) => (
                    <div key={index} className="flex justify-between text-sm text-slate-600">
                      <span>{taxItem.label}</span>
                      <span>{formatCurrency(taxItem.amount, currency)}</span>
                    </div>
                  ))}

                  <div className="flex justify-between text-xl font-bold text-slate-900 border-t border-slate-200 pt-3">
                    <span>Grand Total</span>
                    <span>{formatCurrency(draftQuote.total, currency)}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Terms and Conditions Section */}
            <Card className="p-6">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                <FileText size={18} /> Terms & Conditions
              </h3>
              <textarea
                className="w-full p-3 border border-slate-200 rounded-lg text-sm h-32 focus:ring-2 focus:ring-orange-100 outline-none resize-none font-sans"
                value={draftQuote.terms}
                onChange={(e) => setDraftQuote({...draftQuote, terms: e.target.value})}
                placeholder="Enter terms and conditions here..."
              />
              <div className="mt-2 flex gap-2">
                <button 
                  onClick={() => setDraftQuote({...draftQuote, terms: DEFAULT_TERMS})}
                  className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                >
                  Reset to Default Terms
                </button>
              </div>
            </Card>
          </div>
        </div>

        {isProductPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <div className="relative flex-1 mr-4">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input 
                      autoFocus
                      placeholder="Search products by name or SKU..." 
                      className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-orange-100 transition-all"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>
                <button onClick={() => setIsProductPickerOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2">
                {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase())).map(product => (
                  <div 
                    key={product.id} 
                    onClick={() => addItemToDraft(product)}
                    className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg cursor-pointer group transition-colors border-b border-slate-50 last:border-0"
                  >
                      <div className="w-12 h-12 bg-slate-200 rounded-md overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <img src={product.image} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400"><Package size={20}/></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-800 text-sm group-hover:text-orange-600 transition-colors">{product.name}</div>
                        <div className="text-xs text-slate-500">SKU: {product.sku} | Cat: {product.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-700">{formatCurrency(product.price, product.currency)}</div>
                        <div className="text-xs text-green-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Add +</div>
                      </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (viewMode === 'view' && activeQuoteId) {
     const quote = quotes.find(q => q.id === activeQuoteId);
     const customer = customers.find(c => c.id === quote.customerId);
     // Use dynamic users list to find creator
     const creator = users ? users.find(u => u.id === quote.userId) : null; 
     
     if (!quote) return <div>Quote not found</div>;

     // Calculate breakdown for View mode
     const { taxBreakdown } = calculateTaxDetails(quote.subtotal, quote.customerId);
     const currency = quote.currency || (quote.items[0]?.currency || 'INR'); // Use saved currency
     // Use saved terms or fallback to default if missing (for legacy data)
     const terms = quote.terms || DEFAULT_TERMS;

     const handleWhatsApp = () => {
        if (!customer?.phone) {
            // alert("Customer phone number not available.");
            return;
        }
        // Simple sanitization: remove non-digits
        const phone = customer.phone.replace(/[^0-9]/g, ''); 
        const text = encodeURIComponent(`Hello ${customer.contactPerson}, please find the quotation ${quote.id} from ${COMPANY_INFO.name}.`);
        window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
     };

     const handleEmail = () => {
        if (!customer?.email) return; 
        
        // 1. Open Print Dialog to Save PDF
        window.print();

        // 2. Open Email Client
        setTimeout(() => {
            const subject = encodeURIComponent(`Quotation ${quote.id} - ${COMPANY_INFO.name}`);
            const body = encodeURIComponent(`Dear ${customer.contactPerson},\n\nPlease find the quotation ${quote.id} attached.\n\nBest Regards,\n${COMPANY_INFO.name}`);
            window.location.href = `mailto:${customer.email}?subject=${subject}&body=${body}`;
        }, 1500); // 1.5s delay to let user see print dialog
     };

     return (
       <div className="h-full flex flex-col bg-slate-50 -m-6 p-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 print:hidden">
            <Button variant="ghost" onClick={() => setViewMode('list')}>← Back</Button>
            <div className="flex flex-wrap gap-2 justify-end">
               <Button variant="secondary" onClick={() => handleEditDraft(quote)}>
                 <Edit size={16}/> Edit
               </Button>
               <Button className="bg-green-600 hover:bg-green-700 text-white border-green-600" onClick={handleWhatsApp}>
                 <MessageCircle size={16}/> WhatsApp
               </Button>
               <Button className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600" onClick={handleEmail}>
                 <Mail size={16}/> Email
               </Button>
               <Button variant="outline" onClick={() => window.print()}>
                 <Printer size={16}/> Print / Save PDF
               </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-white shadow-lg max-w-4xl mx-auto w-full p-12 print:shadow-none print:p-0" id="invoice-print">
              <div className="flex justify-between border-b-2 border-slate-900 pb-8 mb-8 items-start">
                {/* Left Side: Company Details */}
                <div className="text-left">
                    <h2 className="font-bold text-slate-800 text-lg">{COMPANY_INFO.name}</h2>
                    <div className="text-sm text-slate-500 mt-1 space-y-0.5">
                      <p>{COMPANY_INFO.address}</p>
                      <p>{COMPANY_INFO.city}</p>
                      <p className="font-semibold text-slate-700">{COMPANY_INFO.taxId}</p>
                      <p>{COMPANY_INFO.email} | {COMPANY_INFO.website}</p>
                      <p>{COMPANY_INFO.phone}</p>
                    </div>
                </div>

                {/* Right Side: Logo, Quotation Title, Number */}
                <div className="flex flex-col items-end text-right">
                    <img src="logo-1.png" alt="Company Logo" className="h-20 mb-2 object-contain" />
                    
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase">Quotation</h1>
                    <p className="text-orange-500 font-bold text-lg">{quote.id}</p>
                </div>
              </div>

              <div className="flex justify-between mb-12 items-start">
                 {/* Left: Customer Details */}
                 <div className="flex-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer</p>
                    <h3 className="font-bold text-slate-800 text-xl">{customer?.name}</h3>
                    <p className="text-slate-600">{customer?.address}, {customer?.state}</p>
                    <p className="text-slate-600 mt-1"><span className="font-bold text-xs text-slate-500 uppercase">Contact :</span> {customer?.contactPerson}</p>
                    <p className="text-slate-600">{customer?.email}</p>
                 </div>

                 {/* Right: Quote Meta Details (Moved here) */}
                 <div className="text-right space-y-1 pt-2">
                    <p className="text-sm"><span className="text-slate-400 font-medium mr-4">Date:</span> <strong>{quote.date}</strong></p>
                    <p className="text-sm"><span className="text-slate-400 font-medium mr-4">Valid Until:</span> <strong>30 Days</strong></p>
                    <p className="text-sm"><span className="text-slate-400 font-medium mr-4">Prepared by:</span> <strong>{creator ? creator.name : 'Admin'}</strong></p>
                 </div>
              </div>

              <table className="w-full mb-8">
                <thead className="bg-slate-50 border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase">Item</th>
                    <th className="py-3 px-4 text-right text-xs font-bold text-slate-500 uppercase">Qty</th>
                    <th className="py-3 px-4 text-right text-xs font-bold text-slate-500 uppercase">Rate</th>
                    <th className="py-3 px-4 text-right text-xs font-bold text-slate-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {quote.items.map((item, idx) => {
                     const convertedPrice = convertAmount(item.price, item.currency, currency);
                     return (
                     <tr key={idx}>
                       <td className="py-4 px-4">
                          <div className="font-bold text-slate-800">{item.name}</div>
                          <div className="text-xs text-slate-500">{item.sku}</div>
                       </td>
                       <td className="py-4 px-4 text-right text-slate-600">{item.qty}</td>
                       <td className="py-4 px-4 text-right text-slate-600">{formatCurrency(convertedPrice, currency)}</td>
                       <td className="py-4 px-4 text-right font-bold text-slate-800">{formatCurrency(convertedPrice * item.qty, currency)}</td>
                     </tr>
                   )})}
                </tbody>
              </table>

              <div className="flex justify-end border-t-2 border-slate-100 pt-8">
                 <div className="w-64 space-y-2">
                    <div className="flex justify-between text-slate-600">
                       <span>Subtotal</span>
                       <span>{formatCurrency(quote.subtotal, currency)}</span>
                    </div>
                    
                    {/* Dynamic Tax Rows in PDF/View */}
                    {taxBreakdown.map((taxItem, index) => (
                      <div key={index} className="flex justify-between text-slate-600">
                        <span>{taxItem.label}</span>
                        <span>{formatCurrency(taxItem.amount, currency)}</span>
                      </div>
                    ))}
                    
                    <div className="flex justify-between text-slate-900 text-xl font-bold pt-4 border-t border-slate-200 mt-2">
                       <span>Total</span>
                       <span>{formatCurrency(quote.total, currency)}</span>
                    </div>
                 </div>
              </div>

              {/* Terms & Conditions View */}
              <div className="mt-12 pt-8 border-t border-slate-100 page-break-inside-avoid">
                <h4 className="font-bold text-slate-800 mb-3 uppercase text-xs tracking-wider">Terms & Conditions</h4>
                <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed font-medium bg-slate-50 p-4 rounded-lg border border-slate-100">
                  {terms}
                </div>
              </div>

              {/* Annexure Section - Forces new page on print */}
              <div className="break-before-page print:break-before-page mt-12 pt-12 border-t-4 border-slate-100">
                 <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight flex items-center justify-center gap-3">
                      <BookOpen className="text-orange-500" /> Annexure
                    </h2>
                    <p className="text-slate-500 mt-2">Technical Specifications & Machine Details</p>
                 </div>

                 <div className="space-y-12">
                   {quote.items.map((item, index) => (
                     <div key={index} className="break-inside-avoid scroll-mt-4">
                       <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-orange-200 pb-2 flex items-center gap-3">
                          <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded text-sm font-mono">Item {index + 1}</span>
                          {item.name}
                       </h3>
                       
                       {/* Modified layout for print consistency */}
                       <div className="flex flex-row gap-6 items-start mt-4">
                          {/* Left: Text Details */}
                          <div className="flex-1 space-y-6">
                            <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                               <h4 className="font-semibold text-slate-700 mb-3 text-xs uppercase tracking-wider flex items-center gap-2">
                                 <Settings size={14} /> Technical Specifications
                               </h4>
                               <p className="text-slate-600 whitespace-pre-wrap leading-relaxed text-sm font-mono">{item.details || 'No specific technical details provided.'}</p>
                            </div>
                            
                            {item.optionalDetails && (
                              <div className="bg-blue-50/50 p-6 rounded-lg border border-blue-100">
                                 <h4 className="font-semibold text-blue-700 mb-3 text-xs uppercase tracking-wider flex items-center gap-2">
                                   <Info size={14} /> Additional Information
                                 </h4>
                                 <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">{item.optionalDetails}</p>
                              </div>
                            )}
                          </div>

                          {/* Right: Image */}
                          {item.image && (
                            <div className="w-64 flex-shrink-0 pt-2">
                               <div className="border border-slate-200 rounded-lg p-1 bg-white">
                                  <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-full h-48 object-contain rounded bg-slate-50" 
                                  />
                               </div>
                            </div>
                          )}
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
          </div>
       </div>
     );
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Quotations</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Quotes', val: stats.total, icon: FileText, color: 'bg-slate-100 text-slate-600' },
          { label: 'Drafts', val: stats.draft, icon: Edit, color: 'bg-yellow-50 text-yellow-600' },
          { label: 'Sent', val: stats.sent, icon: Send, color: 'bg-blue-50 text-blue-600' },
          { label: 'Confirmed', val: stats.confirmed, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase">{s.label}</p>
              <p className="text-2xl font-bold text-slate-800">{s.val}</p>
            </div>
            <div className={`p-3 rounded-full ${s.color}`}>
              <s.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      <Card className="min-h-[600px] flex flex-col">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
            {['All', 'Draft', 'Sent', 'Order Confirmed'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  statusFilter === status 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          
          <div className="flex w-full md:w-auto gap-3">
             <div className="relative flex-1 md:w-64">
               <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
               <input 
                 placeholder="Search quotes..." 
                 className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200"
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
               />
             </div>
             {/* Use shared Create New handler from props */}
             <Button onClick={onCreateNew} variant="primary">
               <Plus size={16} /> New Quote
             </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="p-4 w-32">Quote #</th>
                <th className="p-4">Customer</th>
                <th className="p-4 w-32">Date</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-center w-32">Status</th>
                <th className="p-4 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotes.map(q => {
                  const customer = customers.find(c => c.id === q.customerId);
                  return (
                    <tr key={q.id} className="hover:bg-slate-50 group transition-colors">
                      <td 
                         className="p-4 font-bold text-blue-600 hover:text-blue-800 cursor-pointer hover:underline underline-offset-2"
                         onClick={() => handleView(q)}
                      >
                         {q.id}
                      </td>
                      <td 
                         className="p-4 cursor-pointer"
                         onClick={() => handleView(q)}
                      >
                        <div className="font-medium text-slate-800 hover:text-blue-600 transition-colors">{customer?.name || 'Unknown'}</div>
                        <div className="text-xs text-slate-500">{customer?.email}</div>
                      </td>
                      <td className="p-4 text-slate-500">{q.date}</td>
                      <td className="p-4 text-right font-medium text-slate-800">
                        {formatCurrency(q.total, q.items[0]?.currency)}
                      </td>
                      <td className="p-4 text-center">
                        <select
                          value={q.status}
                          onChange={(e) => handleStatusChange(q.id, e.target.value)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-300 text-center w-32 appearance-none ${STATUS_OPTIONS.find(s => s.value === q.status)?.color || 'bg-slate-100 text-slate-600'}`}
                          title="Change Status"
                        >
                           {STATUS_OPTIONS.map(opt => (
                             <option key={opt.value} value={opt.value} className="bg-white text-slate-800">
                               {opt.label}
                             </option>
                           ))}
                        </select>
                      </td>
                      <td className="p-4 text-right">
                         <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => handleEditDraft(q)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full" title="Edit">
                             <Edit size={16} />
                           </button>
                           <button onClick={() => handleDeleteQuote(q.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full" title="Delete">
                             <Trash2 size={16} />
                           </button>
                         </div>
                      </td>
                    </tr>
                  );
              })}
            </tbody>
          </table>
          {filteredQuotes.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <FileText size={48} className="mb-4 opacity-20" />
              <p>No quotes found matching your filters.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null); // Auth State
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Lifted States
  const [users, setUsers] = useState(INITIAL_USERS); // User State
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [quotes, setQuotes] = useState(INITIAL_QUOTES);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [exchangeRates, setExchangeRates] = useState(DEFAULT_RATES); // Currency State

  // Lifted Quotation View State
  const [quoteViewMode, setQuoteViewMode] = useState('list');
  const [activeQuoteId, setActiveQuoteId] = useState(null);
  const [draftQuote, setDraftQuote] = useState(null); // Lifted Draft State

  const handleOpenQuote = (id) => {
    setActiveQuoteId(id);
    setQuoteViewMode('view');
    setActiveTab('quotes');
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setActiveTab('dashboard'); // Reset to dashboard on login
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };
  
  const handleCreateNewQuote = () => {
    setDraftQuote({
      id: `QT-${1000 + quotes.length + 1}`,
      customerId: '',
      userId: currentUser.id, // Assign current user
      date: new Date().toISOString().split('T')[0],
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      status: 'Draft',
      taxType: 'none',
      terms: DEFAULT_TERMS,
      currency: 'INR' 
    });
    setQuoteViewMode('create');
    setActiveTab('quotes');
  };

  // Reset Quotation View when switching tabs
  useEffect(() => {
    if (activeTab !== 'quotes') {
      setQuoteViewMode('list');
      setActiveQuoteId(null);
    }
  }, [activeTab]);

  // Load Data
  useEffect(() => {
    const savedProducts = localStorage.getItem('onyx_products');
    const savedCustomers = localStorage.getItem('onyx_customers');
    const savedQuotes = localStorage.getItem('onyx_quotes');
    const savedCategories = localStorage.getItem('onyx_categories');
    const savedUsers = localStorage.getItem('onyx_users'); // Load users
    const savedRates = localStorage.getItem('onyx_rates'); // Load rates
    
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
    if (savedQuotes) setQuotes(JSON.parse(savedQuotes));
    if (savedCategories) setCategories(JSON.parse(savedCategories));
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedRates) setExchangeRates(JSON.parse(savedRates));
  }, []);

  // Save Data
  useEffect(() => { localStorage.setItem('onyx_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('onyx_customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('onyx_quotes', JSON.stringify(quotes)); }, [quotes]);
  useEffect(() => { localStorage.setItem('onyx_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('onyx_users', JSON.stringify(users)); }, [users]); // Save users
  useEffect(() => { localStorage.setItem('onyx_rates', JSON.stringify(exchangeRates)); }, [exchangeRates]); // Save rates

  // Auth Guard
  if (!currentUser) {
    return <LoginView onLogin={handleLogin} users={users} />;
  }

  // Main Render
  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900">
      
      {/* Sidebar */}
      <aside className="w-20 bg-slate-900 text-white flex-shrink-0 flex flex-col h-full overflow-hidden transition-all duration-300">
        <div className="p-4 border-b border-slate-800 flex justify-center items-center flex-shrink-0 h-20">
          <div className="text-2xl font-bold tracking-tighter text-orange-500">ONYX</div>
        </div>

        <nav className="py-4 space-y-2 flex-1 overflow-y-auto flex flex-col items-center">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'quotes', icon: FileText, label: 'Quotations' },
            { id: 'customers', icon: Users, label: 'Customers' },
            { id: 'products', icon: Package, label: 'Products' },
            { id: 'currency', icon: CircleDollarSign, label: 'Currency' }, // Added Currency to nav
            { id: 'settings', icon: Settings, label: 'Settings', adminOnly: true }
          ].filter(item => !item.adminOnly || currentUser.role === 'admin').map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors group relative ${
                activeTab === item.id 
                  ? 'bg-orange-500 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title={item.label}
            >
              <item.icon size={20} />
              {/* Tooltip on hover */}
              <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900 flex-shrink-0 flex flex-col items-center gap-4">
          <div className="group relative">
             <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold cursor-pointer hover:bg-slate-700 transition-colors border border-slate-700">
                <UserCircle size={20} />
             </div>
             <span className="absolute left-14 top-2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {currentUser.name} ({currentUser.role})
             </span>
          </div>
          
          <button onClick={handleLogout} className="w-10 h-10 rounded-full text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-colors" title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative w-full">
        {activeTab === 'dashboard' && <DashboardView quotes={quotes} customers={customers} setActiveTab={setActiveTab} onQuoteClick={handleOpenQuote} currentUser={currentUser} onCreateNew={handleCreateNewQuote} />}
        {activeTab === 'quotes' && (
          <QuotationBuilder 
            quotes={quotes} 
            setQuotes={setQuotes} 
            customers={customers} 
            products={products} 
            viewMode={quoteViewMode} 
            setViewMode={setQuoteViewMode} 
            activeQuoteId={activeQuoteId} 
            setActiveQuoteId={setActiveQuoteId} 
            currentUser={currentUser}
            users={users} 
            draftQuote={draftQuote}
            setDraftQuote={setDraftQuote}
            onCreateNew={handleCreateNewQuote}
            exchangeRates={exchangeRates} // Passed exchangeRates to QuotationBuilder
          />
        )}
        {activeTab === 'customers' && <CustomersView customers={customers} setCustomers={setCustomers} currentUser={currentUser} users={users} />}
        {activeTab === 'products' && <ProductsView products={products} setProducts={setProducts} categories={categories} setCategories={setCategories} currentUser={currentUser} />}
        {activeTab === 'currency' && <CurrencyView exchangeRates={exchangeRates} setExchangeRates={setExchangeRates} currentUser={currentUser} />}
        {activeTab === 'settings' && currentUser.role === 'admin' && (
          <SettingsView 
            products={products} setProducts={setProducts}
            customers={customers} setCustomers={setCustomers}
            quotes={quotes} setQuotes={setQuotes}
            categories={categories} setCategories={setCategories}
            users={users} setUsers={setUsers}
            currentUser={currentUser}
          />
        )}
      </main>
    </div>
  );
}