import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ShieldCheck, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  qrDataUrl?: string;
  qrCode?: string;
  passId: string;
  studentName: string;
  rollNumber: string;
  validity: string;
}

export const QRModal: React.FC<QRModalProps> = ({
  isOpen,
  onClose,
  title = 'Outpass Gate Scan QR',
  qrDataUrl,
  qrCode,
  passId,
  studentName,
  rollNumber,
  validity,
}) => {
  const [copied, setCopied] = useState(false);
  const [generatedQr, setGeneratedQr] = useState<string | null>(qrDataUrl || qrCode || null);

  useEffect(() => {
    const existingQr = qrDataUrl || qrCode;
    if (existingQr) {
      setGeneratedQr(existingQr);
    } else if (passId) {
      const payload = JSON.stringify({
        type: 'CAMPUSFLOW_OUTPASS',
        passId,
        rollNumber: rollNumber || '2300033711',
        studentName: studentName || 'Student',
        validUntil: validity,
        timestamp: new Date().toISOString(),
      });

      QRCode.toDataURL(payload, {
        width: 400,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
      })
        .then((url) => setGeneratedQr(url))
        .catch((err) => console.error('Failed to render QR Code:', err));
    }
  }, [qrDataUrl, qrCode, passId, rollNumber, studentName, validity]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(passId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedQr) return;
    const link = document.createElement('a');
    link.href = generatedQr;
    link.download = `${passId}_QR_Pass.png`;
    link.click();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-center overflow-hidden"
        >
          {/* Header background accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 mb-3 mt-1">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Verified Digital Security Pass
          </p>

          {/* QR Code Container */}
          <div className="my-5 p-4 bg-white rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 inline-block shadow-inner">
            {generatedQr ? (
              <img src={generatedQr} alt="Verified Gate QR" className="w-48 h-48 mx-auto rounded-lg" />
            ) : (
              <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                Generating QR...
              </div>
            )}
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 text-left text-xs space-y-1.5 border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex justify-between text-slate-500">
              <span>Pass ID:</span>
              <button
                onClick={handleCopy}
                className="font-mono font-semibold text-slate-900 dark:text-white flex items-center gap-1 hover:text-blue-500"
              >
                {passId} {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Student:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{studentName}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Roll Number:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{rollNumber}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Valid Until:</span>
              <span className="font-semibold text-emerald-500">{validity}</span>
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={!generatedQr}
            className="w-full mt-5 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download QR Pass
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
