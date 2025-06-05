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
  Loader2,
  AlertCircle,
  X,
  Calendar,
  User,
} from "lucide-react";
import * as XLSX from "xlsx";

const MembershipScreen = () => {
  const [platData, setPlatData] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalType, setModalType] = useState("add"); // 'add' or 'edit'
  const [editingId, setEditingId] = useState(null);
  const [deleteData, setDeleteData] = useState([]);
  const [formData, setFormData] = useState({
    plate_number: "",
    owner_name: "",
    membership_expiry: "",
  });

  // Fetch membership data from API
  const fetchMembershipData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://tkj-3b.com/tkj-3b.com/opengate/membership.php"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch membership data");
      }

      const data = await response.json();

      // Transform API data to match our table structure
      const transformedData = data.map((item, index) => ({
        id: item.id || index + 1,
        nomor: item.plate_number,
        owner: item.owner_name,
        kategori: "Member",
        status:
          new Date(item.membership_expiry) > new Date() ? "Aktif" : "Expired",
        tanggal: item.membership_expiry,
      }));

      setPlatData(transformedData);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching membership data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available vehicles from API
  const fetchAvailableVehicles = async () => {
    try {
      const response = await fetch(
        "http://tkj-3b.com/tkj-3b.com/opengate/get-vehicles.php"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch vehicles data");
      }

      const data = await response.json();
      setAvailableVehicles(data);
    } catch (err) {
      console.error("Error fetching vehicles data:", err);
    }
  };

  // Fetch data from API
  useEffect(() => {
    fetchMembershipData();
    fetchAvailableVehicles();
  }, []);

  // Filter data based on search term
  const filteredData = platData.filter(
    (plat) =>
      plat.nomor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plat.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (type, data = null) => {
    setModalType(type);

    if (type === "add") {
      setFormData({
        plate_number: "",
        owner_name: "",
        membership_expiry: "",
      });
      setEditingId(null);
    } else if (type === "edit" && data) {
      setFormData({
        plate_number: data.nomor,
        owner_name: data.owner,
        membership_expiry: data.tanggal,
      });
      setEditingId(data.id);
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType("add");
    setEditingId(null);
    setFormData({
      plate_number: "",
      owner_name: "",
      membership_expiry: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.plate_number ||
      !formData.owner_name ||
      !formData.membership_expiry
    ) {
      alert("Semua field harus diisi!");
      return;
    }

    setIsSubmitting(true);

    try {
      const url =
        modalType === "edit"
          ? `http://tkj-3b.com/tkj-3b.com/opengate/membership.php?id=${editingId}`
          : "http://tkj-3b.com/tkj-3b.com/opengate/membership.php";

      const method = modalType === "edit" ? "PUT" : "POST";

      const requestBody =
        modalType === "edit" ? { ...formData, id: editingId } : formData;

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${modalType} membership`);
      }

      // Refresh data after successful submission
      await fetchMembershipData();
      closeModal();
      alert(
        modalType === "edit"
          ? "Membership berhasil diperbarui!"
          : "Membership berhasil ditambahkan!"
      );
    } catch (err) {
      console.error(`Error ${modalType}ing membership:`, err);
      alert(
        `Gagal ${
          modalType === "edit" ? "memperbarui" : "menambahkan"
        } membership. Silakan coba lagi.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  

  // Export to Excel function
  const handleExport = () => {
    try {
      // Prepare data for export
      const exportData = filteredData.map((item, index) => ({
        No: index + 1,
        "Nomor Plat": item.nomor,
        "Nama Pemilik": item.owner,
        Kategori: item.kategori,
        Status: item.status,
        "Tanggal Berakhir": formatDate(item.tanggal),
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 5 }, // No
        { wch: 15 }, // Nomor Plat
        { wch: 20 }, // Nama Pemilik
        { wch: 10 }, // Kategori
        { wch: 10 }, // Status
        { wch: 20 }, // Tanggal Berakhir
      ];
      ws["!cols"] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Data Membership");

      // Generate filename with current date
      const currentDate = new Date().toISOString().split("T")[0];
      const filename = `Data_Membership_${currentDate}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);

      alert("Data berhasil diekspor ke Excel!");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Gagal mengekspor data. Silakan coba lagi.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertCircle className="w-8 h-8 text-red-600" />
        <span className="ml-2 text-red-600">Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Daftar Membership Plat Nomor
        </h2>
        <div className="flex gap-2">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </button>
          <button
            onClick={() => openModal("add")}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Member
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Cari nomor plat atau nama pemilik..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Menampilkan {filteredData.length} dari {platData.length} data
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nomor Plat
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nama Pemilik
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Expired Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {searchTerm
                      ? "Tidak ada data yang sesuai dengan pencarian"
                      : "Belum ada data membership"}
                  </td>
                </tr>
              ) : (
                filteredData.map((plat) => (
                  <tr
                    key={plat.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <Car className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="font-bold text-gray-900">
                          {plat.nomor}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">
                        {plat.owner}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {plat.kategori}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-sm rounded-full ${
                          plat.status === "Aktif"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {plat.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {formatDate(plat.tanggal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal("edit", plat)}
                          className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {/* <button
                          onClick={() => handleDelete(plat)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {modalType === "edit" ? "Edit Member" : "Tambah Member Baru"}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Plate Number Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Car className="w-4 h-4 inline mr-2" />
                    Nomor Plat
                  </label>
                  {modalType === "edit" ? (
                    <input
                      type="text"
                      name="plate_number"
                      value={formData.plate_number}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-100"
                      readOnly
                    />
                  ) : (
                    <select
                      name="plate_number"
                      value={formData.plate_number}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      required
                    >
                      <option value="">Pilih Nomor Plat</option>
                      {availableVehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.plate_number}>
                          {vehicle.plate_number} - {vehicle.plate_type}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Owner Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Nama Pemilik
                  </label>
                  <input
                    type="text"
                    name="owner_name"
                    value={formData.owner_name}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama pemilik"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>

                {/* Membership Expiry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Tanggal Berakhir Membership
                  </label>
                  <input
                    type="date"
                    name="membership_expiry"
                    value={formData.membership_expiry}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {modalType === "edit"
                          ? "Memperbarui..."
                          : "Menyimpan..."}
                      </>
                    ) : modalType === "edit" ? (
                      "Perbarui Member"
                    ) : (
                      "Tambah Member"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipScreen;
