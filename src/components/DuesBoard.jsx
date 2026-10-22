import React, { useState } from 'react';
import { Search, ExternalLink } from 'lucide-react';

export default function DuesBoard({ students, onViewReceipt }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter students by search
  const filteredStudents = students.filter((s) => {
    return (
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nickname && s.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Search Input */}
      <div className="relative w-full">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or nickname..."
          className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Main Table of Names that have paid */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-1.5">
            <p className="text-sm font-semibold text-stone-300">No records found</p>
            <p className="text-xs text-stone-500">No one matches your search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-950/80 border-b border-stone-800 text-stone-400 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-3.5 sm:px-4 w-12">#</th>
                  <th className="py-3 px-3.5 sm:px-4">NAMES</th>
                  <th className="py-3 px-3.5 sm:px-4">BIRTHDAY</th>
                  <th className="py-3 px-3.5 sm:px-4 text-right">PROOF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80">
                {filteredStudents.map((student, idx) => {
                  const bdayStr = `${months[student.dob_month - 1]} ${student.dob_day}`;

                  return (
                    <tr 
                      key={student.id} 
                      className="hover:bg-stone-800/30 transition-colors"
                    >
                      {/* # Number */}
                      <td className="py-3 px-3.5 sm:px-4 text-stone-500 font-mono text-xs">
                        {idx + 1}
                      </td>

                      {/* NAMES */}
                      <td className="py-3 px-3.5 sm:px-4">
                        <div className="flex items-center space-x-2.5 sm:space-x-3">
                          <img
                            src={student.photo_url}
                            alt={student.full_name}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-emerald-900/60 flex-shrink-0"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                            }}
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-white block text-xs sm:text-sm truncate">
                              {student.full_name}
                            </span>
                            {student.nickname && (
                              <span className="text-[11px] text-emerald-400 font-semibold block truncate">
                                "{student.nickname}"
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* BIRTHDAY */}
                      <td className="py-3 px-3.5 sm:px-4 text-stone-300 font-medium whitespace-nowrap text-xs sm:text-sm">
                        {bdayStr}
                      </td>

                      {/* PROOF / ACTION */}
                      <td className="py-3 px-3.5 sm:px-4 text-right">
                        {student.receipt_url ? (
                          <button
                            onClick={() => onViewReceipt(student)}
                            className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-800 hover:border-emerald-800 transition-colors whitespace-nowrap"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>View Receipt</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-stone-500 italic">No receipt</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
