export enum Role {
  GUEST = 'GUEST',
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN'
}

export enum BookStatus {
  AVAILABLE = 'AVAILABLE',
  LOANED = 'LOANED',
  LOST = 'LOST',
  DAMAGED = 'DAMAGED'
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  category: string;
  publisher: string;
  year: number;
  pages: number;
  coverUrl: string;
  description: string;
  shelfLocation: string;
  totalCopies: number;
  availableCopies: number;
  status: BookStatus;
  addedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  photoUrl: string;
  memberSince: string;
  currentFines: number;
  phone?: string;
  passwordHash?: string; // Simulated
}

export interface Loan {
  id: string;
  bookId: string;
  userId: string;
  checkoutDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
  fineAmount: number;
}

export interface LibraryState {
  books: Book[];
  users: User[];
  loans: Loan[];
  currentUser: User | null;
  theme: 'light' | 'dark';
}

export type ViewState = 'DASHBOARD' | 'BOOKS' | 'MEMBERS' | 'LOANS' | 'PROFILE' | 'LOGIN' | 'REGISTER' | 'SETTINGS';