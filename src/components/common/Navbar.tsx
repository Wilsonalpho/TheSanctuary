import React, { useState } from 'react';
import { useSanctuary } from '../../context/SanctuaryContext';
import {
  BookOpen,
  QrCode,
  Bell,
  Volume2,
  VolumeX,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  BookCheck,
  Library
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
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('borrow')}
                className="flex items-center gap-2.5 text-left group focus:outline-none"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white transition-opacity group-hover:opacity-90">
                  <Library className="w-4 h-4 text-zinc-100" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm tracking-tight text-zinc-950">
                      The Sanctuary
                    </span>
                    <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-medium tracking-wide text-zinc-500 bg-zinc-100 border border-zinc-200/60 rounded">
                      Lending
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* Navigation Tabs (Minimalist Segmented Control) */}
            <nav className="flex items-center p-0.5 bg-zinc-100/90 rounded-lg border border-zinc-200/70 text-xs">
              <button
                onClick={() => setActiveTab('borrow')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-medium ${
                  activeTab === 'borrow'
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Borrow</span>
              </button>

              <button
                onClick={() => setActiveTab('my-loans')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-medium ${
                  activeTab === 'my-loans'
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Check / Return</span>
                <span className="xs:hidden">Status</span>
              </button>

              <button
                onClick={() => setActiveTab('shopkeeper')}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-medium ${
                  activeTab === 'shopkeeper'
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <BookCheck className="w-3.5 h-3.5" />
                <span>Shopkeeper</span>
                {pendingCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-zinc-900 text-white text-[9px] font-medium rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-1.5">
              {/* Counter QR Standee */}
              <button
                onClick={() => setShowQRModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border border-transparent hover:border-zinc-200/60 transition-colors"
                title="View & Print Table QR Code"
              >
                <QrCode className="w-3.5 h-3.5 text-zinc-500" />
                <span className="hidden md:inline">Counter QR</span>
              </button>

              {/* Sound Toggle */}
              <button
                onClick={toggleSound}
                className={`p-1.5 rounded-lg border text-zinc-500 transition-colors ${
                  soundEnabled
                    ? 'border-zinc-200/80 bg-zinc-50 hover:bg-zinc-100 text-zinc-800'
                    : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
                title={soundEnabled ? 'Mute Alert Sounds' : 'Enable Alert Sounds'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="relative p-1.5 rounded-lg border border-zinc-200/80 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 transition-colors"
                  title="Daily alerts and lending notifications"
                >
                  <Bell className="w-3.5 h-3.5" />
                  {totalAlerts > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-zinc-900 text-white text-[8px] font-semibold items-center justify-center">
                        {totalAlerts}
                      </span>
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {showNotifMenu && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-xl shadow-lg border border-zinc-200 p-2 z-50 animate-fade-in text-xs">
                    <div className="px-2 py-1.5 border-b border-zinc-100 flex items-center justify-between">
                      <h4 className="font-semibold text-zinc-900">Notifications</h4>
                      <button
                        onClick={requestNotifications}
                        className="text-[10px] text-zinc-500 hover:text-zinc-900 font-medium"
                      >
                        Enable Desktop
                      </button>
                    </div>

                    <div className="max-h-64 overflow-y-auto py-1 divide-y divide-zinc-50">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-zinc-400">
                          <CheckCircle2 className="w-5 h-5 text-zinc-300 mx-auto mb-1" />
                          No pending requests or overdue books.
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          return (
                            <div
                              key={notif.id}
                              onClick={() => handleOpenLoanFromNotif(notif.loanId)}
                              className="p-2 rounded-lg transition-colors cursor-pointer hover:bg-zinc-50 flex items-start gap-2 text-left"
                            >
                              <div className="mt-0.5">
                                {notif.type === 'overdue' ? (
                                  <AlertTriangle className="w-3.5 h-3.5 text-zinc-900" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-zinc-900 leading-tight">{notif.title}</p>
                                <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug line-clamp-2">
                                  {notif.message}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="px-2 pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Radio className={`w-2.5 h-2.5 ${sseConnected ? 'text-zinc-900' : 'text-zinc-300'}`} />
                        <span>{sseConnected ? 'Live Sync Active' : 'Offline'}</span>
                      </div>
                      <button
                        onClick={() => {
                          setShowNotifMenu(false);
                          setActiveTab('shopkeeper');
                        }}
                        className="text-zinc-900 font-medium hover:underline"
                      >
                        Dashboard &rarr;
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
