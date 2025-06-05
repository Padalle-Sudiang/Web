import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, 
  Plus, 
  BarChart3, 
  Shield, 
  FileText,
  Users
} from 'lucide-react';

const Sidebar = ({ activeTab }) => {
  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: BarChart3, path: '/' },
    { id: 'membership-list', label: 'Membership', icon: Car, path: '/membership-list' },
    { id: 'plat-illegal', label: 'Pencarian Plat Ilegal', icon: Shield, path: '/plat-illegal' },
    { id: 'logs', label: 'Log Aktivitas', icon: FileText, path: '/logs' }
  ];

  return (
    <div className="w-64 bg-white shadow-xl h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl mr-3">
            <Car className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">PadalleSudiang</h1>
            <p className="text-sm text-gray-500">Management System</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg mr-3">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Admin</p>
              <p className="text-sm text-gray-500">Padalle Sudiang</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;