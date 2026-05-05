import { Menu, LogOut, Bell, User as UserIcon, Package } from 'lucide-react'; // Tambahkan icon Package
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
    moderator: 'bg-blue-100 text-blue-700',
    staff: 'bg-green-100 text-green-700',
  };

  const badgeStyle = roleBadge[user?.role?.toLowerCase()] || 'bg-gray-100 text-gray-700';

  return (
    <header className="bg-white border-b border-gray-200 h-16 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick} 
          className="lg:hidden text-gray-500 hover:text-gray-900 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
        >
          <Menu size={20} />
        </button>

        <div className="hidden lg:flex items-center gap-2.5">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
            <Package size={20} className="text-white" />
          </div>
          <div className="text-xl font-extrabold bg-linear-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent tracking-tight">
            Office Inventory
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <button className="relative text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

        <div className="flex items-center gap-3">
           <div className="hidden sm:flex flex-col items-end">
             <span className="text-sm font-semibold text-slate-800 leading-none">
               {user?.name || 'User'}
             </span>
             <span className={`text-[10px] font-bold px-2 py-0.5 mt-1 rounded-full uppercase tracking-wider ${badgeStyle}`}>
               {user?.role || 'Staff'}
             </span>
           </div>
           
           <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
             {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={16} />}
           </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center text-gray-400 hover:text-red-600 ml-1 p-2 rounded-lg hover:bg-red-50 transition-colors"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}