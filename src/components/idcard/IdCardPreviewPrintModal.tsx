import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Printer, Download, Eye, RotateCw, CheckCircle2, ShieldCheck, Sparkles, Layers } from 'lucide-react';
import { IdCardRecord, CollegeBrandingConfig } from '../../types/idCard';
import { IdCardRenderer } from './IdCardRenderer';
import { idCardApi } from '../../api/idCardApi';

interface IdCardPreviewPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: IdCardRecord[];
  branding: CollegeBrandingConfig;
  onPrintRecorded?: () => void;
}

export const IdCardPreviewPrintModal: React.FC<IdCardPreviewPrintModalProps> = ({
  isOpen,
  onClose,
  cards,
  branding,
  onPrintRecorded
}) => {
  const [showBackSide, setShowBackSide] = useState(false);
  const [printing, setPrinting] = useState(false);

  if (!isOpen || cards.length === 0) return null;

  const handlePrint = async () => {
    try {
      setPrinting(true);
      // Record print count on server for each card
      for (const card of cards) {
        await idCardApi.recordPrint(card.id).catch(() => {});
      }
      if (onPrintRecorded) onPrintRecorded();

      // Trigger Print Window
      window.print();
    } catch (err) {
      console.error(err);
    } finally {
      setPrinting(false);
    }
  };

  const handleDownloadPdf = () => {
    // Standard Print to PDF trigger
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-cards-area, #printable-cards-area * {
            visibility: visible;
          }
          #printable-cards-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 text-white rounded-3xl border border-slate-700 shadow-2xl w-full max-w-4xl overflow-hidden my-6 flex flex-col max-h-[90vh]"
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Student ID Card Print & PDF Studio
                <span className="px-2 py-0.5 text-[10px] font-mono bg-indigo-900/80 text-indigo-300 border border-indigo-700 rounded-full">
                  {cards.length} {cards.length === 1 ? 'Card' : 'Batch Cards'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                High-resolution vector cards formatted for CR80 PVC card printers or standard sheets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBackSide(!showBackSide)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Flip to {showBackSide ? 'Front Side' : 'Back Side'}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Cards Grid Area */}
        <div className="p-8 flex-1 overflow-y-auto bg-slate-950/50 flex flex-col items-center justify-center">
          <div
            id="printable-cards-area"
            className="flex flex-wrap items-center justify-center gap-8 p-4"
          >
            {cards.map(card => (
              <div key={card.id} className="relative group flex flex-col items-center">
                <IdCardRenderer
                  card={card}
                  branding={branding}
                  showBackSide={showBackSide}
                  scale={1}
                />
                <span className="text-[10px] font-mono text-slate-400 mt-2 no-print font-bold">
                  {card.cardNumber} • {card.studentName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 no-print">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ready for CR80 standard thermal printing or high-grade PDF export</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
            >
              Close
            </button>

            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Save PDF
            </button>

            <button
              onClick={handlePrint}
              disabled={printing}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              {printing ? 'Preparing Printer...' : 'Print Cards Now'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
