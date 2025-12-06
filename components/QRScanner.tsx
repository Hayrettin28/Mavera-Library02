import React, { useEffect, useState, useRef } from 'react';
import { X, Camera, RefreshCw, AlertCircle } from 'lucide-react';

// Declare global variable from CDN
declare const Html5Qrcode: any;

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const scannerRef = useRef<any>(null);
  const isScanningRef = useRef<boolean>(false);

  useEffect(() => {
    // Initialize scanner
    const startScanner = async () => {
      try {
        setLoading(true);
        if (typeof Html5Qrcode === 'undefined') {
          throw new Error('QR Kütüphanesi yüklenemedi.');
        }

        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        
        await html5QrCode.start(
          { facingMode: "environment" }, 
          config, 
          (decodedText: string) => {
             // Success callback
             if (!isScanningRef.current) return;
             
             // Play beep sound (optional)
             // const audio = new Audio('/beep.mp3'); audio.play().catch(e => {});

             isScanningRef.current = false;
             onScan(decodedText);
             
             // Stop automatically after scan
             html5QrCode.stop().then(() => {
                 html5QrCode.clear();
             }).catch((err: any) => console.error(err));
          },
          (errorMessage: string) => {
            // Ignore frame errors, they happen a lot when searching for QR
          }
        );
        
        isScanningRef.current = true;
        setLoading(false);

      } catch (err: any) {
        console.error("Kamera başlatma hatası:", err);
        setError("Kameraya erişilemedi. Lütfen izin verdiğinizden emin olun veya farklı bir tarayıcı deneyin.");
        setLoading(false);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
        startScanner();
    }, 100);

    return () => {
      clearTimeout(timer);
      isScanningRef.current = false;
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
            scannerRef.current.stop().then(() => {
                scannerRef.current.clear();
            }).catch((e: any) => console.error("Stop error", e));
        } else {
            scannerRef.current.clear();
        }
      }
    };
  }, [onScan]);

  const simulateScan = () => {
      // Simulating a book scan
      const mockData = encodeURIComponent(JSON.stringify({
        id: '1',
        isbn: '9780132350884',
        title: 'Clean Code',
        loc: 'A-12'
      }));
      onScan(mockData);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-dark-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-dark-800 z-10">
            <h3 className="font-bold text-xl dark:text-white flex items-center">
                <Camera className="w-6 h-6 mr-3 text-primary-600" /> 
                QR Tarayıcı
            </h3>
            <button 
                onClick={onClose} 
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-red-100 hover:text-red-600 transition"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
        
        {/* Camera Area */}
        <div className="relative flex-1 bg-black flex flex-col justify-center items-center min-h-[350px]">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50 text-white">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mr-3"></div>
                    Kamera Açılıyor...
                </div>
            )}
            
            {error ? (
                <div className="p-6 text-center text-white max-w-xs">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <p className="mb-4">{error}</p>
                    <button onClick={simulateScan} className="px-4 py-2 bg-white text-black rounded-lg font-medium text-sm">
                        Demo Modunda Devam Et
                    </button>
                </div>
            ) : (
                <div id="reader" className="w-full h-full"></div>
            )}
        </div>

        {/* Footer */}
        <div className="p-5 bg-gray-50 dark:bg-dark-900 text-center border-t border-gray-100 dark:border-gray-700">
             <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Kodu karenin içine ortalayın.
             </p>
             <button 
                onClick={simulateScan}
                className="inline-flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-xs font-medium"
             >
                 <RefreshCw className="w-3 h-3 mr-2" />
                 Simülasyon (Kamerasız Test)
             </button>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;