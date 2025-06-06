import React, { useState, useEffect } from "react";
import {
  Car,
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Filter,
  Download,
  AlertTriangle,
  Clock,
  Camera,
  LogIn,
  LogOut,
  X,
  User,
  Phone,
  FileText,
} from "lucide-react";

const PlatIllegalScreen = () => {
  const [activeTab, setActiveTab] = useState("illegal");
  const [platIllegalData, setPlatIllegalData] = useState([]);
  const [historyLogData, setHistoryLogData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form state for adding new illegal plate
  const [formData, setFormData] = useState({
    plate_number: "",
    nama_pelapor: "",
    no_wa: "",
    description: ""
  });

  // Function to handle image modal
  const handleImageClick = (imageUrl, plateNumber) => {
    setSelectedImage({
      url: imageUrl,
      plateNumber: plateNumber
    });
    setShowImageModal(true);
  };

  // Fetch illegal plates data
  const fetchIllegalPlates = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://tkj-3b.com/tkj-3b.com/opengate/illegal-plates.php', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlatIllegalData(data);
      } else {
        console.error('Failed to fetch illegal plates data');
        // Fallback to sample data if API fails
        setPlatIllegalData([
          {
            id: 1,
            plate_number: "B 1111 XX",
            description: "Plat Palsu",
            status: "Dilaporkan",
            created_at: "2024-03-15",
            nama_pelapor: "Anonymous",
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching illegal plates:', error);
      // Fallback to sample data
      setPlatIllegalData([
        {
          id: 1,
          plate_number: "B 1111 XX",
          description: "Plat Palsu",
          status: "Dilaporkan",
          created_at: "2024-03-15",
          nama_pelapor: "Anonymous",
        }
      ]);
    }
    setLoading(false);
  };

  // Fetch history logs data
  const fetchHistoryLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://tkj-3b.com/tkj-3b.com/opengate/get_illegal_logs.php', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Data yang diterima: :", data);
        setHistoryLogData(data.logs);
      } else {
        console.error('Failed to fetch history logs data');
        // Fallback to sample data
        setHistoryLogData([
          {
            id: 1,
            plate_number: "B 1234 CD",
            entry_time: "08:30",
            exit_time: "17:45",
            log_date: "2024-03-21",
            location: "Gate A",
            image_url: "https://via.placeholder.com/60x40?text=Car1",
            duration: "9h 15m",
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching history logs:', error);
      // Fallback to sample data
      setHistoryLogData([
        {
          id: 1,
          plate_number: "B 1234 CD",
          entry_time: "08:30",
          exit_time: "17:45",
          log_date: "2024-03-21",
          location: "Gate A",
          image_url: "https://via.placeholder.com/60x40?text=Car1",
          duration: "9h 15m",
        }
      ]);
    }
    setLoading(false);
  };

  // Submit new illegal plate report
  const submitIllegalPlate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://tkj-3b.com/tkj-3b.com/opengate/illegal-plates.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        // Reset form and close modal
        setFormData({
          plate_number: "",
          nama_pelapor: "",
          no_wa: "",
          description: ""
        });
        setShowAddModal(false);
        
        // Refresh the illegal plates data
        fetchIllegalPlates();
        
        alert('Plat berhasil dilaporkan!');
      } else {
        alert('Gagal melaporkan plat. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error submitting illegal plate:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    }
    setLoading(false);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter data based on search term
  const filteredIllegalData = platIllegalData.filter(plate => 
    plate.plate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plate.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plate.nama_pelapor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHistoryData = historyLogData.filter(log => 
    log.plate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load data on component mount and tab change
  useEffect(() => {
    if (activeTab === "illegal") {
      fetchIllegalPlates();
    } else {
      fetchHistoryLogs();
    }
  }, [activeTab]);

  const renderIllegalTable = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="ml-3 text-gray-600">Memuat data...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nomor Plat
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Pelapor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredIllegalData.map((plat) => (
                <tr
                  key={plat.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-red-100 p-2 rounded-lg mr-3">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <span className="font-bold text-gray-900">
                        {plat.plate_number}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                      {plat.description}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        plat.status === "Terverifikasi"
                          ? "bg-red-100 text-red-800"
                          : plat.status === "Dilaporkan"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {plat.status || "Dilaporkan"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {plat.created_at}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {plat.nama_pelapor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderHistoryTable = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Memuat data...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nomor Plat
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Jam Masuk
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Jam Keluar
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Durasi
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Foto
                </th>
                {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {historyLogData.map((log) => {
                const entryTime = new Date(log.entry_time);
                const logCreatedAt = new Date(log.log_created_at);
                const now = new Date();
                const duration = Math.floor((now - logCreatedAt) / (1000 * 60)); // Durasi dalam menit
                const formattedDate = logCreatedAt.toLocaleDateString();
                const exitTime = log.exit_time ? new Date(log.exit_time).toLocaleTimeString() : "belum keluar";
  
                return (
                  <tr key={log.log_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-2 rounded-lg mr-3">
                          <Car className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="font-bold text-gray-900">
                          {log.plate_number}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-green-600">
                        <LogIn className="w-4 h-4 mr-1" />
                        <span className="font-medium">{entryTime.toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-red-600">
                        <LogOut className="w-4 h-4 mr-1" />
                        <span className="font-medium">{exitTime}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-blue-600">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="font-medium">{duration} menit</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {formattedDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={log.img_path || "https://via.placeholder.com/60x40?text=No+Image"}
                          alt="Vehicle"
                          className="w-12 h-8 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
                          onClick={() => handleImageClick(log.img_path || "https://via.placeholder.com/60x40?text=No+Image", log.plate_number)}
                        />
                        <button 
                          className="ml-2 p-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => handleImageClick(log.img_path || "https://via.placeholder.com/60x40?text=No+Image", log.plate_number)}
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td> */}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderAddModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Laporkan Plat Illegal</h3>
          <button
            onClick={() => setShowAddModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={submitIllegalPlate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Car className="w-4 h-4 inline mr-2" />
              Nomor Plat
            </label>
            <input
              type="text"
              name="plate_number"
              value={formData.plate_number}
              onChange={handleInputChange}
              placeholder="Contoh: B 1234 CD"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Nama Pelapor
            </label>
            <input
              type="text"
              name="nama_pelapor"
              value={formData.nama_pelapor}
              onChange={handleInputChange}
              placeholder="Masukkan nama Anda"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Nomor WhatsApp
            </label>
            <input
              type="text"
              name="no_wa"
              value={formData.no_wa}
              onChange={handleInputChange}
              placeholder="Contoh: 081234567890"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Deskripsi/Alasan
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Jelaskan alasan pelaporan..."
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50"
            >
              {loading ? "Mengirim..." : "Laporkan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // New Image Modal component
  const renderImageModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white flex justify-between items-center p-4 border-b">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Foto Kendaraan</h3>
            <p className="text-sm text-gray-600">Plat: {selectedImage?.plateNumber}</p>
          </div>
          <button
            onClick={() => setShowImageModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex justify-center">
            <img
              src={selectedImage?.url}
              alt={`Vehicle ${selectedImage?.plateNumber}`}
              className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/400x300?text=Gambar+Tidak+Ditemukan";
              }}
            />
          </div>
          
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = selectedImage?.url;
                link.download = `foto_${selectedImage?.plateNumber}_${new Date().getTime()}.jpg`;
                link.click();
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Foto
            </button>
            <button
              onClick={() => setShowImageModal(false)}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Manajemen Plat Illegal
        </h2>
        <div className="flex gap-2">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          {activeTab === "illegal" && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Laporkan Plat
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("illegal")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "illegal"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Plat Illegal
            </div>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "history"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              History Log
            </div>
          </button>
        </nav>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={
            activeTab === "illegal"
              ? "Cari plat illegal..."
              : "Cari history log..."
          }
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
      </div>

      {/* Content based on active tab */}
      {activeTab === "illegal" ? renderIllegalTable() : renderHistoryTable()}

      {/* Summary Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Plat Illegal</p>
              <p className="text-2xl font-bold text-gray-900">
                {platIllegalData.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Log Hari Ini</p>
              <p className="text-2xl font-bold text-gray-900">
                {historyLogData.filter(log => {
                  const today = new Date().toISOString().split('T')[0];
                  return log.log_date === today;
                }).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <Car className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Kendaraan</p>
              <p className="text-2xl font-bold text-gray-900">
                {historyLogData.length}
              </p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Add Modal */}
      {showAddModal && renderAddModal()}

      {/* Image Modal */}
      {showImageModal && renderImageModal()}
    </div>
  );
};

export default PlatIllegalScreen;