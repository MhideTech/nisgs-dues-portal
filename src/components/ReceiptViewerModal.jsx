import React from 'react';
import { X, Download, ExternalLink, CheckCircle, User } from 'lucide-react';

export default function ReceiptViewerModal({ student, onClose }) {
  if (!student || !student.receipt_url) return null;

  const isPdf = student.receipt_url.toLowerCase().endsWith('.pdf');
  const fullUrl = student.receipt_url.startsWith('http') 
    ? student.receipt_url 
    : `${window.location.origin}${student.receipt_url}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-5 my-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div>
            <h3 className="text-base font-bold text-white">Payment Receipt Proof</h3>
            <p className="text-xs text-stone-400">
              {student.full_name} • <span className="font-mono text-emerald-400">{student.matric_no}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="bg-stone-950 rounded-xl overflow-hidden border border-stone-800 flex items-center justify-center min-h-[300px] max-h-[70vh]">
          {isPdf ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-sm text-stone-300">This receipt was uploaded as a PDF document.</p>
              <a
                href={fullUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-bold rounded-xl"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open PDF in New Tab</span>
              </a>
            </div>
          ) : (
            <img
              src={fullUrl}
              alt="Receipt"
              className="w-full h-full object-contain max-h-[65vh]"
            />
          )}
        </div>

        {/* Footer info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-stone-400">
          <div>
            {student.payment_reference && (
              <span>Sender Reference: <strong className="text-stone-200">{student.payment_reference}</strong></span>
            )}
          </div>
          <div className="flex space-x-2">
            <a
              href={fullUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
