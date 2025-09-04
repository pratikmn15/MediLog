import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  FiHome, FiUser, FiCalendar, FiActivity,
  FiLogOut, FiChevronDown, FiDatabase,
  FiShield, FiPackage  // Use FiPackage instead of FiPill
} from 'react-icons/fi';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, token } = useAuth();
  const [navOpen, setNavOpen] = useState({ records: true });
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user details for sidebar display
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/user-details`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setUserDetails(response.data);
      } catch (err) {
        // If 404, user hasn't filled details yet - that's fine
        if (err.response?.status !== 404) {
          console.error('Error fetching user details for sidebar:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [token]);

  const displayName = userDetails?.fullName || 'User';
  const userCity = userDetails?.address?.city || '—';
  const userInitial = displayName.charAt(0).toUpperCase();

  // Update the navItems array to include medicines
  const navItems = [
    { label: 'Overview', icon: <FiHome />, to: '/dashboard' },
    { label: 'Profile', icon: <FiUser />, to: '/user-details' },
    {
      label: 'Records',
      icon: <FiDatabase />,
      collapsible: true,
      key: 'records',
      children: [
        { label: 'Appointments', icon: <FiCalendar />, to: '/appointments', badge: 0 },
        { label: 'Medicines', icon: <FiPackage />, to: '/medicines' }, // Changed to FiPackage
        { label: 'Vitals', icon: <FiActivity />, to: '/vitals', badge: 3 },
        { label: 'Insurance', icon: <FiShield />, to: '/insurance' }
      ]
    }
  ];

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 h-full border-r border-slate-800 bg-slate-950/90 backdrop-blur supports-[backdrop-filter]:bg-slate-950/70 flex flex-col">
        <div className="px-5 py-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center font-bold">
            MT
          </div>
          <span className="font-semibold tracking-wide">MediTracker</span>
        </div>
        
        <div className="px-5 pb-3">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Navigation</div>
          <nav className="space-y-1">
            {navItems.map(item => {
              if (item.collapsible) {
                const open = navOpen[item.key];
                return (
                  <div key={item.label}>
                    <button
                      onClick={() =>
                        setNavOpen(prev => ({ ...prev, [item.key]: !open }))
                      }
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition
                        ${open ? 'bg-slate-800/60' : 'hover:bg-slate-800/40'}
                      `}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{item.icon}</span>
                        {item.label}
                      </span>
                      <FiChevronDown
                        className={`transition-transform ${open ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        open ? 'max-h-64 mt-1' : 'max-h-0'
                      }`}
                    >
                      <div className="pl-4 space-y-1">
                        {item.children.map(ch => {
                          const active = location.pathname === ch.to;
                          return (
                            <Link
                              key={ch.label}
                              to={ch.to}
                              className={`flex items-center justify-between text-sm px-3 py-2 rounded-md
                                ${active
                                  ? 'bg-slate-800 text-white'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}
                              `}
                            >
                              <span className="flex items-center gap-2">
                                <span className="text-base">{ch.icon}</span>
                                {ch.label}
                              </span>
                              {typeof ch.badge === 'number' && ch.badge > 0 && (
                                <span className="text-xs bg-blue-600 px-2 py-0.5 rounded-full">
                                  {ch.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition
                    ${active
                      ? 'bg-slate-800 text-slate-100'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="mt-auto p-5 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-sm font-medium">
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
              ) : (
                userInitial
              )}
            </div>
            <div className="text-sm">
              <div className="font-semibold truncate max-w-[9rem]">
                {loading ? (
                  <div className="h-3 w-16 bg-slate-700 rounded animate-pulse"></div>
                ) : (
                  displayName
                )}
              </div>
              <div className="text-xs text-slate-500">
                {loading ? (
                  <div className="h-2 w-10 bg-slate-700 rounded animate-pulse mt-1"></div>
                ) : (
                  userCity
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-slate-800 hover:bg-red-600/80 text-slate-200 hover:text-white text-sm transition"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;