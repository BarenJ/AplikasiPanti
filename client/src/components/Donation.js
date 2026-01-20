// components/Donation.js
import React, { useState, useEffect } from 'react';
import { transactionsAPI, donationCategoriesAPI } from '../services/api';

const Donation = ({ navigateTo }) => {
  const [showForm, setShowForm] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  const [filters, setFilters] = useState({
    type: '',
    month: '',
    category_id: ''
  });

  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
    source: '',
    description: '',
    payment_method: 'cash',
    reference_number: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [categoriesData] = await Promise.all([
        donationCategoriesAPI.getAll()
      ]);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const data = await transactionsAPI.getAll(filters);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    if (!showForm) {
      setFormData({
        category_id: '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        source: '',
        description: '',
        payment_method: 'cash',
        reference_number: '',
        notes: ''
      });
      // Reset attachment states
      setAttachmentFile(null);
      setAttachmentPreview(null);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsFormLoading(true);

    try {
      // Create FormData object to handle file upload
      const formDataToSend = new FormData();

      // Append all form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Append the attachment file if exists
      if (attachmentFile) {
        formDataToSend.append('attachment', attachmentFile);
      }

      await transactionsAPI.create(formDataToSend);
      alert('✅ Transaksi berhasil disimpan!');
      setShowForm(false);
      setAttachmentFile(null);
      setAttachmentPreview(null);
      fetchTransactions();
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('❌ Gagal menyimpan transaksi: ' + (error.error || 'Terjadi kesalahan'));
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleDeleteTransaction = async (id, description) => {
    if (!window.confirm(`Yakin ingin menghapus transaksi "${description || 'ini'}"?\n\nData yang dihapus tidak dapat dikembalikan.`)) {
      return;
    }

    try {
      await transactionsAPI.delete(id);
      alert('✅ Transaksi berhasil dihapus');

      // Refresh the list
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert(`❌ Gagal menghapus transaksi: ${error.error || 'Terjadi kesalahan'}`);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTransactionTypeClass = (type) => {
    switch (type) {
      case 'income': return 'text-success';
      case 'expense': return 'text-danger';
      default: return 'text-muted';
    }
  };

  const getTransactionTypeIcon = (type) => {
    switch (type) {
      case 'income': return 'fa-arrow-down';
      case 'expense': return 'fa-arrow-up';
      default: return 'fa-exchange-alt';
    }
  };

  const viewAttachment = (attachmentPath) => {
    window.open(`http://localhost:5000${attachmentPath}`, '_blank');
  };

  return (
    <div className="page-wrapper">
      <button className="btn btn-back" onClick={() => navigateTo('dashboard')}>
        <i className="fas fa-arrow-left"></i> Kembali
      </button>

      <h2 className="page-title">
        <i className="fas fa-donate"></i>
        Keuangan & Inventory
      </h2>
      {isAdmin && (
        <div className="mb-4 d-flex justify-content-between">
          <button className="btn btn-primary-custom" onClick={toggleForm}>
            <i className="fas fa-plus"></i> Tambah Transaksi Baru
          </button>
          <button className="btn btn-outline-secondary" onClick={fetchData}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      )}

      {/* Transaction Form */}
      {showForm && (
        <div className="form-section">
          <h4><i className="fas fa-edit"></i> Form Transaksi</h4>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Kategori *</label>
                <select
                  className="form-select"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleFormChange}
                  required
                  disabled={isFormLoading}
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.type === 'income' ? 'Pemasukan' : 'Pengeluaran'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Jumlah *</label>
                <input
                  type="number"
                  className="form-control"
                  name="amount"
                  value={formData.amount}
                  onChange={handleFormChange}
                  required
                  min="0"
                  step="1000"
                  placeholder="0"
                  disabled={isFormLoading}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Tanggal *</label>
                <input
                  type="date"
                  className="form-control"
                  name="transaction_date"
                  value={formData.transaction_date}
                  onChange={handleFormChange}
                  required
                  disabled={isFormLoading}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Sumber / Penerima</label>
                <input
                  type="text"
                  className="form-control"
                  name="source"
                  value={formData.source}
                  onChange={handleFormChange}
                  placeholder="Nama donatur / vendor"
                  disabled={isFormLoading}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Deskripsi</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows="2"
                  placeholder="Keterangan transaksi"
                  disabled={isFormLoading}
                ></textarea>
              </div>

              <div className="col-md-4">
                <label className="form-label">Metode Transfer</label>
                <select
                  className="form-select"
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleFormChange}
                  disabled={isFormLoading}
                >
                  <option value="cash">Tunai</option>
                  <option value="transfer">Transfer</option>
                  <option value="check">Cek</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Nomor Referensi</label>
                <input
                  type="text"
                  className="form-control"
                  name="reference_number"
                  value={formData.reference_number}
                  onChange={handleFormChange}
                  placeholder="No. bukti transfer / cek"
                  disabled={isFormLoading}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Bukti Transaksi (Gambar/PDF)</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setAttachmentFile(file);
                      if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setAttachmentPreview(reader.result);
                        };
                        reader.readAsDataURL(file);
                      } else {
                        setAttachmentPreview(null);
                      }
                    }
                  }}
                  disabled={isFormLoading}
                />
                <small className="text-muted">Maksimal 5MB. Format: JPG, PNG, GIF, PDF</small>

                {attachmentPreview && (
                  <div className="mt-2">
                    <img
                      src={attachmentPreview}
                      alt="Preview"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '200px',
                        borderRadius: '8px',
                        border: '1px solid #ddd'
                      }}
                    />
                  </div>
                )}

                {attachmentFile && !attachmentPreview && attachmentFile.type === 'application/pdf' && (
                  <div className="mt-2">
                    <div className="alert alert-info">
                      <i className="fas fa-file-pdf me-2"></i>
                      File PDF: {attachmentFile.name}
                    </div>
                  </div>
                )}
              </div>

              <div className="col-md-4">
                <label className="form-label">Catatan</label>
                <input
                  type="text"
                  className="form-control"
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  placeholder="Catatan tambahan"
                  disabled={isFormLoading}
                />
              </div>
            </div>

            <div className="text-center mt-4">
              <button
                type="submit"
                className="btn btn-primary-custom me-2"
                disabled={isFormLoading}
              >
                {isFormLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i> Simpan Transaksi
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-secondary-custom"
                onClick={toggleForm}
                disabled={isFormLoading}
              >
                <i className="fas fa-times"></i> Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="filter-row mb-4">
        <div className="row g-2">
          <div className="col-md-3">
            <label className="form-label">Tipe</label>
            <select
              className="form-select"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              disabled={isLoading}
            >
              <option value="">Semua Tipe</option>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Kategori</label>
            <select
              className="form-select"
              value={filters.category_id}
              onChange={(e) => handleFilterChange('category_id', e.target.value)}
              disabled={isLoading}
            >
              <option value="">Semua Kategori</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Bulan</label>
            <input
              type="month"
              className="form-control"
              value={filters.month}
              onChange={(e) => handleFilterChange('month', e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="col-md-3 d-flex align-items-end">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={() => setFilters({ type: '', month: '', category_id: '' })}
              disabled={isLoading}
            >
              <i className="fas fa-times"></i> Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="transaction-list">
        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Memuat data transaksi...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-donate fa-3x text-muted mb-3"></i>
            <p className="text-muted">
              {Object.values(filters).some(f => f)
                ? 'Tidak ditemukan transaksi dengan filter tersebut'
                : 'Belum ada data transaksi. Tambahkan transaksi baru untuk melihatnya di sini.'
              }
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Kategori</th>
                  <th>Deskripsi</th>
                  <th>Sumber/Penerima</th>
                  <th>Jumlah</th>
                  <th>Metode</th>
                  <th>Aksi</th>
                  <th>Bukti</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td>
                      <div className="fw-semibold">{formatDate(transaction.transaction_date)}</div>
                      <small className="text-muted">ID: {transaction.transaction_id}</small>
                    </td>
                    <td>
                      <span className={`badge ${transaction.transaction_type === 'income' ? 'bg-success' : 'bg-warning'}`}>
                        {transaction.category_name}
                      </span>
                    </td>
                    <td>
                      <div>{transaction.description || '-'}</div>
                      {transaction.notes && (
                        <small className="text-muted">{transaction.notes}</small>
                      )}
                    </td>
                    <td>{transaction.source || '-'}</td>
                    <td>
                      <div className={`fw-bold ${getTransactionTypeClass(transaction.transaction_type)}`}>
                        <i className={`fas ${getTransactionTypeIcon(transaction.transaction_type)} me-1`}></i>
                        {formatCurrency(transaction.amount)}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-info">
                        {transaction.payment_method === 'cash' ? 'Tunai' :
                          transaction.payment_method === 'transfer' ? 'Transfer' :
                            transaction.payment_method === 'check' ? 'Cek' : 'Lainnya'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteTransaction(transaction.id, transaction.description)}
                        title="Hapus transaksi"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                    <td>
                      {transaction.attachment_path ? (
                        <button
                          className="btn btn-sm btn-outline-info"
                          onClick={() => viewAttachment(transaction.attachment_path)}
                          title="Lihat bukti transaksi"
                        >
                          <i className="fas fa-eye"></i> Lihat
                        </button>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary */}
            <div className="mt-4 p-3 bg-light rounded">
              <div className="row">
                <div className="col-md-4">
                  <div className="text-center p-3 bg-success text-white rounded">
                    <h5>Total Pemasukan</h5>
                    <h4>
                      {formatCurrency(
                        transactions
                          .filter(t => t.transaction_type === 'income')
                          .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                      )}
                    </h4>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center p-3 bg-danger text-white rounded">
                    <h5>Total Pengeluaran</h5>
                    <h4>
                      {formatCurrency(
                        transactions
                          .filter(t => t.transaction_type === 'expense')
                          .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                      )}
                    </h4>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center p-3 bg-primary text-white rounded">
                    <h5>Saldo</h5>
                    <h4>
                      {formatCurrency(
                        transactions
                          .filter(t => t.transaction_type === 'income')
                          .reduce((sum, t) => sum + parseFloat(t.amount), 0) -
                        transactions
                          .filter(t => t.transaction_type === 'expense')
                          .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                      )}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Donation;