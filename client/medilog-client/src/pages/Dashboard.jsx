import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiUser, FiCalendar, FiActivity,
  FiLogOut, FiChevronDown, FiSearch, FiDatabase,
  FiShield, FiAlertTriangle
} from 'react-icons/fi';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, logout, isAuthenticated, authLoading } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [navOpen, setNavOpen] = useState({ records: true });
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    console.debug('[Dashboard] mount effect token=', token, 'authLoading=', authLoading);
    if (authLoading) return;
    if (!token) return; // do NOT navigate here; let guard or UI decide
    let cancelled = false;
    const fetchData = async () => {
      try {
        console.debug('[Dashboard] fetching user-details');
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/user-details`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!cancelled) setUserDetails(res.data);
      } catch (e) {
        console.debug('[Dashboard] fetch error status=', e.response?.status);
        if (e.response?.status === 401) {
          // optional: don't logout immediately; show message
          if (!cancelled) setError('Session expired. Please re-login.');
        } else if (e.response?.status !== 404 && !cancelled) {
          setError('Failed to load data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [token, authLoading]);

  const displayName = userDetails?.fullName || 'User';

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
        { label: 'Vitals', icon: <FiActivity />, to: '/vitals', badge: 3 },
        { label: 'Insurance', icon: <FiShield />, to: '/insurance' }
      ]
    }
  ];

  // Helper to safely count entries whether value is a CSV string or an array
  const countEntries = (val) => {
    if (!val) return 0;
    if (Array.isArray(val)) return val.filter(Boolean).length;
    return String(val)
      .split(',')
      .map(s => s.trim())
      .filter(Boolean).length;
  };

  const filteredCards = [
    {
      title: 'Profile Status',
      value: userDetails ? 'Complete' : 'Incomplete',
      accent: userDetails ? 'text-green-400' : 'text-yellow-400',
      body: userDetails
        ? 'Your profile is up to date.'
        : 'Add medical + contact info for better experience.'
    },
    {
      title: 'Medical Overview',
      value: countEntries(userDetails?.chronicDiseases),
      accent: 'text-blue-400',
      body: 'Chronic condition entries'
    },
    {
      title: 'Medications',
      value: countEntries(userDetails?.currentMedications),
      accent: 'text-purple-400',
      body: 'Active medications tracked'
    },
    {
      title: 'Allergies',
      value: countEntries(userDetails?.allergies),
      accent: 'text-red-400',
      body: 'Registered allergies'
    }
  ].filter(c =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.body.toLowerCase().includes(query.toLowerCase())
  );

  // Helpers to safely render complex medical fields
  const formatValue = (v) => {
    if (!v || (Array.isArray(v) && v.length === 0)) return '—';
    if (Array.isArray(v)) {
      if (v.length && typeof v[0] === 'object' && v[0] !== null) {
        // Array of objects (e.g. surgeries) -> list of names or JSON fallback
        return v.map(o => o.name || o.title || JSON.stringify(o)).join(', ');
      }
      return v.filter(Boolean).join(', ');
    }
    if (typeof v === 'object') {
      return v.name || v.title || JSON.stringify(v);
    }
    return String(v);
  };

  const formatSurgeriesElement = (surgeries) => {
    if (!surgeries || (Array.isArray(surgeries) && surgeries.length === 0)) return '—';
    if (!Array.isArray(surgeries)) surgeries = [surgeries];
    return (
      <ul className="list-disc ml-4 space-y-1 text-slate-300 marker:text-slate-500">
        {surgeries.map((s, i) => (
          <li key={s._id || i} className="text-xs leading-snug">
            <span className="font-medium text-slate-200">{s.name || 'Procedure'}</span>
            {s.date && (
              <span className="text-slate-400"> — {new Date(s.date).toLocaleDateString()}</span>
            )}
            {s.notes && (
              <span className="block text-slate-500">{s.notes}</span>
            )}
          </li>
        ))}
      </ul>
    );
  };

  const SkeletonCard = () => (
    <div className="rounded-xl bg-slate-800/40 border border-slate-700/60 p-5 animate-pulse space-y-4">
      <div className="h-4 w-1/3 bg-slate-700 rounded" />
      <div className="h-8 w-16 bg-slate-700 rounded" />
      <div className="h-3 w-2/3 bg-slate-700 rounded" />
    </div>
  );

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-slate-300">
        Initializing...
      </div>
    );
  }

  if (!token && !authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-slate-300">
        <div className="space-y-4 text-center">
          <p>No active session.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-md text-sm"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

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
              {displayName.charAt(0)}
            </div>
            <div className="text-sm">
              <div className="font-semibold truncate max-w-[9rem]">{displayName}</div>
              <div className="text-xs text-slate-500">
                {userDetails?.address?.city || '—'}
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

      {/* Main */}
      <main className="flex-1 h-full overflow-y-auto">
        <div className="px-8 pt-8 pb-20 space-y-8">
          {/* Header + Search */}
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Dashboard
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Welcome back, {displayName}. Manage your health info.
                </p>
              </div>
              <div className="relative max-w-md">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search insights..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm placeholder:text-slate-500"
                />
              </div>
            </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-900/40 border border-red-800 rounded-lg text-sm text-red-300">
              <FiAlertTriangle className="text-lg shrink-0" />
              {error}
            </div>
          )}

          {/* Stats / Cards */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">
              Overview
            </h2>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                : filteredCards.map(card => (
                  <div
                    key={card.title}
                    className="group relative rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 transition p-5"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs uppercase tracking-wide text-slate-500">
                        {card.title}
                      </span>
                    </div>
                    <div className={`text-3xl font-bold mt-4 ${card.accent}`}>
                      {card.value}
                    </div>
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                      {card.body}
                    </p>
                    <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-white/0 via-white/0 to-white/5" />
                  </div>
                ))
              }
              {!loading && filteredCards.length === 0 && (
                <div className="col-span-full text-center text-sm text-slate-500 py-10">
                  No cards match your search.
                </div>
              )}
            </div>
          </section>

          {/* Detailed Panels */}
          <section className="grid gap-8 lg:grid-cols-3">
            {/* Profile panel */}
            <div className="lg:col-span-1 space-y-6">
              <div className="rounded-xl bg-slate-800/40 border border-slate-700/60 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-4">
                  Profile
                </h3>
                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 w-2/3 bg-slate-700 rounded" />
                    <div className="h-3 w-1/2 bg-slate-700 rounded" />
                    <div className="h-3 w-1/3 bg-slate-700 rounded" />
                  </div>
                ) : (
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-slate-500">Full Name</span>
                      <span className="text-slate-200">{userDetails?.fullName || '—'}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-500">Phone</span>
                      <span className="text-slate-200">{userDetails?.phone || '—'}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-500">Gender</span>
                      <span className="text-slate-200">{userDetails?.gender || '—'}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-500">DOB</span>
                      <span className="text-slate-200">
                        {userDetails?.dateOfBirth
                          ? new Date(userDetails.dateOfBirth).toLocaleDateString()
                          : '—'}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-500">Blood Group</span>
                      <span className="text-slate-200">
                        {userDetails?.bloodGroup || '—'}
                      </span>
                    </li>
                  </ul>
                )}
                <button
                  onClick={() => navigate('/user-details')}
                  className="mt-5 w-full text-sm bg-green-600 hover:bg-green-500 transition rounded-md py-2.5 font-medium"
                >
                  {userDetails ? 'Update Details' : 'Complete Profile'}
                </button>
              </div>

              {userDetails?.emergencyContact?.name && (
                <div className="rounded-xl bg-slate-800/40 border border-slate-700/60 p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-4">
                    Emergency Contact
                  </h3>
                  <ul className="text-sm space-y-2">
                    <li className="flex justify-between">
                      <span className="text-slate-500">Name</span>
                      <span>{userDetails.emergencyContact.name}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-500">Relation</span>
                      <span>{userDetails.emergencyContact.relation}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-500">Phone</span>
                      <span>{userDetails.emergencyContact.phone}</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Medical panel */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-xl bg-slate-800/40 border border-slate-700/60 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-4">
                  Medical Overview
                </h3>
                {loading ? (
                  <div className="grid gap-4 md:grid-cols-2 animate-pulse">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-20 rounded-lg bg-slate-700/50" />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {[
                      { label: 'Allergies', value: formatValue(userDetails?.allergies) },
                      { label: 'Chronic Diseases', value: formatValue(userDetails?.chronicDiseases) },
                      { label: 'Current Medications', value: formatValue(userDetails?.currentMedications) },
                      { label: 'Surgeries', value: formatSurgeriesElement(userDetails?.surgeries) },
                      { label: 'Insurance Provider', value: formatValue(userDetails?.insuranceProvider) },
                      { label: 'Policy Number', value: formatValue(userDetails?.policyNumber) }
                    ].map(block => (
                      <div
                        key={block.label}
                        className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-4 hover:border-slate-600 transition"
                      >
                        <div className="text-xs uppercase tracking-wide text-slate-500">
                          {block.label}
                        </div>
                        <div className="mt-2 text-sm text-slate-200 whitespace-pre-wrap break-words space-y-1">
                          {block.value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!userDetails && !loading && (
                <div className="rounded-lg border border-yellow-700/50 bg-yellow-900/30 p-4 flex gap-4 items-start">
                  <FiAlertTriangle className="text-yellow-400 text-xl mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-300 mb-1">
                      Complete your profile
                    </p>
                    <p className="text-yellow-200/80 mb-3">
                      Add medical history, emergency contact and insurance info to unlock full features.
                    </p>
                    <button
                      onClick={() => navigate('/user-details')}
                      className="px-4 py-2 rounded-md bg-yellow-500 hover:bg-yellow-400 text-slate-900 text-xs font-semibold transition"
                    >
                      Complete Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

