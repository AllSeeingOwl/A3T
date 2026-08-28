import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface QRScannerModalProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ onScanSuccess, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [hasCameras, setHasCameras] = useState<boolean>(true);
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
        } else {
          setHasCameras(false);
          setError('No cameras found on your device.');
        }
      } catch (err) {
        console.error('Error starting scanner:', err);
        setError('Failed to access camera. Please ensure permissions are granted.');
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
            aria-label="Close Scanner"
            className="text-slate-400 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-arena-magenta focus-visible:outline-none rounded-full p-1"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {/* Scanner Body */}
        <div className="p-4 flex flex-col items-center">
          <p className="text-slate-300 text-sm mb-4 text-center">
            Position the QR code on the physical card within the frame to verify and load its questions.
          </p>

          <div className="w-full bg-black rounded-lg overflow-hidden border border-slate-700 min-h-[300px] flex items-center justify-center relative">
            {error ? (
              <div className="text-red-400 text-center p-6 flex flex-col items-center gap-2">
                <Camera className="w-8 h-8 opacity-50 mb-2" aria-hidden="true" />
                <p>{error}</p>
                {!hasCameras && (
                  <p className="text-xs text-slate-500 mt-2">
                    You can still use your device's native camera app to scan the card.
                  </p>
                )}
              </div>
            ) : (
              <div id="qr-reader" className="w-full h-full"></div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
