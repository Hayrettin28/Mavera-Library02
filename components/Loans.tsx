import React, { useState, useEffect } from 'react';
import { Book, User, Loan, BookStatus } from '../types';
import { ScanLine, ArrowRight, User as UserIcon, Book as BookIcon, CheckCircle, AlertTriangle, ShoppingBag, Trash2, Plus, Calendar, Clock } from 'lucide-react';
import { useLibrary } from '../contexts/LibraryContext';

interface LoansProps {
  books: Book[];
  users: User[];
  loans: Loan[];
  onCheckout: (bookId: string, userId: string, days?: number) => void;
  onReturn: (loanId: string) => void;
}

const Loans: React.FC<LoansProps> = ({ books, users, loans, onCheckout, onReturn }) => {
  const { scannedResult, clearScannedResult } = useLibrary();
  const [activeTab, setActiveTab] = useState<'CHECKOUT' | 'RETURN'>('CHECKOUT');
  
  // Checkout State
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [loanDuration, setLoanDuration] = useState(15); // Default 15 days
  const [checkoutBasket, setCheckoutBasket] = useState<Book[]>([]); // New: Basket for multi-checkout
  const [successMsg, setSuccessMsg] = useState('');

  // Return State
  const [returnSearch, setReturnSearch] = useState('');
  const [bookCondition, setBookCondition] = useState('Sağlam');

  // Handle Scanned Result
  useEffect(() => {
    if (scannedResult) {
       // If Scan is User ID
       if (scannedResult.startsWith('USER:')) {
           const uid = scannedResult.split(':')[1];
           const foundUser = users.find(u => u.id === uid);
           if (foundUser) {
               setSelectedUserId(uid);
               setActiveTab('CHECKOUT');
               setSuccessMsg(`Kullanıcı algılandı: ${foundUser.name}`);
               setTimeout(() => setSuccessMsg(''), 3000);
           }
       } 
       // If Scan is Book Data (JSON)
       else {
           try {
               const data = JSON.parse(decodeURIComponent(scannedResult));
               if (data && data.id) {
                   const foundBook = books.find(b => b.id === data.id);
                   if (foundBook) {
                       // Check if it's already loaned out to decide tab
                       const activeLoan = loans.find(l => l.bookId === data.id && l.status !== 'RETURNED');
                       if (activeLoan) {
                           setActiveTab('RETURN');
                           setReturnSearch(foundBook.title); // Auto search for return
                           setSuccessMsg(`Kitap iade için seçildi: ${foundBook.title}`);
                       } else {
                           setActiveTab('CHECKOUT');
                           // Add to basket logic
                           if (!checkoutBasket.some(b => b.id === foundBook.id)) {
                               setCheckoutBasket(prev => [...prev, foundBook]);
                               setSuccessMsg(`Kitap listeye eklendi: ${foundBook.title}`);
                           } else {
                               setSuccessMsg(`Kitap zaten listede: ${foundBook.title}`);
                           }
                       }
                       setTimeout(() => setSuccessMsg(''), 3000);
                   }
               }
           } catch (e) {
               console.error("QR Parse error", e);
           }
       }
       clearScannedResult();
    }
  }, [scannedResult, books, users, loans, checkoutBasket]);

  const addToBasket = () => {
    if (selectedBookId) {
        const book = books.find(b => b.id === selectedBookId);
        if (book && !checkoutBasket.some(b => b.id === book.id)) {
            setCheckoutBasket([...checkoutBasket, book]);
            setSelectedBookId('');
        }
    }
  };

  const removeFromBasket = (id: string) => {
      setCheckoutBasket(checkoutBasket.filter(b => b.id !== id));
  };

  const handleCheckout = () => {
    if (selectedUserId && checkoutBasket.length > 0) {
      // Process all books in basket
      checkoutBasket.forEach(book => {
          onCheckout(book.id, selectedUserId, loanDuration);
      });
      
      setSuccessMsg(`${checkoutBasket.length} adet kitap başarıyla ödünç verildi! (${loanDuration} Günlük)`);
      setCheckoutBasket([]); // Clear basket
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const activeLoans = loans.filter(l => l.status !== 'RETURNED');
  
  // Filter active loans for return search
  const filteredActiveLoans = activeLoans.filter(loan => {
    const book = books.find(b => b.id === loan.bookId);
    const user = users.find(u => u.id === loan.userId);
    const search = returnSearch.toLowerCase();
    
    return book?.title.toLowerCase().includes(search) || 
           book?.isbn.includes(search) ||
           user?.name.toLowerCase().includes(search);
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-24 lg:pb-0">
      {/* Main Actions (Top on mobile, Left on Desktop) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Custom Tab Switcher */}
          <div className="flex border-b border-gray-100 dark:border-gray-700">
            <button 
              onClick={() => setActiveTab('CHECKOUT')}
              className={`flex-1 py-4 md:py-5 text-center font-bold text-base md:text-lg transition duration-300 relative ${activeTab === 'CHECKOUT' ? 'text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-900/10' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500'}`}
            >
              <div className="flex items-center justify-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Ödünç Ver
              </div>
              {activeTab === 'CHECKOUT' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-600"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('RETURN')}
              className={`flex-1 py-4 md:py-5 text-center font-bold text-base md:text-lg transition duration-300 relative ${activeTab === 'RETURN' ? 'text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-900/10' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500'}`}
            >
               <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  İade Al
              </div>
              {activeTab === 'RETURN' && <div className="absolute bottom-0 left-0 w-full h-1 bg-green-600"></div>}
            </button>
          </div>

          <div className="p-4 md:p-8">
            {successMsg && (
                <div className="flex items-center text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-300 p-4 rounded-xl mb-6 animate-fade-in border border-green-100 dark:border-green-800 shadow-sm">
                    <CheckCircle className="w-6 h-6 mr-3" />
                    <span className="font-medium text-sm md:text-base">{successMsg}</span>
                </div>
            )}

            {activeTab === 'CHECKOUT' ? (
              <div className="space-y-6">
                
                {/* User Selection */}
                <div className="bg-gray-50 dark:bg-dark-900/50 p-4 md:p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Üye Seçimi</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select 
                      className="w-full pl-12 pr-4 py-3 md:py-4 rounded-xl border border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-dark-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 appearance-none transition shadow-sm text-sm md:text-base"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                    >
                      <option value="">Listeden üye seçin veya QR okutun...</option>
                      {users.filter(u => u.role !== 'GUEST').map(u => (
                        <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Book Selection & Basket */}
                <div className="space-y-4">
                     <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Kitap Ekle</label>
                     <div className="flex gap-2">
                        <div className="relative flex-1">
                            <BookIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select 
                            className="w-full pl-12 pr-4 py-3 md:py-4 rounded-xl border border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-dark-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 appearance-none transition shadow-sm text-sm md:text-base"
                            value={selectedBookId}
                            onChange={(e) => setSelectedBookId(e.target.value)}
                            >
                            <option value="">Kitap seçin veya QR okutun...</option>
                            {books.filter(b => b.availableCopies > 0 && !checkoutBasket.some(cb => cb.id === b.id)).map(b => (
                                <option key={b.id} value={b.id}>{b.title} (Raf: {b.shelfLocation})</option>
                            ))}
                            </select>
                        </div>
                        <button 
                            onClick={addToBasket}
                            disabled={!selectedBookId}
                            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white p-3 md:p-4 rounded-xl transition disabled:opacity-50"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Basket View */}
                    <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-500 mb-3 flex justify-between">
                            <span>EKLENECEK KİTAPLAR ({checkoutBasket.length})</span>
                            <span className="text-xs">Çoklu seçim yapılabilir</span>
                        </h4>
                        
                        {checkoutBasket.length === 0 ? (
                            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center text-gray-400">
                                <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                Henüz kitap eklenmedi.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {checkoutBasket.map((book, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white dark:bg-dark-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm animate-fade-in-up">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary-50 dark:bg-primary-900/20 text-primary-600 p-2 rounded-lg">
                                                <BookIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-white text-sm md:text-base">{book.title}</p>
                                                <p className="text-xs text-gray-500">{book.author} • {book.shelfLocation}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => removeFromBasket(book.id)}
                                            className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Loan Duration Selector */}
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900/50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-orange-700 dark:text-orange-300">
                        <Clock className="w-5 h-5" />
                        <span className="font-bold text-sm">Teslim Süresi</span>
                    </div>
                    <select 
                        value={loanDuration}
                        onChange={(e) => setLoanDuration(Number(e.target.value))}
                        className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white text-sm font-medium rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value={7}>1 Hafta (7 Gün)</option>
                        <option value={15}>15 Gün (Standart)</option>
                        <option value={30}>1 Ay (30 Gün)</option>
                        <option value={60}>2 Ay (60 Gün)</option>
                        <option value={90}>3 Ay (Dönemlik)</option>
                    </select>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={!selectedUserId || checkoutBasket.length === 0}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-6 h-6" />
                  İşlemi Tamamla ({checkoutBasket.length} Kitap)
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative">
                  <ScanLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="İade için Ara: Kitap Adı, Üye Adı veya ISBN..." 
                    className="w-full pl-12 pr-4 py-3 md:py-4 rounded-xl border border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-dark-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500 shadow-sm transition text-sm md:text-base"
                    value={returnSearch}
                    onChange={(e) => setReturnSearch(e.target.value)}
                  />
                </div>
                
                <div className="max-h-[500px] overflow-y-auto space-y-3 custom-scrollbar">
                   {filteredActiveLoans.length === 0 && (
                       <div className="text-center py-10">
                           <CheckCircle className="w-16 h-16 text-green-100 mx-auto mb-3" />
                           <p className="text-gray-400">Aktif ödünç kaydı bulunamadı.</p>
                       </div>
                   )}
                   {filteredActiveLoans.map(loan => {
                     const book = books.find(b => b.id === loan.bookId);
                     const user = users.find(u => u.id === loan.userId);
                     const isOverdue = loan.status === 'OVERDUE';
                     
                     return (
                        <div key={loan.id} className="p-4 md:p-5 border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-md transition bg-white dark:bg-dark-900 flex flex-col gap-4 group">
                          <div className="flex justify-between items-start">
                              <div className="flex gap-3 md:gap-4">
                                  <img src={book?.coverUrl} className="w-10 h-14 md:w-12 md:h-16 object-cover rounded shadow-sm" alt="" />
                                  <div>
                                    <p className="font-bold text-gray-800 dark:text-white text-base md:text-lg">{book?.title}</p>
                                    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mt-1">
                                        <UserIcon className="w-3 h-3" />
                                        {user?.name}
                                    </div>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <span className={`inline-block px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                                      {isOverdue ? 'GECİKMİŞ' : 'Zamanında'}
                                  </span>
                                  <p className="text-[10px] md:text-xs text-gray-400 mt-1">Son Tarih: {loan.dueDate}</p>
                              </div>
                          </div>
                          
                          {isOverdue && (
                              <div className="flex items-center text-red-600 bg-red-50 dark:bg-red-900/20 p-2 md:p-3 rounded-lg text-sm">
                                  <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                                  <span className="font-bold">Gecikme Cezası: ₺{loan.fineAmount}</span>
                              </div>
                          )}

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-gray-50 dark:border-gray-800">
                              <select 
                                value={bookCondition}
                                onChange={(e) => setBookCondition(e.target.value)}
                                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-green-500"
                              >
                                  <option value="Sağlam">Durum: Sağlam</option>
                                  <option value="Hasarlı">Durum: Hasarlı</option>
                                  <option value="Yıpranmış">Durum: Yıpranmış</option>
                                  <option value="Kayıp">Durum: Kayıp</option>
                              </select>
                              <button 
                                onClick={() => onReturn(loan.id)}
                                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition shadow-lg shadow-green-500/20 flex items-center justify-center"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                İade Al ve Tamamla
                              </button>
                          </div>
                        </div>
                     );
                   })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Feed (Bottom on mobile, Right on Desktop) */}
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                 <ShoppingBag className="w-32 h-32" />
             </div>
             <h3 className="text-xl font-bold mb-1 relative z-10">Hızlı İstatistik</h3>
             <p className="text-gray-400 text-sm mb-6 relative z-10">Bugünün işlem özeti</p>
             
             <div className="grid grid-cols-2 gap-4 relative z-10">
                 <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                     <p className="text-2xl font-bold">{loans.filter(l => l.checkoutDate === new Date().toISOString().split('T')[0]).length}</p>
                     <p className="text-xs text-gray-300">Bugün Ödünç</p>
                 </div>
                 <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                     <p className="text-2xl font-bold">{loans.filter(l => l.returnDate === new Date().toISOString().split('T')[0]).length}</p>
                     <p className="text-xs text-gray-300">Bugün İade</p>
                 </div>
             </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4">Son Hareketler</h3>
            <div className="relative pl-4 border-l-2 border-gray-100 dark:border-gray-700 space-y-6">
            {loans.slice().reverse().slice(0, 6).map((loan, i) => {
                const book = books.find(b => b.id === loan.bookId);
                const user = users.find(u => u.id === loan.userId);
                const isReturn = loan.status === 'RETURNED';
                
                return (
                <div key={loan.id} className="relative group">
                    <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white dark:border-dark-800 ${isReturn ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{user?.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                <span className={isReturn ? 'text-green-600' : 'text-blue-600'}>
                                    {isReturn ? 'İade etti:' : 'Ödünç aldı:'}
                                </span> {book?.title}
                            </p>
                        </div>
                        <span className="text-[10px] text-gray-400 bg-gray-50 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                            {isReturn ? loan.returnDate : loan.checkoutDate}
                        </span>
                    </div>
                </div>
                )
            })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Loans;