import React, { useState, useEffect } from 'react';
import { LibraryProvider, useLibrary } from './contexts/LibraryContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Books from './components/Books';
import Loans from './components/Loans';
import UserProfile from './components/UserProfile';
import QRScanner from './components/QRScanner';
import Mascot from './components/Mascot';
import { Role, ViewState, User } from './types';
import { Sun, Moon, Menu, ScanLine, Camera, Database, RefreshCw, Trash2, Save, UserPlus, LogIn, Eye, EyeOff, Download, Upload } from 'lucide-react';

// Auth Components placed inline for simplicity in this file structure
const LoginView = () => {
  const { login, registerUser, setCurrentView } = useLibrary();
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Login State
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Mascot Tracking State
  const [focusedField, setFocusedField] = useState<'center' | 'email' | 'password'>('center');
  const [currentTextLength, setCurrentTextLength] = useState(0);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(email, pass)) {
      setError('Hatalı bilgiler. Lütfen tekrar deneyin.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPass) {
        setError('Lütfen tüm alanları doldurun.');
        return;
    }

    const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: regName,
        email: regEmail,
        passwordHash: regPass,
        role: Role.MEMBER,
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${regName}`, // Auto avatar
        memberSince: new Date().toISOString().split('T')[0],
        currentFines: 0,
        phone: regPhone
    };

    registerUser(newUser);
    // Auto login after register
    login(regEmail, regPass);
  };

  // Common Input Class
  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900 p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-dark-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-700 animate-fade-in-up relative mt-20">
        
        {/* Mascot Sitting on Top - Reset when view mounts */}
        <Mascot 
            mode="login"
            lookAt={focusedField} 
            textLength={currentTextLength} 
            passwordShown={showPass} 
            resetTrigger={Date.now()}
        />

        <div className="text-center mb-6 mt-4">
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-500 mb-2">Mavera</h1>
            <p className="text-gray-500 dark:text-gray-400">Yapay Zeka Destekli Kütüphane</p>
        </div>

        {isRegistering ? (
            <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ad Soyad</label>
                    <input 
                        type="text" 
                        required
                        value={regName}
                        onChange={e => { setRegName(e.target.value); setCurrentTextLength(e.target.value.length); }}
                        onFocus={() => { setFocusedField('email'); setCurrentTextLength(regName.length); }}
                        onBlur={() => setFocusedField('center')}
                        className={inputClass}
                        placeholder="Örn: Ali Yılmaz"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-Posta</label>
                    <input 
                        type="email" 
                        required
                        value={regEmail}
                        onChange={e => { setRegEmail(e.target.value); setCurrentTextLength(e.target.value.length); }}
                        onFocus={() => { setFocusedField('email'); setCurrentTextLength(regEmail.length); }}
                        onBlur={() => setFocusedField('center')}
                        className={inputClass}
                        placeholder="ornek@email.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Şifre Belirle</label>
                    <div className="relative">
                        <input 
                            type={showPass ? "text" : "password"}
                            required
                            value={regPass}
                            onChange={e => setRegPass(e.target.value)}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField('center')}
                            className={inputClass}
                            placeholder="******"
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition transform active:scale-95 shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Kayıt Ol ve Giriş Yap
                </button>
                <button type="button" onClick={() => setIsRegistering(false)} className="w-full text-sm text-gray-500 hover:text-primary-600 mt-2 text-center">
                    Zaten hesabın var mı? Giriş Yap
                </button>
            </form>
        ) : (
            <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-Posta</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={e => { setEmail(e.target.value); setCurrentTextLength(e.target.value.length); }}
                        onFocus={() => { setFocusedField('email'); setCurrentTextLength(email.length); }}
                        onBlur={() => setFocusedField('center')}
                        className={inputClass}
                        placeholder="E-postanızı girin"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Şifre</label>
                    <div className="relative">
                        <input 
                            type={showPass ? "text" : "password"}
                            value={pass}
                            onChange={e => setPass(e.target.value)}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField('center')}
                            className={inputClass}
                            placeholder="Şifrenizi girin"
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            tabIndex={-1}
                        >
                            {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">{error}</p>}
                
                <button type="submit" className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition transform active:scale-95 shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 mt-2">
                    <LogIn className="w-5 h-5" />
                    Giriş Yap
                </button>
                
                <div className="flex flex-col gap-3 mt-4">
                     <button type="button" onClick={() => setIsRegistering(true)} className="w-full py-3 border border-primary-200 text-primary-700 rounded-xl font-bold hover:bg-primary-50 transition flex items-center justify-center gap-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                        Hesap Oluştur
                    </button>
                     <button type="button" onClick={() => setCurrentView('BOOKS')} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-center">
                        Üye olmadan (Misafir) devam et
                    </button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};

const SettingsView = () => {
    const { books, users, loans } = useLibrary();

    const handleReset = () => {
        if(window.confirm("DİKKAT! Tüm veriler silinecek ve demo verilerine dönülecek. Onaylıyor musunuz?")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const handleBackup = () => {
        const data = {
            books: JSON.parse(localStorage.getItem('mavera_db_books') || '[]'),
            users: JSON.parse(localStorage.getItem('mavera_db_users') || '[]'),
            loans: JSON.parse(localStorage.getItem('mavera_db_loans') || '[]'),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mavera_yedek_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (data.books && data.users && data.loans) {
                    if (window.confirm("Mevcut veriler silinip yedek yüklenecek. Emin misiniz?")) {
                        localStorage.setItem('mavera_db_books', JSON.stringify(data.books));
                        localStorage.setItem('mavera_db_users', JSON.stringify(data.users));
                        localStorage.setItem('mavera_db_loans', JSON.stringify(data.loans));
                        alert("Yedek başarıyla yüklendi!");
                        window.location.reload();
                    }
                } else {
                    alert("Geçersiz yedek dosyası.");
                }
            } catch (err) {
                alert("Dosya okuma hatası.");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
             <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Sistem Ayarları</h2>
                <p className="text-gray-500 dark:text-gray-400">Uygulama tercihlerini ve veri tabanını yönetin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Database Stats Card */}
                <div className="bg-white dark:bg-dark-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                            <Database className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Veritabanı Durumu</h3>
                            <p className="text-sm text-green-500 font-medium">● Çevrimiçi ve Kaydediliyor</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <span className="text-gray-600 dark:text-gray-300">Kayıtlı Kitap</span>
                            <span className="font-bold text-gray-900 dark:text-white text-lg">{books.length}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <span className="text-gray-600 dark:text-gray-300">Toplam Üye</span>
                            <span className="font-bold text-gray-900 dark:text-white text-lg">{users.length}</span>
                        </div>
                         <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <span className="text-gray-600 dark:text-gray-300">İşlem Kaydı</span>
                            <span className="font-bold text-gray-900 dark:text-white text-lg">{loans.length}</span>
                        </div>
                    </div>
                </div>

                {/* Actions Card */}
                <div className="bg-white dark:bg-dark-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                     <div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl">
                                <Save className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Veri Yönetimi</h3>
                                <p className="text-sm text-gray-500">Tarayıcı önbelleği & Yedekleme</p>
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed text-sm">
                            Verileriniz tarayıcınızda güvende. Ancak farklı bir cihaza geçmek veya sıfırlamak için yedek alabilirsiniz.
                        </p>
                     </div>

                    <div className="space-y-3">
                         <button 
                            onClick={handleBackup}
                            className="w-full py-4 flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl transition border border-indigo-100 dark:border-indigo-900/50"
                         >
                             <Download className="w-5 h-5" />
                             Veritabanını İndir (Yedekle)
                         </button>

                         <label className="w-full py-4 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition cursor-pointer">
                             <Upload className="w-5 h-5" />
                             Yedek Yükle (Geri Yükle)
                             <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
                         </label>

                         <button 
                            onClick={handleReset}
                            className="w-full py-4 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-bold rounded-xl transition border border-red-100 dark:border-red-900/50 mt-4"
                         >
                             <Trash2 className="w-5 h-5" />
                             Fabrika Ayarlarına Dön (Sıfırla)
                         </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MainLayout = () => {
  const { 
    currentView, setCurrentView, currentUser, logout, darkMode, setDarkMode,
    books, users, loans, addBook, deleteBook, checkoutBook, returnBook, setScannedResult
  } = useLibrary();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  
  // Mascot Wave Logic & View tracking for reset
  const [mascotWaving, setMascotWaving] = useState(false);
  
  // Create a trigger that changes on every view change to reset mascot mood
  const [viewTrigger, setViewTrigger] = useState(0);

  useEffect(() => {
     setMascotWaving(true);
     setViewTrigger(Date.now()); // Update trigger to bring back panda if angry
     const timer = setTimeout(() => setMascotWaving(false), 2000); 
     return () => clearTimeout(timer);
  }, [currentView]);

  const role = currentUser?.role || Role.GUEST;

  const handleScan = (data: string) => {
      setScannedResult(data);
      setShowScanner(false);
      setCurrentView('BOOKS'); 
  };

  // View Router
  const renderContent = () => {
    switch(currentView) {
      case 'DASHBOARD': return <Dashboard books={books} loans={loans} users={users} currentUser={currentUser} />;
      case 'BOOKS': return <Books books={books} role={role} onAddBook={addBook} onDeleteBook={deleteBook} />;
      case 'LOANS': return <Loans books={books} users={users} loans={loans} onCheckout={checkoutBook} onReturn={returnBook} />;
      case 'PROFILE': return currentUser ? <UserProfile user={currentUser} loans={loans} books={books} /> : null;
      case 'MEMBERS': return (
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Üye Listesi</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        <tr>
                            <th className="p-3 rounded-l-lg">İsim</th>
                            <th className="p-3">E-Posta</th>
                            <th className="p-3">Kayıt Tarihi</th>
                            <th className="p-3 rounded-r-lg">Ceza</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.filter(u => u.role === Role.MEMBER).map(u => (
                            <tr key={u.id} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="p-3 flex items-center gap-3 dark:text-gray-200">
                                    <img src={u.photoUrl} className="w-8 h-8 rounded-full" alt="" />
                                    {u.name}
                                </td>
                                <td className="p-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                                <td className="p-3 text-gray-500 dark:text-gray-400">{u.memberSince}</td>
                                <td className="p-3 text-red-500 font-mono">₺{u.currentFines}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      );
      case 'SETTINGS': return <SettingsView />;
      default: return <div className="p-8 text-center text-gray-500">Sayfa Bulunamadı</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-300">
      
      {/* GLOBAL MASCOT - Always present in MainLayout */}
      {/* Passed viewTrigger so he comes back if he ran away on previous screen */}
      <Mascot mode="global" isWaving={mascotWaving} resetTrigger={viewTrigger} />

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-dark-800 shadow-sm sticky top-0 z-30">
        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <Menu className="w-6 h-6 dark:text-white" />
        </button>
        <span className="font-bold text-primary-600 text-xl">Mavera</span>
        <div className="flex gap-2">
            <button onClick={() => setShowScanner(true)} className="p-2 rounded-full bg-primary-50 text-primary-600 dark:bg-primary-900/30">
                <ScanLine className="w-5 h-5" />
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>
        </div>
      </div>

      <Sidebar 
        currentView={currentView} 
        role={role} 
        onChangeView={(v) => { setCurrentView(v); setSidebarOpen(false); }} 
        onLogout={logout}
        isOpen={sidebarOpen}
      />

      {/* Main Content */}
      <main className="lg:pl-64 p-4 lg:p-8 pt-8">
        {/* Desktop Header Actions */}
        <div className="hidden lg:flex justify-end mb-8 items-center gap-4">
            
            {/* Global QR Scan Button */}
            <button 
                onClick={() => setShowScanner(true)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition font-medium"
            >
                <ScanLine className="w-5 h-5 mr-2" />
                QR Tara
            </button>

             {role === Role.GUEST && (
                 <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm border border-blue-100">
                     Misafir Modu
                 </div>
             )}
            <button 
                onClick={() => setDarkMode(!darkMode)} 
                className="p-3 rounded-full bg-white dark:bg-dark-800 shadow-sm hover:shadow-md transition text-gray-600 dark:text-gray-300"
            >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
             {currentUser && (
                <div className="flex items-center gap-3 bg-white dark:bg-dark-800 py-2 px-4 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium dark:text-white">{currentUser.name}</span>
                    <img src={currentUser.photoUrl} className="w-8 h-8 rounded-full border border-gray-200" alt="Avatar" />
                </div>
            )}
        </div>
        
        <div className="animate-fade-in pb-20 lg:pb-0">
             {renderContent()}
        </div>
      </main>

      {/* QR Scanner Modal */}
      {showScanner && (
          <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}

      {/* Floating Action Button for Mobile (Bottom Right) */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
           <button 
                onClick={() => setShowScanner(true)}
                className="p-4 bg-primary-600 text-white rounded-full shadow-2xl shadow-primary-500/50 flex items-center justify-center active:scale-90 transition"
           >
                <Camera className="w-7 h-7" />
           </button>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

const AppContent = () => {
    const { currentView } = useLibrary();
    if (currentView === 'LOGIN') return <LoginView />;
    return <MainLayout />;
}

const App = () => {
  return (
    <LibraryProvider>
      <AppContent />
    </LibraryProvider>
  );
};

export default App;