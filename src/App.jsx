import React, { useState, useEffect } from 'react';
import { 
  FileEdit, ShieldAlert, Shield, RefreshCw, 
  Compass, CheckCircle2, Lock 
} from 'lucide-react';
import SubmissionForm from './components/SubmissionForm.jsx';
import DuesBoard from './components/DuesBoard.jsx';
import BirthdayCardModal from './components/BirthdayCardModal.jsx';
import AdminModal from './components/AdminModal.jsx';
import ReceiptViewerModal from './components/ReceiptViewerModal.jsx';

export default function App() {
  // Requirement 1: Form is default on page load!
  const [activeTab, setActiveTab] = useState('form'); // 'form' or 'board'
  const [students, setStudents] = useState([]);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedBirthdayStudent, setSelectedBirthdayStudent] = useState(null);
  const [selectedReceiptStudent, setSelectedReceiptStudent] = useState(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const cacheBuster = Date.now();
      const [studentsRes, settingsRes] = await Promise.all([
        fetch(`/api/students?_t=${cacheBuster}`, { cache: 'no-store' }),
        fetch(`/api/settings?_t=${cacheBuster}`, { cache: 'no-store' })
      ]);

      if (studentsRes.ok) {
        const data = await studentsRes.json();
        setStudents(data.students || []);
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#070B09] text-stone-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Geodetic Coordinates Top Bar */}
      <div className="bg-[#040806] border-b border-emerald-950/80 px-4 py-1.5 text-[11px] text-emerald-500/80 font-mono flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          <span>CLASS OF 2030 • SURVEYING & GEOINFORMATICS</span>
        </div>
        <div className="text-emerald-400 font-bold">2026/2027 Session</div>
      </div>

      {/* Main Header / Nav */}
      <header className="sticky top-0 z-40 bg-[#090E0C]/95 backdrop-blur-md border-b border-emerald-900/40">
        <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          {/* Logo & Department Branding */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white p-1 shadow border border-emerald-600/60 flex items-center justify-center flex-shrink-0">
              <img
                src="/nisgs-logo.png"
                alt="NISGS Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight text-white">NISGS</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Class of 2030
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-medium leading-tight">
                Surveying & Geoinformatics
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Only 2 tabs as requested) */}
          <nav className="flex items-center space-x-1 bg-stone-950/90 p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'form'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <FileEdit className="w-3.5 h-3.5 text-emerald-400" />
              <span>Submit Form</span>
            </button>

            <button
              onClick={() => setActiveTab('board')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'board'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Paid List ({students.length})</span>
            </button>
          </nav>

          {/* Right Action: Admin */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="flex items-center space-x-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 hover:border-emerald-800/80 transition-colors"
              title="Admin Birthday Hub"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3.5 sm:px-6 py-5 sm:py-7">
        {/* Tab 1: Form (Default) */}
        {activeTab === 'form' && (
          <div className="space-y-4">
            <div className="text-center max-w-lg mx-auto space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Submit Your Profile & Dues
              </h1>
              <p className="text-xs text-stone-400">
                Class of 2030 • Department of Surveying & Geoinformatics
              </p>
            </div>

            <SubmissionForm
              settings={settings}
              onSubmissionSuccess={async () => {
                await fetchData();
                setActiveTab('board');
              }}
            />
          </div>
        )}

        {/* Tab 2: Paid List Dashboard */}
        {activeTab === 'board' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-center sm:text-left space-y-1">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Paid List
                </h1>
                <p className="text-xs text-stone-400">
                  Coursemates who have submitted their profile and dues payment receipt.
                </p>
              </div>

              <button
                onClick={fetchData}
                disabled={isLoading}
                className="self-center sm:self-auto inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 hover:border-emerald-700/60 transition-colors disabled:opacity-50"
                title="Refresh Paid List"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Updating...' : 'Refresh List'}</span>
              </button>
            </div>

            <DuesBoard
              students={students}
              onViewReceipt={(student) => setSelectedReceiptStudent(student)}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-800/80 bg-[#050806] py-5 px-4 text-xs text-stone-500 text-center">
        <p className="font-semibold text-stone-400">
          Department of Surveying & Geoinformatics • Class of 2030
        </p>
      </footer>

      {/* Modals */}
      {selectedBirthdayStudent && (
        <BirthdayCardModal
          student={selectedBirthdayStudent}
          onClose={() => setSelectedBirthdayStudent(null)}
        />
      )}

      {selectedReceiptStudent && (
        <ReceiptViewerModal
          student={selectedReceiptStudent}
          onClose={() => setSelectedReceiptStudent(null)}
        />
      )}

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        students={students}
        settings={settings}
        onGenerateCard={(student) => setSelectedBirthdayStudent(student)}
      />
    </div>
  );
}
