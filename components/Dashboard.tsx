import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Book, User, Loan, Role } from '../types';
import { TrendingUp, AlertCircle, BookOpen, Users, Book as BookIcon, CheckSquare, PlusCircle, Clock, Calendar, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { useLibrary } from '../contexts/LibraryContext';

interface DashboardProps {
  books: Book[];
  loans: Loan[];
  users: User[];
  currentUser: User | null;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

const Dashboard: React.FC<DashboardProps> = ({ books, loans, users, currentUser }) => {
  const { setCurrentView } = useLibrary();
  const isAdmin = currentUser?.role === Role.ADMIN;
  const isMember = currentUser?.role === Role.MEMBER;

  // Stats Logic
  const totalBooks = books.reduce((acc, book) => acc + book.totalCopies, 0) || 1; // Prevent div by zero
  const totalMembers = users.filter(u => u.role === Role.MEMBER).length;
  const activeLoans = loans.filter(l => l.status === 'ACTIVE').length;
  const overdueLoans = loans.filter(l => l.status === 'OVERDUE').length;
  const returnedLoans = loans.filter(l => l.status === 'RETURNED').length;
  
  // User specific stats
  const myLoans = currentUser ? loans.filter(l => l.userId === currentUser.id && l.status === 'ACTIVE') : [];
  const myOverdue = currentUser ? loans.filter(l => l.userId === currentUser.id && l.status === 'OVERDUE') : [];
  const myFines = currentUser ? currentUser.currentFines : 0;

  // Chart Data Preparation
  const booksByCategory = books.reduce((acc, book) => {
    acc[book.category] = (acc[book.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(booksByCategory).map(key => ({
    name: key,
    value: booksByCategory[key]
  })).sort((a, b) => b.value - a.value); // Sort for table

  const loansByStatus = [
    { name: 'Aktif', count: activeLoans, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { name: 'Gecikmiş', count: overdueLoans, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
    { name: 'İade', count: returnedLoans, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' }
  ];

  if (isMember) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
             <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Merhaba, {currentUser?.name} 👋</h2>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">Kütüphane durumun ve okumaların burada.</p>
             </div>
             <div className="hidden md:block text-right">
                 <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Üyelik Tarihi</p>
                 <p className="text-gray-800 dark:text-white font-mono">{currentUser?.memberSince}</p>
             </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
           <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 md:p-8 rounded-3xl shadow-xl shadow-blue-500/20 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition duration-500">
                <BookOpen className="w-24 h-24 md:w-32 md:h-32" />
            </div>
            <div className="relative z-10">
              <p className="text-blue-100 font-medium mb-1">Ödünç Aldıkların</p>
              <p className="text-4xl md:text-5xl font-bold tracking-tight">{myLoans.length}</p>
              <p className="text-xs md:text-sm text-blue-200 mt-4 font-light">Aktif olarak okuduğun kitap sayısı</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-500 to-red-600 p-6 md:p-8 rounded-3xl shadow-xl shadow-red-500/20 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition duration-500">
                <AlertCircle className="w-24 h-24 md:w-32 md:h-32" />
            </div>
            <div className="relative z-10">
              <p className="text-red-100 font-medium mb-1">Gecikenler</p>
              <p className="text-4xl md:text-5xl font-bold tracking-tight">{myOverdue.length}</p>
              <p className="text-xs md:text-sm text-red-200 mt-4 font-light">Lütfen en kısa sürede iade et</p>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 p-6 md:p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden">
             <div className="flex flex-col h-full justify-between">
                <div>
                     <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Toplam Ceza</p>
                     <p className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white">₺{myFines.toFixed(2)}</p>
                </div>
                <div className="mt-4">
                     <button className="w-full py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                         Detayları Gör
                     </button>
                </div>
             </div>
          </div>
        </div>
        
        {/* Recommendation Section for Member */}
        <div className="bg-indigo-900 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden text-white">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
                <div className="max-w-xl text-center md:text-left">
                    <span className="inline-block px-3 py-1 bg-indigo-700 rounded-full text-xs font-bold mb-3 tracking-wider">YAPAY ZEKA DESTEKLİ</span>
                    <h3 className="text-2xl md:text-3xl font-bold mb-3">Sırada ne okumalısın?</h3>
                    <p className="text-indigo-200 mb-6 md:mb-8 text-sm md:text-lg">Okuma geçmişine ve ilgi alanlarına göre yapay zeka sana özel kitap önerilerinde bulunsun.</p>
                    <button 
                        onClick={() => setCurrentView('BOOKS')}
                        className="px-6 py-3 md:px-8 md:py-4 bg-white text-indigo-900 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition duration-300 flex items-center gap-2 mx-auto md:mx-0"
                    >
                        <BookIcon className="w-5 h-5" />
                        Kitapları Keşfet
                    </button>
                </div>
                <div className="hidden md:block">
                    {/* Abstract visual */}
                    <div className="w-48 h-48 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full blur-3xl opacity-50 absolute right-10 top-10"></div>
                    <BookIcon className="w-32 h-32 md:w-40 md:h-40 text-indigo-300 relative z-10" strokeWidth={1} />
                </div>
            </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 dark:text-white tracking-tight">Yönetim Paneli</h2>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">Kütüphane envanteri ve üye hareketlerinin genel bakışı.</p>
          </div>
          <div className="flex items-center gap-3 text-xs md:text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-dark-800 px-4 py-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 w-fit">
             <Calendar className="w-4 h-4 text-primary-500" />
             {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
      </div>
      
      {/* Stat Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
            title="Toplam Envanter" 
            value={totalBooks} 
            icon={BookIcon} 
            trend="+5 Bu hafta" 
            color="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
        />
        <StatCard 
            title="Aktif Üyeler" 
            value={totalMembers} 
            icon={Users} 
            trend="+2 Yeni" 
            color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" 
        />
        <StatCard 
            title="Okunan Kitaplar" 
            value={activeLoans} 
            icon={BookOpen} 
            trend="%12 Artış" 
            color="bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400" 
        />
        <StatCard 
            title="Geciken İadeler" 
            value={overdueLoans} 
            icon={Clock} 
            trend="Aksiyon Gerekli" 
            color="bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400" 
            isAlert 
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <QuickAction 
            onClick={() => setCurrentView('LOANS')} 
            title="Hızlı Ödünç" 
            desc="Kitap çıkışı yap"
            icon={PlusCircle}
            color="text-blue-600"
            bg="bg-blue-50 dark:bg-blue-900/10"
          />
          <QuickAction 
            onClick={() => setCurrentView('LOANS')} 
            title="İade Al" 
            desc="Kitap girişi yap"
            icon={CheckSquare}
            color="text-emerald-600"
            bg="bg-emerald-50 dark:bg-emerald-900/10"
          />
           <QuickAction 
            onClick={() => setCurrentView('MEMBERS')} 
            title="Üye Ekle" 
            desc="Yeni kayıt oluştur"
            icon={Users}
            color="text-violet-600"
            bg="bg-violet-50 dark:bg-violet-900/10"
          />
      </div>

      {/* Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white dark:bg-dark-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Kategori Dağılımı Grafiği</h3>
            <PieChartIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 md:h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: 'transparent', color: '#fff', borderRadius: '12px', padding: '10px' }}
                    itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white dark:bg-dark-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Hareket Grafiği</h3>
             <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 md:h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loansByStatus} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: 'transparent', color: '#fff', borderRadius: '12px', padding: '10px' }}
                />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                    {loansByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 1 ? '#ef4444' : index === 2 ? '#10b981' : '#3b82f6'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* DETAILED TABLES SECTION */}
      <h3 className="text-xl font-bold text-gray-800 dark:text-white pt-4">Detaylı Analiz Tabloları</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Aesthetic Category Table */}
          <div className="bg-white dark:bg-dark-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
                  <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                      <BookIcon className="w-5 h-5 text-purple-500" />
                      Kategori Dağılımı
                  </h4>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 dark:bg-dark-900 text-gray-500 dark:text-gray-400">
                          <tr>
                              <th className="p-4 font-medium">Kategori Adı</th>
                              <th className="p-4 font-medium text-center">Kitap Sayısı</th>
                              <th className="p-4 font-medium w-2/5">Dağılım</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {pieData.map((item, index) => {
                              const percentage = Math.round((item.value / books.length) * 100);
                              return (
                                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                      <td className="p-4 font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                          {item.name}
                                      </td>
                                      <td className="p-4 text-center font-bold text-gray-600 dark:text-gray-300">
                                          {item.value}
                                      </td>
                                      <td className="p-4">
                                          <div className="flex items-center gap-3">
                                              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                  <div 
                                                      className="h-full rounded-full transition-all duration-1000" 
                                                      style={{ width: `${percentage}%`, backgroundColor: COLORS[index % COLORS.length] }}
                                                  ></div>
                                              </div>
                                              <span className="text-xs font-bold text-gray-400 w-8 text-right">%{percentage}</span>
                                          </div>
                                      </td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          </div>

          {/* Aesthetic Movement Table */}
          <div className="bg-white dark:bg-dark-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
                  <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-500" />
                      Hareket Durumu
                  </h4>
              </div>
              <div className="overflow-x-auto h-full">
                  <table className="w-full text-left text-sm h-full">
                      <thead className="bg-gray-50 dark:bg-dark-900 text-gray-500 dark:text-gray-400">
                          <tr>
                              <th className="p-4 font-medium">Durum Tipi</th>
                              <th className="p-4 font-medium text-right">Toplam İşlem</th>
                              <th className="p-4 font-medium text-right">Durum</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {loansByStatus.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group">
                                  <td className="p-4">
                                      <div className="flex items-center gap-3">
                                          <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                                              {index === 0 && <BookOpen className="w-4 h-4" />}
                                              {index === 1 && <Clock className="w-4 h-4" />}
                                              {index === 2 && <CheckSquare className="w-4 h-4" />}
                                          </div>
                                          <div>
                                              <p className="font-bold text-gray-800 dark:text-white">{item.name}</p>
                                              <p className="text-xs text-gray-400">
                                                  {index === 0 ? 'Şu an okunanlar' : index === 1 ? 'Süresi dolanlar' : 'Rafa dönenler'}
                                              </p>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="p-4 text-right">
                                      <span className="text-lg font-bold text-gray-700 dark:text-gray-200">{item.count}</span>
                                  </td>
                                  <td className="p-4 text-right">
                                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.bg} ${item.color}`}>
                                          {item.count > 0 ? 'AKTİF' : 'BOŞ'}
                                      </span>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, color, isAlert }: any) => {
  return (
    <div className="bg-white dark:bg-dark-800 p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition duration-300 flex flex-col justify-between h-32 md:h-36">
      <div className="flex justify-between items-start">
        <div className={`p-2 md:p-3 rounded-2xl ${color}`}>
            <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        {trend && (
            <span className={`text-[10px] md:text-xs font-bold px-2 py-1 rounded-full ${isAlert ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {trend}
            </span>
        )}
      </div>
      <div>
        <p className="text-2xl md:text-3xl font-extrabold text-gray-800 dark:text-white mt-2">{value}</p>
        <p className="text-xs md:text-sm font-medium text-gray-400 dark:text-gray-500">{title}</p>
      </div>
    </div>
  );
};

const QuickAction = ({ onClick, title, desc, icon: Icon, color, bg }: any) => (
    <button onClick={onClick} className="group bg-white dark:bg-dark-800 p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-primary-200 transition text-left flex items-center gap-3 md:gap-4">
        <div className={`p-3 md:p-4 rounded-2xl ${bg} ${color} group-hover:scale-110 transition`}>
            <Icon className="w-6 h-6 md:w-8 md:h-8" />
        </div>
        <div>
            <h3 className="font-bold text-base md:text-lg text-gray-800 dark:text-white group-hover:text-primary-600 transition">{title}</h3>
            <p className="text-xs md:text-sm text-gray-500">{desc}</p>
        </div>
    </button>
);

export default Dashboard;