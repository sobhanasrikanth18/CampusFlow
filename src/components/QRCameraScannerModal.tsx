import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, Upload, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface QRCameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (qrText: string) => void;
}

export const QRCameraScannerModal: React.FC<QRCameraScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isStartingRef = useRef(false);
  const isStoppingRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const startCamera = async () => {
    if (isStartingRef.current) return;
    setCameraError(null);
    setIsScanning(true);
    isStartingRef.current = true;

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader-element');
      }

      const devices = await Html5Qrcode.getCameras().catch(() => []);
      let cameraConfig: any = { facingMode: 'environment' };

      if (devices && devices.length > 0) {
        const backCam = devices.find(
          (d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment')
        );
        cameraConfig = backCam ? backCam.id : devices[0].id;
      }

      await html5QrCodeRef.current.start(
        cameraConfig,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          stopCamera();
          onScanSuccess(decodedText);
          onClose();
        },
        () => {}
      );
    } catch (err: any) {
      // Fallback try with basic constraints
      try {
        if (html5QrCodeRef.current) {
          await html5QrCodeRef.current.start(
            { facingMode: 'user' },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              stopCamera();
              onScanSuccess(decodedText);
              onClose();
            },
            () => {}
          );
        }
      } catch (fallbackErr: any) {
        setCameraError(
          fallbackErr?.message ||
            err?.message ||
            'Camera access unavailable. Please verify browser camera permissions or use the Upload Image option.'
        );
        setIsScanning(false);
      }
    } finally {
      isStartingRef.current = false;
    }
  };

  const stopCamera = async () => {
    if (!html5QrCodeRef.current || isStoppingRef.current) return;
    isStoppingRef.current = true;
    try {
      if (html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }
      await html5QrCodeRef.current.clear();
    } catch (err) {
      // Safely ignore benign camera transition warnings
    } finally {
      isStoppingRef.current = false;
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    let tempScanner: Html5Qrcode | null = null;
    try {
      tempScanner = new Html5Qrcode('qr-reader-file-element');
      const decodedText = await tempScanner.scanFile(file, true);
      await tempScanner.clear();
      onScanSuccess(decodedText);
      onClose();
    } catch (err: any) {
      if (tempScanner) {
        try {
          await tempScanner.clear();
        } catch (e) {}
      }
      setUploadError(
        'Could not detect a valid QR code in the uploaded image. Please select a pass image with a clear QR code.'
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5 text-white font-sans relative overflow-hidden">
        {/* Off-screen element for file QR scanner rendering */}
        <div
          id="qr-reader-file-element"
          style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '300px', height: '300px' }}
        />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Security Gate Scanner</h3>
              <p className="text-xs text-slate-400">Scan student QR pass via live camera or upload image</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-800/80 text-xs font-bold">
          <button
            onClick={() => setActiveTab('camera')}
            className={`py-2 rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'camera'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" /> Live Camera Scanner
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'upload'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" /> Upload Pass Image
          </button>
        </div>

        {/* Viewport Area */}
        {activeTab === 'camera' ? (
          <div className="space-y-3">
            <div className="relative w-full h-64 bg-slate-950 rounded-2xl border-2 border-dashed border-slate-700 overflow-hidden flex items-center justify-center">
              <div id="qr-reader-element" className="w-full h-full object-cover"></div>

              {cameraError && (
                <div className="absolute inset-0 bg-slate-950/95 p-6 flex flex-col items-center justify-center text-center text-xs space-y-3">
                  <AlertCircle className="w-8 h-8 text-rose-500" />
                  <p className="text-rose-300 font-semibold">{cameraError}</p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" /> Retry Camera Access
                  </button>
                </div>
              )}
            </div>

            <p className="text-[11px] text-center text-slate-400">
              Point your device camera directly at the student's outpass or visitor QR code.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-64 bg-slate-950/60 rounded-2xl border-2 border-dashed border-amber-500/40 hover:border-amber-500 transition cursor-pointer flex flex-col items-center justify-center p-6 text-center space-y-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Click to Select QR Pass Image</p>
                <p className="text-[11px] text-slate-400 mt-1">Supports PNG, JPG, WEBP formats</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {uploadError && (
              <p className="text-xs text-rose-400 font-semibold text-center bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                {uploadError}
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
