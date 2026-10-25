import React, { useState } from 'react';
import { 
  X, Lock, KeyRound, Sparkles, Calendar, Gift, 
  Search, PartyPopper, MessageCircle, AlertCircle 
} from 'lucide-react';

export default function AdminModal({ 
  isOpen, 
  onClose, 
  students, 
  settings, 
  onGenerateCard 
}) {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Birthday search & month filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const adminPin = settings?.admin_pin || '2030';
    if (pin.trim() === adminPin) {
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect Admin PIN.');
    }
  };

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

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  const getDaysUntilBirthday = (dobMonth, dobDay) => {
    const thisYear = now.getFullYear();
    let bdayDate = new Date(thisYear, dobMonth - 1, dobDay);
    if (bdayDate < new Date(thisYear, currentMonth - 1, currentDay)) {
      bdayDate = new Date(thisYear + 1, dobMonth - 1, dobDay);
    }
    const diffTime = bdayDate - new Date(thisYear, currentMonth - 1, currentDay);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const todayBirthdays = students.filter(
    (s) => s.dob_month === currentMonth && s.dob_day === currentDay
  );

  const upcomingBirthdays = students
    .filter((s) => {
      const days = getDaysUntilBirthday(s.dob_month, s.dob_day);
      return days > 0 && days <= 35;
    })
    .sort((a, b) => getDaysUntilBirthday(a.dob_month, a.dob_day) - getDaysUntilBirthday(b.dob_month, b.dob_day));

  const filteredStudents = students.filter((s) => {
    const matchesSearch = 
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nickname && s.nickname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.interests && s.interests.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedMonth !== 'all' && s.dob_month !== parseInt(selectedMonth)) return false;

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-stone-900 border border-emerald-900/70 rounded-2xl shadow-2xl p-4 sm:p-6 my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800 flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-950 border border-emerald-700/60 rounded-lg text-emerald-400">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Admin • Birthday Hub</h3>
              <p className="text-xs text-stone-400">Manage celebrations, upcoming birthdays & flyer rollouts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN Screen if not authenticated */}
        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="max-w-xs mx-auto py-12 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center mx-auto text-emerald-400">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white">Enter Admin PIN</h4>
              <p className="text-xs text-stone-400">Enter your PIN to proceed</p>
            </div>

            <input
              type="password"
              autoFocus
              maxLength={8}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN"
              className="w-full text-center bg-stone-950 border border-stone-700 rounded-xl px-4 py-2 text-base tracking-widest font-mono text-white focus:outline-none focus:border-emerald-500"
            />

            {errorMsg && (
              <p className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-800/60">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-400 hover:bg-emerald-300 font-bold text-xs text-emerald-950 rounded-xl transition-colors shadow-md"
            >
              Access Admin Page
            </button>
          </form>
        ) : (
          <div className="overflow-y-auto mt-4 space-y-5 pr-1 flex-1">
            {/* Today's Birthday Spotlight */}
            {todayBirthdays.length > 0 && (
              <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 border border-emerald-500 rounded-xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-3 text-center sm:text-left">
                  <div className="p-2.5 bg-emerald-500 text-emerald-950 rounded-xl font-bold flex-shrink-0">
                    <PartyPopper className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-extrabold text-emerald-300">
                      🎉 CELEBRATING TODAY!
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-white">
                      {todayBirthdays.map((b) => b.full_name).join(', ')}
                    </h4>
                  </div>
                </div>

                <div className="flex gap-2">
                  {todayBirthdays.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        onClose();
                        onGenerateCard(b);
                      }}
                      className="py-2 px-3.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-xs rounded-xl shadow transition-transform active:scale-95 flex items-center space-x-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Flyer & Captions</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Birthdays (Next 30 Days) */}
            {upcomingBirthdays.length > 0 && (
              <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
                  <span className="flex items-center space-x-1.5">
                    <Gift className="w-3.5 h-3.5" />
                    <span>Upcoming Birthdays (Next 30 Days)</span>
                  </span>
                  <span className="text-[11px] text-stone-500">{upcomingBirthdays.length} coursemates</span>
                </div>

                <div className="flex space-x-2.5 overflow-x-auto pb-2 scrollbar-thin">
                  {upcomingBirthdays.map((s) => {
                    const daysLeft = getDaysUntilBirthday(s.dob_month, s.dob_day);
                    const monthName = months[s.dob_month - 1]?.label.substring(0, 3);

                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          onClose();
                          onGenerateCard(s);
                        }}
                        className="flex-shrink-0 bg-stone-900 border border-stone-800 hover:border-emerald-700/80 rounded-xl p-2.5 flex items-center space-x-2.5 cursor-pointer transition-all hover:bg-stone-850 min-w-[190px]"
                      >
                        <img
                          src={s.photo_url}
                          alt={s.full_name}
                          className="w-9 h-9 rounded-full object-cover border border-emerald-500/50 flex-shrink-0"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{s.full_name}</p>
                          <p className="text-[11px] text-stone-400">
                            {monthName} {s.dob_day} •{' '}
                            <span className="text-emerald-400 font-semibold">
                              {daysLeft === 1 ? 'Tomorrow!' : `in ${daysLeft}d`}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search coursemates..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-8 pr-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-stone-400 font-medium">Month:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-emerald-500 font-semibold"
                >
                  <option value="all">All Months ({students.length})</option>
                  {months.map((m) => {
                    const count = students.filter((s) => s.dob_month === m.value).length;
                    return (
                      <option key={m.value} value={m.value}>
                        {m.label} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Coursemates Birthday Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredStudents.map((student) => {
                const monthName = months[student.dob_month - 1]?.label || '';
                const bdayString = `${monthName} ${student.dob_day}`;

                return (
                  <div
                    key={student.id}
                    className="bg-stone-950/80 border border-stone-800 hover:border-emerald-800/80 rounded-xl p-3.5 flex flex-col justify-between space-y-3 shadow transition-all"
                  >
                    <div className="flex items-start space-x-3">
                      <img
                        src={student.photo_url}
                        alt={student.full_name}
                        className="w-13 h-13 rounded-xl object-cover border border-emerald-900/60 shadow flex-shrink-0"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                          {student.full_name}
                        </h4>
                        {student.nickname && (
                          <p className="text-[11px] text-emerald-400 font-semibold truncate">
                            "{student.nickname}"
                          </p>
                        )}
                        <div className="inline-flex items-center space-x-1 mt-1 text-[11px] text-stone-300 font-medium">
                          <Calendar className="w-3 h-3 text-emerald-400" />
                          <span>{bdayString}</span>
                        </div>
                      </div>
                    </div>

                    {student.interests && (
                      <p className="text-[11px] text-stone-400 line-clamp-1 italic bg-stone-900/50 p-1.5 rounded">
                        {student.interests}
                      </p>
                    )}

                    <button
                      onClick={() => {
                        onClose();
                        onGenerateCard(student);
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs font-bold transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Flyer & WhatsApp Captions</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
