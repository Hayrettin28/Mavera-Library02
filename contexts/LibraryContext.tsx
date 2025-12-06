import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Book, User, Loan, Role, ViewState } from '../types';
import { MOCK_BOOKS, MOCK_USERS, MOCK_LOANS } from '../constants';

interface LibraryContextType {
  books: Book[];
  users: User[];
  loans: Loan[];
  currentUser: User | null;
  currentView: ViewState;
  darkMode: boolean;
  scannedResult: string | null;
  
  // Actions
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  setDarkMode: (val: boolean) => void;
  setCurrentView: (view: ViewState) => void;
  
  addBook: (book: Book) => void;
  deleteBook: (id: string) => void;
  checkoutBook: (bookId: string, userId: string, days?: number) => void;
  returnBook: (loanId: string) => void;
  registerUser: (user: User) => void;
  
  setScannedResult: (result: string) => void;
  clearScannedResult: () => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

// Database Keys - Updated to Mavera namespace for clear separation
const DB_KEYS = {
  BOOKS: 'mavera_db_books',
  USERS: 'mavera_db_users',
  LOANS: 'mavera_db_loans',
  SESSION: 'mavera_db_session',
  THEME: 'mavera_db_theme'
};

export const LibraryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- DATABASE INITIALIZATION HELPER ---
  const loadFromDB = <T,>(key: string, defaultVal: T): T => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultVal;
    } catch (e) {
      console.error(`Error loading ${key} from DB`, e);
      return defaultVal;
    }
  };

  // --- STATE INITIALIZATION ---
  const [books, setBooks] = useState<Book[]>(() => loadFromDB(DB_KEYS.BOOKS, MOCK_BOOKS));
  const [users, setUsers] = useState<User[]>(() => loadFromDB(DB_KEYS.USERS, MOCK_USERS));
  const [loans, setLoans] = useState<Loan[]>(() => loadFromDB(DB_KEYS.LOANS, MOCK_LOANS));
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadFromDB(DB_KEYS.SESSION, null));
  const [darkMode, setDarkMode] = useState(() => loadFromDB(DB_KEYS.THEME, false));
  
  // View state (Transient)
  const [currentView, setCurrentView] = useState<ViewState>(() => {
    // If user is logged in, show Dashboard, else Books (Guest mode default)
    const session = loadFromDB(DB_KEYS.SESSION, null);
    return session ? 'DASHBOARD' : 'BOOKS';
  });
  
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  // --- DATABASE PERSISTENCE EFFECTS ---
  
  // Save Books on change
  useEffect(() => {
    window.localStorage.setItem(DB_KEYS.BOOKS, JSON.stringify(books));
  }, [books]);

  // Save Users on change
  useEffect(() => {
    window.localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  // Save Loans on change
  useEffect(() => {
    window.localStorage.setItem(DB_KEYS.LOANS, JSON.stringify(loans));
  }, [loans]);

  // Save Session on change
  useEffect(() => {
    if (currentUser) {
      window.localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(currentUser));
    } else {
      window.localStorage.removeItem(DB_KEYS.SESSION);
    }
  }, [currentUser]);

  // Save Theme on change
  useEffect(() => {
    window.localStorage.setItem(DB_KEYS.THEME, JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);


  // --- ACTIONS ---

  const login = (email: string, pass: string) => {
    const user = users.find(u => u.email === email && u.passwordHash === pass);
    if (user) {
      setCurrentUser(user);
      setCurrentView('DASHBOARD');
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentView('LOGIN'); 
  };

  const addBook = (book: Book) => {
    setBooks(prev => [...prev, book]);
  };

  const deleteBook = (id: string) => {
    // Prevent deleting if book has active loans
    const hasActiveLoans = loans.some(l => l.bookId === id && l.status !== 'RETURNED');
    if (hasActiveLoans) {
        alert("Bu kitap şu an ödünçte olduğu için silinemez.");
        return;
    }
    setBooks(prev => prev.filter(b => b.id !== id));
  };

  const checkoutBook = (bookId: string, userId: string, days: number = 15) => {
    const book = books.find(b => b.id === bookId);
    if (!book || book.availableCopies <= 0) return;

    // Decrease available copies
    setBooks(prev => prev.map(b => b.id === bookId ? {...b, availableCopies: b.availableCopies - 1} : b));

    const newLoan: Loan = {
      id: Math.random().toString(36).substr(2, 9),
      bookId,
      userId,
      checkoutDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
      status: 'ACTIVE',
      fineAmount: 0
    };
    setLoans(prev => [...prev, newLoan]);
  };

  const returnBook = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    // 1. Mark loan returned
    setLoans(prev => prev.map(l => l.id === loanId ? {...l, status: 'RETURNED', returnDate: new Date().toISOString().split('T')[0]} : l));

    // 2. Increase available copies
    setBooks(prev => prev.map(b => b.id === loan.bookId ? {...b, availableCopies: b.availableCopies + 1} : b));

    // 3. If there was a fine, deduct it from the user's total fines (assume paid/forgiven on return)
    if (loan.fineAmount > 0) {
        setUsers(prev => prev.map(u => {
            if (u.id === loan.userId) {
                // Deduct the specific fine amount, ensuring it doesn't go below 0
                const newFines = Math.max(0, u.currentFines - loan.fineAmount);
                return { ...u, currentFines: newFines };
            }
            return u;
        }));
    }
  };

  const registerUser = (user: User) => {
    // Check if email exists
    if (users.some(u => u.email === user.email)) {
        alert("Bu e-posta adresi ile zaten bir kayıt var.");
        return;
    }
    setUsers(prev => [...prev, user]);
  };

  const clearScannedResult = () => setScannedResult(null);

  return (
    <LibraryContext.Provider value={{
      books, users, loans, currentUser, currentView, darkMode, scannedResult,
      login, logout, setDarkMode, setCurrentView,
      addBook, deleteBook, checkoutBook, returnBook, registerUser,
      setScannedResult, clearScannedResult
    }}>
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary must be used within LibraryProvider');
  return context;
};