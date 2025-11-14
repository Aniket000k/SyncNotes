import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

const Sidebar = ({ notes, isOpen, onToggle, onCreateNote }) => {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");

  const totalNotes = notes.length;
  const reminderNotes = notes.filter((note) => note.reminderAt).length;
  const imageNotes = notes.filter(
    (note) => Array.isArray(note.images) && note.images.length > 0
  ).length;

  const normalizedSearch = searchTerm.toLowerCase();
  const matchingNotes = normalizedSearch
    ? notes.filter((note) => {
        const title = (note.title || "").toLowerCase();
        const content = (note.content || "").toLowerCase();
        return (
          title.includes(normalizedSearch) || content.includes(normalizedSearch)
        );
      })
    : notes;

  return (
    <div className="h-full">
      {/* MOBILE HEADER */}
      <div
        className={`md:hidden fixed top-0 left-0 right-0 h-16 ${
          isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
        } z-30 flex items-center px-4 border-b`}
      >
        <button
          onClick={onToggle}
          className={`p-2 rounded-md ${
            isDarkMode ? "text-white hover:bg-gray-700" : "text-gray-900 hover:bg-gray-100"
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>

        <h1 className={`ml-4 text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          SyncNotes
        </h1>
      </div>

      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          h-full 
          w-64 md:w-80 
          flex flex-col
        
          /* fixed only on mobile */
          fixed md:relative 
          top-0 left-0
        
          /* slide animation */
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        
          /* theme */
          ${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}
        
          /* desktop border */
          md:border-r
        
          /* shadow only on mobile */
          shadow-xl md:shadow-none
        
          /* z-index fix so dashboard is visible */
          ${isOpen ? "z-40" : "z-0 md:z-0"}
        `}
      >

        {/* TOP AREA */}
        <div className={`p-4 border-b ${isDarkMode ? "border-gray-800" : "border-gray-100"}`}>
          <button
            onClick={onCreateNote}
            className="w-full text-white py-2.5 px-4 rounded-xl font-medium flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-500 shadow-lg hover:shadow-xl hover:from-purple-500 hover:to-indigo-400 transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Note
          </button>

          {/* STATS */}
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            {/* Notes */}
            <div
              className={`rounded-xl py-3 flex flex-col items-center ${
                isDarkMode ? "bg-gray-800 text-gray-100" : "bg-purple-50 text-purple-700"
              }`}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6M9 8h6M5 5h14v14H5z" />
                </svg>
              </div>
              <p className="mt-1 font-semibold text-sm">{totalNotes}</p>
            </div>

            {/* Reminders */}
            <div
              className={`rounded-xl py-3 flex flex-col items-center ${
                isDarkMode ? "bg-gray-800 text-gray-100" : "bg-amber-50 text-amber-700"
              }`}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l2 2m6-2a8 8 0 11-16 0 8 8 0 0116 0z" />
                </svg>
              </div>
              <p className="mt-1 font-semibold text-sm">{reminderNotes}</p>
            </div>

            {/* Image Notes */}
            <div
              className={`rounded-xl py-3 flex flex-col items-center ${
                isDarkMode ? "bg-gray-800 text-gray-100" : "bg-sky-50 text-sky-700"
              }`}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L22 16M4 6h16v12H4z" />
                </svg>
              </div>
              <p className="mt-1 font-semibold text-sm">{imageNotes}</p>
            </div>
          </div>

          {/* SEARCH */}
          <div className="mt-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search notes..."
                className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  isDarkMode
                    ? "bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-400"
                    : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500"
                }`}
              />
              <svg
                className="w-4 h-4 absolute left-3 top-2.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-4.35-4.35M11 17a6 6 0 100-12 6 6 0 000 12z"
                />
              </svg>
            </div>
            <p className={`mt-1 text-[11px] ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              {normalizedSearch
                ? `${matchingNotes.length} note${matchingNotes.length === 1 ? "" : "s"} match your search`
                : `${totalNotes} total note${totalNotes === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>

        {/* STICKER AREA */}
        <div className="flex-none px-4 pb-4 pt-3 flex flex-col gap-3">
          {/* Sticker 1 */}
          <div
            className={`h-20 rounded-2xl shadow-md flex items-center justify-center ${
              isDarkMode ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-amber-100 to-yellow-100"
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <svg className="w-7 h-7 text-purple-500/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h10v10H7zM9 5h6M9 19h6" />
              </svg>
              <p className={`mt-1 text-[10px] ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                Capture ideas before they fade.
              </p>
            </div>
          </div>
 
          {/* Sticker 2 */}
          <div
            className={`h-20 rounded-2xl shadow-md flex items-center justify-center ${
              isDarkMode ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-blue-100 to-sky-100"
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <svg className="w-7 h-7 text-indigo-500/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l2 2m6-2a8 8 0 11-16 0 8 8 0 0116 0z" />
              </svg>
              <p className={`mt-1 text-[10px] ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                Remember what matters, right on time.
              </p>
            </div>
          </div>
 
          {/* Sticker 3 */}
          <div
            className={`h-20 rounded-2xl shadow-md flex items-center justify-center ${
              isDarkMode ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-emerald-100 to-teal-100"
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <svg className="w-7 h-7 text-emerald-500/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h10M4 14h7M4 18h4" />
              </svg>
              <p className={`mt-1 text-[10px] ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                Organize thoughts, clear your mind.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Sidebar;
