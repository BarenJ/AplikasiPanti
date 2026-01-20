import React, { useState, useEffect } from 'react';
import { residentsAPI } from '../services/api';
import { calculateAge, formatDate } from '../utils/helpers';

const ResidentList = ({ navigateTo, showDetail }) => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const data = await residentsAPI.getAll();
      // We need to fetch room information for each resident
      const residentsWithRooms = await Promise.all(
        data.map(async (resident) => {
          try {
            // If you have an API endpoint that returns resident with room info
            const residentDetail = await residentsAPI.getById(resident.id);
            return {
              ...resident,
              room_name: residentDetail.room_name || null,
              room_type: residentDetail.room_type || null
            };
          } catch (error) {
            console.error(`Error fetching room for resident ${resident.id}:`, error);
            return resident;
          }
        })
      );
      setResidents(residentsWithRooms);
    } catch (error) {
      console.error('Error fetching residents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter residents based on search term
  const filteredResidents = residents.filter(resident =>
    resident.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-wrapper">
      <button className="btn btn-back" onClick={() => navigateTo('dashboard')}>
        <i className="fas fa-arrow-left"></i> Kembali
      </button>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title">
          <i className="fas fa-users"></i>
          Daftar Opa & Oma
        </h2>
        <button
          className="btn btn-primary-custom"
          onClick={() => navigateTo('input')}
        >
          <i className="fas fa-user-plus"></i> Tambah Penghuni Baru
        </button>
      </div>

      <div className="search-box mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="🔍 Cari nama Opa atau Oma..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Memuat data...</p>
        </div>
      ) : filteredResidents.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-users fa-3x text-muted mb-3"></i>
          <p className="text-muted">
            {searchTerm ? 'Tidak ada penghuni yang sesuai dengan pencarian' : 'Belum ada data penghuni'}
          </p>
          {!searchTerm && (
            <button
              className="btn btn-primary-custom mt-3"
              onClick={() => navigateTo('input')}
            >
              <i className="fas fa-user-plus"></i> Tambah Penghuni Baru
            </button>
          )}
        </div>
      ) : (
        <div className="profile-grid">
          {filteredResidents.map(resident => {
            const age = resident.age || calculateAge(resident.birth_date);
            const gender = resident.gender || 'male';
            const genderIcon = gender === 'male' ? 'fa-male' : 'fa-female';
            const type = gender === 'male' ? 'Opa' : 'Oma';

            return (
              <div
                key={resident.id}
                className="profile-card"
              >
                <div
                  className="profile-header"
                  onClick={() => showDetail(resident.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="profile-avatar">
                    <i className={`fas ${genderIcon}`}></i>
                  </div>
                  <h5 style={{ margin: 0, fontSize: '1.3rem' }}>{resident.name}</h5>
                  <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
                    {type} • {age || '?'} Tahun • ID: {resident.resident_id}
                  </p>
                </div>
                <div className="profile-body">
                  <div className="profile-info-item">
                    <i className="fas fa-heartbeat"></i>
                    <span><strong>Kondisi:</strong> {resident.condition || 'Tidak ada data'}</span>
                  </div>

                  {/* NEW: Room Information */}
                  <div className="profile-info-item">
                    <i className="fas fa-bed"></i>
                    <span>
                      <strong>Ruangan:</strong> {resident.room_name || 'Belum ditugaskan'}
                      {resident.room_name && (
                        <span className="badge bg-info ms-2">
                          {resident.room_type === 'private' ? 'Pribadi' :
                            resident.room_type === 'shared' ? 'Bersama' : 'Khusus'}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="profile-info-item">
                    <i className="fas fa-calendar"></i>
                    <span><strong>Masuk:</strong> {formatDate(resident.join_date) || '-'}</span>
                  </div>

                  <div className="mt-3 d-flex justify-content-between align-items-center">
                    <span className={`badge ${resident.status === 'Perlu Perhatian' ? 'bg-warning text-dark' :
                      resident.status === 'Keluar' ? 'bg-secondary' :
                        resident.status === 'Meninggal' ? 'bg-dark' : 'bg-success'} badge-custom`}>
                      {resident.status || 'Aktif'}
                    </span>

                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => showDetail(resident.id)}
                    >
                      <i className="fas fa-eye"></i> Detail
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResidentList;