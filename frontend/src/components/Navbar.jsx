import { Menu, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleBadge = {
    admin: 'bg-red-100 text-red-700',
    petugas: 'bg-blue-100 text-blue-700',
    staf: 'bg-green-100 text-green-700',
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <button onClick={onMenuClick} className="lg:hidden text-gray-500 hover:text-gray-700">
        <Menu size={22} />
      </button>

      <div className="hidden lg:block">
        <h1 className="text-lg font-semibold text-gray-800">
          Sistem Inventaris Peralatan Kantor
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative text-gray-500 hover:text-gray-700">
          <Bell size={20} />
        </button>
        <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${roleBadge[user?.role]}`}>
          {user?.role}
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}