import { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  TrendingUp, ShoppingBag, AlertTriangle, 
  CreditCard, DollarSign, Package,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import apiAuth from '../utils/apiAuth';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const StatCard = ({ title, value, icon: Icon, colorClass, iconColorClass, trend, loading }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      {loading ? (
        <Skeleton width={120} height={32} />
      ) : (
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      )}
      {trend && !loading && (
        <p className={`text-xs mt-2 flex items-center ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend > 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
          {Math.abs(trend)}% from last month
        </p>
      )}
    </div>
    <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 ${iconColorClass}`}>
      <Icon size={24} />
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data } = await apiAuth.get('/orders/stats');
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (val) => {
    return `Rs. ${val.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton width={200} height={40} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton height={120} borderRadius={16} count={4} containerClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton height={400} borderRadius={16} className="col-span-2" />
          <Skeleton height={400} borderRadius={16} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Business Overview</h1>
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
          Last 30 Days Data
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(stats?.totalRevenue || 0)} 
          icon={DollarSign} 
          colorClass="bg-blue-500"
          iconColorClass="text-blue-600"
          trend={12.5}
        />
        <StatCard 
          title="Total Orders" 
          value={stats?.totalOrders || 0} 
          icon={ShoppingBag} 
          colorClass="bg-emerald-500"
          iconColorClass="text-emerald-600"
          trend={8.2}
        />
        <StatCard 
          title="Low Stock Warning" 
          value={stats?.lowStockCount || 0} 
          icon={AlertTriangle} 
          colorClass={stats?.lowStockCount > 0 ? "bg-rose-500" : "bg-gray-500"}
          iconColorClass={stats?.lowStockCount > 0 ? "text-rose-600" : "text-gray-600"}
        />
        <StatCard 
          title="Active Promotions" 
          value="0" 
          icon={TrendingUp} 
          colorClass="bg-purple-500"
          iconColorClass="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Revenue Trend</h3>
            <div className="flex items-center space-x-2 text-sm text-green-500 font-medium">
              <TrendingUp size={16} />
              <span>+12.5%</span>
            </div>
          </div>
          <div className="h-[350px] w-full min-w-0 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.dailySales || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9ca3af', fontSize: 12}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9ca3af', fontSize: 12}}
                  tickFormatter={(val) => `Rs.${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(val) => [formatCurrency(val), 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Payment Methods</h3>
          <div className="flex-1 h-[300px] w-full min-w-0 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.paymentMethodDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="method"
                >
                  {(stats?.paymentMethodDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-sm">
            <span className="text-gray-500">Most Used:</span>
            <span className="font-bold text-blue-600">
              {stats?.paymentMethodDistribution?.sort((a,b) => b.count - a.count)[0]?.method || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
