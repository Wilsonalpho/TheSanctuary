import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, Copy, Check, Coffee, BookOpen, Smartphone } from 'lucide-react';

interface CounterQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CounterQRModal: React.FC<CounterQRModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // URL pointing to the borrower portal
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const qrUrl = `${origin}?portal=borrow`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-dark/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-sanctuary-200">
        {/* Header */}
        <div className="bg-sanctuary-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sanctuary-800 rounded-xl">
              <Smartphone className="w-5 h-5 text-sanctuary-300" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold tracking-tight">Shop Counter QR Code</h3>
              <p className="text-xs text-sanctuary-200">Place on tables & counter for customers to scan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-sanctuary-800 text-sanctuary-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Standee Card */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          <div
            id="printable-standee"
            ref={printRef}
            className="bg-[#fcfaf7] border-2 border-dashed border-sanctuary-300 rounded-2xl p-6 text-center shadow-inner"
          >
            <div className="inline-flex items-center justify-center gap-2 text-sanctuary-800 mb-2">
              <Coffee className="w-6 h-6 text-sanctuary-700" />
              <span className="font-serif text-2xl font-bold tracking-wide">The Sanctuary</span>
              <BookOpen className="w-6 h-6 text-sanctuary-700" />
            </div>
            <p className="text-xs uppercase tracking-widest text-sanctuary-600 font-semibold mb-5">
              Coffee & Literary Lounge
            </p>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-sanctuary-200 inline-block mx-auto mb-4">
              <QRCodeSVG
                value={qrUrl}
                size={220}
                bgColor="#ffffff"
                fgColor="#2a1a12"
                level="H"
                includeMargin={false}
              />
            </div>

            <h4 className="font-serif text-lg font-bold text-coffee-dark mb-1">
              Borrow a Book to Read
            </h4>
            <p className="text-xs text-coffee-mocha max-w-xs mx-auto leading-relaxed mb-4">
              1. Scan this QR code with your phone camera<br />
              2. Snap a photo of the books you want to take<br />
              3. Show your approval screen to the barista!
            </p>

            <div className="inline-block bg-sanctuary-100 px-3 py-1.5 rounded-full text-[11px] font-medium text-sanctuary-800">
              Free to borrow for 14 days • Return anytime
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-sanctuary-800 hover:bg-sanctuary-900 text-white font-medium rounded-xl shadow-warm transition-all"
            >
              <Printer className="w-4 h-4" />
              Print Table Standee
            </button>
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-sanctuary-300 hover:bg-sanctuary-50 text-coffee-dark font-medium rounded-xl transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-sanctuary-600" />
                  <span>Copy Form URL</span>
                </>
              )}
            </button>
          </div>
          <p className="text-center text-[11px] text-stone-500 mt-3 truncate font-mono">
            {qrUrl}
          </p>
        </div>
      </div>
    </div>
  );
};
