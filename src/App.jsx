import React, { useState, useEffect, useRef } from 'react';
import { Recycle, Users, Trophy, Activity, Search, QrCode, ArrowRight, Trash2, XCircle, Lock, User, Plus, X, Edit, Trash, Gift, Wallet, BarChart3, LayoutDashboard, Calendar, Filter, Upload, Settings, Bell, CheckCircle, Clock } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

// ==========================================
// 1. KONFIGURASI FIREBASE ANDA
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyA93ckSUA4i5gLYoKgt-gQv-IjwQGAOEGs",
  authDomain: "revive-165c1.firebaseapp.com",
  projectId: "revive-165c1",
  storageBucket: "revive-165c1.firebasestorage.app",
  messagingSenderId: "2820905150",
  appId: "1:2820905150:web:15cecb416aec550f5066ef"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Data Dummy Ikut Struktur Sekolah & Statistik Kekal
const initialStudents = [
  // Tingkatan 1 (Kelas A-E)
  { id: "S001", name: "Fatihah", marks: 102, totalContributed: 102, form: "1", className: "A", redeemRequest: false },
  { id: "S002", name: "Aisyah", marks: 5, totalContributed: 5, form: "1", className: "B", redeemRequest: false },
  { id: "S003", name: "Zahirah", marks: 8, totalContributed: 8, form: "1", className: "C", redeemRequest: false },
  { id: "S004", name: "Fatimah", marks: 15, totalContributed: 15, form: "1", className: "D", redeemRequest: false },
  { id: "S005", name: "Atiqah", marks: 3, totalContributed: 3, form: "1", className: "E", redeemRequest: false },

  // Tingkatan 2 (Kelas A-E)
  { id: "S006", name: "Hafiya", marks: 25, totalContributed: 25, form: "2", className: "A", redeemRequest: false },
  { id: "S007", name: "Aliya", marks: 0, totalContributed: 0, form: "2", className: "B", redeemRequest: false },
  { id: "S008", name: "Ardaeya", marks: 14, totalContributed: 14, form: "2", className: "C", redeemRequest: false },
  { id: "S009", name: "Syafiqah", marks: 33, totalContributed: 33, form: "2", className: "D", redeemRequest: false },
  { id: "S010", name: "Haneef", marks: 7, totalContributed: 7, form: "2", className: "E", redeemRequest: false },

  // Tingkatan 3 (Kelas A-E)
  { id: "S011", name: "Ayyub", marks: 9, totalContributed: 9, form: "3", className: "A", redeemRequest: false },
  { id: "S012", name: "Syazriel", marks: 45, totalContributed: 45, form: "3", className: "B", redeemRequest: false },
  { id: "S013", name: "Haikal", marks: 18, totalContributed: 18, form: "3", className: "C", redeemRequest: false },
  { id: "S014", name: "Zulfikar", marks: 0, totalContributed: 0, form: "3", className: "D", redeemRequest: false },
  { id: "S015", name: "Adeeb", marks: 21, totalContributed: 21, form: "3", className: "E", redeemRequest: false },

  // Tingkatan 4 (Kelas A-D)
  { id: "S016", name: "Iqbal", marks: 11, totalContributed: 11, form: "4", className: "A", redeemRequest: false },
  { id: "S017", name: "Aqil", marks: 3, totalContributed: 3, form: "4", className: "B", redeemRequest: false },
  { id: "S018", name: "Ayuni", marks: 27, totalContributed: 27, form: "4", className: "C", redeemRequest: false },
  { id: "S019", name: "Zulaiqah", marks: 10, totalContributed: 10, form: "4", className: "D", redeemRequest: false },

  // Tingkatan 5 (Kelas A-D)
  { id: "S020", name: "Husna", marks: 16, totalContributed: 16, form: "5", className: "A", redeemRequest: false },
  { id: "S021", name: "Hafiy", marks: 50, totalContributed: 50, form: "5", className: "B", redeemRequest: false },
  { id: "S022", name: "Dayana", marks: 38, totalContributed: 38, form: "5", className: "C", redeemRequest: false },
  { id: "S023", name: "Nisreen", marks: 4, totalContributed: 4, form: "5", className: "D", redeemRequest: false },

  // Tingkatan 6 (Atas & Bawah)
  { id: "S024", name: "Nabilah", marks: 19, totalContributed: 19, form: "6", className: "Atas", redeemRequest: false },
  { id: "S025", name: "Sofia", marks: 8, totalContributed: 8, form: "6", className: "Bawah", redeemRequest: false }
];

export default function App() {
  // ==========================================
  // STATE PENGURUSAN ROLE & LOGIN
  // ==========================================
  const [userRole, setUserRole] = useState('guest'); 
  const [loggedInStudent, setLoggedInStudent] = useState(null);
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginTab, setLoginTab] = useState('student'); 
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  
  // State Paparan & Tetapan
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); 
  const [students, setStudents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [conversionRate, setConversionRate] = useState(0.01);
  
  // State Penapis Jadual
  const [searchTerm, setSearchTerm] = useState('');
  const [filterForm, setFilterForm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [selectedIds, setSelectedIds] = useState([]); 
  
  // State Modal CRUD
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const [newStudent, setNewStudent] = useState({ id: '', name: '', form: '', className: '' });
  const [editStudentData, setEditStudentData] = useState({ id: '', name: '', form: '', className: '', marks: 0, totalContributed: 0 });
  const [tempRate, setTempRate] = useState(0.01);

  const fileInputRef = useRef(null); 

  // Pilihan Kelas Mengikut Struktur Sekolah Tetap
  const getClassOptions = (form) => {
    if (['1', '2', '3'].includes(form)) return ['A', 'B', 'C', 'D', 'E'];
    if (['4', '5'].includes(form)) return ['A', 'B', 'C', 'D'];
    if (form === '6') return ['Atas', 'Bawah'];
    return [];
  };

  // ==========================================
  // BACA DATA DARI FIREBASE
  // ==========================================
  useEffect(() => {
    const settingsRef = doc(db, 'settings', 'system');
    const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setConversionRate(docSnap.data().conversionRate || 0.01);
      } else {
        setDoc(settingsRef, { conversionRate: 0.01 }); 
      }
    });

    const studentsRef = collection(db, 'students'); 
    const unsubStudents = onSnapshot(studentsRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "modified") {
          const student = change.doc.data();
          const newActivity = {
            id: Date.now() + Math.random(),
            studentId: student.id,
            name: student.name,
            time: new Date().toLocaleTimeString(),
            message: `Kemas kini botol.` 
          };
          setRecentActivity(prev => [newActivity, ...prev].slice(0, 5));
        }
      });

      if (!snapshot.empty) {
        const updatedStudents = [];
        snapshot.forEach(doc => updatedStudents.push(doc.data()));
        updatedStudents.sort((a, b) => a.id.localeCompare(b.id));
        setStudents(updatedStudents);
      } else {
        initialStudents.forEach(async (s) => {
          await setDoc(doc(studentsRef, s.id), s);
        });
      }
    });
    
    return () => {
      unsubSettings();
      unsubStudents();
    };
  }, []);

  // Sync data profil pelajar yang sedang login
  useEffect(() => {
    if (userRole === 'student' && loggedInStudent) {
      const freshData = students.find(s => s.id === loggedInStudent.id);
      if (freshData) setLoggedInStudent(freshData);
    }
  }, [students, userRole, loggedInStudent]);

  // ==========================================
  // LOGIK LOGIN / LOGOUT
  // ==========================================
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginTab === 'admin') {
      if (loginUser === 'admin' && loginPass === 'abc@12345') {
        setUserRole('admin'); setShowLoginModal(false); setLoginUser(''); setLoginPass('');
      } else alert("Username atau Password Admin salah!");
    } else {
      const studentFound = students.find(s => s.id.toLowerCase() === loginUser.toLowerCase());
      if (studentFound && loginPass === '1234') {
        setUserRole('student');
        setLoggedInStudent(studentFound);
        setShowLoginModal(false);
        setLoginUser(''); setLoginPass('');
        setFilterForm(studentFound.form);
        setFilterClass(studentFound.className);
      } else alert("ID Pelajar salah atau Password salah (Default: 1234)");
    }
  };

  const handleLogout = () => {
    setUserRole('guest'); setLoggedInStudent(null); setFilterForm(''); setFilterClass('');
  };

  // ==========================================
  // PENGIRAAN STATISTIK (BERDASARKAN totalContributed)
  // ==========================================
  const totalBottles = students.reduce((sum, student) => sum + (parseInt(student.totalContributed) || 0), 0);
  const activeUsers = students.filter(s => s.totalContributed > 0).length;
  const topStudent = students.length > 0 ? [...students].sort((a, b) => (b.totalContributed || 0) - (a.totalContributed || 0))[0] : null;

  const availableForms = ['1', '2', '3', '4', '5', '6'];
  const availableClasses = filterForm ? getClassOptions(filterForm) : ['A', 'B', 'C', 'D', 'E', 'Atas', 'Bawah'];

  const filteredStudents = students.filter(student => {
    if (userRole === 'student') {
      return student.form === loggedInStudent.form && student.className === loggedInStudent.className &&
             (student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.id.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    const matchSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        student.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchForm = filterForm ? student.form === filterForm : true;
    const matchClass = filterClass ? student.className === filterClass : true;
    return matchSearch && matchForm && matchClass;
  });

  const statsByForm = {};
  students.forEach(student => {
    const form = student.form ? `Tingkatan ${student.form}` : "Lain-lain";
    const className = student.className || "Tiada Kelas";
    const marksContributed = parseInt(student.totalContributed) || 0;
    
    if (!statsByForm[form]) statsByForm[form] = { total: 0, classes: {} };
    statsByForm[form].total += marksContributed;
    if (!statsByForm[form].classes[className]) statsByForm[form].classes[className] = 0;
    statsByForm[form].classes[className] += marksContributed;
  });
  const sortedForms = Object.keys(statsByForm).sort();

  // ==========================================
  // LOGIK REDEEM PENEBUSAN WANG
  // ==========================================
  const requestRedeem = async () => {
    if (window.confirm("Adakah anda pasti mahu memohon penebusan wang?")) {
      try {
        await updateDoc(doc(db, 'students', loggedInStudent.id), { redeemRequest: true });
        alert("Permohonan dihantar! Sila tunggu kelulusan Admin.");
      } catch (err) { alert("Ralat menghantar permohonan."); }
    }
  };

  const handleAcceptRedeem = async (student) => {
    const totalRM = (student.marks * conversionRate).toFixed(2);
    if (window.confirm(`Sah luluskan penebusan RM ${totalRM} untuk ${student.name}?\nBaki botol pelajar di-reset ke 0, tetapi statistik sumbangan kekal terpelihara.`)) {
      try {
        await updateDoc(doc(db, 'students', student.id), { marks: 0, redeemRequest: false });
        alert(`Berjaya! RM ${totalRM} telah diluluskan.`);
      } catch (err) { alert("Ralat meluluskan mata."); }
    }
  };

  const handleCancelRedeem = async (studentId) => {
    try { await updateDoc(doc(db, 'students', studentId), { redeemRequest: false }); } catch (err) { alert("Gagal."); }
  };

  // ==========================================
  // SYKED PIPELINE / CRUD ADMIN
  // ==========================================
  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.id || !newStudent.name || !newStudent.form || !newStudent.className) return alert("Sila isi semua maklumat!");
    try {
      await setDoc(doc(db, 'students', newStudent.id.toUpperCase()), {
        id: newStudent.id.toUpperCase(), name: newStudent.name, form: newStudent.form, className: newStudent.className, marks: 0, totalContributed: 0, redeemRequest: false
      });
      setShowAddModal(false); setNewStudent({ id: '', name: '', form: '', className: '' }); alert("Berjaya ditambah!");
    } catch (err) { alert("Gagal menambah pelajar."); }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      const marksVal = parseInt(editStudentData.marks) || 0;
      const currentHistory = students.find(s => s.id === editStudentData.id)?.totalContributed || 0;
      const newHistory = marksVal > currentHistory ? marksVal : currentHistory;

      await updateDoc(doc(db, 'students', editStudentData.id), {
        name: editStudentData.name, form: editStudentData.form, className: editStudentData.className, 
        marks: marksVal, totalContributed: newHistory
      });
      setShowEditModal(false); alert("Berjaya dikemas kini!");
    } catch (err) { alert("Gagal mengemas kini."); }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'system'), { conversionRate: parseFloat(tempRate) }, { merge: true });
      setShowSettingsModal(false); alert("Kadar harga berjaya dikemas kini!");
    } catch (err) { alert("Gagal mengemas kini tetapan."); }
  };

  const handleDeleteStudent = async (id, name) => {
    if (window.confirm(`Pasti padam rekod ${name}?`)) {
      try { await deleteDoc(doc(db, 'students', id)); } catch (err) { alert("Gagal memadam."); }
    }
  };

  // PEMBETULAN: Fungsi Khas Untuk Select All & Padam Beramai-ramai
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredStudents.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Adakah anda pasti mahu memadam ${selectedIds.length} rekod serentak?`)) {
      try {
        for (const id of selectedIds) await deleteDoc(doc(db, 'students', id));
        setSelectedIds([]); alert("Rekod terpilih berjaya dipadam!");
      } catch (error) { alert("Ralat memadam rekod."); }
    }
  };

  // Muat Naik CSV Data
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const rows = text.split('\n');
      let successCount = 0;
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;
        const cols = row.split(','); 
        if (cols.length >= 2 && cols[0].toLowerCase().trim() !== 'id' && cols[0].toLowerCase().trim() !== 'id pelajar') {
          const id = cols[0].trim().toUpperCase();
          const name = cols[1].trim();
          const form = cols[2] ? cols[2].trim() : '';
          const className = cols[3] ? cols[3].trim() : '';
          if (id && name) {
            await setDoc(doc(db, 'students', id), { id, name, form, className, marks: 0, totalContributed: 0, redeemRequest: false });
            successCount++;
          }
        }
      }
      alert(`${successCount} rekod pelajar berjaya dimuat naik!`);
      e.target.value = null; 
    };
    reader.readAsText(file);
  };

  const simulateESP32Update = async () => {
    if (students.length === 0) return;
    setIsScanning(true);
    const student = students[Math.floor(Math.random() * students.length)];
    try { 
      await updateDoc(doc(db, 'students', student.id), { 
        marks: (parseInt(student.marks) || 0) + 1,
        totalContributed: (parseInt(student.totalContributed) || 0) + 1
      }); 
    } catch (err) {} finally { setIsScanning(false); }
  };

  const pendingRequestsCount = students.filter(s => s.redeemRequest).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans relative">
      
      {/* ========================================== */}
      {/* MODAL & POPUPS                             */}
      {/* ========================================== */}
      {showLoginModal && userRole === 'guest' && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold text-slate-800">Log Masuk</h2><button onClick={() => setShowLoginModal(false)} className="text-slate-400 hover:text-red-500"><X /></button></div>
            <div className="flex mb-6 bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setLoginTab('student')} className={`flex-1 py-2 text-sm font-bold rounded-md ${loginTab === 'student' ? 'bg-white shadow text-emerald-600' : 'text-slate-500'}`}>Pelajar</button>
              <button onClick={() => setLoginTab('admin')} className={`flex-1 py-2 text-sm font-bold rounded-md ${loginTab === 'admin' ? 'bg-white shadow text-emerald-600' : 'text-slate-500'}`}>Admin</button>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div><label className="block text-sm font-medium mb-1">{loginTab === 'student' ? 'ID Pelajar' : 'Username'}</label><div className="relative"><User className="absolute left-3 top-3 h-5 w-5 text-slate-400" /><input type="text" required value={loginUser} onChange={(e) => setLoginUser(e.target.value)} className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" /></div></div>
              <div><label className="block text-sm font-medium mb-1">Password {loginTab === 'student' && <span className="text-xs text-slate-400 font-normal">(Default: 1234)</span>}</label><div className="relative"><Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" /><input type="password" required value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" /></div></div>
              <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700">Masuk</button>
            </form>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm">
            <div className="flex justify-between mb-4"><h3 className="font-bold text-xl">Tetapan Nilai Botol</h3><button onClick={() => setShowSettingsModal(false)}><X/></button></div>
            <form onSubmit={handleUpdateSettings} className="space-y-4">
              <div><label className="block text-sm font-bold text-slate-700">1 Botol = RM</label><input type="number" step="0.01" min="0" required value={tempRate} onChange={(e) => setTempRate(e.target.value)} className="w-full p-2 border rounded font-bold text-emerald-600 focus:ring-2 focus:ring-emerald-500" /></div>
              <button type="submit" className="w-full bg-emerald-600 text-white p-2 rounded font-bold">Simpan Perubahan</button>
            </form>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <div className="flex justify-between mb-4"><h3 className="font-bold text-xl">Tambah Pelajar</h3><button onClick={() => setShowAddModal(false)}><X/></button></div>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <input type="text" placeholder="ID (Cth: S026)" required value={newStudent.id} onChange={(e) => setNewStudent({...newStudent, id: e.target.value})} className="w-full p-2 border rounded" />
              <input type="text" placeholder="Nama Penuh" required value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} className="w-full p-2 border rounded" />
              <div className="grid grid-cols-2 gap-4">
                <select required value={newStudent.form} onChange={(e) => setNewStudent({...newStudent, form: e.target.value, className: ''})} className="w-full p-2 border rounded bg-white text-slate-700"><option value="" disabled>Pilih Tg</option>{['1', '2', '3', '4', '5', '6'].map(f => <option key={f} value={f}>Tg {f}</option>)}</select>
                <select required value={newStudent.className} disabled={!newStudent.form} onChange={(e) => setNewStudent({...newStudent, className: e.target.value})} className="w-full p-2 border rounded bg-white text-slate-700"><option value="" disabled>Pilih Kelas</option>{getClassOptions(newStudent.form).map(c => <option key={c} value={c}>{c}</option>)}</select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-bold">Simpan</button>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <div className="flex justify-between mb-4"><h3 className="font-bold text-xl">Edit Pelajar</h3><button onClick={() => setShowEditModal(false)}><X/></button></div>
            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <input type="text" disabled value={editStudentData.id} className="w-full p-2 border bg-slate-100 rounded text-slate-500" />
              <input type="text" required value={editStudentData.name} onChange={(e) => setEditStudentData({...editStudentData, name: e.target.value})} className="w-full p-2 border rounded" />
              <div className="grid grid-cols-2 gap-4">
                <select required value={editStudentData.form} onChange={(e) => setEditStudentData({...editStudentData, form: e.target.value, className: ''})} className="w-full p-2 border rounded bg-white"><option value="" disabled>Tg</option>{['1', '2', '3', '4', '5', '6'].map(f => <option key={f} value={f}>Tg {f}</option>)}</select>
                <select required value={editStudentData.className} disabled={!editStudentData.form} onChange={(e) => setEditStudentData({...editStudentData, className: e.target.value})} className="w-full p-2 border rounded bg-white"><option value="" disabled>Kelas</option>{getClassOptions(editStudentData.form).map(c => <option key={c} value={c}>{c}</option>)}</select>
              </div>
              <div><label className="text-sm font-bold text-slate-600">Baki Botol (Akaun Dompet Penebusan)</label><input type="number" required value={editStudentData.marks} onChange={(e) => setEditStudentData({...editStudentData, marks: e.target.value})} className="w-full p-2 border rounded font-bold text-blue-600" /></div>
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-bold">Kemas Kini</button>
            </form>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="bg-emerald-600 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}><Recycle className="h-8 w-8" /><span className="text-2xl font-bold tracking-wider hidden sm:block">REVIVE</span></div>
          <div className="flex space-x-1 bg-emerald-700/50 p-1 rounded-lg">
            <button onClick={() => setActiveTab('dashboard')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center ${activeTab === 'dashboard' ? 'bg-white text-emerald-700 shadow-sm' : 'text-emerald-50 hover:text-white'}`}><LayoutDashboard className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Utama</span></button>
            <button onClick={() => setActiveTab('statistik')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center ${activeTab === 'statistik' ? 'bg-white text-emerald-700 shadow-sm' : 'text-emerald-50 hover:text-white'}`}><BarChart3 className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Statistik</span></button>
          </div>
          <div className="flex items-center">
            {userRole !== 'guest' ? (
              <div className="flex items-center space-x-3"><span className="hidden md:block text-sm font-medium bg-emerald-800 px-3 py-1 rounded-full">Hi, {userRole === 'admin' ? 'Admin' : loggedInStudent.name}</span><button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded text-sm font-bold">Keluar</button></div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="bg-emerald-800 hover:bg-emerald-900 px-4 py-2 rounded text-sm font-bold flex items-center"><User className="h-4 w-4 mr-2"/> Log Masuk</button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* ALERTS JIKA MARMAH PELAJAR >= 100 */}
        {userRole === 'student' && loggedInStudent && loggedInStudent.marks >= 100 && !loggedInStudent.redeemRequest && (
          <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg flex flex-col sm:flex-row justify-between items-start sm:items-center animate-in slide-in-from-top-2">
            <div>
              <h3 className="font-bold text-green-800 flex items-center"><Gift className="h-5 w-5 mr-2" /> Tahniah! Anda boleh menebus wang.</h3>
              <p className="text-green-700 text-sm mt-1">Akaun anda mengandungi baki {loggedInStudent.marks} botol. Nilai tebusan: RM {(loggedInStudent.marks * conversionRate).toFixed(2)}</p>
            </div>
            <button onClick={requestRedeem} className="mt-3 sm:mt-0 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">Mohon Penebusan</button>
          </div>
        )}

        {userRole === 'student' && loggedInStudent && loggedInStudent.redeemRequest && (
          <div className="bg-amber-100 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg shadow-sm">
            <h3 className="font-bold text-amber-800 flex items-center"><Clock className="h-5 w-5 mr-2" /> Permohonan Diproses</h3>
            <p className="text-amber-700 text-sm mt-1">Sila bawa kad fizikal ke kaunter pengurusan untuk penebusan tunai RM {(loggedInStudent.marks * conversionRate).toFixed(2)}.</p>
          </div>
        )}

        {userRole === 'admin' && pendingRequestsCount > 0 && (
          <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg shadow-sm">
            <h3 className="font-bold text-blue-800 flex items-center"><Bell className="h-5 w-5 mr-2" /> Tindakan Admin</h3>
            <p className="text-blue-700 text-sm mt-1">Terdapat <b>{pendingRequestsCount}</b> permohonan penebusan mata yang perlu disemak.</p>
          </div>
        )}

        {/* TAB 1: DASHBOARD UTAMA */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Papan Pemuka Pintar</h1>
                <p className="text-slate-500 mt-1">1 Botol = 1 Markah = <span className="font-bold text-emerald-600">RM {conversionRate.toFixed(2)}</span></p>
              </div>
              {userRole === 'admin' && (
                <div className="flex flex-wrap gap-2">
                  <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                  <button onClick={() => { setTempRate(conversionRate); setShowSettingsModal(true); }} className="flex items-center px-4 py-2 rounded-lg font-medium shadow-sm bg-slate-200 text-slate-700 hover:bg-slate-300"><Settings className="mr-2 h-4 w-4" /> Tetapan</button>
                  <button onClick={() => fileInputRef.current.click()} className="flex items-center px-4 py-2 rounded-lg font-medium shadow-sm bg-indigo-600 text-white hover:bg-indigo-700"><Upload className="mr-2 h-4 w-4" /> CSV Data</button>
                  <button onClick={() => setShowAddModal(true)} className="flex items-center px-4 py-2 rounded-lg font-medium shadow-sm bg-blue-600 text-white hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" /> Pelajar</button>
                  <button onClick={simulateESP32Update} disabled={isScanning} className="flex items-center px-4 py-2 rounded-lg font-medium bg-emerald-600 text-white hover:bg-emerald-700"><QrCode className="mr-2 h-4 w-4" /> Simulasi</button>
                </div>
              )}
            </div>

            {/* STATISTIK DIKIRA DARI totalContributed (SEJARAH KEKAL) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center"><div className="bg-emerald-100 p-4 rounded-lg text-emerald-600 mr-4"><Trash2 className="h-8 w-8" /></div><div><p className="text-sm text-slate-500 font-medium">Jumlah Botol Terkumpul Sekolah (Kekal)</p><h3 className="text-3xl font-bold text-slate-800">{totalBottles}</h3></div></div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center"><div className="bg-amber-100 p-4 rounded-lg text-amber-600 mr-4"><Wallet className="h-8 w-8" /></div><div><p className="text-sm text-slate-500 font-medium">Dana Penjimatan Hijau</p><h3 className="text-3xl font-bold text-slate-800">{(totalBottles * conversionRate).toFixed(2)}</h3></div></div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center"><div className="bg-blue-100 p-4 rounded-lg text-blue-600 mr-4"><Trophy className="h-8 w-8" /></div><div><p className="text-sm text-slate-500 font-medium">Penyumbang Teratas (Sejarah)</p><h3 className="text-xl font-bold text-slate-800 truncate max-w-[150px]">{topStudent && topStudent.totalContributed > 0 ? topStudent.name : '-'}</h3><p className="text-xs text-blue-600 font-medium">{topStudent && topStudent.totalContributed > 0 ? `${topStudent.totalContributed} Botol` : '0 Botol'}</p></div></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* JADUAL UTAMA */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h2 className="text-xl font-bold text-slate-800 shrink-0">
                    {userRole === 'student' ? `Senarai Kelas ${loggedInStudent.form} ${loggedInStudent.className}` : 'Pangkalan Data Dompet Pelajar'}
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    {userRole === 'admin' && selectedIds.length > 0 && (
                      <button onClick={handleBulkDelete} className="flex items-center px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"><Trash2 className="w-4 h-4 mr-1.5" /> Padam ({selectedIds.length})</button>
                    )}
                    {userRole !== 'student' && (
                      <>
                        <div className="relative">
                          <select value={filterForm} onChange={(e) => {setFilterForm(e.target.value); setFilterClass('');}} className="w-full appearance-none border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-sm bg-slate-50"><option value="">Semua Tg</option>{availableForms.map(form => <option key={form} value={form}>Tg {form}</option>)}</select>
                          <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                        </div>
                        <div className="relative">
                          <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="w-full appearance-none border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-sm bg-slate-50 disabled:opacity-50" disabled={!filterForm && filterClass === ''}><option value="">Semua Kelas</option>{availableClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}</select>
                          <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                        </div>
                      </>
                    )}
                    <div className="relative w-full sm:w-48"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" /><input type="text" placeholder="Cari..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" /></div>
                  </div>
                </div>

                <div className="overflow-x-auto h-[500px]">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead className="bg-slate-50 sticky top-0 shadow-sm z-10">
                      <tr>
                        {userRole === 'admin' && (<th className="p-4 w-12 text-center"><input type="checkbox" className="w-4 h-4 text-emerald-600 rounded" checked={filteredStudents.length > 0 && selectedIds.length === filteredStudents.length} onChange={handleSelectAll} /></th>)}
                        <th className="p-4 font-semibold text-slate-600 text-sm">ID</th>
                        <th className="p-4 font-semibold text-slate-600 text-sm">Nama</th>
                        {userRole !== 'student' && <th className="p-4 font-semibold text-slate-600 text-sm">Tg/Kls</th>}
                        <th className="p-4 font-semibold text-slate-600 text-sm text-center">Dompet (Baki Botol)</th>
                        <th className="p-4 font-semibold text-slate-600 text-sm text-center">Jumlah Sejarah</th>
                        <th className="p-4 font-semibold text-slate-600 text-sm text-center">Nilai RM Pelajar</th>
                        {userRole === 'admin' && <th className="p-4 font-semibold text-slate-600 text-sm text-center">Tindakan</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                          <tr key={student.id} className={`border-b border-slate-100 hover:bg-slate-50 ${(userRole === 'student' && student.id === loggedInStudent?.id) ? 'bg-emerald-50/30' : ''} ${selectedIds.includes(student.id) ? 'bg-emerald-50/50' : ''}`}>
                            {userRole === 'admin' && (<td className="p-4 text-center"><input type="checkbox" className="w-4 h-4 rounded" checked={selectedIds.includes(student.id)} onChange={() => handleSelectRow(student.id)} /></td>)}
                            <td className="p-4 font-mono text-sm text-slate-500">{student.id}</td>
                            <td className="p-4 font-medium text-slate-800">{student.name}{(userRole === 'student' && student.id === loggedInStudent?.id) && <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Anda</span>}</td>
                            {userRole !== 'student' && <td className="p-4 text-sm text-slate-600">{student.form || '-'} {student.className || '-'}</td>}
                            <td className="p-4 text-center font-bold text-slate-700">{student.marks}</td>
                            <td className="p-4 text-center text-slate-500 font-medium">{student.totalContributed || 0}</td>
                            <td className="p-4 text-center">
                              {student.redeemRequest ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 animate-pulse">Menunggu Lulus</span>
                              ) : (
                                <span className="font-bold text-emerald-600">RM {(student.marks * conversionRate).toFixed(2)}</span>
                              )}
                            </td>
                            {userRole === 'admin' && (
                              <td className="p-4 text-center">
                                <div className="flex justify-center space-x-2">
                                  {student.redeemRequest && (
                                    <>
                                      <button onClick={() => handleAcceptRedeem(student)} className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded flex items-center shadow-sm"><CheckCircle className="h-3 w-3 mr-1" /> Luluskan</button>
                                      <button onClick={() => handleCancelRedeem(student.id)} className="px-2 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded flex items-center shadow-sm"><X className="h-3 w-3" /></button>
                                    </>
                                  )}
                                  {!student.redeemRequest && (
                                    <>
                                      <button onClick={() => { setEditStudentData(student); setShowEditModal(true); }} className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"><Edit className="h-3.5 w-3.5" /></button>
                                      <button onClick={() => handleDeleteStudent(student.id, student.name)} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"><Trash className="h-3.5 w-3.5" /></button>
                                    </>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        ))
                      ) : (<tr><td colSpan={userRole === 'admin' ? 8 : (userRole === 'student' ? 6 : 7)} className="p-8 text-center text-slate-500">Tiada pelajar dijumpai.</td></tr>)}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RECENT ACTIVITY */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
                <div className="p-6 border-b border-slate-100 flex items-center"><Activity className="h-5 w-5 text-emerald-600 mr-2" /><h2 className="text-xl font-bold text-slate-800">Aktiviti Terkini</h2></div>
                <div className="p-6 flex-1 overflow-y-auto h-[500px]">
                  {recentActivity.length > 0 ? (
                    <div className="space-y-6">
                      {recentActivity.map((activity, index) => (
                        <div key={activity.id} className="relative flex gap-4">
                          {index !== recentActivity.length - 1 && <div className="absolute top-8 left-4 -ml-px h-full w-0.5 bg-slate-200"></div>}
                          <div className="relative flex h-8 w-8 flex-none items-center justify-center rounded-full bg-emerald-100"><ArrowRight className="h-4 w-4 text-emerald-600" /></div>
                          <div className="flex-auto py-0.5 text-sm leading-5"><span className="font-medium text-slate-900">{activity.name} ({activity.studentId})</span><p className="text-emerald-600 font-medium mt-0.5">{activity.message}</p><p className="text-slate-400 text-xs mt-1">{activity.time}</p></div>
                        </div>
                      ))}
                    </div>
                  ) : (<div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center"><QrCode className="h-12 w-12 mb-3 opacity-20" /><p>Menunggu imbasan...</p></div>)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LAPORAN STATISTIK KEKAL */}
        {activeTab === 'statistik' && (
          <div className="animate-in fade-in duration-300">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <div><h1 className="text-2xl font-bold text-slate-900">Laporan & Statistik Keseluruhan (Sejarah Sumbangan)</h1><p className="text-slate-500 text-sm mt-1">Data kitar semula ini terpelihara dan kekal walaupun pelajar telah menebus wang.</p></div>
              <div className="flex items-center space-x-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200"><Calendar className="h-5 w-5 text-slate-500" /><input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-transparent font-medium text-slate-700 focus:outline-none" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedForms.map(formName => {
                const formTotal = statsByForm[formName].total;
                const classes = statsByForm[formName].classes;
                const sortedClasses = Object.keys(classes).sort();
                return (
                  <div key={formName} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="bg-emerald-50 border-b border-emerald-100 p-4 flex justify-between items-center"><h3 className="font-bold text-emerald-800 text-lg">{formName}</h3><div className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">{formTotal} Botol</div></div>
                    <div className="p-4 space-y-4">
                      {sortedClasses.map(cls => {
                        const classMarks = classes[cls];
                        const percentage = formTotal > 0 ? Math.round((classMarks / formTotal) * 100) : 0;
                        return (
                          <div key={cls} className="space-y-1">
                            <div className="flex justify-between text-sm"><span className="font-medium text-slate-700">Kelas {cls}</span><span className="text-slate-500 font-bold">{classMarks} Botol <span className="font-normal text-xs">(Nilai: RM {(classMarks * conversionRate).toFixed(2)})</span></span></div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden"><div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}