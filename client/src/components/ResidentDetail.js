// components/ResidentDetail.js
import React, { useState, useEffect } from 'react';
import { residentsAPI, recordsAPI } from '../services/api';


const ResidentDetail = ({ navigateTo, residentId }) => {
  const [resident, setResident] = useState(null);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (residentId) {
      fetchResidentData();
    }
  }, [residentId]);

  const fetchResidentData = async () => {
    try {
      setIsLoading(true);
      const [residentData, recordsData] = await Promise.all([
        residentsAPI.getById(residentId),
        recordsAPI.getAll({ resident_id: residentId, date_from: getDateOneWeekAgo() })
      ]);
      setResident(residentData);
      setRecords(recordsData);
    } catch (error) {
      console.error('Error fetching resident data:', error);
      alert('Gagal memuat data penghuni');
    } finally {
      setIsLoading(false);
    }
  };

  const getDateOneWeekAgo = () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  };

  const getConditionBadgeClass = (condition) => {
    switch (condition) {
      case 'Sehat': return 'bg-success';
      case 'Cukup Sehat': return 'bg-warning text-dark';
      case 'Kurang Sehat': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'Baik': return 'success';
      case 'Cukup Baik': return 'warning';
      case 'Kurang Baik': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Aktif': return 'bg-success';
      case 'Perlu Perhatian': return 'bg-warning text-dark';
      case 'Keluar': return 'bg-secondary';
      case 'Meninggal': return 'bg-dark';
      default: return 'bg-info';
    }
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

  const formatDateTime = (datetime) => {
    if (!datetime) return '-';
    const date = new Date(datetime);
    return date.toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate type from gender
  const getTypeFromGender = (gender) => {
    return gender === 'male' ? 'Opa' : 'Oma';
  };

  if (isLoading) {
    return (
      <div className="page-wrapper text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Memuat data penghuni...</p>
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="page-wrapper">
        <button className="btn btn-back" onClick={() => navigateTo('list')}>
          <i className="fas fa-arrow-left"></i> Kembali ke Daftar
        </button>
        <div className="text-center py-5">
          <i className="fas fa-user-slash fa-3x text-muted mb-3"></i>
          <h3>Data penghuni tidak ditemukan</h3>
          <button
            className="btn btn-primary mt-3"
            onClick={() => navigateTo('list')}
          >
            <i className="fas fa-arrow-left me-2"></i> Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <button className="btn btn-back" onClick={() => navigateTo('list')}>
        <i className="fas fa-arrow-left"></i> Kembali ke Daftar
      </button>

      <div className="detail-header mb-4">
        {/* Photo Display */}
        {resident.photo_path ? (
          <div className="detail-photo">
            <img
              src={`http://localhost:5000${resident.photo_path}`}
              alt={resident.name}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid white',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/120?text=No+Image';
              }}
            />
          </div>
        ) : (
          <div className="detail-avatar">
            <i className={`fas fa-${resident.gender === 'male' ? 'male' : 'female'}`}></i>
          </div>
        )}

        <div>
          <h2 style={{ margin: 0, fontSize: '2.2rem' }}>{resident.name}</h2>
          <p style={{ margin: '10px 0 0 0', fontSize: '1.1rem', opacity: 0.95 }}>
            {resident.gender === 'male' ? 'Opa' : 'Oma'} • {resident.age} Tahun • ID: {resident.resident_id}
          </p>
          <div className="mt-2">
            <span className={`badge ${getStatusBadgeClass(resident.status)} me-2`}>
              {resident.status}
            </span>
            <span className={`badge ${getConditionBadgeClass(resident.condition)}`}>
              {resident.condition}
            </span>
          </div>
        </div>
      </div>

      {/* Audio Player */}
      {resident.audio_path && (
        <div className="form-section mb-4">
          <h5><i className="fas fa-volume-up"></i> Rekaman Suara</h5>
          <div className="audio-player">
            <audio controls style={{ width: '100%' }}>
              <source src={`http://localhost:5000${resident.audio_path}`} type="audio/wav" />
              Browser Anda tidak mendukung pemutar audio.
            </audio>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation mb-4">
        <div className="nav nav-tabs" id="residentTab" role="tablist">
          <button
            className={`nav-link ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
            type="button"
          >
            <i className="fas fa-user me-1"></i> Data Pribadi
          </button>
          <button
            className={`nav-link ${activeTab === 'guardians' ? 'active' : ''}`}
            onClick={() => setActiveTab('guardians')}
            type="button"
          >
            <i className="fas fa-user-friends me-1"></i> Data Wali
            {resident.guardians && resident.guardians.length > 0 && (
              <span className="badge bg-success ms-1">{resident.guardians.length}</span>
            )}
          </button>
          <button
            className={`nav-link ${activeTab === 'medications' ? 'active' : ''}`}
            onClick={() => setActiveTab('medications')}
            type="button"
          >
            <i className="fas fa-pills me-1"></i> Data Obat
            {resident.medications && resident.medications.length > 0 && (
              <span className="badge bg-warning ms-1">{resident.medications.length}</span>
            )}
          </button>
          <button
            className={`nav-link ${activeTab === 'records' ? 'active' : ''}`}
            onClick={() => setActiveTab('records')}
            type="button"
          >
            <i className="fas fa-clipboard-list me-1"></i> Record Harian
            {records.length > 0 && (
              <span className="badge bg-primary ms-1">{records.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* Info Tab */}
      {activeTab === 'info' && (
        <div className="tab-content">
          {/* Data Pribadi */}
          <div className="info-section">
            <h5><i className="fas fa-user"></i> Data Pribadi</h5>
            <div className="row">
              <div className="col-md-6">
                <div className="info-row">
                  <div className="info-label">Nama Lengkap:</div>
                  <div className="info-value">{resident.name}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Usia:</div>
                  <div className="info-value">{resident.age} Tahun</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Tanggal Lahir:</div>
                  <div className="info-value">{formatDate(resident.birth_date)}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Tempat Lahir:</div>
                  <div className="info-value">{resident.birth_place || '-'}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="info-row">
                  <div className="info-label">Jenis Kelamin:</div>
                  <div className="info-value">
                    {resident.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                    <span className="badge bg-info ms-2">
                      {getTypeFromGender(resident.gender)}
                    </span>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-label">Agama:</div>
                  <div className="info-value">{resident.religion || '-'}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Tanggal Masuk:</div>
                  <div className="info-value">{formatDate(resident.join_date)}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Alamat Asal:</div>
                  <div className="info-value">{resident.address || '-'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Kesehatan */}
          <div className="info-section">
            <h5><i className="fas fa-heartbeat"></i> Data Kesehatan</h5>
            <div className="row">
              <div className="col-md-6">
                <div className="info-row">
                  <div className="info-label">Kondisi Umum:</div>
                  <div className="info-value">
                    <span className={`badge ${getConditionBadgeClass(resident.condition)}`}>
                      {resident.condition}
                    </span>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-label">Riwayat Penyakit:</div>
                  <div className="info-value">{resident.medical_history || 'Tidak ada'}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Alergi:</div>
                  <div className="info-value">{resident.allergies || 'Tidak ada'}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="info-row">
                  <div className="info-label">Merokok:</div>
                  <div className="info-value">{resident.smoking || 'Tidak'}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Minum Alkohol:</div>
                  <div className="info-value">{resident.alcohol || 'Tidak'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Kondisi Fungsional */}
          <div className="info-section">
            <h5><i className="fas fa-walking"></i> Kondisi Fungsional</h5>
            <div className="row">
              <div className="col-md-6">
                <div className="info-row">
                  <div className="info-label">Kemampuan Berjalan:</div>
                  <div className="info-value">{resident.functional_walking || 'Mandiri'}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="info-row">
                  <div className="info-label">Kemampuan Makan:</div>
                  <div className="info-value">{resident.functional_eating || 'Mandiri'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Kondisi Mental */}
          <div className="info-section">
            <h5><i className="fas fa-brain"></i> Kondisi Mental & Emosi</h5>
            <div className="row">
              <div className="col-md-6">
                <div className="info-row">
                  <div className="info-label">Kondisi Emosi:</div>
                  <div className="info-value">{resident.mental_emotion || 'Stabil'}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="info-row">
                  <div className="info-label">Tingkat Kesadaran:</div>
                  <div className="info-value">{resident.mental_consciousness || 'Compos Mentis'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'medications' && (
        <div className="tab-content">
          {resident.medications && resident.medications.length > 0 ? (
            <div className="row">
              {resident.medications.map((medication, index) => (
                <div key={medication.id || index} className="col-md-6 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="card-title mb-0">
                          <i className="fas fa-pills me-2 text-warning"></i>
                          Obat #{index + 1}
                          <span className={`badge ${medication.status === 'Active' ? 'bg-success' : 'bg-secondary'} ms-2`}>
                            {medication.status === 'Active' ? 'Aktif' :
                              medication.status === 'Completed' ? 'Selesai' :
                                medication.status === 'Stopped' ? 'Dihentikan' : 'Diganti'}
                          </span>
                        </h5>
                      </div>

                      <div className="info-section p-0 border-0 bg-transparent">
                        <div className="info-row">
                          <div className="info-label">Nama Obat:</div>
                          <div className="info-value fw-semibold">{medication.medication_name}</div>
                        </div>

                        {medication.dosage && (
                          <div className="info-row">
                            <div className="info-label">Dosis:</div>
                            <div className="info-value">{medication.dosage}</div>
                          </div>
                        )}

                        {medication.schedule && (
                          <div className="info-row">
                            <div className="info-label">Waktu Konsumsi:</div>
                            <div className="info-value">{medication.schedule}</div>
                          </div>
                        )}

                        {medication.prescribing_doctor && (
                          <div className="info-row">
                            <div className="info-label">Dokter Peresep:</div>
                            <div className="info-value">{medication.prescribing_doctor}</div>
                          </div>
                        )}

                        {medication.start_date && (
                          <div className="info-row">
                            <div className="info-label">Tanggal Mulai:</div>
                            <div className="info-value">{formatDate(medication.start_date)}</div>
                          </div>
                        )}

                        {medication.notes && (
                          <div className="info-row">
                            <div className="info-label">Catatan:</div>
                            <div className="info-value">{medication.notes}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="fas fa-pills fa-4x text-muted mb-3"></i>
                <h4 className="text-muted">Belum ada data obat</h4>
                <p className="text-muted mb-4">
                  Data obat-obatan yang sedang dikonsumsi belum ditambahkan.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Records Tab */}
      {activeTab === 'records' && (
        <div className="tab-content">
          {records.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
              <p className="text-muted">Belum ada record dalam 7 hari terakhir</p>
              <button
                className="btn btn-primary"
                onClick={() => navigateTo('record')}
              >
                <i className="fas fa-plus me-2"></i> Tambah Record
              </button>
            </div>
          ) : (
            <div className="record-list">
              {records.map(record => (
                <div className="record-card">
                  <div className="record-header">
                    <div className="record-date">
                      <i className="fas fa-calendar-day"></i> {formatDateTime(record.record_datetime)}
                    </div>
                    <span className={`badge`} style={{
                      backgroundColor: record.activity_color || '#007bff',
                      color: 'white'
                    }}>
                      {record.activity_name}
                    </span>
                  </div>
                  <h5 className="record-name">
                    {record.resident_name} ({record.resident_type})
                  </h5>
                  <div className="mb-2">
                    <span className={`badge bg-${getConditionColor(record.condition)} me-2`}>
                      {record.condition}
                    </span>
                  </div>
                  <p className="mb-0">{record.notes}</p>
                  {record.recorded_by && (
                    <div className="record-footer mt-2">
                      <small className="text-muted">
                        Dicatat oleh: {record.recorded_by}
                      </small>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Guardians Tab */}
      {activeTab === 'guardians' && (
        <div className="tab-content">
          {resident.guardians && resident.guardians.length > 0 ? (
            <div className="row">
              {resident.guardians.map((guardian, index) => (
                <div key={guardian.id || guardian.name || index} className="col-md-6 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="card-title mb-0">
                          <i className="fas fa-user-friends me-2 text-primary"></i>
                          Wali {index + 1}
                          {guardian.is_primary && (
                            <span className="badge bg-success ms-2">Utama</span>
                          )}
                        </h5>
                        {guardian.emergency_contact && (
                          <span className="badge bg-danger">
                            <i className="fas fa-phone-alt me-1"></i> Darurat
                          </span>
                        )}
                      </div>

                      <div className="info-section">
                        <div className="info-row">
                          <div className="info-label">Nama Lengkap:</div>
                          <div className="info-value fw-semibold">{guardian.name || '-'}</div>
                        </div>

                        {guardian.id_number && (
                          <div className="info-row">
                            <div className="info-label">No. KTP:</div>
                            <div className="info-value">{guardian.id_number}</div>
                          </div>
                        )}

                        <div className="info-row">
                          <div className="info-label">Hubungan:</div>
                          <div className="info-value">
                            {guardian.relationship || '-'}
                            {guardian.is_primary && (
                              <span className="badge bg-info ms-2">Penanggung Jawab</span>
                            )}
                          </div>
                        </div>

                        {guardian.phone && (
                          <div className="info-row">
                            <div className="info-label">Telepon:</div>
                            <div className="info-value">
                              <a href={`tel:${guardian.phone}`} className="text-decoration-none">
                                <i className="fas fa-phone me-1"></i> {guardian.phone}
                              </a>
                            </div>
                          </div>
                        )}

                        {guardian.email && (
                          <div className="info-row">
                            <div className="info-label">Email:</div>
                            <div className="info-value">
                              <a href={`mailto:${guardian.email}`} className="text-decoration-none">
                                <i className="fas fa-envelope me-1"></i> {guardian.email}
                              </a>
                            </div>
                          </div>
                        )}

                        {guardian.address && (
                          <div className="info-row">
                            <div className="info-label">Alamat:</div>
                            <div className="info-value">{guardian.address}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="fas fa-user-friends fa-4x text-muted mb-3"></i>
                <h4 className="text-muted">Belum ada data wali</h4>
                <p className="text-muted mb-4">
                  Data wali atau penanggung jawab belum ditambahkan untuk penghuni ini.
                </p>
              </div>
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Informasi:</strong> Wali adalah keluarga atau kerabat yang bertanggung jawab atas penghuni.
                Data wali dapat ditambahkan melalui form input data penghuni.
              </div>
            </div>
          )}
        </div>
      )}
      <div className="info-section">
        <h5><i className="fas fa-bed"></i> Informasi Ruangan</h5>
        {resident.room_id ? (
          <div className="row">
            <div className="col-md-6">
              <div className="info-row">
                <div className="info-label">Ruangan:</div>
                <div className="info-value">
                  {resident.room_name || 'Ruangan ' + resident.room_id}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="info-row">
                <div className="info-label">Tipe Ruangan:</div>
                <div className="info-value">
                  {resident.room_type === 'private' ? 'Pribadi' :
                    resident.room_type === 'shared' ? 'Bersama' : 'Khusus'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            Penghuni belum ditugaskan ke ruangan tertentu
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidentDetail;  