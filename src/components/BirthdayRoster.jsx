import React, { useState } from 'react';
import { 
  Sparkles, Calendar, Gift, Search, Share2, Check, 
  PartyPopper, User, Heart, ChevronRight 
} from 'lucide-react';

export default function BirthdayRoster({ students, onGenerateCard }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

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
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentDay = now.getDate();

  // Calculate days until next birthday
  const getDaysUntilBirthday = (dobMonth, dobDay) => {
    const thisYear = now.getFullYear();
    let bdayDate = new Date(thisYear, dobMonth - 1, dobDay);
    if (bdayDate < new Date(thisYear, currentMonth - 1, currentDay)) {
      bdayDate = new Date(thisYear + 1, dobMonth - 1, dobDay);
    }
    const diffTime = bdayDate - new Date(thisYear, currentMonth - 1, currentDay);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Find today's birthdays and upcoming 30 days
  const todayBirthdays = students.filter(
    (s) => s.dob_month === currentMonth && s.dob_day === currentDay
  );

  const upcomingBirthdays = students
    .filter((s) => {
      const days = getDaysUntilBirthday(s.dob_month, s.dob_day);
      return days > 0 && days <= 35;
    })
    .sort((a, b) => getDaysUntilBirthday(a.dob_month, a.dob_day) - getDaysUntilBirthday(b.dob_month, b.dob_day));

  // Filter list
  const filteredStudents = students.filter((s) => {
    const matchesSearch = 
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.matric_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nickname && s.nickname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.interests && s.interests.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedMonth !== 'all' && s.dob_month !== parseInt(selectedMonth)) return false;

    return true;
  });

  const handleCopyWish = (student) => {
    const monthName = months[student.dob_month - 1]?.label || '';
    const text = `🎉 *HAPPY BIRTHDAY TO OUR ESTEEMED GEOMATICIAN!* 🎂\n\n*Name:* ${student.full_name} ${student.nickname ? `("${student.nickname}")` : ''}\n*Matric No:* ${student.matric_no}\n*Birthday:* ${monthName} ${student.dob_day}\n\nMay your coordinates always lead to prosperity, breakthroughs, and boundary-breaking triumphs! 📐🌍\n\n_Courtesy: Office of the Course Representative & NISGS Department of Surveying and Geoinformatics_`;
    navigator.clipboard.writeText(text);
    setCopiedId(student.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Today's Birthday Spotlight */}
      {todayBirthdays.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-900/90 via-stone-900 to-emerald-950 border border-emerald-500 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-center sm:text-left">
              <div className="p-3 bg-emerald-500 text-emerald-950 rounded-xl font-bold">
                <PartyPopper className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest font-extrabold text-emerald-300">
                  🎉 CELEBRATING TODAY'S GEOMATICIAN!
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  {todayBirthdays.map((b) => b.full_name).join(', ')}
                </h3>
                <p className="text-xs text-stone-300">
                  Today is their birthday! Roll out their NISGS celebration flyer!
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {todayBirthdays.map((b) => (
                <button
                  key={b.id}
                  onClick={() => onGenerateCard(b)}
                  className="py-2.5 px-4 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Flyer for {b.nickname || b.full_name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Birthdays Carousel / Pill Row */}
      {upcomingBirthdays.length > 0 && (
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Gift className="w-4 h-4" />
              <span>Upcoming Birthdays (Next 30 Days)</span>
            </div>
            <span className="text-xs text-stone-400">{upcomingBirthdays.length} coursemates</span>
          </div>

          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin">
            {upcomingBirthdays.map((s) => {
              const daysLeft = getDaysUntilBirthday(s.dob_month, s.dob_day);
              const monthName = months[s.dob_month - 1]?.label.substring(0, 3);

              return (
                <div
                  key={s.id}
                  onClick={() => onGenerateCard(s)}
                  className="flex-shrink-0 bg-stone-950/80 border border-stone-800 hover:border-emerald-700/70 rounded-xl p-3 flex items-center space-x-3 cursor-pointer transition-all hover:bg-stone-950 min-w-[210px]"
                >
                  <img
                    src={s.photo_url}
                    alt={s.full_name}
                    className="w-10 h-10 rounded-full object-cover border border-emerald-500/50 flex-shrink-0"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{s.full_name}</p>
                    <p className="text-[11px] text-stone-400">
                      {monthName} {s.dob_day} •{' '}
                      <span className="text-emerald-400 font-semibold">
                        {daysLeft === 1 ? 'Tomorrow!' : `in ${daysLeft} days`}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & Month Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, nickname, or interests..."
            className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Month Dropdown / Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-stone-400 font-medium">Month:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500 font-semibold"
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

      {/* Coursemates Directory Grid */}
      {filteredStudents.length === 0 ? (
        <div className="bg-stone-900/60 border border-stone-800 rounded-2xl py-12 px-4 text-center space-y-2">
          <p className="text-sm font-semibold text-stone-300">No coursemates found</p>
          <p className="text-xs text-stone-500">Try adjusting your search query or selecting a different month.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const monthName = months[student.dob_month - 1]?.label || '';
            const bdayString = `${monthName} ${student.dob_day}`;
            const isPaid = student.dues_status === 'paid' && student.verified_by_admin === 1;

            return (
              <div
                key={student.id}
                className="bg-stone-900/90 border border-stone-800 hover:border-emerald-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-lg transition-all"
              >
                {/* Top Section with Photo & Info */}
                <div className="flex items-start space-x-3.5">
                  <div className="relative">
                    <img
                      src={student.photo_url}
                      alt={student.full_name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-900/60 shadow-md"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
                      }}
                    />
                    {isPaid ? (
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-stone-900 flex items-center justify-center text-[10px] text-emerald-950 font-bold" title="Dues Paid">
                        ✓
                      </span>
                    ) : (
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-rose-500 border-2 border-stone-900 flex items-center justify-center text-[9px] text-white font-bold" title="Dues Unpaid">
                        !
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-white leading-snug truncate">
                      {student.full_name}
                    </h4>

                    {student.nickname && (
                      <p className="text-xs text-emerald-400 font-semibold truncate">
                        "{student.nickname}"
                      </p>
                    )}

                    <p className="text-[11px] font-mono text-stone-400 mt-0.5">
                      {student.matric_no}
                    </p>

                    <div className="inline-flex items-center space-x-1 mt-1.5 px-2 py-0.5 rounded-md bg-stone-950 border border-stone-800 text-[11px] text-stone-300 font-medium">
                      <Calendar className="w-3 h-3 text-emerald-400" />
                      <span>{bdayString}</span>
                    </div>
                  </div>
                </div>

                {/* Interests / Side Quests */}
                {student.interests && (
                  <div className="bg-stone-950/70 border border-stone-800/80 rounded-xl p-2.5 text-[11px] text-stone-300 leading-relaxed">
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400/90 font-bold block mb-0.5">
                      Interests & Side Quests:
                    </span>
                    <p className="line-clamp-2">{student.interests}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 border-t border-stone-800/80 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onGenerateCard(student)}
                    className="py-2 px-2.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[11px] font-bold transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Flyer Design</span>
                  </button>

                  <button
                    onClick={() => handleCopyWish(student)}
                    className="py-2 px-2.5 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800 text-[11px] font-medium transition-colors flex items-center justify-center space-x-1.5"
                  >
                    {copiedId === student.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Copy Wish</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
