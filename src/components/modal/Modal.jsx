import React from 'react';

const Modal = ({ showModal, setShowModal, modalType, selectedPlat }) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {modalType === 'add' ? 'Tambah Plat Baru' : 'Edit Plat'}
        </h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nomor Plat"
            defaultValue={selectedPlat?.plate_number || ''}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <input
            type="text"
            placeholder="Nama Pemilik"
            defaultValue={selectedPlat?.owner_name || ''}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <input
            type="date"
            placeholder="Tanggal Kadaluarsa"
            defaultValue={selectedPlat?.membership_expiry || ''}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => setShowModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => setShowModal(false)}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;