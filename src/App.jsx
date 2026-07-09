import React, { useState, useEffect, useRef } from 'react';
import { Recycle, Users, Trophy, Activity, Search, QrCode, ArrowRight, Trash2, XCircle, Lock, User, Plus, X, Edit, Trash, Gift, Wallet, BarChart3, LayoutDashboard, Calendar, Filter, Upload, Settings, Bell, CheckCircle, Clock, Home, Globe, ArrowLeft, ShieldCheck } from 'lucide-react';
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
    loadingText: "Memuatkan sistem pintar REVIVE 2.0",
    chooseRole: "Pilih Peranan Anda",
    roleResidentDesc: "Akses profil, lihat rekod, dan tebus ganjaran hijau anda.",
    roleAdminDesc: "Urus komuniti, tetapan sistem, dan pengesahan tebusan.",
    loginAs: "Log Masuk sebagai",
    back: "Kembali",
    loginRevive: "Log Masuk REVIVE 2.0",
    resident: "Penduduk",
    admin: "Pengurus Taman",
    resId: "ID Penduduk (Cth: TM001)",
    adminUser: "Kredensial Admin",
    password: "Kata Laluan",
    defaultPass: "(Lalai: 1234)",
    enter: "Masuk Sistem",
    qrTitle: "Kod QR Kitar Semula",
    qrDesc: "Tunjukkan kod QR ini ke kamera pengimbas di REVIVE 2.0 Smart Bin semasa ingin membuang botol.",
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
    dashTitle: "Papan Pemuka Pintar REVIVE 2.0",
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
    actTitle: "Aktiviti REVIVE 2.0 Smart Bin",
    waitSig: "Menunggu isyarat perkakasan IoT luaran...",
    statTitle: "Prestasi Hijau Taman Mawar (Lorong Ramin)",
    statDesc: "Analisis perbandingan jumlah botol yang berjaya dikumpul mengikut zon jalan.",
    optAll: "Statistik Keseluruhan",
    optCur: "Baki Aktif Semasa",
    bottle: "Botol",
    footer: "Hakcipta terpelihara SEMAJU",
    alertManagerWrong: "Kredensial Pengurus salah!",
    alertResWrong: "ID Penduduk tidak dijumpai atau Kata Laluan salah",
    confirmRedeem: "Hantar permohonan penebusan insentif tunai hijau anda kepada pihak pengurusan?",
    alertRedeemSent: "Permohonan berjaya dihantar! Sila tunggu kelulusan.",
    alertErrSystem: "Ralat sistem.",
    alertPaySuccess: "Pembayaran berjaya disahkan!",
    alertIncomplete: "Sila lengkapkan profil penduduk!",
    alertAddSuccess: "Penduduk berjaya didaftarkan!",
    alertEditSuccess: "Profil penduduk dikemas kini!",
    alertSetSuccess: "Kadar ganjaran kitar semula dikemas kini!",
    logMsg: "REVIVE 2.0 Smart Bin mengesan pembuangan botol."
  },
  en: {
    loadingText: "Loading REVIVE 2.0 smart system...",
    chooseRole: "Choose Your Role",
    roleResidentDesc: "Access profile, view records, and redeem your green rewards.",
    roleAdminDesc: "Manage community, system settings, and redemptions.",
    loginAs: "Login as",
    back: "Back",
    loginRevive: "REVIVE 2.0 Login",
    resident: "Resident",
    admin: "Park Manager",
    resId: "Resident ID (Ex: TM001)",
    adminUser: "Admin Username",
    password: "Password",
    defaultPass: "(Default: 1234)",
    enter: "Enter System",
    qrTitle: "Recycling QR Code",
    qrDesc: "Show this QR code to the scanner camera at the REVIVE 2.0 Smart Bin when disposing of bottles.",
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
    dashTitle: "REVIVE 2.0 Smart Dashboard",
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
    actTitle: "REVIVE 2.0 Smart Bin Activity",
    waitSig: "Waiting for external IoT hardware signals...",
    statTitle: "Ramin Sector Green Performance",
    statDesc: "Comparative analysis of the total bottles successfully collected by street zone.",
    optAll: "Overall Statistics",
    optCur: "Current Active Balance",
    bottle: "Bottles",
    footer: "All rights reserved SEMAJU",
    alertManagerWrong: "Manager credentials incorrect!",
    alertResWrong: "Resident ID not found or Password incorrect",
    confirmRedeem: "Submit your green cash incentive redemption request to management?",
    alertRedeemSent: "Request submitted successfully! Please await approval.",
    alertErrSystem: "System error.",
    alertPaySuccess: "Payment successfully confirmed!",
    alertIncomplete: "Please complete the resident profile!",
    alertAddSuccess: "Resident successfully registered!",
    alertEditSuccess: "Resident profile updated!",
    alertSetSuccess: "Recycling reward rate updated!",
    logMsg: "REVIVE 2.0 Smart Bin detected bottle disposal."
  }
};

export default function App() {
  const [lang, setLang] = useState('ms');
  const t = (key) => dict[lang][key] || key;

  const [isAppLoading, setIsAppLoading] = useState(true);

  // ==========================================
  // STATE PENGURUSAN ROLE & LOGIN
  // ==========================================
  const [userRole, setUserRole] = useState('guest'); 
  const [loggedInResident, setLoggedInResident] = useState(null);
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginStep, setLoginStep] = useState('selectRole'); // 'selectRole' | 'form'
  const [loginTab, setLoginTab] = useState('resident'); 
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [statViewType, setStatViewType] = useState('keseluruhan');
  const [residents, setResidents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [conversionRate, setConversionRate] = useState(0.10); 
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRamin, setFilterRamin] = useState('');
  const [selectedIds, setSelectedIds] = useState([]); 
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newResident, setNewResident] = useState({ id: '', name: '', ramin: '', houseNo: '' });
  const [editResidentData, setEditResidentData] = useState({ id: '', name: '', ramin: '', houseNo: '', marks: 0, totalMarks: 0 });
  const [tempRate, setTempRate] = useState(0.10);

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

      setTimeout(() => {
        setIsAppLoading(false);
      }, 1500); // Sedikit tambahan masa supaya logo nampak jelas

    });
    
    return () => {
      unsubSettings();
      unsubResidents();
    };
  }, []);

  useEffect(() => {
    if (userRole === 'resident' && loggedInResident) {
      const freshData = residents.find(r => r.id === loggedInResident.id);
      if (freshData) setLoggedInResident(freshData);
    }
  }, [residents]);

  // ==========================================
  // LOGIK LOGIN
  // ==========================================
  const handleOpenLogin = () => {
    setLoginStep('selectRole');
    setLoginUser('');
    setLoginPass('');
    setShowLoginModal(true);
  };

  const handleSelectRole = (role) => {
    setLoginTab(role);
    setLoginStep('form');
  };

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
        ? `[SIMULASI IoT]: QR Code milik ${randomResident.name} (${randomResident.id}) dikesan di REVIVE 2.0 Smart Bin! +1 Botol direkodkan.`
        : `[IoT SIMULATION]: QR Code for ${randomResident.name} (${randomResident.id}) detected at REVIVE 2.0 Smart Bin! +1 Bottle recorded.`;
      alert(alertMsg);
    } 
    catch (err) {} finally { setIsScanning(false); }
  };

  const pendingRequestsCount = residents.filter(r => r.redeemRequest).length;

  // ==========================================
  // PAPARAN LOADING (SKRIN PEMUATAN MODEN)
  // ==========================================
  if (isAppLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center font-sans">
        <div className="relative flex justify-center items-center mb-2">
          {/* Efek cahaya latar belakang yang elegan */}
          <div className="absolute inset-0 bg-emerald-500 rounded-full blur-3xl opacity-20 animate-pulse w-48 h-48 m-auto"></div>
          {/* Logo baharu dimasukkan di sini */}
          <img 
            src="revive-logo.png" 
            alt="Revive 2.0 Logo" 
            className="w-64 h-64 object-contain relative z-10 animate-pulse drop-shadow-xl"
          />
        </div>
        <h2 className="mt-2 text-xl font-bold text-slate-800 tracking-wide animate-pulse">
          {t('loadingText')}
        </h2>
        <div className="flex space-x-1 mt-4">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAPARAN APLIKASI UTAMA
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans relative flex flex-col animate-in fade-in duration-700">
      
      {/* ========================================== */}
      {/* MODAL & POPUPS (MODEN UX LOGIN)            */}
      {/* ========================================== */}
      {showLoginModal && userRole === 'guest' && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-60 flex justify-center items-center z-50 p-4 backdrop-blur-sm transition-opacity">
          <div className={`bg-white p-8 rounded-3xl shadow-2xl w-full ${loginStep === 'selectRole' ? 'max-w-2xl' : 'max-w-md'} animate-in zoom-in-95 duration-300`}>
            
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                {loginStep === 'form' && (
                  <button onClick={() => setLoginStep('selectRole')} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full transition-colors" title={t('back')}>
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                )}
                <h2 className="text-2xl font-bold text-slate-800">
                  {loginStep === 'selectRole' ? t('chooseRole') : `${t('loginAs')} ${loginTab === 'resident' ? t('resident') : t('admin')}`}
                </h2>
              </div>
              <button onClick={() => setShowLoginModal(false)} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"><X className="h-5 w-5"/></button>
            </div>
            
            {loginStep === 'selectRole' ? (
              // STEP 1: KAD PILIHAN PERANAN (ROLE SELECTION CARDS)
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div 
                  onClick={() => handleSelectRole('resident')}
                  className="group cursor-pointer bg-white border-2 border-slate-100 hover:border-emerald-500 rounded-2xl p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="bg-emerald-50 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                    <Users className="h-10 w-10 text-emerald-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{t('resident')}</h3>
                  <p className="text-sm text-slate-500">{t('roleResidentDesc')}</p>
                </div>

                <div 
                  onClick={() => handleSelectRole('admin')}
                  className="group cursor-pointer bg-white border-2 border-slate-100 hover:border-blue-500 rounded-2xl p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="bg-blue-50 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                    <ShieldCheck className="h-10 w-10 text-blue-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{t('admin')}</h3>
                  <p className="text-sm text-slate-500">{t('roleAdminDesc')}</p>
                </div>
              </div>
            ) : (
              // STEP 2: BORANG LOG MASUK (LOGIN FORM)
              <form onSubmit={handleLogin} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{loginTab === 'resident' ? t('resId') : t('adminUser')}</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input type="text" required value={loginUser} onChange={(e) => setLoginUser(e.target.value)} className="w-full pl-12 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-slate-50 focus:bg-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{t('password')}</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input type="password" required value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className="w-full pl-12 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-slate-50 focus:bg-white" />
                  </div>
                </div>
                <button type="submit" className={`w-full text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 ${loginTab === 'resident' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {t('enter')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {showQrModal && userRole === 'resident' && loggedInResident && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm text-center animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">{t('qrTitle')}</h3>
              <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X /></button>
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
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="flex justify-between mb-4"><h3 className="font-bold text-xl">{t('settingTitle')}</h3><button onClick={() => setShowSettingsModal(false)} className="hover:text-red-500 transition-colors"><X/></button></div>
            <form onSubmit={handleUpdateSettings} className="space-y-4">
              <div><label className="block text-sm font-bold text-slate-700 mb-1">{t('bottleEq')}</label><input type="number" step="0.01" min="0" required value={tempRate} onChange={(e) => setTempRate(e.target.value)} className="w-full p-2 border rounded-lg font-bold text-emerald-600 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" /></div>
              <button type="submit" className="w-full bg-emerald-600 text-white p-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors">{t('save')}</button>
            </form>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between mb-4"><h3 className="font-bold text-xl">{t('addResTitle')}</h3><button onClick={() => setShowAddModal(false)} className="hover:text-red-500 transition-colors"><X/></button></div>
            <form onSubmit={handleAddResident} className="space-y-4">
              <input type="text" placeholder={t('phResId')} required value={newResident.id} onChange={(e) => setNewResident({...newResident, id: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              <input type="text" placeholder={t('phName')} required value={newResident.name} onChange={(e) => setNewResident({...newResident, name: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              <div className="grid grid-cols-2 gap-4">
                <select required value={newResident.ramin} onChange={(e) => setNewResident({...newResident, ramin: e.target.value})} className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                  <option value="" disabled>{t('selRamin')}</option>
                  {availableRamins.map(r => <option key={r} value={r}>Ramin {r}</option>)}
                </select>
                <input type="text" placeholder={t('phHouse')} required value={newResident.houseNo} onChange={(e) => setNewResident({...newResident, houseNo: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm">{t('saveAcc')}</button>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between mb-4"><h3 className="font-bold text-xl">{t('editTitle')}</h3><button onClick={() => setShowEditModal(false)} className="hover:text-red-500 transition-colors"><X/></button></div>
            <form onSubmit={handleUpdateResident} className="space-y-4">
              <input type="text" disabled value={editResidentData.id} className="w-full p-2 border bg-slate-100 rounded-lg text-slate-500 cursor-not-allowed" />
              <input type="text" required value={editResidentData.name} onChange={(e) => setEditResidentData({...editResidentData, name: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              <div className="grid grid-cols-2 gap-4">
                <select required value={editResidentData.ramin} onChange={(e) => setEditResidentData({...editResidentData, ramin: e.target.value})} className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                  {availableRamins.map(r => <option key={r} value={r}>Ramin {r}</option>)}
                </select>
                <input type="text" required value={editResidentData.houseNo} onChange={(e) => setEditResidentData({...editResidentData, houseNo: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div><label className="text-sm font-bold text-slate-600 mb-1 block">{t('curBal')}</label><input type="number" required value={editResidentData.marks} onChange={(e) => setEditResidentData({...editResidentData, marks: e.target.value})} className="w-full p-2 border rounded-lg font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all" /></div>
              <div><label className="text-sm font-bold text-slate-600 mb-1 block">{t('lifeTot')}</label><input type="number" required value={editResidentData.totalMarks} onChange={(e) => setEditResidentData({...editResidentData, totalMarks: e.target.value})} className="w-full p-2 border rounded-lg font-bold text-emerald-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all" /></div>
              <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm">{t('update')}</button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* NAVBAR                                     */}
      {/* ========================================== */}
      <nav className="bg-emerald-600 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
          <div className="flex items-center space-x-2 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.scrollTo(0,0)}>
            <img src="revive-logo.png" alt="Revive Logo" className="h-8 w-8 object-contain bg-white rounded-full p-1" />
            <span className="text-2xl font-bold tracking-wider hidden sm:block">REVIVE 2.0</span>
          </div>
          
          <div className="flex space-x-1 bg-emerald-700/50 p-1 rounded-lg">
            <button onClick={() => setActiveTab('dashboard')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center ${activeTab === 'dashboard' ? 'bg-white text-emerald-700 shadow-sm' : 'text-emerald-50 hover:text-white hover:bg-emerald-700/80'}`}>
              <LayoutDashboard className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">{t('dashboard')}</span>
            </button>
            <button onClick={() => setActiveTab('statistik')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center ${activeTab === 'statistik' ? 'bg-white text-emerald-700 shadow-sm' : 'text-emerald-50 hover:text-white hover:bg-emerald-700/80'}`}>
              <BarChart3 className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">{t('statZone')}</span>
            </button>
          </div>

          <div className="flex items-center">
            {userRole !== 'guest' ? (
              <div className="flex items-center space-x-3">
                <span className="hidden md:block text-sm font-medium bg-emerald-800 px-3 py-1 rounded-full shadow-inner">
                  {t('hi')} {userRole === 'admin' ? t('secManager') : loggedInResident.name}
                </span>
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg text-sm font-bold transition-all shadow-sm">{t('logout')}</button>
              </div>
            ) : (
              <button onClick={handleOpenLogin} className="bg-emerald-800 hover:bg-emerald-900 px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-all shadow-sm"><User className="h-4 w-4 mr-2"/> {t('login')}</button>
            )}

            <button 
              onClick={() => setLang(lang === 'ms' ? 'en' : 'ms')} 
              className="ml-3 bg-emerald-700 hover:bg-emerald-800 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center transition-all border border-emerald-500 shadow-sm"
            >
              <Globe className="h-4 w-4 mr-1"/> {lang === 'ms' ? 'EN' : 'MS'}
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full">

        {userRole === 'resident' && loggedInResident && (
          <div className="bg-white border border-slate-200 p-6 mb-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center"><Home className="mr-2 text-emerald-600" /> {t('yourAcc')}</h2>
              <p className="text-slate-500 text-sm mt-1">{t('sector')} <span className="font-bold text-slate-700">Ramin {loggedInResident.ramin}</span> | {t('houseNo')} <span className="font-bold text-slate-700">{loggedInResident.houseNo}</span></p>
              
              <div className="mt-4 flex space-x-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex-1">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{t('rewardBal')}</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{loggedInResident.marks} {t('bottle')}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex-1">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{t('greenVal')}</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">RM {(loggedInResident.marks * conversionRate).toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => setShowQrModal(true)} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all"
              >
                <QrCode className="h-5 w-5" />
                <span>{t('showQr')}</span>
              </button>

              {loggedInResident.marks >= 10 && !loggedInResident.redeemRequest ? (
                <button onClick={requestRedeem} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all text-sm">
                  {t('reqRedeem')}
                </button>
              ) : loggedInResident.redeemRequest ? (
                <div className="bg-amber-50 text-amber-800 text-xs p-4 rounded-xl border border-amber-200 flex items-center shadow-inner font-medium">
                  <Clock className="w-5 h-5 mr-3 shrink-0 animate-pulse text-amber-600" />
                  <span>{t('reviewMsg')}</span>
                </div>
              ) : (
                <p className="text-xs text-center text-slate-400 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">{t('minBottleMsg')}</p>
              )}
            </div>
          </div>
        )}

        {userRole === 'admin' && pendingRequestsCount > 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-xl shadow-sm">
            <h3 className="font-bold text-blue-800 flex items-center"><Bell className="h-5 w-5 mr-2 animate-bounce" /> {t('notiTitle')}</h3>
            <p className="text-blue-700 text-sm mt-1">{t('notiMsg1')} <b className="text-lg mx-1">{pendingRequestsCount}</b> {t('notiMsg2')}</p>
          </div>
        )}

        {/* ========================================== */}
        {/* VIEW 1: DASHBOARD UTAMA                    */}
        {/* ========================================== */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('dashTitle')}</h1>
                <p className="text-slate-500 mt-1">{t('susRate')} 1 {t('bottle')} = <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">RM {conversionRate.toFixed(2)}</span></p>
              </div>
              
              {userRole === 'admin' && (
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => { setTempRate(conversionRate); setShowSettingsModal(true); }} className="flex items-center px-4 py-2 rounded-lg font-medium shadow-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"><Settings className="mr-2 h-4 w-4" /> {t('valSetting')}</button>
                  <button onClick={() => setShowAddModal(true)} className="flex items-center px-4 py-2 rounded-lg font-medium shadow-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"><Plus className="mr-2 h-4 w-4" /> {t('addResBtn')}</button>
                  <button onClick={simulateESP32Scan} disabled={isScanning} className="flex items-center px-4 py-2 rounded-lg font-medium shadow-sm bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                    <QrCode className="mr-2 h-4 w-4" /> {t('simBtn')}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 p-6 flex items-center group">
                <div className="bg-emerald-50 p-4 rounded-xl text-emerald-600 mr-4 group-hover:scale-110 transition-transform"><Trash2 className="h-8 w-8" /></div>
                <div><p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{t('totBot')}</p><h3 className="text-3xl font-black text-slate-800">{totalBottlesLifetime}</h3></div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 p-6 flex items-center group">
                <div className="bg-amber-50 p-4 rounded-xl text-amber-600 mr-4 group-hover:scale-110 transition-transform"><Wallet className="h-8 w-8" /></div>
                <div><p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{t('totFund')}</p><h3 className="text-3xl font-black text-slate-800">{(totalBottlesLifetime * conversionRate).toFixed(2)}</h3></div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 p-6 flex items-center group">
                <div className="bg-blue-50 p-4 rounded-xl text-blue-600 mr-4 group-hover:scale-110 transition-transform"><Trophy className="h-8 w-8" /></div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{t('hero')}</p>
                  <h3 className="text-lg font-bold text-slate-800 truncate max-w-[170px]">{topResident && getResidentTotal(topResident) > 0 ? topResident.name : '-'}</h3>
                  <p className="text-xs text-blue-600 font-semibold">{topResident && getResidentTotal(topResident) > 0 ? `Total: ${getResidentTotal(topResident)} ${t('bottle')} (${topResident.houseNo})` : ''}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                  <h2 className="text-lg font-bold text-slate-800 shrink-0">
                    {userRole === 'resident' ? `${t('secRank')} ${loggedInResident.ramin}` : t('resDb')}
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {userRole !== 'resident' && (
                      <div className="relative">
                        <select value={filterRamin} onChange={(e) => setFilterRamin(e.target.value)} className="w-full appearance-none border border-slate-200 rounded-lg pl-3 pr-8 py-2.5 text-sm focus:ring-emerald-500 bg-white shadow-sm outline-none transition-all cursor-pointer">
                          <option value="">{t('allRamin')}</option>
                          {availableRamins.map(r => <option key={r} value={r}>Ramin {r}</option>)}
                        </select>
                        <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      </div>
                    )}
                    <div className="relative flex-1 sm:w-64">
                      <input type="text" placeholder={t('searchPh')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:ring-emerald-500 shadow-sm outline-none transition-all bg-white" />
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                        <th className="p-4 pl-6">{t('thId')}</th>
                        <th className="p-4">{t('thName')}</th>
                        <th className="p-4">{t('thSec')}</th>
                        <th className="p-4">{t('thHouse')}</th>
                        <th className="p-4 text-center">{t('thBal')}</th>
                        <th className="p-4 text-center">{t('thTot')}</th>
                        {userRole === 'admin' && <th className="p-4 text-center pr-6">{t('thAct')}</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm">
                      {filteredResidents.map((r) => (
                        <tr key={r.id} className={`hover:bg-slate-50 transition-colors ${r.redeemRequest ? 'bg-amber-50/30' : ''}`}>
                          <td className="p-4 pl-6 font-mono font-bold text-slate-600">{r.id}</td>
                          <td className="p-4 font-semibold text-slate-800">
                            <div className="flex items-center space-x-2">
                              <span>{r.name}</span>
                              {r.redeemRequest && <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">{t('reqTag')}</span>}
                            </div>
                          </td>
                          <td className="p-4"><span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-bold">Ramin {r.ramin}</span></td>
                          <td className="p-4 font-medium text-slate-600">{r.houseNo}</td>
                          <td className="p-4 text-center font-black text-blue-600">{r.marks}</td>
                          <td className="p-4 text-center font-bold text-slate-700">{getResidentTotal(r)}</td>
                          {userRole === 'admin' && (
                            <td className="p-4 pr-6">
                              <div className="flex items-center justify-center space-x-2">
                                {r.redeemRequest && (
                                  <button onClick={() => handleAcceptRedeem(r)} className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md shadow-sm transition-transform hover:scale-105" title="Luluskan Wang"><CheckCircle className="w-4 h-4" /></button>
                                )}
                                <button onClick={() => { setEditResidentData(r); setShowEditModal(true); }} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteResident(r.id, r.name)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"><Trash className="w-4 h-4" /></button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                      {filteredResidents.length === 0 && (
                        <tr><td colSpan="7" className="p-8 text-center text-slate-400 font-medium">{t('noRec')}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
                <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center"><Activity className="mr-2 text-emerald-500 h-5 w-5" /> {t('actTitle')}</h2>
                <div className="space-y-4 flex-grow overflow-hidden relative">
                  {recentActivity.map((act) => (
                    <div key={act.id} className="flex items-start space-x-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100 animate-in slide-in-from-right-4 duration-300">
                      <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 mt-0.5"><Recycle className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">{act.name} <span className="font-normal text-slate-400 ml-1">({act.residentId})</span></p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{t(act.messageKey) || act.messageKey}</p>
                        <span className="text-[10px] text-slate-400 font-medium block mt-1.5">{act.time}</span>
                      </div>
                    </div>
                  ))}
                  {recentActivity.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center py-8">
                       <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-200 rounded-full animate-spin mb-3"></div>
                       <p className="text-slate-400 text-sm font-medium">{t('waitSig')}</p>
                    </div>
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
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{t('statTitle')}</h2>
                <p className="text-sm text-slate-500 mt-1">{t('statDesc')}</p>
              </div>
              <select value={statViewType} onChange={(e) => setStatViewType(e.target.value)} className="border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer">
                <option value="keseluruhan">{t('optAll')}</option>
                <option value="semasa">{t('optCur')}</option>
              </select>
            </div>

            <div className="space-y-8 max-w-4xl">
              {availableRamins.map(rNum => {
                const rKey = `Ramin ${rNum}`;
                const rData = statsByRamin[rKey] || { currentTotal: 0, lifetimeTotal: 0 };
                const totalTarget = statViewType === 'semasa' ? rData.currentTotal : rData.lifetimeTotal;
                const grandTotal = statViewType === 'semasa' ? totalBottlesCurrent : totalBottlesLifetime;
                const percentage = grandTotal > 0 ? Math.round((totalTarget / grandTotal) * 100) : 0;
                return (
                  <div key={rNum} className="space-y-3">
                    <div className="flex justify-between text-sm items-end">
                      <span className="font-extrabold text-slate-700 text-base">{rKey}</span>
                      <span className="text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-md">{totalTarget} {t('bottle')} <span className="text-emerald-600 ml-1">({percentage}%)</span></span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner">
                      <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${percentage}%` }}>
                         <div className="absolute top-0 bottom-0 left-0 right-0 bg-white opacity-20 w-full h-full animate-[pulse_2s_ease-in-out_infinite]"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <footer className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-300 text-center py-6 mt-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] relative overflow-hidden group">
        <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors duration-700 ease-in-out"></div>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3 relative z-10">
          <span className="text-sm font-medium tracking-wider text-slate-400 group-hover:text-emerald-400 transition-colors duration-500">
            &copy; {new Date().getFullYear()} {t('footer')}
          </span>
          <Recycle className="h-4 w-4 text-emerald-500/70 group-hover:text-emerald-400 animate-[spin_4s_linear_infinite] transition-colors duration-500" />
        </div>
      </footer>
    </div>
  );
}