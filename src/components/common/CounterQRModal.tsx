import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, Copy, Check, Library } from 'lucide-react';

interface CounterQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CounterQRModal: React.FC<CounterQRModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl border border-zinc-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Library className="w-4 h-4 text-zinc-900" />
            <h3 className="font-semibold text-sm text-zinc-900">Counter QR Code</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Standee Card */}
        <div className="p-6">
          <div
            id="printable-standee"
            ref={printRef}
            className="bg-white border border-zinc-200 rounded-xl p-6 text-center space-y-4"
          >
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400">
                The Sanctuary
              </span>
              <h4 className="font-semibold text-base text-zinc-900 tracking-tight">
                Scan to Borrow a Book
              </h4>
            </div>

            <div className="p-3 bg-white border border-zinc-100 rounded-xl inline-block mx-auto shadow-sm">
              <QRCodeSVG
                value={qrUrl}
                size={180}
                bgColor="#ffffff"
                fgColor="#09090b"
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="text-[11px] text-zinc-500 max-w-xs mx-auto space-y-1">
              <p>1. Scan with phone camera</p>
              <p>2. Snap a photo of the book</p>
              <p>3. Present approval to barista</p>
            </div>

            <div className="inline-block bg-zinc-100 px-2.5 py-1 rounded text-[10px] font-medium text-zinc-600">
              14-Day Standard Lending
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Standee</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-zinc-200 hover:bg-zinc-50 text-zinc-800 font-medium text-xs rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-zinc-900" />
                  <span className="text-zinc-900 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Copy URL</span>
                </>
              )}
            </button>
          </div>
          <p className="text-center text-[10px] text-zinc-400 mt-3 truncate font-mono">
            {qrUrl}
          </p>
        </div>
      </div>
    </div>
  );
};
