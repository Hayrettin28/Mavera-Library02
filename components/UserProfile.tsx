import React from 'react';
import { User, Loan, Book } from '../types';
import { User as UserIcon, Mail, Calendar, Phone, DollarSign, BookOpen } from 'lucide-react';

interface UserProfileProps {
  user: User;
  loans: Loan[];
  books: Book[];
}

const UserProfile: React.FC<UserProfileProps> = ({ user, loans, books }) => {
  const userLoans = loans.filter(l => l.userId === user.id);
  const activeLoans = userLoans.filter(l => l.status === 'ACTIVE' || l.status === 'OVERDUE');
  const historyLoans = userLoans.filter(l => l.status === 'RETURNED');

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-6 items-center">
        <img 
          src={user.photoUrl} 
          alt={user.name} 
          className="w-24 h-24 rounded-full object-cover border-4 border-primary-100 dark:border-primary-900"
        />
        <div className="text-center md:text-left flex-1">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{user.name}</h2>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 mt-2">
            {user.role}
          </span>
          <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1"><Mail className="w-4 h-4"/> {user.email}</div>
            {user.phone && <div className="flex items-center gap-1"><Phone className="w-4 h-4"/> {user.phone}</div>}
            <div className="flex items-center gap-1"><Calendar className="w-4 h-4"/> Kayıt: {user.memberSince}</div>
          </div>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-center min-w-[150px]">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium flex items-center justify-center gap-1">
            <DollarSign className="w-4 h-4" /> Ödenmemiş Ceza
          </p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">₺{user.currentFines.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Loans */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" /> Aktif Ödünçler
          </h3>
          {activeLoans.length === 0 ? (
            <p className="text-gray-400 text-sm">Şu anda ödünç alınmış kitap yok.</p>
          ) : (
            <div className="space-y-3">
              {activeLoans.map(loan => {
                const book = books.find(b => b.id === loan.bookId);
                const isOverdue = loan.status === 'OVERDUE';
                return (
                  <div key={loan.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                    <img src={book?.coverUrl} className="w-12 h-16 object-cover rounded" alt="cover" />
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{book?.title}</p>
                      <p className="text-xs text-gray-500">Son Tarih: {loan.dueDate}</p>
                      {isOverdue && <p className="text-xs font-bold text-red-500 mt-1">Gecikmiş! Ceza: ₺{loan.fineAmount}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* History */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" /> Okuma Geçmişi
          </h3>
           {historyLoans.length === 0 ? (
            <p className="text-gray-400 text-sm">Henüz okuma geçmişi yok.</p>
          ) : (
             <div className="space-y-3">
              {historyLoans.map(loan => {
                const book = books.find(b => b.id === loan.bookId);
                return (
                  <div key={loan.id} className="flex items-center justify-between p-2 border-b border-gray-50 dark:border-gray-700/50">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{book?.title}</span>
                    <span className="text-xs text-gray-400">İade: {loan.returnDate}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      
       {/* Digital Card Simulation */}
       <div className="flex justify-center mt-8">
         <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 rounded-xl w-full max-w-md shadow-2xl relative overflow-hidden transform hover:scale-105 transition duration-500">
            <div className="absolute top-0 right-0 p-4 opacity-20">
                <UserIcon className="w-32 h-32" />
            </div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                    <h3 className="text-lg font-bold tracking-widest uppercase">Mavera Kütüphane</h3>
                    <span className="bg-white/20 px-2 py-1 rounded text-xs">ÜYE KARTI</span>
                </div>
                <p className="text-sm text-gray-400 mb-1">Kart Sahibi</p>
                <p className="text-xl font-mono mb-6">{user.name.toUpperCase()}</p>
                <div className="flex justify-between items-end">
                    <div className="text-xs text-gray-400">
                        ID: {user.id.toUpperCase()}
                    </div>
                    {/* QR Code for User ID */}
                    <div className="bg-white p-1 rounded">
                         <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=USER:${user.id}`} 
                            alt="User QR" 
                            className="w-12 h-12"
                         />
                    </div>
                </div>
            </div>
         </div>
       </div>
    </div>
  );
};

export default UserProfile;