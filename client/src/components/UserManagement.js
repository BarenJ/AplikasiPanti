// components/UserManagement.js
import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';

const UserManagement = ({ navigateTo }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'staff' // Fixed to 'staff' only
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Gagal memuat data pengguna');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    if (!showForm) {
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        role: 'staff' // Always staff
      });
      setFormErrors({});
    }
  };

  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setPasswordForm({
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    setSelectedUser(null);
    setShowPasswordModal(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = 'Username wajib diisi';
    } else if (formData.username.length < 3) {
      errors.username = 'Username minimal 3 karakter';
    }

    if (!formData.password) {
      errors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      errors.password = 'Password minimal 6 karakter';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Password tidak cocok';
    }

    if (!formData.full_name.trim()) {
      errors.full_name = 'Nama lengkap wajib diisi';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordForm.newPassword) {
      errors.newPassword = 'Password baru wajib diisi';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Password minimal 6 karakter';
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Password tidak cocok';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsFormLoading(true);

    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...userData } = formData;
      
      await usersAPI.create(userData);
      alert('✅ Akun staff berhasil dibuat!');
      
      setShowForm(false);
      fetchUsers(); // Refresh user list
      
      // Reset form
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        role: 'staff'
      });
    } catch (error) {
      console.error('Error creating user:', error);
      alert(`❌ Gagal membuat akun: ${error.error || 'Terjadi kesalahan'}`);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    try {
      await usersAPI.changePassword(selectedUser.id, {
        newPassword: passwordForm.newPassword
      });
      
      alert('✅ Password berhasil diubah!');
      closePasswordModal();
    } catch (error) {
      console.error('Error changing password:', error);
      alert(`❌ Gagal mengubah password: ${error.error || 'Terjadi kesalahan'}`);
    }
  };

  const handleDeleteUser = async (id, username) => {
    if (id === 1) {
      alert('❌ Tidak dapat menghapus akun admin utama');
      return;
    }

    if (!window.confirm(`Yakin ingin menghapus akun "${username}"?\n\nAkun yang dihapus tidak dapat dikembalikan.`)) {
      return;
    }

    try {
      await usersAPI.delete(id);
      alert('✅ Akun berhasil dihapus');
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`❌ Gagal menghapus akun: ${error.error || 'Terjadi kesalahan'}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'bg-danger';
      case 'staff': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'staff': return 'Staff';
      default: return role;
    }
  };

  return (
    <div className="page-wrapper">
      <button className="btn btn-back" onClick={() => navigateTo('dashboard')}>
        <i className="fas fa-arrow-left"></i> Kembali
      </button>

      <h2 className="page-title">
        <i className="fas fa-users-cog"></i>
        Manajemen Pengguna
      </h2>

      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <button className="btn btn-primary-custom me-2" onClick={toggleForm}>
            <i className="fas fa-user-plus"></i> Tambah Akun Staff
          </button>
          <button className="btn btn-outline-secondary" onClick={fetchUsers}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
        <div className="text-muted">
          <i className="fas fa-info-circle me-1"></i>
          Total: {users.length} pengguna
        </div>
      </div>

      {/* Add User Form - SIMPLIFIED */}
      {showForm && (
        <div className="form-section mb-4">
          <h4><i className="fas fa-user-plus"></i> Form Tambah Akun Staff</h4>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Username *</label>
                <input
                  type="text"
                  className={`form-control ${formErrors.username ? 'is-invalid' : ''}`}
                  name="username"
                  value={formData.username}
                  onChange={handleFormChange}
                  placeholder="min. 3 karakter"
                  disabled={isFormLoading}
                />
                {formErrors.username && (
                  <div className="invalid-feedback">{formErrors.username}</div>
                )}
                <small className="text-muted">Digunakan untuk login</small>
              </div>

              <div className="col-md-6">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  placeholder="min. 6 karakter"
                  disabled={isFormLoading}
                />
                {formErrors.password && (
                  <div className="invalid-feedback">{formErrors.password}</div>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label">Konfirmasi Password *</label>
                <input
                  type="password"
                  className={`form-control ${formErrors.confirmPassword ? 'is-invalid' : ''}`}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleFormChange}
                  placeholder="ulangi password"
                  disabled={isFormLoading}
                />
                {formErrors.confirmPassword && (
                  <div className="invalid-feedback">{formErrors.confirmPassword}</div>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label">Nama Lengkap *</label>
                <input
                  type="text"
                  className={`form-control ${formErrors.full_name ? 'is-invalid' : ''}`}
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleFormChange}
                  placeholder="Nama lengkap staff"
                  disabled={isFormLoading}
                />
                {formErrors.full_name && (
                  <div className="invalid-feedback">{formErrors.full_name}</div>
                )}
              </div>

              {/* Role field is hidden/auto-set to staff */}
              <input type="hidden" name="role" value="staff" />
            </div>

            <div className="alert alert-info mt-3">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Informasi:</strong> Akun staff hanya dapat menginput data penghuni dan melihat daftar penghuni. 
              Tidak dapat mengakses keuangan (donasi) atau menghapus data.
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
                    Membuat akun...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i> Buat Akun Staff
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

      {/* Users List */}
      <div className="user-list">
        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Memuat data pengguna...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-users fa-3x text-muted mb-3"></i>
            <p className="text-muted">Belum ada data pengguna.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Nama Lengkap</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Terakhir Login</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="fw-semibold">{user.username}</div>
                      <small className="text-muted">ID: {user.id}</small>
                    </td>
                    <td>{user.full_name}</td>
                    <td>
                      <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                        {getRoleDisplay(user.role)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.is_active ? 'bg-success' : 'bg-secondary'}`}>
                        {user.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <small>{formatDate(user.last_login)}</small>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary me-1"
                          onClick={() => openPasswordModal(user)}
                          title="Ganti password"
                        >
                          <i className="fas fa-key"></i>
                        </button>
                        {user.id !== 1 && user.role === 'staff' && (
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            title="Hapus pengguna"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && selectedUser && (
        
        <div className="modal-backdrop show custom-backdrop" style={{ display: 'block' }}>
          <div className="modal show" tabIndex="-1" style={{ display: 'block' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="fas fa-key me-2"></i>
                    Ganti Password
                  </h5>
                  <button type="button" className="btn-close" onClick={closePasswordModal}></button>
                </div>
                <div className="modal-body">
                  <p>
                    Mengganti password untuk: <strong>{selectedUser.full_name}</strong> ({selectedUser.username})
                  </p>
                  
                  <form onSubmit={handleChangePassword}>
                    <div className="mb-3">
                      <label className="form-label">Password Baru *</label>
                      <input
                        type="password"
                        className={`form-control ${passwordErrors.newPassword ? 'is-invalid' : ''}`}
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordFormChange}
                        placeholder="min. 6 karakter"
                        autoFocus
                      />
                      {passwordErrors.newPassword && (
                        <div className="invalid-feedback">{passwordErrors.newPassword}</div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Konfirmasi Password Baru *</label>
                      <input
                        type="password"
                        className={`form-control ${passwordErrors.confirmPassword ? 'is-invalid' : ''}`}
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordFormChange}
                        placeholder="ulangi password baru"
                      />
                      {passwordErrors.confirmPassword && (
                        <div className="invalid-feedback">{passwordErrors.confirmPassword}</div>
                      )}
                    </div>

                    <div className="alert alert-warning">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Password yang diubah akan berlaku pada login berikutnya.
                    </div>

                    <div className="text-end">
                      <button
                        type="button"
                        className="btn btn-secondary me-2"
                        onClick={closePasswordModal}
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary-custom"
                      >
                        <i className="fas fa-save me-1"></i> Simpan Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;