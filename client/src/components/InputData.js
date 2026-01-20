// components/InputData.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const InputData = ({ navigateTo }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [calculatedAge, setCalculatedAge] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);

  const [guardians, setGuardians] = useState([{
    id: Date.now(),
    name: '',
    id_number: '',
    email: '',
    phone: '',
    relationship: '',
    address: '',
    is_primary: true
  }]);

  const [medications, setMedications] = useState([]);

  const [formData, setFormData] = useState({
    // Data Pribadi
    name: '',
    gender: 'male',
    birth_date: '', // Empty by default
    birth_place: '',
    address: '',
    religion: '',
    join_date: '', // Empty by default
    condition: 'Sehat',

    // Data Kesehatan
    medical_history: '',
    allergies: '',
    smoking: 'Tidak',
    alcohol: 'Tidak',

    // Pemeriksaan Hematologi
    hemoglobin: '',
    leukocyte: '',
    erythrocyte: '',

    // Data Gula Darah
    blood_sugar_random: '',
    blood_sugar_fasting: '',
    blood_sugar_two_hour: '',

    // Kondisi Fungsional
    functional_walking: 'Mandiri',
    functional_eating: 'Mandiri',

    // Kondisi Mental
    mental_emotion: 'Stabil',
    mental_consciousness: 'Compos Mentis',

    // Kamar
    room_id: ''
  });

  const [availableRooms, setAvailableRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);

  useEffect(() => {
    fetchAvailableRooms();
  }, []);

  const fetchAvailableRooms = async () => {
    try {
      setRoomsLoading(true);
      const response = await axios.get('http://localhost:5000/api/rooms/available');
      setAvailableRooms(response.data);
    } catch (error) {
      console.error('Error fetching available rooms:', error);
    } finally {
      setRoomsLoading(false);
    }
  };

  // Calculate age when birth_date changes
  useEffect(() => {
    if (formData.birth_date) {
      const calculateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        return age;
      };

      setCalculatedAge(calculateAge(formData.birth_date));
    } else {
      setCalculatedAge('');
    }
  }, [formData.birth_date]);

  // Function to set join date to today
  const setJoinDateToToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, join_date: today }));
  };

  // Medication Functions
  const addMedication = () => {
    setMedications([...medications, {
      id: Date.now(),
      medication_name: '',
      dosage: '',
      schedule: '',
      status: 'Active'
    }]);
  };

  const removeMedication = (id) => {
      setMedications(medications.filter(medication => medication.id !== id));
    };

  const updateMedication = (id, field, value) => {
    setMedications(medications.map(medication =>
      medication.id === id ? { ...medication, [field]: value } : medication
    ));
  };

  // Guardian Functions
  const addGuardian = () => {
    setGuardians([...guardians, {
      id: Date.now(),
      name: '',
      id_number: '',
      email: '',
      phone: '',
      relationship: '',
      address: '',
      is_primary: false
    }]);
  };

  const removeGuardian = (id) => {
    if (guardians.length > 1) {
      setGuardians(guardians.filter(guardian => guardian.id !== id));
    }
  };

  const updateGuardian = (id, field, value) => {
    setGuardians(guardians.map(guardian =>
      guardian.id === id ? { ...guardian, [field]: value } : guardian
    ));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        alert('Hanya file gambar yang diizinkan (JPG, PNG, GIF)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioURL(audioUrl);
        setIsRecording(false);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Tidak dapat mengakses mikrofon. Pastikan izin mikrofon telah diberikan.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const clearAudio = () => {
    setAudioBlob(null);
    setAudioURL('');
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create FormData object
      const formDataToSend = new FormData();

      // Add all form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Add guardians as JSON
      const validGuardians = guardians.filter(g => g.name.trim() !== '');
      formDataToSend.append('guardians', JSON.stringify(validGuardians));

      // Add medications as JSON
      const validMedications = medications.filter(m => m.medication_name.trim() !== '');
      formDataToSend.append('medications', JSON.stringify(validMedications));

      // Add photo if exists
      if (fileInputRef.current.files[0]) {
        formDataToSend.append('photo', fileInputRef.current.files[0]);
      }

      // Add audio if exists
      if (audioBlob) {
        const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
        formDataToSend.append('audio', audioFile);
      }

      // Send to server with multipart/form-data
      const response = await axios.post('http://localhost:5000/api/residents', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert(`✅ ${response.data.message}\nID: ${response.data.resident_id}\nUmur: ${response.data.age_calculated} tahun`);
      navigateTo('list');
    } catch (error) {
      console.error('Error creating resident:', error);
      let errorMessage = 'Gagal menyimpan data';

      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = `Data tidak valid: ${error.response.data.error}`;
        } else if (error.response.data && error.response.data.details) {
          errorMessage = `${error.response.data.error}: ${error.response.data.details}`;
        } else {
          errorMessage = error.response.data.error || 'Terjadi kesalahan pada server';
        }
      } else if (error.request) {
        errorMessage = 'Tidak dapat terhubung ke server';
      }

      alert(`❌ ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <button className="btn btn-back" onClick={() => navigateTo('dashboard')}>
        <i className="fas fa-arrow-left"></i> Kembali
      </button>

      <h2 className="page-title">
        <i className="fas fa-user-plus"></i>
        Form Input Data Penghuni
      </h2>

      <form onSubmit={handleSubmit} id="inputForm">
        {/* === DATA PRIBADI === */}
        <div className="form-section">
          <h4><i className="fas fa-user"></i> Data Pribadi</h4>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nama Lengkap *</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
                required
                disabled={isLoading}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Tanggal Lahir *</label>
              <input
                type="date"
                className="form-control"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
                disabled={isLoading}
              />
              {calculatedAge && (
                <div className="mt-2">
                  <span className="badge bg-info">
                    <i className="fas fa-calculator me-1"></i>
                    Umur: {calculatedAge} tahun
                  </span>
                </div>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label">Jenis Kelamin *</label>
              <select
                className="form-select"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                disabled={isLoading}
              >
                <option value="male">Laki-laki (Opa)</option>
                <option value="female">Perempuan (Oma)</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Tempat Lahir</label>
              <input
                type="text"
                className="form-control"
                name="birth_place"
                value={formData.birth_place}
                onChange={handleChange}
                placeholder="Kota, Provinsi"
                disabled={isLoading}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Tanggal Masuk *</label>
              <div className="input-group">
                <input
                  type="date"
                  className="form-control"
                  name="join_date"
                  value={formData.join_date}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  style={{borderLeft:'1px solid #0d6efd' ,
                          borderTopLeftRadius: '0.375rem',
                          borderBottomLeftRadius: '0.375rem'
                  }}
                  onClick={setJoinDateToToday}
                  disabled={isLoading}
                  title="Isi dengan tanggal hari ini"
                >
                  <i className="fas fa-calendar-day"></i> Hari Ini
                </button>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="col-md-6">
              <label className="form-label">Foto Penghuni</label>
              <div className="d-flex align-items-start gap-3">
                <div className="flex-grow-1">
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    disabled={isLoading}
                  />
                  <small className="text-muted">Format: JPG, PNG, GIF (Maks. 5MB)</small>
                </div>
                {previewImage && (
                  <div className="image-preview">
                    <img
                      src={previewImage}
                      alt="Preview"
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Audio Recording */}
            <div className="col-md-6">
              <label className="form-label">Rekaman Suara (Opsional)</label>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className={`btn ${isRecording ? 'btn-danger' : 'btn-outline-primary'}`}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading}
                >
                  <i className={`fas fa-${isRecording ? 'stop' : 'microphone'} me-1`}></i>
                  {isRecording ? 'Berhenti Rekam' : 'Mulai Rekam'}
                </button>
                {audioURL && (
                  <>
                    <button
                      type="button"
                      className="btn btn-outline-success"
                      onClick={() => new Audio(audioURL).play()}
                      disabled={isLoading}
                    >
                      <i className="fas fa-play me-1"></i> Putar
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={clearAudio}
                      disabled={isLoading}
                    >
                      <i className="fas fa-times me-1"></i> Hapus
                    </button>
                  </>
                )}
              </div>
              {isRecording && (
                <div className="mt-2">
                  <div className="spinner-border spinner-border-sm text-danger me-2" role="status">
                    <span className="visually-hidden">Recording...</span>
                  </div>
                  <span className="text-danger">Sedang merekam...</span>
                </div>
              )}
            </div>

            <div className="col-12">
              <label className="form-label">Alamat Lengkap</label>
              <textarea
                className="form-control"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                placeholder="Jl. Nama Jalan No. XX, Kelurahan, Kecamatan, Kota"
                disabled={isLoading}
              ></textarea>
            </div>
            <div className="col-md-6">
              <label className="form-label">Agama</label>
              <select
                className="form-select"
                name="religion"
                value={formData.religion}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="">Pilih Agama</option>
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Kondisi Umum *</label>
              <select
                className="form-select"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                required
                disabled={isLoading}
              >
                <option value="Sehat">Sehat</option>
                <option value="Cukup Sehat">Cukup Sehat</option>
                <option value="Kurang Sehat">Kurang Sehat</option>
              </select>
            </div>
          </div>
        </div>

        {/* === DATA KESEHATAN === */}
        <div className="form-section">
          <h4><i className="fas fa-heartbeat"></i> Data Kesehatan</h4>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Riwayat Penyakit</label>
              <textarea
                className="form-control"
                name="medical_history"
                value={formData.medical_history}
                onChange={handleChange}
                rows="2"
                placeholder="Contoh: Diabetes Tipe 2, Hipertensi, Asam Urat, Jantung, dll."
                disabled={isLoading}
              ></textarea>
            </div>
            <div className="col-md-6">
              <label className="form-label">Alergi</label>
              <input
                type="text"
                className="form-control"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="Contoh: Seafood, Udang, Debu, Obat tertentu"
                disabled={isLoading}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Merokok</label>
              <select
                className="form-select"
                name="smoking"
                value={formData.smoking}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="Tidak">Tidak</option>
                <option value="Ya">Ya</option>
                <option value="Dulu (Sudah Berhenti)">Dulu (Sudah Berhenti)</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Minum Alkohol</label>
              <select
                className="form-select"
                name="alcohol"
                value={formData.alcohol}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="Tidak">Tidak</option>
                <option value="Ya">Ya</option>
                <option value="Jarang">Jarang</option>
              </select>
            </div>
          </div>
        </div>

        {/* === PEMERIKSAAN HEMATOLOGI === */}
        <div className="form-section">
          <h4><i className="fas fa-vial"></i> Pemeriksaan Hematologi</h4>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Hemoglobin (g/dL)</label>
              <input
                type="text"
                className="form-control"
                name="hemoglobin"
                value={formData.hemoglobin}
                onChange={handleChange}
                placeholder="Contoh: 14.2"
                disabled={isLoading}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Leukosit (ribu/μL)</label>
              <input
                type="text"
                className="form-control"
                name="leukocyte"
                value={formData.leukocyte}
                onChange={handleChange}
                placeholder="Contoh: 7.5"
                disabled={isLoading}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Eritrosit (juta/μL)</label>
              <input
                type="text"
                className="form-control"
                name="erythrocyte"
                value={formData.erythrocyte}
                onChange={handleChange}
                placeholder="Contoh: 5.1"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* === DATA GULA DARAH === */}
        <div className="form-section">
          <h4><i className="fas fa-tint"></i> Data Gula Darah</h4>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Gula Darah Sewaktu (mg/dL)</label>
              <input
                type="text"
                className="form-control"
                name="blood_sugar_random"
                value={formData.blood_sugar_random}
                onChange={handleChange}
                placeholder="Contoh: 145"
                disabled={isLoading}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Gula Darah Puasa (mg/dL)</label>
              <input
                type="text"
                className="form-control"
                name="blood_sugar_fasting"
                value={formData.blood_sugar_fasting}
                onChange={handleChange}
                placeholder="Contoh: 110"
                disabled={isLoading}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Gula Darah 2 Jam PP (mg/dL)</label>
              <input
                type="text"
                className="form-control"
                name="blood_sugar_two_hour"
                value={formData.blood_sugar_two_hour}
                onChange={handleChange}
                placeholder="Contoh: 160"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* === DATA OBAT (Multiple) === */}
        <div className="form-section">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4><i className="fas fa-pills"></i> Data Obat  </h4>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={addMedication}
              disabled={isLoading}
            >
              <i className="fas fa-plus me-1"></i> Tambah Obat
            </button>
          </div>

          {medications.length > 0 ? (
            medications.map((medication, index) => (
              <div key={medication.id} className="">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">
                    <i className="fas fa-pills me-2 text-primary"></i>
                    Obat #{index + 1}
                  </h6>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeMedication(medication.id)}
                    disabled={isLoading}
                  >
                    <i className="fas fa-times"></i> Hapus
                  </button>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Nama Obat</label>
                    <input
                      type="text"
                      className="form-control"
                      value={medication.medication_name}
                      onChange={(e) => updateMedication(medication.id, 'medication_name', e.target.value)}
                      placeholder="Contoh: Metformin 500mg, Insulin, Amlodipine 10mg"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Dosis</label>
                    <input
                      type="text"
                      className="form-control"
                      value={medication.dosage}
                      onChange={(e) => updateMedication(medication.id, 'dosage', e.target.value)}
                      placeholder="Contoh: 2x sehari, 1 tablet pagi"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Waktu Konsumsi</label>
                    <input
                      type="text"
                      className="form-control"
                      value={medication.schedule}
                      onChange={(e) => updateMedication(medication.id, 'schedule', e.target.value)}
                      placeholder="Contoh: Pagi (08:00) & Malam (20:00)"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={medication.status}
                      onChange={(e) => updateMedication(medication.id, 'status', e.target.value)}
                      disabled={isLoading}
                    >
                      <option value="Active">Aktif</option>
                      <option value="Completed">Selesai</option>
                      <option value="Stopped">Dihentikan</option>
                      <option value="Changed">Diganti</option>
                    </select>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-3 border rounded bg-light">
              <i className="fas fa-pills fa-2x text-muted mb-2"></i>
              <p className="text-muted mb-2">Belum ada data obat. Klik "Tambah Obat" jika perlu menambahkan.</p>
              <small className="text-muted">
                Obat-obatan yang sedang dikonsumsi secara rutin oleh penghuni. Bisa dikosongkan jika tidak ada.
              </small>
            </div>
          )}
        </div>

        {/* === KONDISI FUNGSIONAL === */}
        <div className="form-section">
          <h4><i className="fas fa-walking"></i> Kondisi Fungsional</h4>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Kemampuan Berjalan</label>
              <select
                className="form-select"
                name="functional_walking"
                value={formData.functional_walking}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="Mandiri">Mandiri</option>
                <option value="Dengan Bantuan">Dengan Bantuan (tongkat/walker)</option>
                <option value="Kursi Roda">Kursi Roda</option>
                <option value="Tidak Bisa Berjalan">Tidak Bisa Berjalan</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Kemampuan Makan</label>
              <select
                className="form-select"
                name="functional_eating"
                value={formData.functional_eating}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="Mandiri">Mandiri</option>
                <option value="Dibantu">Dibantu</option>
                <option value="Makanan Cair">Makanan Cair</option>
                <option value="NGT/PEG">NGT/PEG</option>
              </select>
            </div>
          </div>
        </div>

        {/* === KONDISI MENTAL === */}
        <div className="form-section">
          <h4><i className="fas fa-brain"></i> Kondisi Mental & Emosi</h4>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Kondisi Emosi</label>
              <select
                className="form-select"
                name="mental_emotion"
                value={formData.mental_emotion}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="Stabil">Stabil</option>
                <option value="Cukup Stabil">Cukup Stabil</option>
                <option value="Tidak Stabil">Tidak Stabil</option>
                <option value="Depresi">Depresi</option>
                <option value="Cemas">Cemas</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Tingkat Kesadaran</label>
              <select
                className="form-select"
                name="mental_consciousness"
                value={formData.mental_consciousness}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="Compos Mentis">Compos Mentis (Sadar penuh)</option>
                <option value="Apatis">Apatis</option>
                <option value="Somnolen">Somnolen (Mengantuk)</option>
                <option value="Sopor">Sopor</option>
                <option value="Koma">Koma</option>
              </select>
            </div>
          </div>
        </div>

        {/* === DATA WALI === */}
        <div id="guardian-container">
          {guardians.map((guardian, index) => (
            <div key={guardian.id} className="guardian-section form-section">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5><i className="fas fa-user-friends"></i> Data Wali {index + 1}</h5>
                {guardians.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => removeGuardian(guardian.id)}
                    disabled={isLoading}
                  >
                    <i className="fas fa-times"></i> Hapus Wali
                  </button>
                )}
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nama Wali *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={guardian.name}
                    onChange={(e) => updateGuardian(guardian.id, 'name', e.target.value)}
                    placeholder="Nama lengkap wali"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Nomor KTP</label>
                  <input
                    type="text"
                    className="form-control"
                    value={guardian.id_number}
                    onChange={(e) => updateGuardian(guardian.id, 'id_number', e.target.value)}
                    placeholder="16 digit nomor KTP"
                    disabled={isLoading}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Nomor Telepon *</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={guardian.phone}
                    onChange={(e) => updateGuardian(guardian.id, 'phone', e.target.value)}
                    placeholder="081234567890"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={guardian.email}
                    onChange={(e) => updateGuardian(guardian.id, 'email', e.target.value)}
                    placeholder="email@contoh.com"
                    disabled={isLoading}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Hubungan</label>
                  <input
                    type="text"
                    className="form-control"
                    value={guardian.relationship}
                    onChange={(e) => updateGuardian(guardian.id, 'relationship', e.target.value)}
                    placeholder="Contoh: Anak, Saudara, Keponakan, Cucu"
                    disabled={isLoading}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Alamat</label>
                  <textarea
                    className="form-control"
                    value={guardian.address}
                    onChange={(e) => updateGuardian(guardian.id, 'address', e.target.value)}
                    rows="2"
                    placeholder="Alamat lengkap wali"
                    disabled={isLoading}
                  ></textarea>
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`primary-${guardian.id}`}
                      checked={guardian.is_primary}
                      onChange={(e) => updateGuardian(guardian.id, 'is_primary', e.target.checked)}
                      disabled={isLoading}
                    />
                    <label className="form-check-label" htmlFor={`primary-${guardian.id}`}>
                      <strong>Wali Utama (Penanggung Jawab)</strong>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="col-md-6">
          <label className="form-label">Ruangan</label>
          <select
            className="form-select"
            name="room_id"
            value={formData.room_id}
            onChange={handleChange}
            disabled={isLoading || roomsLoading}
          >
            <option value="">Pilih Ruangan (Opsional)</option>
            {roomsLoading ? (
              <option value="" disabled>Memuat daftar ruangan...</option>
            ) : availableRooms.length === 0 ? (
              <option value="" disabled>Tidak ada ruangan tersedia</option>
            ) : (
              availableRooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.room_name}
                  {room.capacity > 1 ? ` (Kapasitas: ${room.current_occupants || 0}/${room.capacity})` : ''}
                </option>
              ))
            )}
          </select>
          <small className="text-muted">
            Penugasan ruangan dapat diubah nanti dari halaman daftar penghuni
          </small>
        </div>

        <div className="text-center mt-4">
          <button
            type="button"
            className="btn btn-secondary me-2"
            onClick={addGuardian}
            disabled={isLoading}
          >
            <i className="fas fa-plus"></i> Tambah Wali Lain
          </button>
        </div>

        <div className="text-center mt-4">
          <button
            type="submit"
            className="btn btn-primary-custom me-3"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Menyimpan...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i> Simpan Data
              </>
            )}
          </button>
          <button
            type="button"
            className="btn btn-secondary-custom"
            onClick={() => navigateTo('dashboard')}
            disabled={isLoading}
          >
            <i className="fas fa-times"></i> Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputData;