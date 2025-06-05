import React, { useState } from 'react';
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
  Phone
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HomeScreen = () => {
  const navigate = useNavigate();
  const [selectedStatistic, setSelectedStatistic] = useState('membership');
  const [selectedPeriod, setSelectedPeriod] = useState('harian');

  const stats = [
    { title: 'Total Kendaraan Membership', value: '12,345', icon: Car, color: 'from-blue-500 to-blue-600' },
    { title: 'Total Kendaraan Parkir', value: '11,892', icon: ParkingCircle, color: 'from-green-500 to-green-600' },
    { title: 'Total Pemasukan', value: '23', icon: Phone, color: 'from-red-500 to-red-600' }
  ];

  const statisticOptions = [
    { value: 'membership', label: 'Pendaftaran Membership' },
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

  // Sample data untuk setiap jenis statistik dan periode
  const getChartData = () => {
    const baseData = {
      harian: [
        { name: 'Sen', value: 45 },
        { name: 'Sel', value: 52 },
        { name: 'Rab', value: 48 },
        { name: 'Kam', value: 61 },
        { name: 'Jum', value: 55 },
        { name: 'Sab', value: 67 },
        { name: 'Min', value: 43 }
      ],
      mingguan: [
        { name: 'W1', value: 320 },
        { name: 'W2', value: 285 },
        { name: 'W3', value: 390 },
        { name: 'W4', value: 410 }
      ],
      bulanan: [
        { name: 'Jan', value: 1200 },
        { name: 'Feb', value: 1350 },
        { name: 'Mar', value: 1180 },
        { name: 'Apr', value: 1420 },
        { name: 'Mei', value: 1380 },
        { name: 'Jun', value: 1560 }
      ],
      tahunan: [
        { name: '2020', value: 12000 },
        { name: '2021', value: 15000 },
        { name: '2022', value: 18000 },
        { name: '2023', value: 22000 },
        { name: '2024', value: 25000 }
      ],
      alltime: [
        { name: '2019', value: 8000 },
        { name: '2020', value: 12000 },
        { name: '2021', value: 15000 },
        { name: '2022', value: 18000 },
        { name: '2023', value: 22000 },
        { name: '2024', value: 25000 },
        { name: '2025', value: 28000 }
      ]
    };

    const multipliers = {
      membership: 1,
      parking: 15,
      income: 0.8
    };

    return baseData[selectedPeriod].map(item => ({
      ...item,
      value: Math.round(item.value * multipliers[selectedStatistic])
    }));
  };

  const getLineColor = () => {
    const colors = {
      membership: '#3B82F6',
      parking: '#10B981',  
      income: '#EF4444'
    };
    return colors[selectedStatistic];
  };

  return (
    <div className="space-y-8">
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
        <div className="h-80">
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
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
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
    </div>
  );
};

export default HomeScreen;