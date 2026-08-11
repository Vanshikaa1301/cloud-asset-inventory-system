import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import SearchBar from '../common/SearchBar';
import {
  Menu, Bell, ChevronDown, Sun, Moon, User, LogOut, Settings as SettingsIcon
} from 'lucide-react';

const notifications = [
  { id: 1, text: 'Public S3 bucket detected', time: '2 min ago', unread: true },
  { id: 2, text: 'EC2 instance stopped', time: '1 hour ago', unread: true },
  { id: 3, text: 'New asset discovered', time: '3 hours ago', unread: false },
];

export default function TopNavbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('Production AWS');
  const [selectedRegion, setSelectedRegion] = useState('us-east-1');
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (value) => {
    setSearch(value);
    if (value.trim()) {
      navigate(`/dashboard/assets?q=${encodeURIComponent(value.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="hidden md:block">
            <SearchBar value={search} onChange={handleSearch} placeholder="Search assets, resources..." className="w-80" />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="hidden md:block text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option>Production AWS</option>
            <option>Staging AWS</option>
            <option>Development AWS</option>
          </select>

          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="hidden md:block text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="us-east-1">US East (Virginia)</option>
            <option value="us-west-2">US West (Oregon)</option>
            <option value="eu-west-1">EU (Ireland)</option>
            <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
          </select>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${n.unread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{n.text}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 text-center">
                  <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">View all</button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-gray-300" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </button>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{user?.name?.charAt(0) || 'A'}</span>
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name || 'Aditya'}</span>
              <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
            </button>
            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'Aditya'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'admin@company.com'}</p>
                </div>
                <div className="py-1">
                  <button onClick={() => { setShowProfile(false); navigate('/dashboard/settings'); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <SettingsIcon className="w-4 h-4" /> Settings
                  </button>
                  <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
