import React, { useState, useEffect, useRef } from 'react';
import { 
  Recycle, LayoutDashboard, BarChart3, User, Plus, Edit2, Trash2, 
  Settings, Upload, RefreshCw, AlertCircle, CheckCircle, XCircle, Search, Filter 
} from 'lucide-react';
import { db } from './firebase'; // Pastikan path ke fail konfigurasi firebase anda betul
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

const initialStudents = [
  { id: "S001", name: "Fatihah", marks: 102, totalMarks: 102, form: "1", className: "A", redeemRequest: false },
  { id: "S002", name: "Irfan", marks: 13, totalMarks: 155, form: "1", className: "B", redeemRequest: true },
  { id: "S003", name: "Aisyah", marks: 44, totalMarks: 44, form: "2", className: "A", redeemRequest: false },
  { id: "S004", name: "Haziq", marks: 145, totalMarks: 245, form: "3", className: "C", redeemRequest: false },
  { id: "S005", name: "Amira", marks: 21, totalMarks: 121, form: "4", className: "B", redeemRequest: false },
  { id: "S006", name: "Zul", marks: 167, totalMarks: 167, form: "5", className: "A", redeemRequest: false },
  { id: "S007", name: "Sarah", marks: 0, totalMarks: 89, form: "6", className: "Atas", redeemRequest: false }
];

export default function App() {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [userRole, setUserRole] = useState('guest'); // 'guest' | 'student' | 'admin'
  const [loggedInStudent, setLoggedInStudent] = useState(null);
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginTab, setLoginTab] = useState('student'); 
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [statViewType, setStatViewType] = useState('keseluruhan');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); 
  
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Memastikan sistem memuat turun data dahulu
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [conversionRate, setConversionRate] = useState(0.01);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterForm, setFilterForm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [selectedIds, setSelectedIds] = useState([]); 
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const [newStudent, setNewStudent] = useState({ id: '', name: '', form: '', className: '' });
  const [editStudentData, setEditStudentData] = useState({ id: '', name: '', form: '', className: '', marks: 0, totalMarks: 0 });
  const [tempRate, setTempRate] = useState(0.01);

  const fileInputRef = useRef(null); 

  const getClassOptions = (form) => {
    if (['1', '2', '3'].includes(form)) return ['A', 'B', 'C', 'D', 'E'];
    if (['4', '5'].includes(form)) return ['A', 'B', 'C', 'D'];
    if (form === '6') return ['Atas', 'Bawah'];
    return [];
  };

  // ==========================================
  // FIREBASE REAL-TIME SYNC
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
            message: `Sistem dikesan mengemas kini botol.` 
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
      setIsLoading(false);
    }, (error) => {
      console.error("Firebase Error:", error);
      setIsLoading(false);
    });
    
    return () => {
      unsubSettings();
      unsubStudents();
    };
  }, []);

  useEffect(() => {
    if (userRole === 'student' && loggedInStudent) {
      const freshData = students.find(s => s.id === loggedInStudent.id);
      if (freshData) setLoggedInStudent(freshData);
    }
  }, [students]);

  // ==========================================
  // LOGIC & UTILITIES
  // ==========================================
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginTab === 'admin') {
      if (loginUser === 'admin' && loginPass === 'abc@12345') {
        setUserRole('admin');
        setShowLoginModal(false); setLoginUser(''); setLoginPass('');
      } else alert("Username atau Password Admin salah!");
    } else {
      const studentFound = students.find(s => s.id.toLowerCase() === loginUser.toLowerCase());
      if (studentFound && loginPass === '1234') {
        setUserRole('student');
        setLoggedInStudent(studentFound);
        setShowLoginModal(false); setLoginUser(''); setLoginPass('');
        setFilterForm(studentFound.form);
        setFilterClass(studentFound.className);
      } else alert("ID Pelajar tidak dijumpai atau Password salah (Gunakan 1234)");
    }
  };

  const handleLogout = () => {
    setUserRole('guest');
    setLoggedInStudent(null);
    setFilterForm('');
    setFilterClass('');
  };

  const getStudentTotal = (student) => student.totalMarks !== undefined ? student.totalMarks : student.marks;

  const totalBottlesCurrent = students.reduce((sum, student) => sum + student.marks, 0);
  const totalBottlesLifetime = students.reduce((sum, student) => sum + getStudentTotal(student), 0);
  
  const activeTotalBottles = statViewType === 'semasa' ? totalBottlesCurrent : totalBottlesLifetime;

  const topStudent = students.length > 0 ? [...students].sort((a, b) => getStudentTotal(b) - getStudentTotal(a))[0] : null;

  const availableForms = ['1', '2', '3', '4', '5', '6'];
  const availableClasses = filterForm ? getClassOptions(filterForm) : ['A', 'B', 'C', 'D', 'E', 'Atas', 'Bawah'];
  
  const filteredStudents = students.filter(student => {
    if (userRole === 'student') {
      return student.form === loggedInStudent.form && student.className === loggedInStudent.className &&
             (student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.id.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    const matchSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchForm = filterForm ? student.form === filterForm : true;
    const matchClass = filterClass ? student.className === filterClass : true;
    return matchSearch && matchForm && matchClass;
  });

  const statsByForm = {};
  students.forEach(student => {
    const form = student.form ? `Tingkatan ${student.form}` : "Lain-lain";
    const className = student.className || "Tiada Kelas";
    const current = student.marks || 0;
    const lifetime = getStudentTotal(student);

    if (!statsByForm[form]) {
      statsByForm[form] = { currentTotal: 0, lifetimeTotal: 0, classes: {} };
    }
    statsByForm[form].currentTotal += current;
    statsByForm[form].lifetimeTotal += lifetime;

    if (!statsByForm[form].classes[className]) {
      statsByForm[form].classes[className] = { current: 0, lifetime: 0 };
    }
    statsByForm[form].classes[className].current += current;
    statsByForm[form].classes[className].lifetime += lifetime;
  });
  const sortedForms = Object.keys(statsByForm).sort();

  // ==========================================
  // ACTIONS (CRUD & OPERATIONS)
  // ==========================================
  const requestRedeem = async () => {
    if (window.confirm("Adakah anda pasti mahu memohon penebusan wang? Admin akan menyemak permohonan ini.")) {
      try {
        await updateDoc(doc(db, 'students', loggedInStudent.id), { redeemRequest: true });
        alert("Permohonan dihantar! Sila tunggu kelulusan Admin.");
      } catch (err) { alert("Ralat menghantar permohonan."); }
    }
  };

  const handleAcceptRedeem = async (student) => {
    const totalRM = (student.marks * conversionRate).toFixed(2);
    if (window.confirm(`Sah luluskan penebusan RM ${totalRM} untuk ${student.name}?\n\nBaki Semasa akan menjadi 0, Statistik Keseluruhan akan KEKAL.`)) {
      try {
        await updateDoc(doc(db, 'students', student.id), { marks: 0, redeemRequest: false });
        alert(`Berjaya! RM ${totalRM} telah diluluskan untuk ${student.name}.`);
      } catch (err) { alert("Ralat meluluskan mata."); }
    }
  };

  const handleCancelRedeem = async (studentId) => {
    try {
      await updateDoc(doc(db, 'students', studentId), { redeemRequest: false });
    } catch (err) { alert("Gagal batalkan permohonan."); }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.id || !newStudent.name || !newStudent.form || !newStudent.className) return alert("Sila isi semua maklumat!");
    try {
      await setDoc(doc(db, 'students', newStudent.id.toUpperCase()), {
        id: newStudent.id.toUpperCase(), name: newStudent.name, form: newStudent.form, className: newStudent.className, marks: 0, totalMarks: 0, redeemRequest: false
      });
      setShowAddModal(false); setNewStudent({ id: '', name: '', form: '', className: '' }); alert("Berjaya ditambah!");
    } catch (err) { alert("Gagal menambah pelajar."); }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'students', editStudentData.id), {
        name: editStudentData.name, form: editStudentData.form, className: editStudentData.className, 
        marks: parseInt(editStudentData.marks) || 0, totalMarks: parseInt(editStudentData.totalMarks) || 0
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

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(filteredStudents.map(s => s.id));
    else setSelectedIds([]);
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

  const simulateESP32Update = async () => {
    if (students.length === 0) return;
    setIsScanning(true);
    const student = students[Math.floor(Math.random() * students.length)];
    try { 
      const currentTotal = getStudentTotal(student);
      await updateDoc(doc(db, 'students', student.id), { marks: student.marks + 1, totalMarks: currentTotal + 1 });
    } catch (err) {} finally { setIsScanning(false); }
  };

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
            await setDoc(doc(db, 'students', id), { id, name, form, className, marks: 0, totalMarks: 0, redeemRequest: false });
            successCount++;
          }
        }
      }
      alert(`${successCount} rekod pelajar berjaya dimuat naik!`);
      e.target.value = null; 
    };
    reader.readAsText(file);
  };

  const pendingRequestsCount = students.filter(s => s.redeemRequest).length;

  // ==========================================
  // VIEW RENDER INTERCEPT (LOADING WINDOW)
  // ==========================================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <p className="mt-4 text-slate-600 font-medium animate-pulse">Memuat turun data REVIVE...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between relative">
      
      {/* WRAPPER KANDUNGAN ATAS */}
      <div className="flex-grow">
        {/* STICKY NAVBAR */}
        <nav className="bg-emerald-600 text-white shadow-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Recycle className="h-8 w-8 animate-spin-slow" />
              <span className="text-2xl font-bold tracking-wider hidden sm:block">REVIVE</span>
            </div>
            
            <div className="flex space-x-1 bg-emerald-700/50 p-1 rounded-lg">
              <button onClick={() => setActiveTab('dashboard')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-all ${activeTab === 'dashboard' ? 'bg-white text-emerald-700 shadow-sm' : 'text-emerald-50 hover:text-white'}`}>
                <LayoutDashboard className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Papan Pemuka</span>
              </button>
              <button onClick={() => setActiveTab('statistik')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-all ${activeTab === 'statistik' ? 'bg-white text-emerald-700 shadow-sm' : 'text-emerald-50 hover:text-white'}`}>
                <BarChart3 className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Statistik Tingkatan</span>
              </button>
            </div>

            <div className="flex items-center">
              {userRole !== 'guest' ? (
                <div className="flex items-center space-x-3">
                  <span className="hidden md:block text-sm font-medium bg-emerald-800 px-3 py-1 rounded-full border border-emerald-500/30">
                    Hi, {userRole === 'admin' ? '🔥 Admin' : `👤 ${loggedInStudent?.name}`}
                  </span>
                  <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded text-sm font-bold shadow-sm transition-all">Keluar</button>
                </div>
              ) : (
                <button onClick={() => setShowLoginModal(true)} className="bg-emerald-800 hover:bg-emerald-900 px-4 py-2 rounded text-sm font-bold flex items-center transition-colors"><User className="h-4 w-4 mr-2" /> Log Masuk</button>
              )}
            </div>
          </div>
        </nav>

        {/* MAIN BODY LAYOUT */}
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' ? (
            <div className="space-y-6">
              
              {/* NOTIFIKASI PERMOHONAN PENEBUSAN BAGI ADMIN */}
              {userRole === 'admin' && pendingRequestsCount > 0 && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-start space-x-3 shadow-sm animate-pulse">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-800 font-semibold">Terdapat {pendingRequestsCount} permohonan penebusan baki ganjaran tertunggak yang memerlukan tindakan anda.</p>
                  </div>
                </div>
              )}

              {/* MAKLUMAT RINGKASAN PENGGUNA TERLOG-MASUK (STUDENT ROLE) */}
              {userRole === 'student' && loggedInStudent && (
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="bg-emerald-700/60 text-emerald-100 text-xs px-2.5 py-1 rounded-full border border-emerald-500/20 font-mono tracking-wider">{loggedInStudent.id}</span>
                    <h2 className="text-2xl font-bold mt-1">{loggedInStudent.name}</h2>
                    <p className="text-emerald-100 text-sm mt-0.5">Tingkatan {loggedInStudent.form} {loggedInStudent.className}</p>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <div className="bg-white/10 px-4 py-2 rounded-xl flex-1 md:flex-initial">
                      <span className="text-xs text-emerald-100 block">Baki Semasa</span>
                      <strong className="text-xl font-bold">{loggedInStudent.marks} <span className="text-xs font-normal">Botol</span></strong>
                    </div>
                    <div className="bg-white/10 px-4 py-2 rounded-xl flex-1 md:flex-initial">
                      <span className="text-xs text-emerald-100 block">Nilai Wang</span>
                      <strong className="text-xl font-bold">RM {(loggedInStudent.marks * conversionRate).toFixed(2)}</strong>
                    </div>
                    {loggedInStudent.marks > 0 ? (
                      loggedInStudent.redeemRequest ? (
                        <button disabled className="bg-amber-500 text-white px-5 py-2 rounded-xl text-sm font-bold shadow flex items-center"><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Diproses</button>
                      ) : (
                        <button onClick={requestRedeem} className="bg-white text-emerald-700 hover:bg-emerald-50 px-5 py-2 rounded-xl text-sm font-bold shadow transition-all">Tebus Wang</button>
                      )
                    ) : (
                      <button disabled className="bg-slate-300 text-slate-500 px-5 py-2 rounded-xl text-sm font-bold cursor-not-allowed">Tiada Baki</button>
                    )}
                  </div>
                </div>
              )}

              {/* ROW 3 KAD STATISTIK UTAMA */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Kitar Semula Semasa</div>
                  <div className="text-3xl font-bold text-slate-900 mt-2 flex items-baseline">{totalBottlesCurrent} <span className="text-sm font-normal text-slate-400 ml-2">unit botol aktif</span></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Jumlah Nilai Ganjaran</div>
                  <div className="text-3xl font-bold text-emerald-600 mt-2">RM {(totalBottlesCurrent * conversionRate).toFixed(2)}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Kitar Semula Keseluruhan (Lifetime)</div>
                  <div className="text-3xl font-bold text-slate-900 mt-2 flex items-baseline">{totalBottlesLifetime} <span className="text-sm font-normal text-slate-400 ml-2">unit terkumpul</span></div>
                </div>
              </div>

              {/* GRID OPERASI: SENARAI JADUAL DAN AKTIVITI LIVE */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  
                  {/* ALAT CARIAN, TAPISAN & BUTANG KENDALIAN TABEL */}
                  <div className="p-4 bg-slate-50/60 border-b border-slate-100 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input type="text" placeholder="Cari nama atau ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white" />
                      </div>
                      
                      {userRole !== 'student' && (
                        <div className="flex gap-2">
                          <select value={filterForm} onChange={(e) => { setFilterForm(e.target.value); setFilterClass(''); }} className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none">
                            <option value="">Semua Ting.</option>
                            {availableForms.map(f => <option key={f} value={f}>Ting. {f}</option>)}
                          </select>
                          <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none">
                            <option value="">Semua Kelas</option>
                            {availableClasses.map(c => <option key={c} value={c}>Kelas {c}</option>)}
                          </select>
                        </div>
                      )}
                    </div>

                    {userRole === 'admin' && (
                      <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-slate-100">
                        <div className="flex gap-2">
                          <button onClick={() => setShowAddModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center transition-all"><Plus className="w-4 h-4 mr-1.5" /> Tambah</button>
                          <button onClick={() => fileInputRef.current.click()} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center transition-all"><Upload className="w-4 h-4 mr-1.5" /> Fail CSV</button>
                          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
                          <button onClick={() => { setTempRate(conversionRate); setShowSettingsModal(true); }} className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl transition-all"><Settings className="w-4 h-4" /></button>
                        </div>
                        {selectedIds.length > 0 && (
                          <button onClick={handleBulkDelete} className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-xl text-sm font-bold flex items-center border border-red-200 transition-all"><Trash2 className="w-4 h-4 mr-1.5" /> Padam Terpilih ({selectedIds.length})</button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* RUANGAN UTAMA JADUAL REKOD PENDUDUK/PELAJAR */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                          {userRole === 'admin' && (
                            <th className="p-4 w-12"><input type="checkbox" checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0} onChange={handleSelectAll} className="rounded text-emerald-600 focus:ring-emerald-500" /></th>
                          )}
                          <th className="p-4">ID / Nama</th>
                          <th className="p-4 hidden sm:table-cell">Kelas</th>
                          <th className="p-4 text-right">Baki Botol (Nilai)</th>
                          <th className="p-4 text-right hidden md:table-cell">Keseluruhan</th>
                          {userRole === 'admin' && <th className="p-4 text-center">Tindakan / Status</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map((student) => {
                            const totalRM = (student.marks * conversionRate).toFixed(2);
                            return (
                              <tr key={student.id} className={`hover:bg-slate-50/80 transition-colors ${student.redeemRequest ? 'bg-amber-50/40 hover:bg-amber-50/60' : ''}`}>
                                {userRole === 'admin' && (
                                  <td className="p-4"><input type="checkbox" checked={selectedIds.includes(student.id)} onChange={() => handleSelectRow(student.id)} className="rounded text-emerald-600 focus:ring-emerald-500" /></td>
                                )}
                                <td className="p-4">
                                  <div className="font-mono text-xs text-slate-400">{student.id}</div>
                                  <div className="font-semibold text-slate-800 mt-0.5">{student.name}</div>
                                  <div className="sm:hidden text-xs text-slate-400 mt-0.5">Ting. {student.form} {student.className}</div>
                                </td>
                                <td className="p-4 text-slate-600 hidden sm:table-cell">Tingkatan {student.form} {student.className}</td>
                                <td className="p-4 text-right font-medium">
                                  <span className="text-slate-900">{student.marks} unit</span>
                                  <div className="text-xs text-emerald-600 font-semibold mt-0.5">RM {totalRM}</div>
                                </td>
                                <td className="p-4 text-right text-slate-500 hidden md:table-cell font-mono">{getStudentTotal(student)}</td>
                                {userRole === 'admin' && (
                                  <td className="p-4">
                                    <div className="flex items-center justify-center space-x-1">
                                      {student.redeemRequest ? (
                                        <div className="flex items-center space-x-1 bg-white p-1 rounded-lg border border-amber-200 shadow-sm">
                                          <button onClick={() => handleAcceptRedeem(student)} className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-md text-xs font-bold transition-all" title="Luluskan Wang"><CheckCircle className="w-3.5 h-3.5" /></button>
                                          <button onClick={() => handleCancelRedeem(student.id)} className="bg-slate-100 hover:bg-slate-200 text-slate-500 p-1.5 rounded-md text-xs font-bold transition-all" title="Batal"><XCircle className="w-3.5 h-3.5" /></button>
                                        </div>
                                      ) : (
                                        <>
                                          <button onClick={() => { setEditStudentData({ ...student, totalMarks: getStudentTotal(student) }); setShowEditModal(true); }} className="text-slate-400 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all"><Edit2 className="w-4 h-4" /></button>
                                          <button onClick={() => handleDeleteStudent(student.id, student.name)} className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                )}
                              </tr>
                            );
                          })
                        ) : (
                          <tr><td colSpan={6} className="p-8 text-center text-slate-400">Tiada rekod pelajar atau perumahan yang dijumpai.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SISI KANAN: SIMULASI HARDWARE DAN AKTIVITI TERKINI */}
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 text-base">Ujian Sistem (Simulasi IoT)</h3>
                    <p className="text-xs text-slate-500 mt-1">Simulasi isyarat mikrokontroler ESP32 dari tong kitar semula fizikal apabila mendeteksi botol masuk.</p>
                    <button onClick={simulateESP32Update} disabled={isScanning} className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center transition-all disabled:opacity-50">{isScanning ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Memproses Input...</> : <><RefreshCw className="w-4 h-4 mr-2" /> Masukkan 1 Botol Rawak</>}</button>
                  </div>

                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 text-base">Log Aktiviti Semasa</h3>
                    <div className="mt-4 space-y-3">
                      {recentActivity.length > 0 ? (
                        recentActivity.map((act) => (
                          <div key={act.id} className="flex items-start space-x-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100/50 text-xs">
                            <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-mono font-bold mt-0.5">{act.time}</span>
                            <div className="flex-1">
                              <strong className="text-slate-700 block">{act.name} ({act.studentId})</strong>
                              <span className="text-slate-500">{act.message}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 py-4 text-center">Menunggu kemas kini data dari perkakasan IoT...</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            
            /* ==========================================
               KANDUNGAN HALAMAN STATISTIK KEMAJUAN
               ========================================== */
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Analisis Kemajuan Mengikut Tingkatan</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Carta statistik pembuangan mengikut kumpulan tingkatan berdaftar.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl self-start">
                  <button onClick={() => setStatViewType('keseluruhan')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${statViewType === 'keseluruhan' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>Keseluruhan</button>
                  <button onClick={() => setStatViewType('semasa')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${statViewType === 'semasa' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>Baki Semasa</button>
                </div>
              </div>

              {sortedForms.length > 0 ? (
                <div className="space-y-5">
                  {sortedForms.map(formKey => {
                    const formData = statsByForm[formKey];
                    const count = statViewType === 'semasa' ? formData.currentTotal : formData.lifetimeTotal;
                    const percentage = activeTotalBottles > 0 ? (count / activeTotalBottles) * 100 : 0;
                    return (
                      <div key={formKey} className="space-y-1.5">
                        <div className="flex justify-between text-sm font-semibold text-slate-700">
                          <span>{formKey}</span>
                          <span className="font-mono text-slate-900">{count} Botol ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                          {Object.keys(formData.classes).sort().map(clsKey => {
                            const clsData = formData.classes[clsKey];
                            const clsCount = statViewType === 'semasa' ? clsData.current : clsData.lifetime;
                            return (
                              <span key={clsKey} className="text-xs text-slate-400">Kelas {clsKey}: <strong className="text-slate-600 font-mono">{clsCount}</strong></span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-400 py-6 text-center">Tiada data yang mencukupi untuk menjana visualisasi graf.</p>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ==========================================
         MODAL WINDOW POPUPS CONTROL SECTION
         ========================================== */}
      
      {/* 1. MODAL WINDOW: LOG MASUK */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full p-6 relative">
            <h3 className="text-lg font-bold text-slate-800">Akses Sistem REVIVE</h3>
            <div className="flex bg-slate-100 p-1 rounded-xl mt-4">
              <button onClick={() => setLoginTab('student')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${loginTab === 'student' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>Pelajar / Penduduk</button>
              <button onClick={() => setLoginTab('admin')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${loginTab === 'admin' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>Pengurus Admin</button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              <div>
                <label className="text-xs text-slate-500 font-medium block">Username / ID Pelajar</label>
                <input type="text" required value={loginUser} onChange={(e) => setLoginUser(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder={loginTab === 'admin' ? 'Contoh: admin' : 'Contoh: S001'} />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium block">Kata Laluan (Password)</label>
                <input type="password" required value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="••••" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowLoginModal(false)} className="flex-1 border border-slate-200 hover:bg-slate-50 py-2 rounded-xl text-sm font-semibold transition-all">Batal</button>
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-sm font-semibold shadow transition-all">Masuk</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL WINDOW: TAMBAH PELAJAR BARU */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-slate-800">Daftar Ahli Komuniti Baru</h3>
            <form onSubmit={handleAddStudent} className="space-y-4 mt-4">
              <div>
                <label className="text-xs text-slate-500 font-medium block">ID Pelajar / Kad Unik</label>
                <input type="text" required value={newStudent.id} onChange={(e) => setNewStudent({...newStudent, id: e.target.value})} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none" placeholder="Contoh: S008" />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium block">Nama Penuh</label>
                <input type="text" required value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none" placeholder="Masukkan nama penuh" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 font-medium block">Tingkatan</label>
                  <select required value={newStudent.form} onChange={(e) => setNewStudent({...newStudent, form: e.target.value, className: ''})} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white">
                    <option value="">Pilih...</option>
                    {availableForms.map(f => <option key={f} value={f}>Tingkatan {f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium block">Kelas</label>
                  <select required value={newStudent.className} onChange={(e) => setNewStudent({...newStudent, className: e.target.value})} disabled={!newStudent.form} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white disabled:opacity-50">
                    <option value="">Pilih...</option>
                    {getClassOptions(newStudent.form).map(c => <option key={c} value={c}>Kelas {c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 border border-slate-200 hover:bg-slate-50 py-2 rounded-xl text-sm font-semibold">Batal</button>
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-sm font-semibold shadow">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL WINDOW: EDIT DATA DATA PELAJAR */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-slate-800">Kemaskini Profil & Mata</h3>
            <form onSubmit={handleUpdateStudent} className="space-y-4 mt-4">
              <div>
                <label className="text-xs text-slate-500 font-mono block">ID Pelajar: {editStudentData.id}</label>
                <input type="text" required value={editStudentData.name} onChange={(e) => setEditStudentData({...editStudentData, name: e.target.value})} className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 font-medium block">Tingkatan</label>
                  <select required value={editStudentData.form} onChange={(e) => setEditStudentData({...editStudentData, form: e.target.value, className: ''})} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white">
                    {availableForms.map(f => <option key={f} value={f}>Tingkatan {f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium block">Kelas</label>
                  <select required value={editStudentData.className} onChange={(e) => setEditStudentData({...editStudentData, className: e.target.value})} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white">
                    {getClassOptions(editStudentData.form).map(c => <option key={c} value={c}>Kelas {c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 font-medium block">Baki Semasa (Botol)</label>
                  <input type="number" required value={editStudentData.marks} onChange={(e) => setEditStudentData({...editStudentData, marks: parseInt(e.target.value) || 0})} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium block">Keseluruhan (Lifetime)</label>
                  <input type="number" required value={editStudentData.totalMarks} onChange={(e) => setEditStudentData({...editStudentData, totalMarks: parseInt(e.target.value) || 0})} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 border border-slate-200 hover:bg-slate-50 py-2 rounded-xl text-sm font-semibold">Batal</button>
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-sm font-semibold shadow">Kemaskini</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL WINDOW: TETAPAN SISTEM (KADAR HARGA GANJARAN) */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-slate-800">Ketetapan Nilai Mata Ganjaran</h3>
            <p className="text-xs text-slate-500 mt-1">Sediakan nilai pertukaran wang (Ringgit Malaysia) bagi setiap satu unit botol yang dikitar semula.</p>
            <form onSubmit={handleUpdateSettings} className="space-y-4 mt-4">
              <div>
                <label className="text-xs text-slate-500 font-medium block">Kadar Nilai (RM / Unit Botol)</label>
                <input type="number" step="0.001" required value={tempRate} onChange={(e) => setTempRate(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowSettingsModal(false)} className="flex-1 border border-slate-200 hover:bg-slate-50 py-2 rounded-xl text-sm font-semibold">Batal</button>
                <button type="submit" className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-xl text-sm font-semibold shadow">Kemas Kini</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
         🆕 FOOTER COMPONENT (Sentiasa Di Bawah Sekali)
         ========================================== */}
      <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-12 w-full">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Info Kiri */}
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-600 text-white p-2 rounded-lg">
                <Recycle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-white font-semibold tracking-wide">REVIVE</h4>
                <p className="text-xs text-slate-500">Smart City Taman Mawar • IoT Integrated System</p>
              </div>
            </div>

            {/* Indikator Status & Data Tengah */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Pangkalan Data: <strong className="text-slate-300">Firebase Terhubung</strong></span>
              </div>
              <div>
                <span>Jumlah Botol Terkumpul: <strong className="text-slate-200">{totalBottlesLifetime}</strong></span>
              </div>
              <div>
                <span>Kadar Harga: <strong className="text-emerald-400">RM {conversionRate}/botol</strong></span>
              </div>
            </div>

            {/* Hak Cipta Kanan */}
            <div className="text-center md:text-right text-xs text-slate-500">
              <p>&copy; {new Date().getFullYear()} REVIVE System. Hak Cipta Terpelihara SEMAJU.</p>
            </div>

          </div>
        </div>
      </footer>

    </div>
  );
}