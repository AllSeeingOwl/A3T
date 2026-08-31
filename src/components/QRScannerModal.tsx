import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Loader2 } from 'lucide-react';

interface QRScannerModalProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ onScanSuccess, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [hasCameras, setHasCameras] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Focus the close button on mount for accessibility
    closeRef.current?.focus();

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          html5QrCodeRef.current = new Html5Qrcode('qr-reader');
          await html5QrCodeRef.current.start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              onScanSuccess(decodedText);
            },
            () => {
              // Ignore scan errors, as they happen continuously when no QR code is in frame
            }
          );
          setIsLoading(false);
        } else {
          setHasCameras(false);
          setError('No cameras found on your device.');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error starting scanner:', err);
        setError('Failed to access camera. Please ensure permissions are granted.');
        setIsLoading(false);
      }
    };

    startScanner();

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch((err) => {
          console.error('Failed to stop scanner:', err);
        });
      }
    };
  }, [onScanSuccess]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-scanner-title"
    >
      <div className="bg-arena-navy rounded-xl border border-arena-magenta shadow-[0_0_20px_rgba(217,70,239,0.3)] max-w-md w-full overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-900/50">
          <h2 id="qr-scanner-title" className="text-xl font-display uppercase tracking-widest text-arena-magenta flex items-center gap-2">
            <Camera className="w-5 h-5" aria-hidden="true" />
            Scan Card
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close Scanner (Escape)"
            className="text-slate-400 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-arena-magenta focus-visible:outline-none rounded-full p-1 group relative"
          >
            <X className="w-6 h-6" aria-hidden="true" />
            <span
              aria-hidden="true"
              className="absolute right-0 top-full mt-2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-visible:opacity-100 group-focus-visible:visible transition-all duration-200 border border-slate-600 shadow-md font-sans tracking-wide z-50 flex items-center gap-1.5"
            >
              <span>Close Scanner</span>
              <kbd className="font-sans text-[10px] bg-slate-700 border border-slate-500 px-1 py-0.5 rounded text-slate-300 shadow-inner">Esc</kbd>
            </span>
          </button>
        </div>

        {/* Scanner Body */}
        <div className="p-4 flex flex-col items-center">
          <p className="text-slate-300 text-sm mb-4 text-center">
            Position the QR code on the physical card within the frame to verify and load its questions.
          </p>

          <div className="w-full bg-black rounded-lg overflow-hidden border border-slate-700 min-h-[300px] flex items-center justify-center relative">
            {isLoading && !error && (
              <div role="status" aria-live="polite" className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 text-arena-magenta">
                <Loader2 aria-hidden="true" className="w-10 h-10 mb-4 animate-spin" />
                <span className="text-sm uppercase tracking-widest font-display">Accessing Camera...</span>
                <span className="sr-only">Please grant camera permissions if prompted.</span>
              </div>
            )}
            {error ? (
              <div role="alert" className="text-red-400 text-center p-6 flex flex-col items-center gap-2 relative z-20">
                <Camera className="w-8 h-8 opacity-50 mb-2" aria-hidden="true" />
                <p>{error}</p>
                {!hasCameras && (
                  <p className="text-xs text-slate-500 mt-2">
                    You can still use your device's native camera app to scan the card.
                  </p>
                )}
              </div>
            ) : (
              <div id="qr-reader" className={`w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}`}></div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
