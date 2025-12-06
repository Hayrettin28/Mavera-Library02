import React from 'react';
import { 
  LayoutDashboard, 
  Book, 
  Users, 
  ArrowLeftRight, 
  Settings, 
  LogOut, 
  Library,
  UserCircle
} from 'lucide-react';
import { Role, ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  role: Role;
  onChangeView: (view: ViewState) => void;
  onLogout: () => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, role, onChangeView, onLogout, isOpen }) => {
  const menuItems = [
    { view: 'DASHBOARD', label: 'Panel', icon: LayoutDashboard, roles: [Role.ADMIN, Role.MEMBER] },
    { view: 'BOOKS', label: 'Kitap Envanteri', icon: Book, roles: [Role.ADMIN, Role.MEMBER, Role.GUEST] },
    { view: 'MEMBERS', label: 'Üyeler', icon: Users, roles: [Role.ADMIN] },
    { view: 'LOANS', label: 'Ödünç & İade', icon: ArrowLeftRight, roles: [Role.ADMIN] },
    { view: 'PROFILE', label: 'Profilim', icon: UserCircle, roles: [Role.MEMBER, Role.ADMIN] },
    { view: 'SETTINGS', label: 'Ayarlar', icon: Settings, roles: [Role.ADMIN] },
  ];

  const baseClasses = `fixed left-0 top-0 h-full bg-white dark:bg-dark-800 shadow-xl transition-transform duration-300 z-50 w-64 flex flex-col`;
  const transformClass = isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0';

  return (
    <aside className={`${baseClasses} ${transformClass}`}>
      <div className="p-6 flex items-center border-b border-gray-200 dark:border-gray-700">
        <Library className="w-8 h-8 text-primary-600 mr-3" />
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">
          Mavera
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            if (!item.roles.includes(role)) return null;
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <li key={item.view}>
                <button
                  onClick={() => onChangeView(item.view as ViewState)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 group
                    ${isActive 
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 font-medium' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200'}`} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {role !== Role.GUEST ? (
          <button
            onClick={onLogout}
            className="w-full flex items-center px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Çıkış Yap
          </button>
        ) : (
          <button
            onClick={() => onChangeView('LOGIN')}
            className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg shadow transition-colors"
          >
            <UserCircle className="w-5 h-5 mr-2" />
            Üye Girişi
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;