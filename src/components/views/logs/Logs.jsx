import React, { useState, useEffect, useRef } from "react";
import {
  Car,
  Search,
  Filter,
  Download,
  Loader2,
  AlertCircle,
  Clock,
  Eye,
  RefreshCw,
  Camera,
  ArrowUp,
  ArrowDown,
  X,
  Calendar,
  DollarSign,
  Delete,
  Trash,
  CreditCard,
} from "lucide-react";
import { utils, writeFile } from "xlsx";
import { useLocation } from "react-router-dom";

const LogsScreen = () => {
  const [logsData, setLogsData] = useState([]);
  const [memberData, setMemberData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "entry_time",
    direction: "desc",
  });
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [parkingFee, setParkingFee] = useState(0);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [changeMoney, setChangeMoney] = useState(0);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const location = useLocation();
  const prioritizePlate = location.state?.prioritize;
  const rowRefs = useRef({});

  // Fetch logs data from API
  const fetchLogsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://tkj-3b.com/tkj-3b.com/opengate/parking-logs.php"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch parking logs data");
      }

      const data = await response.json();

      // Transform API data to match our table structure
      const transformedData = data.map((item, index) => ({
        id: item.id || index + 1,
        plate_number: item.plate_number,
        entry_time: item.entry_time || item.time_in,
        exit_time: item.exit_time || item.time_out || null,
        parking_fee: item.parking_fee || item.fee || 0,
        photo: item.photo || item.img_path || null,
        img_path_exit: item.img_path_exit || null,
        status: item.exit_time || item.time_out ? "SELESAI" : "PARKIR",
      }));

      setLogsData(transformedData);
      console.log(transformedData);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching parking logs data:", err);
    } finally {
      setLoading(false);
    }
  };

  const openGate = async () => {
    try {
      await fetch("http://10.12.12.251:5050/servo/open", { method: "POST" });
      console.log("Servo opened successfully");
    } catch (servoErr) {
      console.error("Error opening servo:", servoErr);
    }
  };

  useEffect(() => {
    fetchLogsData();
  }, []);

  // Filter and search data
  const filteredData = logsData.filter((log) => {
    const matchesSearch = log.plate_number
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "parkir" && log.status === "PARKIR") ||
      (filterStatus === "selesai" && log.status === "SELESAI");

    const matchesDate = !filterDate || log.entry_time.startsWith(filterDate);

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    // Prioritaskan plat yang diprioritaskan ke atas
    if (prioritizePlate) {
      if (a.plate_number === prioritizePlate && b.plate_number !== prioritizePlate) {
        return -1;
      }
      if (b.plate_number === prioritizePlate && a.plate_number !== prioritizePlate) {
        return 1;
      }
    }
    
    // Sorting normal setelah prioritas
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
    }
    return 0;
  });

  // Baru setelah itu, useEffect yang pakai sortedData
  useEffect(() => {
    if (prioritizePlate) {
      // Scroll ke atas karena item prioritas sudah ada di posisi teratas
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  }, [prioritizePlate, sortedData]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleRefresh = () => {
    fetchLogsData();
  };

  const openImageModal = (imageUrl, plateNumber) => {
    setSelectedImage({ url: imageUrl, plate: plateNumber });
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  // Export to Excel function
  const handleExport = () => {
    try {
      const exportData = sortedData.map((item, index) => ({
        No: index + 1,
        "Nomor Plat": item.plate_number,
        "Waktu Masuk": formatDateTime(item.entry_time),
        "Waktu Keluar": item.exit_time
          ? formatDateTime(item.exit_time)
          : "Belum Keluar",
        "Fee Parkir": formatCurrency(item.parking_fee),
        Status: item.status,
      }));

      const wb = utils.book_new();
      const ws = utils.json_to_sheet(exportData);

      const colWidths = [
        { wch: 5 }, // No
        { wch: 15 }, // Nomor Plat
        { wch: 20 }, // Waktu Masuk
        { wch: 20 }, // Waktu Keluar
        { wch: 15 }, // Fee Parkir
        { wch: 12 }, // Status
      ];
      ws["!cols"] = colWidths;

      utils.book_append_sheet(wb, ws, "Log Parkir");

      const currentDate = new Date().toISOString().split("T")[0];
      const filename = `Log_Parkir_${currentDate}.xlsx`;

      writeFile(wb, filename);

      alert("Data log parkir berhasil diekspor ke Excel!");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Gagal mengekspor data. Silakan coba lagi.");
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return "Belum Keluar";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Hitung fee parkir
  const calculateParkingFee = (entryTime) => {
    const now = new Date();
    const entry = new Date(entryTime);
    const diffInMilliseconds = now - entry;
    const diffInHours = Math.ceil(diffInMilliseconds / (1000 * 60 * 60));
    // 1 jam pertama 3000, jam berikutnya 3000/jam
    if (diffInHours <= 1) return 3000;
    return 3000 + (diffInHours - 1) * 3000;
  };

  const openPaymentModal = (log) => {
    const fee = calculateParkingFee(log.entry_time);
    setSelectedPayment(log);
    setParkingFee(fee);
    setPaymentAmount("");
    setChangeMoney(0);
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedPayment(null);
    setParkingFee(0);
    setPaymentAmount("");
    setChangeMoney(0);
  };

  const handlePaymentAmountChange = (value) => {
    const amount = parseInt(value) || 0;
    setPaymentAmount(value);
    setChangeMoney(amount - parkingFee);
  };

  const processPayment = async () => {
    if (parseInt(paymentAmount) < parkingFee) {
      alert("Jumlah pembayaran tidak mencukupi!");
      return;
    }
    setIsPaymentLoading(true);
    try {
      const exitTime = new Date().toISOString();
      const response = await fetch(
        "http://tkj-3b.com/tkj-3b.com/opengate/parking-payment.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plate_number: selectedPayment.plate_number,
            exit_time: exitTime,
            amount_paid: parkingFee,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to update parking data");
      const result = await response.json();

      if (result.open_gate) {
        setLogsData((prevData) =>
          prevData.map((log) =>
            log.plate_number === selectedPayment.plate_number
              ? {
                  ...log,
                  exit_time: exitTime,
                  amount_paid: parkingFee,
                  status: "SELESAI",
                }
              : log
          )
        );
        openGate();
        alert(
          `Pembayaran berhasil!\nKembalian: ${formatCurrency(changeMoney)}`
        );
        fetchLogsData();
        closePaymentModal();
      } else {
        throw new Error(result.message || "Failed to process payment");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Gagal memproses pembayaran. Silakan coba lagi.");
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const testPayment = async () => {
    if (parseInt(paymentAmount) < parkingFee) {
      alert("Jumlah pembayaran tidak mencukupi!");
      return;
    }
    setIsPaymentLoading(true);
    try {
      const exitTime = new Date().toISOString();
      const response = await fetch(
        "http://tkj-3b.com/tkj-3b.com/opengate/parking-payment.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plate_number: selectedPayment.plate_number,
            exit_time: exitTime,
            amount_paid: 0,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to update parking data");
      const result = await response.json();

      if (result.open_gate) {
        setLogsData((prevData) =>
          prevData.map((log) =>
            log.plate_number === selectedPayment.plate_number
              ? {
                  ...log,
                  exit_time: exitTime,
                  amount_paid: parkingFee,
                  status: "SELESAI",
                }
              : log
          )
        );
        openGate();
        alert(
          `Pembayaran berhasil!\nKembalian: ${formatCurrency(changeMoney)}`
        );
        fetchLogsData();
        closePaymentModal();
      } else {
        throw new Error(result.message || "Failed to process payment");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Gagal memproses pembayaran. Silakan coba lagi.");
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handleTestPayment = async () => {
    const response = await fetch(
      "http://tkj-3b.com/tkj-3b.com/opengate/get-vehicles.php"
    );
    const data = await response.json();
    if (data.plate_number === selectedPayment.plate_number) {
      if (data.is_member === 1) {
        testPayment();
      } else {
        processPayment();
      }
    } else {
      // console.log(selectedPayment.plate_number);
      processPayment();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading parking logs...</span>
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
          Log Parkir Kendaraan
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari nomor plat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none bg-white"
          >
            <option value="all">Semua Status</option>
            <option value="parkir">Sedang Parkir</option>
            <option value="selesai">Parkir Selesai</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          Menampilkan {sortedData.length} dari {logsData.length} log parkir
        </span>
        <div className="flex gap-4">
          <span className="flex items-center">
            <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
            Sedang Parkir:{" "}
            {logsData.filter((log) => log.status === "PARKIR").length}
          </span>
          <span className="flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
            Selesai: {logsData.filter((log) => log.status === "SELESAI").length}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("plate_number")}
                >
                  <div className="flex items-center">
                    Nomor Plat
                    {sortConfig.key === "plate_number" &&
                      (sortConfig.direction === "asc" ? (
                        <ArrowUp className="w-4 h-4 ml-1" />
                      ) : (
                        <ArrowDown className="w-4 h-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("entry_time")}
                >
                  <div className="flex items-center">
                    Waktu Masuk
                    {sortConfig.key === "entry_time" &&
                      (sortConfig.direction === "asc" ? (
                        <ArrowUp className="w-4 h-4 ml-1" />
                      ) : (
                        <ArrowDown className="w-4 h-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("exit_time")}
                >
                  <div className="flex items-center">
                    Waktu Keluar
                    {sortConfig.key === "exit_time" &&
                      (sortConfig.direction === "asc" ? (
                        <ArrowUp className="w-4 h-4 ml-1" />
                      ) : (
                        <ArrowDown className="w-4 h-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Fee Parkir
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Foto Masuk
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Foto Keluar
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {searchTerm || filterStatus !== "all" || filterDate
                      ? "Tidak ada data yang sesuai dengan filter"
                      : "Belum ada log parkir"}
                  </td>
                </tr>
              ) : (
                sortedData.map((log) => (
                  <tr
                    key={log.id}
                    ref={(el) => {
                      if (log.plate_number === prioritizePlate)
                        rowRefs.current[log.plate_number] = el;
                    }}
                    className={`hover:bg-gray-50 transition-colors ${
                      log.plate_number === prioritizePlate
                        ? "bg-yellow-100"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <Car className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <span className="font-bold text-gray-900">
                            {log.plate_number}
                          </span>
                          <div className="text-sm text-gray-500">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                log.status === "PARKIR"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {log.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-green-600 mr-2" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {formatDateTime(log.entry_time)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-red-600 mr-2" />
                        <div>
                          {log.exit_time ? (
                            <div className="font-medium text-gray-900">
                              {formatDateTime(log.exit_time)}
                            </div>
                          ) : (
                            <span className="text-orange-600 font-medium">
                              Belum Keluar
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {!log.exit_time ? (
                          <span className="text-orange-600 font-medium">
                            Belum Keluar
                          </span>
                        ) : (
                          <>
                            {Number(log.parking_fee) !== 0 && (
                              <DollarSign className="w-4 h-4 text-green-600 mr-2" />
                            )}
                            <span
                              className={`font-medium ${
                                Number(log.parking_fee) === 0
                                  ? "text-green-600"
                                  : "text-gray-900"
                              }`}
                            >
                              {Number(log.parking_fee) === 0
                                ? "Membership"
                                : formatCurrency(log.parking_fee)}
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.photo ? (
                        <img
                          src={log.photo}
                          alt="Foto Masuk"
                          className="w-16 h-12 object-cover rounded-lg border-2 border-gray-200 cursor-pointer"
                          onClick={() =>
                            openImageModal(log.photo, log.plate_number)
                          }
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">No Photo</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.img_path_exit ? (
                        <img
                          src={log.img_path_exit}
                          alt="Foto Keluar"
                          className="w-16 h-12 object-cover rounded-lg border-2 border-gray-200 cursor-pointer"
                          onClick={() =>
                            openImageModal(log.img_path_exit, log.plate_number)
                          }
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">No Photo</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openPaymentModal(log)}
                        className={`p-2 rounded-lg transition-colors ${
                          log.status === "PARKIR"
                            ? "text-green-600 hover:bg-green-100"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={log.status === "SELESAI"}
                        title="Bayar"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Foto Kendaraan - {selectedImage.plate}
                </h3>
                <button
                  onClick={closeImageModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Image */}
              <div className="flex justify-center">
                {selectedImage.url ? (
                  <img
                    src={selectedImage.url}
                    alt={`Foto kendaraan ${selectedImage.plate}`}
                    className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
                    onError={(e) => {
                      e.target.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbGUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBMMTMwIDEwMEwxMDAgMTMwTDcwIDEwMEwxMDAgNzBaIiBmaWxsPSIjOUI5QjlCIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzlCOUI5QiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Rm90byBUaWRhayBUZXJzZWRpYTwvdGV4dD4KPC9zdmc+";
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-64 bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Foto tidak tersedia</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Pembayaran Parkir
                </h3>
                <button
                  onClick={closePaymentModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Nomor Plat:</span>
                  <span className="font-bold">
                    {selectedPayment.plate_number}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Waktu Masuk:</span>
                  <span>{formatDateTime(selectedPayment.entry_time)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Biaya Parkir:</span>
                  <span className="font-bold text-blue-700">
                    {formatCurrency(parkingFee)}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  1 jam pertama Rp3.000, jam berikutnya Rp3.000/jam
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Uang
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => handlePaymentAmountChange(e.target.value)}
                  placeholder="Masukkan jumlah uang"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="mb-4 flex justify-between items-center">
                <span className="text-gray-600">Kembalian:</span>
                <span
                  className={`font-bold ${
                    changeMoney < 0 ? "text-red-600" : "text-green-700"
                  }`}
                >
                  {formatCurrency(changeMoney)}
                </span>
              </div>
              <button
                onClick={processPayment}
                disabled={
                  isPaymentLoading || parseInt(paymentAmount) < parkingFee
                }
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all shadow ${
                  parseInt(paymentAmount) < parkingFee || isPaymentLoading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isPaymentLoading
                  ? "Memproses..."
                  : "Bayar & Selesaikan Parkir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogsScreen;
