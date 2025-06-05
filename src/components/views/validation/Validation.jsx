import React from 'react';
import { Shield } from 'lucide-react';

const ValidationScreen = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Validasi Otomatis</h2>
      
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Sistem Validasi Otomatis</h3>
          <p className="text-gray-600">Masukkan nomor plat untuk memverifikasi keabsahan dan status</p>
        </div>
        
        <div className="max-w-md mx-auto">
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Masukkan nomor plat (contoh: B 1234 CD)"
              className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-center text-lg font-mono"
            />
          </div>
          
          <button className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-semibold">
            Validasi Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValidationScreen;
