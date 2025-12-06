import React, { useState, useEffect } from 'react';
import { Book, Role, BookStatus } from '../types';
import { Search, Plus, Bot, Trash, X, QrCode, MapPin, ArrowRight, BookOpen } from 'lucide-react';
import { getBookRecommendations } from '../services/geminiService';
import { useLibrary } from '../contexts/LibraryContext';

interface BooksProps {
  books: Book[];
  role: Role;
  onAddBook: (book: Book) => void;
  onDeleteBook: (id: string) => void;
}

const Books: React.FC<BooksProps> = ({ books, role, onAddBook, onDeleteBook }) => {
  const { scannedResult, clearScannedResult, setScannedResult, setCurrentView } = useLibrary();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [showAddModal, setShowAddModal] = useState(false);
  const [aiRec, setAiRec] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // State for QR Modal (Showing generated QR)
  const [selectedQrBook, setSelectedQrBook] = useState<Book | null>(null);

  // State for Scanned Result Modal (Showing details after scan)
  const [scannedBook, setScannedBook] = useState<Book | null>(null);

  // New book state
  const [newBookIsbn, setNewBookIsbn] = useState('');
  const [newBookDetails, setNewBookDetails] = useState<Partial<Book>>({
    title: '', author: '', category: '', totalCopies: 1, shelfLocation: ''
  });

  // Handle Scanned Result from Context
  useEffect(() => {
    if (scannedResult) {
        // If it starts with USER:, ignore it here (User profile or Loans handles it)
        if (scannedResult.startsWith('USER:')) return;

        try {
            const decoded = decodeURIComponent(scannedResult);
            const data = JSON.parse(decoded);
            if (data.id) {
                const found = books.find(b => b.id === data.id);
                if (found) {
                    setScannedBook(found);
                    // We handle the result locally, so clear global state to prevent loops
                    // But we might need it if we navigate to Loans, handled by handleGoToLoans
                    clearScannedResult(); 
                }
            }
        } catch (e) {
            console.error("QR Parse Error in Books:", e);
        }
    }
  }, [scannedResult, books, clearScannedResult]);

  const categories = ['Tümü', ...Array.from(new Set(books.map(b => b.category)))];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.isbn.includes(searchTerm);
    const matchesCategory = selectedCategory === 'Tümü' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAiRecommendation = async () => {
    setIsAiLoading(true);
    setAiRec(null);
    const titles = books.map(b => b.title);
    const result = await getBookRecommendations(searchTerm || "genel ilginç kitaplar", titles);
    setAiRec(result);
    setIsAiLoading(false);
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    const newBook: Book = {
        id: Math.random().toString(36).substr(2, 9),
        isbn: newBookIsbn,
        title: newBookDetails.title || 'Başlıksız',
        author: newBookDetails.author || 'Bilinmiyor',
        category: newBookDetails.category || 'Genel',
        publisher: newBookDetails.publisher || '',
        year: newBookDetails.year || new Date().getFullYear(),
        pages: newBookDetails.pages || 0,
        coverUrl: newBookDetails.coverUrl || `https://picsum.photos/200/300?random=${Math.floor(Math.random()*100)}`,
        description: newBookDetails.description || '',
        shelfLocation: newBookDetails.shelfLocation || 'Danışma',
        totalCopies: newBookDetails.totalCopies || 1,
        availableCopies: newBookDetails.totalCopies || 1,
        status: BookStatus.AVAILABLE,
        addedAt: new Date().toISOString().split('T')[0]
    };
    onAddBook(newBook);
    setShowAddModal(false);
    setNewBookDetails({});
    setNewBookIsbn('');
  };

  const getQrData = (book: Book) => {
    const data = {
        id: book.id,
        isbn: book.isbn,
        title: book.title,
        loc: book.shelfLocation
    };
    return encodeURIComponent(JSON.stringify(data));
  };

  const handleGoToLoans = () => {
      if (scannedBook) {
          // Re-inject the data into context so Loans component can pick it up automatically
          const qrData = getQrData(scannedBook);
          setScannedResult(qrData); 
          setCurrentView('LOANS');
      }
  };

  // Standard input class for modals - using system colors for better visibility
  const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-primary-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors";

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Kitap Envanteri</h2>
        
        <div className="flex gap-2 w-full md:w-auto">
          {role === Role.ADMIN && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center w-full md:w-auto px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              Kitap Ekle
            </button>
          )}
        </div>
      </div>

      {/* Search & AI Bar - Mobile Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="lg:col-span-3 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Başlık, yazar veya ISBN ile ara..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 outline-none transition shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
            <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-800 text-gray-800 dark:text-gray-200 outline-none shadow-sm"
            >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button 
                onClick={handleAiRecommendation}
                disabled={isAiLoading}
                className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm flex items-center justify-center transition disabled:opacity-50"
                title="Yapay Zeka Kütüphanecisine Sor"
            >
                {isAiLoading ? <span className="animate-spin text-xl">✨</span> : <Bot className="w-5 h-5" />}
            </button>
        </div>
      </div>

      {/* AI Result Area */}
      {aiRec && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-4 rounded-xl flex items-start gap-3 animate-fade-in">
             <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
             <div>
                <h4 className="font-semibold text-purple-900 dark:text-purple-300">AI Önerisi:</h4>
                <p className="text-purple-800 dark:text-purple-200 text-sm mt-1">{aiRec}</p>
             </div>
             <button onClick={() => setAiRec(null)} className="ml-auto text-purple-400 hover:text-purple-600"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Book Grid - Responsive Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredBooks.map(book => (
          <div key={book.id} className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition group flex flex-col">
            <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
               <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
               <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                 <MapPin className="w-3 h-3" /> {book.shelfLocation}
               </div>
               
               {/* Mobile: Always show QR button, Desktop: Show on hover */}
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 md:opacity-0 md:group-hover:opacity-100">
                  <button 
                    onClick={() => setSelectedQrBook(book)}
                    className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium transform translate-y-4 group-hover:translate-y-0 transition duration-300 flex items-center shadow-lg hover:bg-gray-100"
                  >
                    <QrCode className="w-4 h-4 mr-2" /> QR Göster
                  </button>
               </div>
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-800 dark:text-white line-clamp-1 text-base md:text-lg" title={book.title}>{book.title}</h3>
                  <div className="flex gap-1">
                      {/* Mobile QR Icon */}
                      <button 
                        onClick={() => setSelectedQrBook(book)}
                        className="text-gray-400 hover:text-primary-500 transition lg:hidden"
                        title="Show QR Code"
                      >
                        <QrCode className="w-5 h-5" />
                      </button>
                      {role === Role.ADMIN && (
                          <button onClick={() => onDeleteBook(book.id)} className="text-gray-400 hover:text-red-500 transition">
                              <Trash className="w-4 h-4" />
                          </button>
                      )}
                  </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{book.author}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                    {book.category}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${book.availableCopies > 0 ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300'}`}>
                    {book.availableCopies > 0 ? `${book.availableCopies} Stokta` : 'Tükendi'}
                </span>
              </div>
              
              <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-400">
                <span>{book.publisher}, {book.year}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Show Generated QR Code */}
      {selectedQrBook && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 relative animate-fade-in-up m-4">
                <button onClick={() => setSelectedQrBook(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white">
                    <X className="w-6 h-6" />
                </button>
                <div className="flex flex-col items-center text-center">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{selectedQrBook.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{selectedQrBook.author}</p>
                    
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-inner mb-6">
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${getQrData(selectedQrBook)}`} 
                            alt="Book QR" 
                            className="w-48 h-48"
                        />
                    </div>
                    
                    <div className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-left space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Raf Konumu:</span>
                            <span className="font-bold text-gray-800 dark:text-white flex items-center">
                                <MapPin className="w-3 h-3 mr-1 text-primary-500" />
                                {selectedQrBook.shelfLocation}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* MODAL: Show Scanned Result Details */}
      {scannedBook && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
           <div className="bg-white dark:bg-dark-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all scale-100 m-2">
              <div className="relative h-48 bg-gray-100">
                  <img src={scannedBook.coverUrl} className="w-full h-full object-cover opacity-90" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                      <h2 className="text-2xl font-bold text-white shadow-sm leading-tight">{scannedBook.title}</h2>
                  </div>
                  <button onClick={() => setScannedBook(null)} className="absolute top-4 right-4 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 backdrop-blur-sm">
                      <X className="w-5 h-5" />
                  </button>
              </div>
              <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 pb-4">
                      <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg text-primary-600">
                          <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                          <p className="text-sm text-gray-400">Yazar</p>
                          <p className="font-semibold text-lg">{scannedBook.author}</p>
                      </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 pb-4">
                      <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg text-orange-600">
                          <MapPin className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                          <p className="text-sm text-gray-400">Raf Konumu</p>
                          <p className="font-bold text-2xl text-gray-800 dark:text-white">{scannedBook.shelfLocation}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${scannedBook.availableCopies > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {scannedBook.availableCopies > 0 ? 'STOKTA' : 'TÜKENDİ'}
                      </div>
                  </div>

                  <div className="pt-2">
                       {role === Role.ADMIN ? (
                           <button 
                             onClick={handleGoToLoans}
                             className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2"
                           >
                               İşlem Yap (Ödünç/İade) <ArrowRight className="w-5 h-5" />
                           </button>
                       ) : (
                           <button 
                             onClick={() => setScannedBook(null)}
                             className="w-full py-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-bold transition"
                           >
                               Kapat
                           </button>
                       )}
                  </div>
              </div>
           </div>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto m-2">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Yeni Kitap Ekle</h3>
                    <button onClick={() => setShowAddModal(false)}><X className="w-6 h-6 text-gray-500" /></button>
                </div>
                <form onSubmit={handleSaveBook} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ISBN / Barkod</label>
                        <input 
                            required
                            value={newBookIsbn}
                            onChange={e => setNewBookIsbn(e.target.value)}
                            className={inputClass}
                            placeholder="ISBN Girin"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kitap Adı</label>
                            <input 
                                required
                                value={newBookDetails.title || ''}
                                onChange={e => setNewBookDetails({...newBookDetails, title: e.target.value})}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yazar</label>
                            <input 
                                required
                                value={newBookDetails.author || ''}
                                onChange={e => setNewBookDetails({...newBookDetails, author: e.target.value})}
                                className={inputClass}
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="col-span-2 md:col-span-1">
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                            <input 
                                value={newBookDetails.category || ''}
                                onChange={e => setNewBookDetails({...newBookDetails, category: e.target.value})}
                                className={inputClass}
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Raf Yeri</label>
                            <input 
                                value={newBookDetails.shelfLocation || ''}
                                onChange={e => setNewBookDetails({...newBookDetails, shelfLocation: e.target.value})}
                                className={inputClass}
                            />
                        </div>
                         <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adet</label>
                            <input 
                                type="number"
                                min="1"
                                value={newBookDetails.totalCopies || 1}
                                onChange={e => setNewBookDetails({...newBookDetails, totalCopies: parseInt(e.target.value)})}
                                className={inputClass}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Açıklama</label>
                        <textarea 
                            value={newBookDetails.description || ''}
                            onChange={e => setNewBookDetails({...newBookDetails, description: e.target.value})}
                            className={inputClass}
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 w-full md:w-auto">
                            Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Books;