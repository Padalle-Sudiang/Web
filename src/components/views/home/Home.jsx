import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  Plus, 
  Shield, 
  BarChart3, 
  Activity,
  ChevronRight,
  AlertTriangle,
  ParkingCircle,
  Phone,
  DollarSign
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HomeScreen = () => {
  const navigate = useNavigate();
  const [selectedStatistic, setSelectedStatistic] = useState('parking');
  const [selectedPeriod, setSelectedPeriod] = useState('harian');
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState({
    membership: [],
    vehicles: [],
    parkingLogs: []
  });
  const [stats, setStats] = useState([
    { title: 'Total Kendaraan Membership', value: '0', icon: Car, color: 'from-blue-500 to-blue-600' },
    { title: 'Total Kendaraan Parkir', value: '0', icon: ParkingCircle, color: 'from-green-500 to-green-600' },
    { title: 'Total Pemasukan', value: 'Rp 0', icon: DollarSign, color: 'from-red-500 to-red-600' }
  ]);

  const statisticOptions = [
    // { value: 'membership', label: 'Pendaftaran Membership' },
    { value: 'parking', label: 'Kendaraan Parkir' },
    { value: 'income', label: 'Pemasukan' }
  ];

  const periodOptions = [
    { value: 'harian', label: 'Harian' },
    { value: 'mingguan', label: 'Mingguan' },
    { value: 'bulanan', label: 'Bulanan' },
    { value: 'tahunan', label: 'Tahunan' },
    { value: 'alltime', label: 'All Time' }
  ];

// Fetch data from APIs
const fetchApiData = async () => {
  try {
    setLoading(true);
    
    const [membershipRes, parkingLogsRes] = await Promise.all([
      fetch('http://tkj-3b.com/tkj-3b.com/opengate/membership.php'),
      fetch('http://tkj-3b.com/tkj-3b.com/opengate/parking-logs.php')
    ]);

    const membershipData = await membershipRes.json();
    const parkingLogsData = await parkingLogsRes.json();

    setApiData({
      membership: Array.isArray(membershipData) ? membershipData : [],
      vehicles: Array.isArray(parkingLogsData) ? parkingLogsData : [], // vehicles data comes from parking logs
      parkingLogs: Array.isArray(parkingLogsData) ? parkingLogsData : []
    });

    // Update stats
    const totalMembership = Array.isArray(membershipData) ? membershipData.length : 0;
    const totalVehicles = Array.isArray(parkingLogsData) ? parkingLogsData.length : 0;
    
    // Calculate total income
    let totalIncome = 0;
    if (Array.isArray(parkingLogsData)) {
      totalIncome = parkingLogsData.reduce((sum, log) => {
        return sum + (parseFloat(log.parking_fee) || 0);
      }, 0);
    }
    // Add membership income (membership count × 50,000)
    totalIncome += totalMembership * 50000;

    setStats([
      { title: 'Total Kendaraan Membership', value: totalMembership.toLocaleString('id-ID'), icon: Car, color: 'from-blue-500 to-blue-600' },
      { title: 'Total Kendaraan Parkir', value: totalVehicles.toLocaleString('id-ID'), icon: ParkingCircle, color: 'from-green-500 to-green-600' },
      { title: 'Total Pemasukan', value: `Rp ${totalIncome.toLocaleString('id-ID')}`, icon: DollarSign, color: 'from-red-500 to-red-600' }
    ]);

  } catch (error) {
    console.error('Error fetching API data:', error);
  } finally {
    setLoading(false);
  }
};

  // Group data by period
  const groupDataByPeriod = (data, dateField, period) => {
    if (!Array.isArray(data) || data.length === 0) return {};

    const grouped = {};
    
    data.forEach(item => {
      if (!item[dateField]) return;
      
      const date = new Date(item[dateField]);
      if (isNaN(date.getTime())) return;

      let key;
      switch (period) {
        case 'harian':
          // Group by day of week for the last 7 days
          const today = new Date();
          const daysDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
          if (daysDiff < 7) {
            const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            key = dayNames[date.getDay()];
          }
          break;
        case 'mingguan':
          // Group by week number
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `W${Math.ceil(date.getDate() / 7)}`;
          break;
        case 'bulanan':
          // Group by month
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
          key = monthNames[date.getMonth()];
          break;
        case 'tahunan':
          // Group by year
          key = date.getFullYear().toString();
          break;
        case 'alltime':
          // Group by year for all time
          key = date.getFullYear().toString();
          break;
        default:
          key = date.toDateString();
      }

      if (key) {
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(item);
      }
    });

    return grouped;
  };

  // Generate chart data based on selected statistic and period
  // Generate chart data based on selected statistic and period
const getChartData = () => {
  let data = [];
  let dateField = '';
  
  switch (selectedStatistic) {
    // case 'membership':
    //   data = apiData.membership;
    //   dateField = 'membership_expiry'; // Fixed: use membership_expiry for membership data
    //   break;
    case 'parking':
      data = apiData.vehicles;
      dateField = 'entry_time'; // Fixed: use entry_time for parking data
      break;
    case 'income':
      data = apiData.parkingLogs;
      dateField = 'entry_time'; // Fixed: use entry_time for parking logs
      break;
  }

  const grouped = groupDataByPeriod(data, dateField, selectedPeriod);
  
  // Convert grouped data to chart format
  const chartData = Object.entries(grouped).map(([name, items]) => {
    let value = 0;
    
    switch (selectedStatistic) {
      // case 'membership':
      //   value = items.length;
      //   break;
      case 'parking':
        value = items.length;
        break;
      case 'income':
        value = items.reduce((sum, item) => {
          return sum + (parseFloat(item.parking_fee) || 0);
        }, 0);
        // Note: For income calculation, we're only using parking fees from parking logs
        // Membership income is calculated separately at the API level or in stats
        break;
    }

    return { name, value };
  });

  // Sort chart data appropriately
  if (selectedPeriod === 'harian') {
    const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    chartData.sort((a, b) => dayOrder.indexOf(a.name) - dayOrder.indexOf(b.name));
  } else if (selectedPeriod === 'bulanan') {
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    chartData.sort((a, b) => monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name));
  } else if (selectedPeriod === 'tahunan' || selectedPeriod === 'alltime') {
    chartData.sort((a, b) => parseInt(a.name) - parseInt(b.name));
  }

  // If no data, return empty array or default data
  if (chartData.length === 0) {
    return getDefaultChartData();
  }

  return chartData;
};

  // Fallback default data when no API data is available
  const getDefaultChartData = () => {
    const baseData = {
      harian: [
        { name: 'Senin', value: 0 },
        { name: 'Selasa', value: 0 },
        { name: 'Rabu', value: 0 },
        { name: 'Kamis', value: 0 },
        { name: 'Jumat', value: 0 },
        { name: 'Sabtu', value: 0 },
        { name: 'Minggu', value: 0 }
      ],
      mingguan: [
        { name: 'W1', value: 0 },
        { name: 'W2', value: 0 },
        { name: 'W3', value: 0 },
        { name: 'W4', value: 0 }
      ],
      bulanan: [
        { name: 'Jan', value: 0 },
        { name: 'Feb', value: 0 },
        { name: 'Mar', value: 0 },
        { name: 'Apr', value: 0 },
        { name: 'Mei', value: 0 },
        { name: 'Jun', value: 0 }
      ],
      tahunan: [
        { name: '2023', value: 0 },
        { name: '2024', value: 0 },
        { name: '2025', value: 0 }
      ],
      alltime: [
        { name: '2023', value: 0 },
        { name: '2024', value: 0 },
        { name: '2025', value: 0 }
      ]
    };

    return baseData[selectedPeriod] || [];
  };

  const getLineColor = () => {
    const colors = {
      membership: '#3B82F6',
      parking: '#10B981',  
      income: '#EF4444'
    };
    return colors[selectedStatistic];
  };

  // Format value for tooltip
  const formatTooltipValue = (value) => {
    if (selectedStatistic === 'income') {
      return `Rp ${value.toLocaleString('id-ID')}`;
    }
    return value.toLocaleString('id-ID');
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    const expired = localStorage.getItem('loginExpiredAt');
    if (!isLoggedIn || !expired || Date.now() > Number(expired)) {
      localStorage.removeItem('isAdminLoggedIn');
      localStorage.removeItem('loginExpiredAt');
      navigate('/login');
      return;
    }

    fetchApiData();
  }, [navigate]);

  // Refresh data when statistic or period changes
  useEffect(() => {
    if (!loading) {
      // Data will be recalculated automatically through getChartData()
    }
  }, [selectedStatistic, selectedPeriod]);

  return (
    <div className="space-y-8">
      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10`}></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Statistics Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 lg:mb-0">Statistik</h3>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Statistic Type Selector */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Jenis Statistik</label>
              <select 
                value={selectedStatistic}
                onChange={(e) => setSelectedStatistic(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                {statisticOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Period Selector */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Periode</label>
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                {periodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80 relative">
          {loading && (
            <div className="absolute inset-0 flex justify-center items-center bg-gray-50 bg-opacity-75 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => selectedStatistic === 'income' ? `${(value/1000)}k` : value}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [formatTooltipValue(value), statisticOptions.find(opt => opt.value === selectedStatistic)?.label]}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={getLineColor()}
                strokeWidth={3}
                dot={{ fill: getLineColor(), strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: getLineColor(), strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Legend */}
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getLineColor() }}
            ></div>
            <span className="text-sm text-gray-600">
              {statisticOptions.find(opt => opt.value === selectedStatistic)?.label} - {periodOptions.find(opt => opt.value === selectedPeriod)?.label}
            </span>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchApiData}
          disabled={loading}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <Activity className="w-4 h-4" />
          <span>{loading ? 'Memuat...' : 'Refresh Data'}</span>
        </button>
      </div>
    </div>
  );
};

export default HomeScreen;