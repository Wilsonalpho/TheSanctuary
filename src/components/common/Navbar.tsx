import React, { useState } from 'react';
import { useSanctuary } from '../../context/SanctuaryContext';
import {
  Coffee,
  BookOpen,
  QrCode,
  Bell,
  Volume2,
  VolumeX,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Search,
  BookCheck
} from 'lucide-react';
import { CounterQRModal } from './CounterQRModal';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    stats,
    notifications,
    sseConnected,
    soundEnabled,
    toggleSound,
    requestNotifications,
    setSelectedLoanForModal,
    loans
  } = useSanctuary();

  const [showQRModal, setShowQRModal] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const pendingCount = stats?.pendingCount || 0;
  const overdueCount = stats?.overdueCount || 0;
  const dueTodayCount = stats?.dueTodayCount || 0;
  const totalAlerts = notifications.length;

  const handleOpenLoanFromNotif = (loanId?: string) => {
    if (!loanId) return;
    const match = loans.find(l => l.id === loanId);
    if (match) {
      setSelectedLoanForModal(match);
      setShowNotifMenu(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sanctuary-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Cafe Identity */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('borrow')}
                className="flex items-center gap-2.5 text-left group focus:outline-none"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sanctuary-700 to-sanctuary-900 flex items-center justify-center text-white shadow-warm group-hover:scale-105 transition-transform">
                  <Coffee className="w-5 h-5 text-sanctuary-200" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif font-black text-xl tracking-tight text-coffee-dark group-hover:text-sanctuary-800 transition-colors">
                      The Sanctuary
                    </span>
                    <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-sanctuary-100 text-sanctuary-800 rounded">
                      Cafe & Library
                    </span>
                  </div>
                  <p className="text-[11px] text-sanctuary-600 font-medium hidden sm:block">
                    Books • Artisanal Brews • Community
                  </p>
                </div>
              </button>
            </div>

            {/* Navigation Tabs (Borrower vs Shopkeeper) */}
            <nav className="flex items-center p-1.5 bg-sanctuary-100/80 rounded-2xl border border-sanctuary-200 text-xs sm:text-sm font-medium">
              <button
                onClick={() => setActiveTab('borrow')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  activeTab === 'borrow'
                    ? 'bg-white text-sanctuary-950 font-bold shadow-sm'
                    : 'text-stone-600 hover:text-coffee-dark hover:bg-white/50'
                }`}
              >
                <BookOpen className="w-4 h-4 text-sanctuary-600" />
                <span>Borrow Book</span>
              </button>

              <button
                onClick={() => setActiveTab('my-loans')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  activeTab === 'my-loans'
                    ? 'bg-white text-sanctuary-950 font-bold shadow-sm'
                    : 'text-stone-600 hover:text-coffee-dark hover:bg-white/50'
                }`}
              >
                <Search className="w-4 h-4 text-sanctuary-600" />
                <span className="hidden xs:inline">Check / Return</span>
                <span className="xs:hidden">Status</span>
              </button>

              <button
                onClick={() => setActiveTab('shopkeeper')}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  activeTab === 'shopkeeper'
                    ? 'bg-sanctuary-900 text-white font-bold shadow-warm'
                    : 'text-stone-700 hover:text-coffee-dark hover:bg-white/50'
                }`}
              >
                <BookCheck className="w-4 h-4 text-sanctuary-300" />
                <span>Shopkeeper</span>
                {pendingCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-white text-[10px] font-black rounded-full animate-bounce">
                    {pendingCount}
                  </span>
                )}
              </button>
            </nav>

            {/* Right Quick Controls */}
            <div className="flex items-center gap-2">
              {/* QR Code Standee Launcher */}
              <button
                onClick={() => setShowQRModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-sanctuary-50 hover:bg-sanctuary-100 text-sanctuary-800 border border-sanctuary-200 transition-colors shadow-sm"
                title="View & Print Table QR Code"
              >
                <QrCode className="w-4 h-4 text-sanctuary-700" />
                <span className="hidden md:inline">Counter QR</span>
              </button>

              {/* Sound Toggle */}
              <button
                onClick={toggleSound}
                className={`p-2 rounded-xl border transition-colors ${
                  soundEnabled
                    ? 'bg-sanctuary-50 text-sanctuary-700 border-sanctuary-200 hover:bg-sanctuary-100'
                    : 'bg-stone-100 text-stone-400 border-stone-200'
                }`}
                title={soundEnabled ? 'Mute Alert Sounds' : 'Enable Alert Sounds'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="relative p-2 rounded-xl bg-sanctuary-50 hover:bg-sanctuary-100 text-sanctuary-800 border border-sanctuary-200 transition-colors"
                  title="Daily alerts and lending notifications"
                >
                  <Bell className="w-4 h-4 text-sanctuary-700" />
                  {totalAlerts > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 text-white text-[9px] font-bold items-center justify-center">
                        {totalAlerts}
                      </span>
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {showNotifMenu && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-warm-lg border border-sanctuary-200 py-3 z-50 animate-fade-in">
                    <div className="px-4 pb-2 border-b border-sanctuary-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-sanctuary-600" />
                        <h4 className="font-serif font-bold text-coffee-dark text-sm">Real-time Notifications</h4>
                      </div>
                      <button
                        onClick={requestNotifications}
                        className="text-[11px] text-sanctuary-600 hover:underline font-medium"
                      >
                        Enable Desktop
                      </button>
                    </div>

                    <div className="max-h-72 overflow-y-auto px-2 py-1 divide-y divide-sanctuary-50">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-stone-500">
                          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                          All clear! No pending requests or overdue books.
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          let badgeBg = 'bg-amber-50 text-amber-900 border-amber-200';
                          let icon = <Clock className="w-4 h-4 text-amber-600 shrink-0" />;

                          if (notif.type === 'overdue') {
                            badgeBg = 'bg-rose-50 text-rose-950 border-rose-200';
                            icon = <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />;
                          }

                          return (
                            <div
                              key={notif.id}
                              onClick={() => handleOpenLoanFromNotif(notif.loanId)}
                              className={`p-2.5 rounded-xl transition-colors cursor-pointer hover:bg-sanctuary-50 flex items-start gap-2.5 my-1 ${badgeBg} border`}
                            >
                              <div className="mt-0.5">{icon}</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold leading-tight">{notif.title}</p>
                                <p className="text-[11px] text-stone-700 mt-0.5 leading-snug line-clamp-2">
                                  {notif.message}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="px-4 pt-2 border-t border-sanctuary-100 flex items-center justify-between text-[11px] text-stone-500">
                      <div className="flex items-center gap-1">
                        <Radio className={`w-3 h-3 ${sseConnected ? 'text-emerald-500 animate-pulse' : 'text-stone-400'}`} />
                        <span>{sseConnected ? 'Live Connection Active' : 'Offline / Polling'}</span>
                      </div>
                      <button
                        onClick={() => {
                          setShowNotifMenu(false);
                          setActiveTab('shopkeeper');
                        }}
                        className="text-sanctuary-700 font-semibold hover:underline"
                      >
                        View Dashboard &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* QR Modal */}
      <CounterQRModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} />
    </>
  );
};
