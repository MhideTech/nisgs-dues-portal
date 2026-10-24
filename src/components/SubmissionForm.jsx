import React, { useState, useRef } from 'react';
import { 
  CheckCircle, AlertCircle, Calendar, Camera, FileText, 
  Copy, Check, ArrowRight, Sparkles 
} from 'lucide-react';

export default function SubmissionForm({ settings, onSubmissionSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    matricNo: '',
    nickname: '',
    dobDay: '',
    dobMonth: '',
    interests: ''
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const photoInputRef = useRef(null);
  const receiptInputRef = useRef(null);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  // Just 1, 2, 3, etc. (no "Day" text as requested)
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please upload a valid image file for your photograph.');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setErrorMsg('');
    }
  };

  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setReceiptPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setReceiptPreview('pdf');
      }
      setErrorMsg('');
    }
  };

  const copyAccountNumber = () => {
    if (settings?.account_number) {
      navigator.clipboard.writeText(settings.account_number);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!formData.matricNo.trim()) {
      setErrorMsg('Please enter your matriculation number.');
      return;
    }
    if (!formData.dobDay || !formData.dobMonth) {
      setErrorMsg('Please select your birth day and month.');
      return;
    }
    if (!photoFile) {
      setErrorMsg('Please upload a photograph of yourself.');
      return;
    }
    if (!receiptFile) {
      setErrorMsg('Please upload your payment receipt.');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('full_name', formData.fullName.trim());
      data.append('matric_no', formData.matricNo.trim().toUpperCase());
      data.append('nickname', formData.nickname.trim());
      data.append('dob_day', formData.dobDay);
      data.append('dob_month', formData.dobMonth);
      data.append('interests', formData.interests.trim());

      if (photoFile) data.append('photo', photoFile);
      if (receiptFile) data.append('receipt', receiptFile);

      const res = await fetch('/api/students/submit', {
        method: 'POST',
        body: data
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to submit form');
      }

      setSuccessData({
        name: formData.fullName,
        matric: formData.matricNo.toUpperCase()
      });

      if (onSubmissionSuccess) {
        await onSubmissionSuccess();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      matricNo: '',
      nickname: '',
      dobDay: '',
      dobMonth: '',
      interests: ''
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setReceiptFile(null);
    setReceiptPreview(null);
    setSuccessData(null);
    setErrorMsg('');
  };

  if (successData) {
    return (
      <div className="max-w-lg mx-auto bg-stone-900 border border-emerald-900/60 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
        <div className="w-14 h-14 bg-emerald-950 border border-emerald-500/50 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Details & Dues Submitted!</h2>
          <p className="text-xs sm:text-sm text-stone-300">
            Thank you, <strong className="text-emerald-400">{successData.name}</strong>. Your payment receipt and birthday profile have been recorded. You are now listed on the paid dashboard!
          </p>
        </div>

        <button
          onClick={resetForm}
          className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-400 hover:bg-emerald-300 text-emerald-950 transition-colors shadow-md"
        >
          Submit Another Person
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Class Account Banner */}
      <div className="bg-gradient-to-r from-emerald-950/90 via-stone-900 to-emerald-950/80 border border-emerald-800/60 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded uppercase">
                2026/2027 Session
              </span>
              <span className="text-xs text-stone-400">Class Dues</span>
            </div>
            <h3 className="text-xl font-extrabold text-white">₦2,000</h3>
            <p className="text-[11px] text-stone-300">
              Pay ₦2,000 to the class account below, then upload your receipt.
            </p>
          </div>

          <div className="bg-stone-950/90 border border-emerald-900/80 rounded-xl p-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] text-stone-400">{settings?.bank_name || 'KUDA MFB'} • {settings?.account_name || 'OKEFOLAHAN OLAMIDE ISRAEL'}</p>
              <p className="text-sm font-mono font-bold tracking-wider text-emerald-300">
                {settings?.account_number || '2091426004'}
              </p>
            </div>
            <button
              type="button"
              onClick={copyAccountNumber}
              className="p-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 rounded-lg border border-emerald-800 transition-colors"
              title="Copy account number"
            >
              {copiedAccount ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Unified Form */}
      <form onSubmit={handleSubmit} className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
        {/* Section 1: Biodata & Birthday */}
        <div className="space-y-4">
          <div className="pb-2 border-b border-stone-800">
            <h2 className="text-sm sm:text-base font-bold text-white">Biodata & Birthday Information</h2>
            <p className="text-xs text-stone-400">Used for class records and organizing birthday designs.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Full Name <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Adegoke Oluwaseun Michael"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* Matriculation Number */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Matric Number <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.matricNo}
                onChange={(e) => setFormData({ ...formData, matricNo: e.target.value.toUpperCase() })}
                placeholder="250405000"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* Alias / Nickname */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Alias / Nickname <span className="text-stone-500 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                placeholder="Gbeff"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Date of Birth Selection */}
          <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center space-x-2 text-stone-200">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <label className="text-xs font-semibold">
                Date of Birth <span className="text-emerald-400">*</span> (Date and Month)
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <select
                  required
                  value={formData.dobMonth}
                  onChange={(e) => setFormData({ ...formData, dobMonth: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="">Select Month</option>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  required
                  value={formData.dobDay}
                  onChange={(e) => setFormData({ ...formData, dobDay: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="">Select Day</option>
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Photograph Upload */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-300">
              Nice Photograph of Yourself <span className="text-emerald-400">*</span>
            </label>

            <div 
              onClick={() => photoInputRef.current?.click()}
              className="border border-dashed border-stone-700 hover:border-emerald-500 bg-stone-950/60 rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5 cursor-pointer transition-colors"
            >
              {photoPreview ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-md flex-shrink-0">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-400 flex-shrink-0">
                  <Camera className="w-6 h-6 text-emerald-400" />
                </div>
              )}

              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-semibold text-emerald-400 block truncate">
                  {photoFile ? photoFile.name : 'Tap to select or upload a nice photo'}
                </span>
                <p className="text-[11px] text-stone-500">For your birthday design flyer</p>
              </div>

              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Interests & Side Quests */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Interests, Side Quests or Anything About You <span className="text-stone-500 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.interests}
              onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
              placeholder="e.g. GIS mapping, drone piloting, football, tech, graphics"
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Section 2: Upload Payment Receipt */}
        <div className="space-y-3 pt-3 border-t border-stone-800">
          <div className="pb-1">
            <h2 className="text-sm sm:text-base font-bold text-white">Payment Receipt</h2>
            <p className="text-xs text-stone-400">Upload screenshot or PDF of your ₦2,000 class dues transfer.</p>
          </div>

          {/* Receipt File Picker */}
          <div 
            onClick={() => receiptInputRef.current?.click()}
            className="border border-dashed border-emerald-800/80 hover:border-emerald-500 bg-stone-950/80 rounded-xl p-3.5 sm:p-4 flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-stone-200 truncate">
                  {receiptFile ? receiptFile.name : 'Tap to upload payment receipt'}
                </p>
                <p className="text-[11px] text-stone-500">Bank receipt or transfer debit screenshot</p>
              </div>
            </div>

            <span className="text-xs font-semibold text-emerald-950 px-3 py-1.5 rounded-lg bg-emerald-400 flex-shrink-0">
              Upload
            </span>

            <input
              ref={receiptInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleReceiptChange}
              className="hidden"
            />
          </div>

          {receiptPreview && receiptPreview !== 'pdf' && (
            <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-emerald-700/60 shadow">
              <img src={receiptPreview} alt="Receipt preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="flex items-center space-x-2 p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-5 rounded-xl font-bold text-xs sm:text-sm text-emerald-950 bg-emerald-400 hover:bg-emerald-300 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/50"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-950 border-t-transparent" />
              <span>Submitting Details...</span>
            </div>
          ) : (
            <>
              <span>Submit Profile & Dues</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
