import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Building2, MapPin, BookOpen, Layers, Grid3X3,
  Users, ClipboardList, LogOut, GraduationCap, UserCog
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NavItem = ({ to, icon: Icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
       ${isActive
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
    }
  >
    <Icon size={18} />
    {label}
  </NavLink>
);

export default function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
  };

  const isAdmin = user?.role === 'admin';
  const isOfficer = user?.role === 'admission_officer';
  const isManagement = user?.role === 'management';

  return (
    <div className="flex flex-col h-full py-4 px-3 overflow-y-auto">
      <nav className="flex-1 space-y-1">
        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" onClick={onNavigate} />

        {/* Master Setup - Admin only */}
        {isAdmin && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Master Setup</p>
            </div>
            <NavItem to="/institutions" icon={Building2}   label="Institutions"  onClick={onNavigate} />
            <NavItem to="/campuses"     icon={MapPin}       label="Campuses"      onClick={onNavigate} />
            <NavItem to="/departments"  icon={Layers}       label="Departments"   onClick={onNavigate} />
            <NavItem to="/programs"     icon={BookOpen}     label="Programs"      onClick={onNavigate} />
            <NavItem to="/seat-matrix"  icon={Grid3X3}      label="Seat Matrix"   onClick={onNavigate} />
          </>
        )}

        {/* Admission Operations - Admin + Officer */}
        {(isAdmin || isOfficer) && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admissions</p>
            </div>
            <NavItem to="/applicants" icon={Users}          label="Applicants"    onClick={onNavigate} />
          </>
        )}

        {/* View for all roles */}
        <div className={`${isAdmin || isOfficer ? '' : 'pt-4'} pb-1 px-3`}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reports</p>
        </div>
        <NavItem to="/admissions" icon={GraduationCap} label="Confirmed Admissions" onClick={onNavigate} />
      </nav>

      {/* User info + logout */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <span className="text-indigo-700 font-semibold text-xs">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize truncate">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
