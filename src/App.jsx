import React, { useState, useEffect, useRef } from 'react';
import { Recycle, Users, Trophy, Activity, Search, QrCode, ArrowRight, Trash2, XCircle, Lock, User, Plus, X, Edit, Trash, Gift, Wallet, BarChart3, LayoutDashboard, Calendar, Filter, Upload, Settings, Bell, CheckCircle, Clock, Home, Globe } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

// ==========================================
// 1. KONFIGURASI FIREBASE
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

// Data awal contoh penduduk Taman Mawar
const initialResidents = [
  { id: "TM001", name: "Ahmad Khairul", marks: 45, totalMarks: 45, ramin: "1", houseNo: "No. 12", redeemRequest: false },
  { id: "TM002", name: "Siti Aminah", marks: 120, totalMarks: 120, ramin: "1", houseNo: "No. 5B", redeemRequest: false },
  { id: "TM003", name: "Ramasamy", marks: 15, totalMarks: 15, ramin: "2", houseNo: "No. 44", redeemRequest: false },
  { id: "TM004", name: "Chong Wei", marks: 80, totalMarks: 80, ramin: "3", houseNo: "No. 101", redeemRequest: false },
  { id: "TM005", name: "Norazlan", marks: 8, totalMarks: 8, ramin: "6", houseNo: "No. 3A", redeemRequest: false }
];

// ==========================================
// KAMUS TERJEMAHAN (MS / EN)
// ==========================================
const dict = {
  ms: {
    loginRevive: "Log Masuk REVIVE",
    resident: "Penduduk",
    admin: "Pengurus Taman",
    resId: "ID Penduduk (Cth: TM001)",
    adminUser: "Kredensial Admin",
    password: "Kata Laluan",
    defaultPass: "(Lalai: 1234)",
    enter: "Masuk",
    qrTitle: "Kod QR Kitar Semula",
    qrDesc: "Tunjukkan kod QR ini ke kamera pengimbas di REVIVE Smart Bin semasa ingin membuang botol.",
    settingTitle: "Tetapan Nilai Botol",
    bottleEq: "1 Botol = RM",
    save: "Simpan",
    addResTitle: "Tambah Akaun Penduduk",
    phResId: "ID Penduduk (Cth: TM105)",
    phName: "Nama Penuh Ketua Rumah / Penduduk",
    selRamin: "Pilih Ramin",
    phHouse: "No. Rumah (Cth: No. 42)",
    saveAcc: "Simpan Akaun",
    editTitle: "Edit Akaun Penduduk",
    curBal: "Baki Botol Semasa",
    lifeTot: "Jumlah Kitaran Seumur Hidup",
    update: "Kemas Kini",
    dashboard: "Papan Pemuka",
    statZone: "Zon Statistik",
    hi: "Hai,",
    secManager: "Pengurus Sektor",
    logout: "Keluar",
    login: "Log Masuk",
    yourAcc: "Akaun Kediaman Anda",
    sector: "Sektor:",
    houseNo: "No. Rumah:",
    rewardBal: "Baki Mata Ganjaran",
    greenVal: "Nilai Tunai Hijau",
    showQr: "Papar Kod QR Penduduk",
    reqRedeem: "Mohon Tebus Tunai Ganjaran",
    reviewMsg: "Permohonan Penebusan Insentif Sedang Disemak oleh Pengurus Komuniti.",
    minBottleMsg: "Kumpul minimum 10 botol untuk tebus insentif tunai.",
    notiTitle: "Notifikasi Pengurusan Komuniti",
    notiMsg1: "Terdapat",
    notiMsg2: "tuntutan ganjaran tunai hijau daripada penduduk yang sedia untuk diproses.",
    dashTitle: "Papan Pemuka Pintar REVIVE",
    susRate: "Kadar Komuniti Lestari:",
    valSetting: "Tetapan Nilai",
    addResBtn: "Tambah Penduduk",
    simBtn: "Simulasi Imbas IoT Smart Bin",
    totBot: "Jumlah Botol Dikumpul (Taman Mawar)",
    totFund: "Jumlah Edaran Dana Lestari (RM)",
    hero: "Hero Lestari Taman Mawar",
    secRank: "Kedudukan Sektor Ramin",
    resDb: "Pangkalan Data Penduduk",
    allRamin: "Semua Ramin",
    searchPh: "Cari nama, ID, atau No. rumah...",
    thId: "ID Penduduk",
    thName: "Nama",
    thSec: "Sektor Ramin",
    thHouse: "No. Rumah",
    thBal: "Baki Mata",
    thTot: "Total Kitaran",
    thAct: "Tindakan",
    reqTag: "Minta Tebus",
    noRec: "Tiada rekod penduduk ditemui.",
    actTitle: "Aktiviti REVIVE Smart Bin",
    waitSig: "Menunggu isyarat perkakasan IoT luaran...",
    statTitle: "Prestasi Hijau Sektor Ramin",
    statDesc: "Analisis perbandingan jumlah botol yang berjaya dikumpul mengikut zon jalan.",
    optAll: "Statistik Keseluruhan",
    optCur: "Baki Aktif Semasa",
    bottle: "Botol",
    footer: "Hakcipta terpelihara SEMAJU",
    alertManagerWrong: "Kredensial Pengurus salah!",
    alertResWrong: "ID Penduduk tidak dijumpai atau Kata Laluan salah (Gunakan default: 1234)",
    confirmRedeem: "Hantar permohonan penebusan insentif tunai hijau anda kepada pihak pengurusan?",
    alertRedeemSent: "Permohonan berjaya dihantar! Sila tunggu kelulusan.",
    alertErrSystem: "Ralat sistem.",
    alertPaySuccess: "Pembayaran berjaya disahkan!",
    alertIncomplete: "Sila lengkapkan profil penduduk!",
    alertAddSuccess: "Penduduk berjaya didaftarkan!",
    alertEditSuccess: "Profil penduduk dikemas kini!",
    alertSetSuccess: "Kadar ganjaran kitar semula dikemas kini!",
    logMsg: "REVIVE Smart Bin mengesan pembuangan botol."
  },
  en: {
    loginRevive: "REVIVE Login",
    resident: "Resident",
    admin: "Park Manager",
    resId: "Resident ID (Ex: TM001)",
    adminUser: "Admin Username",
    password: "Password",
    defaultPass: "(Default: 1234)",
    enter: "Login",
    qrTitle: "Recycling QR Code",
    qrDesc: "Show this QR code to the scanner camera at the REVIVE Smart Bin when disposing of bottles.",
    settingTitle: "Bottle Value Settings",
    bottleEq: "1 Bottle = RM",
    save: "Save",
    addResTitle: "Add Resident Account",
    phResId: "Resident ID (Ex: TM105)",
    phName: "Full Name of Resident / Head of House",
    selRamin: "Select Ramin",
    phHouse: "House No. (Ex: No. 42)",
    saveAcc: "Save Account",
    editTitle: "Edit Resident Account",
    curBal: "Current Bottle Balance",
    lifeTot: "Lifetime Recycling Total",
    update: "Update",
    dashboard: "Dashboard",
    statZone: "Statistics Zone",
    hi: "Hi,",
    secManager: "Sector Manager",
    logout: "Logout",
    login: "Login",
    yourAcc: "Your Residential Account",
    sector: "Sector:",
    houseNo: "House No.:",
    rewardBal: "Reward Points Balance",
    greenVal: "Green Cash Value",
    showQr: "Show Resident QR Code",
    reqRedeem: "Request Cash Reward Redemption",
    reviewMsg: "Incentive Redemption Request is currently being reviewed by the Community Manager.",
    minBottleMsg: "Collect a minimum of 10 bottles to redeem cash incentives.",
    notiTitle: "Community Management Notification",
    notiMsg1: "There are",
    notiMsg2: "green cash reward claims from residents ready to be processed.",
    dashTitle: "REVIVE Smart Dashboard",
    susRate: "Sustainable Community Rate:",
    valSetting: "Value Settings",
    addResBtn: "Add Resident",
    simBtn: "Simulate IoT Smart Bin Scan",
    totBot: "Total Bottles Collected (Taman Mawar)",
    totFund: "Total Distributed Sustainable Funds (RM)",
    hero: "Taman Mawar Sustainable Hero",
    secRank: "Ramin Sector Ranking",
    resDb: "Resident Database",
    allRamin: "All Ramins",
    searchPh: "Search name, ID, or house no...",
    thId: "Resident ID",
    thName: "Name",
    thSec: "Ramin Sector",
    thHouse: "House No.",
    thBal: "Point Balance",
    thTot: "Total Cycles",
    thAct: "Action",
    reqTag: "Request Redeem",
    noRec: "No resident records found.",
    actTitle: "REVIVE Smart Bin Activity",
    waitSig: "Waiting for external IoT hardware signals...",
    statTitle: "Ramin Sector Green Performance",
    statDesc: "Comparative analysis of the total bottles successfully collected by street zone.",
    optAll: "Overall Statistics",
    optCur: "Current Active Balance",
    bottle: "Bottles",
    footer: "All rights reserved SEMAJU",
    alertManagerWrong: "Manager credentials incorrect!",
    alertResWrong: "Resident ID not found or Password incorrect (Use default: 1234)",
    confirmRedeem: "Submit your green cash incentive redemption request to management?",
    alertRedeemSent: "Request submitted successfully! Please await approval.",
    alertErrSystem: "System error.",
    alertPaySuccess: "Payment successfully confirmed!",
    alertIncomplete: "Please complete the resident profile!",
    alertAddSuccess: "Resident successfully registered!",
    alertEditSuccess: "Resident profile updated!",
    alertSetSuccess: "Recycling reward rate updated!",
    logMsg: "REVIVE Smart Bin detected bottle disposal."
  }
};

export default function App() {
  // State Dwibahasa (Bilingual)
  const [lang, setLang] = useState('ms');
  const t = (key) => dict[lang][key] || key;

  // ==========================================
  // STATE PENGURUSAN ROLE & LOGIN
  // ==========================================
  const [userRole, setUserRole] = useState('guest'); // guest, resident, admin
  const [loggedInResident, setLoggedInResident] = useState(null);
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [loginTab, setLoginTab] = useState('resident'); 
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  
  // State Paparan
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [statViewType, setStatViewType] = useState('keseluruhan');
  const [residents, setResidents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [conversionRate, setConversionRate] = useState(0.10); // Default RM0.10
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRamin, setFilterRamin] = useState('');
  const [selectedIds, setSelectedIds] = useState([]); 
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newResident, setNewResident] = useState({ id: '', name: '', ramin: '', houseNo: '' });
  const [editResidentData, setEditResidentData] = useState({ id: '', name: '', ramin: '', houseNo: '', marks: 0, totalMarks: 0 });
  const [tempRate, setTempRate] = useState(0.10);

  const fileInputRef = useRef(null); 

  // ==========================================
  // BACA DATA DARI FIREBASE (Collection: residents)
  // ==========================================
  useEffect(() => {
    const settingsRef = doc(db, 'settings', 'system');
    const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setConversionRate(docSnap.data().conversionRate || 0.10);
      } else {
        setDoc(settingsRef, { conversionRate: 0.10 }); 
      }
    });

    const residentsRef = collection(db, 'residents'); 
    const unsubResidents = onSnapshot(residentsRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "modified") {
          const resident = change.doc.data();
          const newActivity = {
            id: Date.now() + Math.random(),
            residentId: resident.id,
            name: resident.name,
            time: new Date().toLocaleTimeString(),
            messageKey: 'logMsg' 
          };
          setRecentActivity(prev => [newActivity, ...prev].slice(0, 5));
        }
      });

      if (!snapshot.empty) {
        const updatedResidents = [];
        snapshot.forEach(doc => updatedResidents.push(doc.data()));
        updatedResidents.sort((a, b) => a.id.localeCompare(b.id));
        setResidents(updatedResidents);
      } else {
        initialResidents.forEach(async (r) => {
          await setDoc(doc(residentsRef, r.id), r);
        });
      }
    });
    
    return () => {
      unsubSettings();
      unsubResidents();
    };
  }, []);

  // Update session penduduk jika data Firebase berubah
  useEffect(() => {
    if (userRole === 'resident' && loggedInResident) {
      const freshData = residents.find(r => r.id === loggedInResident.id);
      if (freshData) setLoggedInResident(freshData);
    }
  }, [residents]);

  // ==========================================
  // LOGIK LOGIN
  // ==========================================
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginTab === 'admin') {
      if (loginUser === 'admin' && loginPass === 'smartcity2026') {
        setUserRole('admin');
        setShowLoginModal(false); setLoginUser(''); setLoginPass('');
      } else alert(t('alertManagerWrong'));
    } else {
      const residentFound = residents.find(r => r.id.toLowerCase() === loginUser.toLowerCase());
      if (residentFound && loginPass === '1234') {
        setUserRole('resident');
        setLoggedInResident(residentFound);
        setShowLoginModal(false);
        setLoginUser(''); setLoginPass('');
        setFilterRamin(residentFound.ramin);
      } else alert(t('alertResWrong'));
    }
  };

  const handleLogout = () => {
    setUserRole('guest');
    setLoggedInResident(null);
    setFilterRamin('');
  };

  const getResidentTotal = (resident) => resident.totalMarks !== undefined ? resident.totalMarks : resident.marks;

  // ==========================================
  // PENGIRAAN STATISTIK KOMUNITI
  // ==========================================
  const totalBottlesCurrent = residents.reduce((sum, r) => sum + r.marks, 0);
  const totalBottlesLifetime = residents.reduce((sum, r) => sum + getResidentTotal(r), 0);
  
  const topResident = residents.length > 0 ? [...residents].sort((a, b) => getResidentTotal(b) - getResidentTotal(a))[0] : null;

  const availableRamins = ['1', '2', '3', '4', '5', '6'];
  const filteredResidents = residents.filter(resident => {
    if (userRole === 'resident') {
      return resident.ramin === loggedInResident.ramin && 
             (resident.name.toLowerCase().includes(searchTerm.toLowerCase()) || resident.id.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    const matchSearch = resident.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        resident.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        resident.houseNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRamin = filterRamin ? resident.ramin === filterRamin : true;
    return matchSearch && matchRamin;
  });

  // Pengiraan Data mengikut Sektor Ramin
  const statsByRamin = {};
  residents.forEach(r => {
    const raminKey = `Ramin ${r.ramin}`;
    const current = r.marks || 0;
    const lifetime = getResidentTotal(r);

    if (!statsByRamin[raminKey]) {
      statsByRamin[raminKey] = { currentTotal: 0, lifetimeTotal: 0 };
    }
    statsByRamin[raminKey].currentTotal += current;
    statsByRamin[raminKey].lifetimeTotal += lifetime;
  });

  // ==========================================
  // FUNGSI PENGURUSAN & REWARD
  // ==========================================
  const requestRedeem = async () => {
    if (window.confirm(t('confirmRedeem'))) {
      try {
        await updateDoc(doc(db, 'residents', loggedInResident.id), { redeemRequest: true });
        alert(t('alertRedeemSent'));
      } catch (err) { alert(t('alertErrSystem')); }
    }
  };

  const handleAcceptRedeem = async (resident) => {
    const totalRM = (resident.marks * conversionRate).toFixed(2);
    const confirmMsg = lang === 'ms' 
      ? `Sahkan pembayaran RM ${totalRM} kepada ${resident.name} (${resident.houseNo})?\n\nBaki ganjaran semasa akan dikosongkan.`
      : `Confirm payment of RM ${totalRM} to ${resident.name} (${resident.houseNo})?\n\nCurrent reward balance will be cleared.`;
    
    if (window.confirm(confirmMsg)) {
      try {
        await updateDoc(doc(db, 'residents', resident.id), { marks: 0, redeemRequest: false });
        alert(t('alertPaySuccess'));
      } catch (err) { alert(t('alertErrSystem')); }
    }
  };

  const handleCancelRedeem = async (residentId) => {
    try {
      await updateDoc(doc(db, 'residents', residentId), { redeemRequest: false });
    } catch (err) { alert(t('alertErrSystem')); }
  };

  const handleAddResident = async (e) => {
    e.preventDefault();
    if (!newResident.id || !newResident.name || !newResident.ramin || !newResident.houseNo) return alert(t('alertIncomplete'));
    try {
      await setDoc(doc(db, 'residents', newResident.id.toUpperCase()), {
        id: newResident.id.toUpperCase(), name: newResident.name, ramin: newResident.ramin, houseNo: newResident.houseNo, marks: 0, totalMarks: 0, redeemRequest: false
      });
      setShowAddModal(false); setNewResident({ id: '', name: '', ramin: '', houseNo: '' }); alert(t('alertAddSuccess'));
    } catch (err) { alert(t('alertErrSystem')); }
  };

  const handleUpdateResident = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'residents', editResidentData.id), {
        name: editResidentData.name, 
        ramin: editResidentData.ramin, 
        houseNo: editResidentData.houseNo, 
        marks: parseInt(editResidentData.marks) || 0,
        totalMarks: parseInt(editResidentData.totalMarks) || 0
      });
      setShowEditModal(false); alert(t('alertEditSuccess'));
    } catch (err) { alert(t('alertErrSystem')); }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'system'), { conversionRate: parseFloat(tempRate) }, { merge: true });
      setShowSettingsModal(false);
      alert(t('alertSetSuccess'));
    } catch (err) { alert(t('alertErrSystem')); }
  };

  const handleDeleteResident = async (id, name) => {
    const msg = lang === 'ms' ? `Padam terus rekod penduduk ${name}?` : `Permanently delete resident record for ${name}?`;
    if (window.confirm(msg)) {
      try { await deleteDoc(doc(db, 'residents', id));
      } catch (err) { alert(t('alertErrSystem')); }
    }
  };

  // Simulasi Imbasan IoT
  const simulateESP32Scan = async () => {
    if (residents.length === 0) return;
    setIsScanning(true);
    const randomResident = residents[Math.floor(Math.random() * residents.length)];
    try { 
      const currentTotal = getResidentTotal(randomResident);
      await updateDoc(doc(db, 'residents', randomResident.id), { 
        marks: randomResident.marks + 1,
        totalMarks: currentTotal + 1 
      });
      const alertMsg = lang === 'ms' 
        ? `[SIMULASI IoT]: QR Code milik ${randomResident.name} (${randomResident.id}) dikesan di REVIVE Smart Bin! +1 Botol direkodkan.`
        : `[IoT SIMULATION]: QR Code for ${randomResident.name} (${randomResident.id}) detected at REVIVE Smart Bin! +1 Bottle recorded.`;
      alert(alertMsg);
    } 
    catch (err) {} finally { setIsScanning(false); }
  };

  const pendingRequestsCount = residents.filter(r => r.redeemRequest).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans relative flex flex-col">
      
      {/* ========================================== */}
      {/* MODAL & POPUPS                             */}
      {/* ========================================== */}
      {showLoginModal && userRole === 'guest' && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-800">{t('loginRevive')}</h2>
              <button onClick={() => setShowLoginModal(false)} className="text-slate-400 hover:text-red-500"><X /></button>
            </div>
            
            <div className="flex mb-6 bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setLoginTab('resident')} className={`flex-1 py-2 text-sm font-bold rounded-md ${loginTab === 'resident' ? 'bg-white shadow text-emerald-600' : 'text-slate-500'}`}>{t('resident')}</button>
              <button onClick={() => setLoginTab('admin')} className={`flex-1 py-2 text-sm font-bold rounded-md ${loginTab === 'admin' ? 'bg-white shadow text-emerald-600' : 'text-slate-500'}`}>{t('admin')}</button>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">{loginTab === 'resident' ? t('resId') : t('adminUser')}</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input type="text" required value={loginUser} onChange={(e) => setLoginUser(e.target.value)} className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('password')} {loginTab === 'resident' && <span className="text-slate-400 font-normal">{t('defaultPass')}</span>}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input type="password" required value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700">{t('enter')}</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AUTO-GENERATE QR CODE UNTUK PENDUDUK */}
      {showQrModal && userRole === 'resident' && loggedInResident && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm text-center animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">{t('qrTitle')}</h3>
              <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-red-500"><X /></button>
            </div>
            <p className="text-xs text-slate-500 mb-4">{t('qrDesc')}</p>
            
            <div className="bg-slate-50 p-4 rounded-xl flex justify-center items-center mb-4 border border-dashed border-slate-200">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${loggedInResident.id}`} 
                alt="Resident Unique QR" 
                className="w-48 h-48 shadow-sm rounded-lg"
              />
            </div>
            
            <div className="text-sm font-bold text-slate-700 bg-slate-100 py-2 rounded-lg mb-1">
              {loggedInResident.name}
            </div>
            <p className="text-xs text-emerald-600 font-bold tracking-wider">{loggedInResident.id}</p>
            <p className="text-xs text-slate-400 mt-2">Ramin {loggedInResident.ramin} — {loggedInResident.houseNo}</p>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm">
            <div className="flex justify-between mb-4"><h3 className="font-bold text-xl">{t('settingTitle')}</h3><button onClick={() => setShowSettingsModal(false)}><X/></button></div>
            <form onSubmit={handleUpdateSettings} className="space-y-4">
              <div><label className="block text-sm font-bold text-slate-700">{t('bottleEq')}</label><input type="number" step="0.01" min="0" required value={tempRate} onChange={(e) => setTempRate(e.target.value)} className="w-full p-2 border rounded font-bold text-emerald-600 focus:ring-2 focus:ring-emerald-500" /></div>
              <button type="submit" className="w-full bg-emerald-600 text-white p-2 rounded font-bold">{t('save')}</button>
            </form>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <div className="flex justify-between mb-4"><h3 className="font-bold text-xl">{t('addResTitle')}</h3><button onClick={() => setShowAddModal(false)}><X/></button></div>
            <form onSubmit={handleAddResident} className="space-y-4">
              <input type="text" placeholder={t('phResId')} required value={newResident.id} onChange={(e) => setNewResident({...newResident, id: e.target.value})} className="w-full p-2 border rounded" />
              <input type="text" placeholder={t('phName')} required value={newResident.name} onChange={(e) => setNewResident({...newResident, name: e.target.value})} className="w-full p-2 border rounded" />
              <div className="grid grid-cols-2 gap-4">
                <select required value={newResident.ramin} onChange={(e) => setNewResident({...newResident, ramin: e.target.value})} className="w-full p-2 border rounded bg-white">
                  <option value="" disabled>{t('selRamin')}</option>
                  {availableRamins.map(r => <option key={r} value={r}>Ramin {r}</option>)}
                </select>
                <input type="text" placeholder={t('phHouse')} required value={newResident.houseNo} onChange={(e) => setNewResident({...newResident, houseNo: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-bold">{t('saveAcc')}</button>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <div className="flex justify-between mb-4"><h3 className="font-bold text-xl">{t('editTitle')}</h3><button onClick={() => setShowEditModal(false)}><X/></button></div>
            <form onSubmit={handleUpdateResident} className="space-y-4">
              <input type="text" disabled value={editResidentData.id} className="w-full p-2 border bg-slate-100 rounded text-slate-500" />
              <input type="text" required value={editResidentData.name} onChange={(e) => setEditResidentData({...editResidentData, name: e.target.value})} className="w-full p-2 border rounded" />
              <div className="grid grid-cols-2 gap-4">
                <select required value={editResidentData.ramin} onChange={(e) => setEditResidentData({...editResidentData, ramin: e.target.value})} className="w-full p-2 border rounded bg-white">
                  {availableRamins.map(r => <option key={r} value={r}>Ramin {r}</option>)}
                </select>
                <input type="text" required value={editResidentData.houseNo} onChange={(e) => setEditResidentData({...editResidentData, houseNo: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <div><label className="text-sm font-bold text-slate-600">{t('curBal')}</label><input type="number" required value={editResidentData.marks} onChange={(e) => setEditResidentData({...editResidentData, marks: e.target.value})} className="w-full p-2 border rounded font-bold text-blue-600" /></div>
              <div><label className="text-sm font-bold text-slate-600">{t('lifeTot')}</label><input type="number" required value={editResidentData.totalMarks} onChange={(e) => setEditResidentData({...editResidentData, totalMarks: e.target.value})} className="w-full p-2 border rounded font-bold text-emerald-600" /></div>
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-bold">{t('update')}</button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* NAVBAR                                     */}
      {/* ========================================== */}
      <nav className="bg-emerald-600 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <Recycle className="h-8 w-8" />
            <span className="text-2xl font-bold tracking-wider hidden sm:block">REVIVE</span>
          </div>
          
          <div className="flex space-x-1 bg-emerald-700/50 p-1 rounded-lg">
            <button onClick={() => setActiveTab('dashboard')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center ${activeTab === 'dashboard' ? 'bg-white text-emerald-700 shadow-sm' : 'text-emerald-50 hover:text-white'}`}>
              <LayoutDashboard className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">{t('dashboard')}</span>
            </button>
            <button onClick={() => setActiveTab('statistik')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center ${activeTab === 'statistik' ? 'bg-white text-emerald-700 shadow-sm' : 'text-emerald-50 hover:text-white'}`}>
              <BarChart3 className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">{t('statZone')}</span>
            </button>
          </div>

          <div className="flex items-center">
            {userRole !== 'guest' ? (
              <div className="flex items-center space-x-3">
                <span className="hidden md:block text-sm font-medium bg-emerald-800 px-3 py-1 rounded-full">
                  {t('hi')} {userRole === 'admin' ? t('secManager') : loggedInResident.name}
                </span>
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded text-sm font-bold transition-colors">{t('logout')}</button>
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="bg-emerald-800 hover:bg-emerald-900 px-4 py-2 rounded text-sm font-bold flex items-center transition-colors"><User className="h-4 w-4 mr-2"/> {t('login')}</button>
            )}

            {/* BUTANG PENUKAR BAHASA */}
            <button 
              onClick={() => setLang(lang === 'ms' ? 'en' : 'ms')} 
              className="ml-3 bg-emerald-700 hover:bg-emerald-800 px-3 py-1.5 rounded text-sm font-bold flex items-center transition-colors border border-emerald-500"
            >
              <Globe className="h-4 w-4 mr-1"/> {lang === 'ms' ? 'EN' : 'MS'}
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full">

        {/* INTERFACE KHAS UNTUK PENDUDUK YANG LOG MASUK */}
        {userRole === 'resident' && loggedInResident && (
          <div className="bg-white border border-slate-200 p-6 mb-8 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center"><Home className="mr-2 text-emerald-600" /> {t('yourAcc')}</h2>
              <p className="text-slate-500 text-sm mt-1">{t('sector')} <span className="font-bold text-slate-700">Ramin {loggedInResident.ramin}</span> | {t('houseNo')} <span className="font-bold text-slate-700">{loggedInResident.houseNo}</span></p>
              
              <div className="mt-4 flex space-x-4">
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">{t('rewardBal')}</p>
                  <p className="text-2xl font-bold text-blue-600">{loggedInResident.marks} {t('bottle')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">{t('greenVal')}</p>
                  <p className="text-2xl font-bold text-emerald-600">RM {(loggedInResident.marks * conversionRate).toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => setShowQrModal(true)} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-md transition"
              >
                <QrCode className="h-5 w-5" />
                <span>{t('showQr')}</span>
              </button>

              {loggedInResident.marks >= 10 && !loggedInResident.redeemRequest ? (
                <button onClick={requestRedeem} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg text-sm transition">
                  {t('reqRedeem')}
                </button>
              ) : loggedInResident.redeemRequest ? (
                <div className="bg-amber-50 text-amber-700 text-xs p-3 rounded-lg border border-amber-200 flex items-center">
                  <Clock className="w-4 h-4 mr-2 shrink-0 animate-pulse" />
                  <span>{t('reviewMsg')}</span>
                </div>
              ) : (
                <p className="text-xs text-center text-slate-400">{t('minBottleMsg')}</p>
              )}
            </div>
          </div>
        )}

        {/* NOTIFIKASI REQUEST UNTUK ADMIN */}
        {userRole === 'admin' && pendingRequestsCount > 0 && (
          <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg shadow-sm">
            <h3 className="font-bold text-blue-800 flex items-center"><Bell className="h-5 w-5 mr-2" /> {t('notiTitle')}</h3>
            <p className="text-blue-700 text-sm mt-1">{t('notiMsg1')} <b>{pendingRequestsCount}</b> {t('notiMsg2')}</p>
          </div>
        )}

        {/* ========================================== */}
        {/* VIEW 1: DASHBOARD UTAMA                    */}
        {/* ========================================== */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{t('dashTitle')}</h1>
                <p className="text-slate-500 mt-1">{t('susRate')} 1 {t('bottle')} = <span className="font-bold text-emerald-600">RM {conversionRate.toFixed(2)}</span></p>
              </div>
              
              {userRole === 'admin' && (
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => { setTempRate(conversionRate); setShowSettingsModal(true); }} className="flex items-center px-4 py-2 rounded-lg font-medium shadow-sm bg-slate-200 text-slate-700 hover:bg-slate-300"><Settings className="mr-2 h-4 w-4" /> {t('valSetting')}</button>
                  <button onClick={() => setShowAddModal(true)} className="flex items-center px-4 py-2 rounded-lg font-medium shadow-sm bg-blue-600 text-white hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" /> {t('addResBtn')}</button>
                  <button onClick={simulateESP32Scan} disabled={isScanning} className="flex items-center px-4 py-2 rounded-lg font-medium shadow-sm bg-emerald-600 text-white hover:bg-emerald-700">
                    <QrCode className="mr-2 h-4 w-4" /> {t('simBtn')}
                  </button>
                </div>
              )}
            </div>

            {/* Grid Statistik Utama */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center">
                <div className="bg-emerald-100 p-4 rounded-lg text-emerald-600 mr-4"><Trash2 className="h-8 w-8" /></div>
                <div><p className="text-sm text-slate-500 font-medium">{t('totBot')}</p><h3 className="text-3xl font-bold text-slate-800">{totalBottlesLifetime}</h3></div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center">
                <div className="bg-amber-100 p-4 rounded-lg text-amber-600 mr-4"><Wallet className="h-8 w-8" /></div>
                <div><p className="text-sm text-slate-500 font-medium">{t('totFund')}</p><h3 className="text-3xl font-bold text-slate-800">{(totalBottlesLifetime * conversionRate).toFixed(2)}</h3></div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center">
                <div className="bg-blue-100 p-4 rounded-lg text-blue-600 mr-4"><Trophy className="h-8 w-8" /></div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">{t('hero')}</p>
                  <h3 className="text-lg font-bold text-slate-800 truncate max-w-[170px]">{topResident && getResidentTotal(topResident) > 0 ? topResident.name : '-'}</h3>
                  <p className="text-xs text-blue-600 font-medium">{topResident && getResidentTotal(topResident) > 0 ? `Total: ${getResidentTotal(topResident)} ${t('bottle')} (${topResident.houseNo})` : ''}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Jadual Penduduk */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h2 className="text-xl font-bold text-slate-800 shrink-0">
                    {userRole === 'resident' ? `${t('secRank')} ${loggedInResident.ramin}` : t('resDb')}
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    {userRole !== 'resident' && (
                      <div className="relative">
                        <select value={filterRamin} onChange={(e) => setFilterRamin(e.target.value)} className="w-full appearance-none border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-sm focus:ring-emerald-500 bg-slate-50">
                          <option value="">{t('allRamin')}</option>
                          {availableRamins.map(r => <option key={r} value={r}>Ramin {r}</option>)}
                        </select>
                        <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                      </div>
                    )}
                    <div className="relative flex-1 sm:w-64">
                      <input type="text" placeholder={t('searchPh')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-emerald-500" />
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                        <th className="p-4">{t('thId')}</th>
                        <th className="p-4">{t('thName')}</th>
                        <th className="p-4">{t('thSec')}</th>
                        <th className="p-4">{t('thHouse')}</th>
                        <th className="p-4 text-center">{t('thBal')}</th>
                        <th className="p-4 text-center">{t('thTot')}</th>
                        {userRole === 'admin' && <th className="p-4 text-center">{t('thAct')}</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredResidents.map((r) => (
                        <tr key={r.id} className={`hover:bg-slate-50/80 transition-colors ${r.redeemRequest ? 'bg-amber-50/50' : ''}`}>
                          <td className="p-4 font-mono font-bold text-slate-600">{r.id}</td>
                          <td className="p-4 font-medium text-slate-800">
                            <div className="flex items-center space-x-2">
                              <span>{r.name}</span>
                              {r.redeemRequest && <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">{t('reqTag')}</span>}
                            </div>
                          </td>
                          <td className="p-4"><span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-semibold">Ramin {r.ramin}</span></td>
                          <td className="p-4 font-medium text-slate-600">{r.houseNo}</td>
                          <td className="p-4 text-center font-bold text-blue-600">{r.marks}</td>
                          <td className="p-4 text-center font-bold text-slate-700">{getResidentTotal(r)}</td>
                          {userRole === 'admin' && (
                            <td className="p-4">
                              <div className="flex items-center justify-center space-x-2">
                                {r.redeemRequest && (
                                  <button onClick={() => handleAcceptRedeem(r)} className="p-1 bg-green-500 hover:bg-green-600 text-white rounded shadow-sm" title="Luluskan Wang"><CheckCircle className="w-4 h-4" /></button>
                                )}
                                <button onClick={() => { setEditResidentData(r); setShowEditModal(true); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteResident(r.id, r.name)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash className="w-4 h-4" /></button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                      {filteredResidents.length === 0 && (
                        <tr><td colSpan="7" className="p-8 text-center text-slate-400">{t('noRec')}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Log Aktiviti Smart Bin (Masa Nyata) */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center"><Activity className="mr-2 text-emerald-500" /> {t('actTitle')}</h2>
                <div className="space-y-4">
                  {recentActivity.map((act) => (
                    <div key={act.id} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="bg-emerald-500 p-1.5 rounded-md text-white mt-0.5"><Recycle className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{act.name} ({act.residentId})</p>
                        <p className="text-xs text-slate-500">{t(act.messageKey) || act.messageKey}</p>
                        <span className="text-[10px] text-slate-400 font-medium block mt-1">{act.time}</span>
                      </div>
                    </div>
                  ))}
                  {recentActivity.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm">{t('waitSig')}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* VIEW 2: STATISTIK ZON RAMIN                */}
        {/* ========================================== */}
        {activeTab === 'statistik' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{t('statTitle')}</h2>
                <p className="text-sm text-slate-500">{t('statDesc')}</p>
              </div>
              <select value={statViewType} onChange={(e) => setStatViewType(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium bg-slate-50">
                <option value="keseluruhan">{t('optAll')}</option>
                <option value="semasa">{t('optCur')}</option>
              </select>
            </div>

            <div className="space-y-6 max-w-3xl">
              {availableRamins.map(rNum => {
                const rKey = `Ramin ${rNum}`;
                const rData = statsByRamin[rKey] || { currentTotal: 0, lifetimeTotal: 0 };
                const totalTarget = statViewType === 'semasa' ? rData.currentTotal : rData.lifetimeTotal;
                const grandTotal = statViewType === 'semasa' ? totalBottlesCurrent : totalBottlesLifetime;
                const percentage = grandTotal > 0 ? Math.round((totalTarget / grandTotal) * 100) : 0;
                return (
                  <div key={rNum} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-700">{rKey}</span>
                      <span className="text-slate-500 font-bold">{totalTarget} {t('bottle')} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div className="bg-emerald-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER HAKCIPTA */}
      <footer className="w-full bg-slate-800 text-slate-300 text-center py-4 text-sm mt-auto shadow-inner">
        &copy; {new Date().getFullYear()} {t('footer')}
      </footer>
    </div>
  );
}