import { Book, User, Loan, Role, BookStatus } from './types';

export const MOCK_BOOKS: Book[] = [
  {
    id: '1',
    isbn: '9780132350884',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    category: 'Bilgisayar Bilimi',
    publisher: 'Prentice Hall',
    year: 2008,
    pages: 464,
    coverUrl: 'https://picsum.photos/200/300?random=1',
    description: 'Çevik Yazılım İşçiliği El Kitabı',
    shelfLocation: 'A-12',
    totalCopies: 5,
    availableCopies: 3,
    status: BookStatus.AVAILABLE,
    addedAt: '2023-01-15'
  },
  {
    id: '2',
    isbn: '9780321125217',
    title: 'Domain-Driven Design',
    author: 'Eric Evans',
    category: 'Bilgisayar Bilimi',
    publisher: 'Addison-Wesley',
    year: 2003,
    pages: 560,
    coverUrl: 'https://picsum.photos/200/300?random=2',
    description: 'Yazılımın Kalbindeki Karmaşıklıkla Mücadele',
    shelfLocation: 'A-13',
    totalCopies: 2,
    availableCopies: 0,
    status: BookStatus.LOANED,
    addedAt: '2023-02-10'
  },
  {
    id: '3',
    isbn: '9780061120084',
    title: 'Bülbülü Öldürmek',
    author: 'Harper Lee',
    category: 'Roman',
    publisher: 'Harper Perennial',
    year: 1960,
    pages: 324,
    coverUrl: 'https://picsum.photos/200/300?random=3',
    description: 'Güneyde geçen unutulmaz bir çocukluk romanı.',
    shelfLocation: 'F-05',
    totalCopies: 10,
    availableCopies: 8,
    status: BookStatus.AVAILABLE,
    addedAt: '2023-03-05'
  },
  {
    id: '4',
    isbn: '9780451524935',
    title: '1984',
    author: 'George Orwell',
    category: 'Roman',
    publisher: 'Signet Classic',
    year: 1949,
    pages: 328,
    coverUrl: 'https://picsum.photos/200/300?random=4',
    description: 'Distopik bir sosyal bilim kurgu romanı.',
    shelfLocation: 'F-06',
    totalCopies: 8,
    availableCopies: 8,
    status: BookStatus.AVAILABLE,
    addedAt: '2023-03-10'
  },
  {
    id: '5',
    isbn: '9780743273565',
    title: 'Muhteşem Gatsby',
    author: 'F. Scott Fitzgerald',
    category: 'Roman',
    publisher: 'Scribner',
    year: 1925,
    pages: 180,
    coverUrl: 'https://picsum.photos/200/300?random=5',
    description: 'Amerikan rüyası hakkında bir roman.',
    shelfLocation: 'F-02',
    totalCopies: 4,
    availableCopies: 2,
    status: BookStatus.AVAILABLE,
    addedAt: '2023-04-01'
  }
];

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Yönetici Kütüphaneci',
    email: 'admin@library.com',
    role: Role.ADMIN,
    photoUrl: 'https://picsum.photos/100/100?random=u1',
    memberSince: '2022-01-01',
    currentFines: 0,
    passwordHash: 'admin123' 
  },
    {
    id: 'u4',
    name: 'Yönetici Kütüphaneci',
    email: 'hs@admin.com',
    role: Role.ADMIN,
    photoUrl: 'https://picsum.photos/100/100?random=u1',
    memberSince: '2022-01-01',
    currentFines: 0,
    passwordHash: 'admin123' 
  },
  {
    id: 'u2',
    name: 'Ayşe Yılmaz',
    email: 'ayse@example.com',
    role: Role.MEMBER,
    photoUrl: 'https://picsum.photos/100/100?random=u2',
    memberSince: '2023-05-12',
    currentFines: 15.00,
    phone: '555-0123',
    passwordHash: 'user123'
  },
  {
    id: 'u3',
    name: 'Mehmet Demir',
    email: 'mehmet@example.com',
    role: Role.MEMBER,
    photoUrl: 'https://picsum.photos/100/100?random=u3',
    memberSince: '2023-06-01',
    currentFines: 0,
    passwordHash: 'user123'
  }
];

export const MOCK_LOANS: Loan[] = [
  {
    id: 'l1',
    bookId: '2',
    userId: 'u2',
    checkoutDate: '2023-10-01',
    dueDate: '2023-10-15',
    status: 'OVERDUE',
    fineAmount: 15.00
  },
  {
    id: 'l2',
    bookId: '5',
    userId: 'u2',
    checkoutDate: '2023-10-20',
    dueDate: '2023-11-03',
    status: 'ACTIVE',
    fineAmount: 0
  }
];