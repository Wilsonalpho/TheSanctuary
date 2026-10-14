import React, { useEffect } from 'react';
import { SanctuaryProvider, useSanctuary } from './context/SanctuaryContext';
import { Navbar } from './components/common/Navbar';
import { BorrowerPortal } from './components/borrower/BorrowerPortal';
import { ReturnLookup } from './components/borrower/ReturnLookup';
import { ShopkeeperDashboard } from './components/shopkeeper/ShopkeeperDashboard';
import { ToastContainer } from './components/common/ToastContainer';
import { LoanDetailModal } from './components/common/LoanDetailModal';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, selectedLoanForModal, setSelectedLoanForModal } = useSanctuary();

  // Check URL params on initial load (e.g. if customer scanned QR code ?portal=borrow)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const portalParam = params.get('portal');
      if (portalParam === 'borrow') {
        setActiveTab('borrow');
      } else if (portalParam === 'shopkeeper') {
        setActiveTab('shopkeeper');
      } else if (portalParam === 'return') {
        setActiveTab('my-loans');
      }
    }
  }, [setActiveTab]);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans selection:bg-zinc-900 selection:text-white">
      {/* Top Header Navigation */}
      <Navbar />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'borrow' && <BorrowerPortal />}
        {activeTab === 'my-loans' && (
          <div className="py-6 sm:py-10 px-4">
            <ReturnLookup />
          </div>
        )}
        {activeTab === 'shopkeeper' && <ShopkeeperDashboard />}
      </main>

      {/* Global Modals & Notifications */}
      <ToastContainer />
      <LoanDetailModal
        loan={selectedLoanForModal}
        onClose={() => setSelectedLoanForModal(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <SanctuaryProvider>
      <AppContent />
    </SanctuaryProvider>
  );
}
