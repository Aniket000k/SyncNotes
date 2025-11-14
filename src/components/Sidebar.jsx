import { useTheme } from '../contexts/ThemeContext';

const Sidebar = ({ notes, isOpen, onToggle, onCreateNote }) => {
  const { isDarkMode } = useTheme();

  const totalNotes = notes.length;
  const reminderNotes = notes.filter((note) => note.reminderAt).length;
  const imageNotes = notes.filter((note) => Array.isArray(note.images) && note.images.length > 0).length;

  return (
    <div className="relative h-screen">
      {/* Mobile Header */}
      <div
        className={`md:hidden fixed top-0 left-0 right-0 h-16 ${
          isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        } z-30 flex items-center px-4 border-b`}
      >
        <button
          onClick={onToggle}
          className={`p-2 rounded-md ${
            isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'
          }`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>

        <h1
          className={`ml-4 text-xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          SyncNotes
        </h1>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 w-64 md:w-80 flex flex-col transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${
          isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        } md:border-r z-30 md:z-0 shadow-xl md:shadow-none`}
      >
        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
          <button
            onClick={onCreateNote}
            className="w-full text-white py-2.5 px-4 rounded-lg font-semibold flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-500 shadow-md hover:shadow-lg hover:from-purple-500 hover:to-indigo-400 transition"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            New Note
          </button>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className={`rounded-xl py-3 flex flex-col items-center justify-center ${
              isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-purple-50 text-purple-700'
            }`}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6M9 8h6M5 5h14v14H5z"
                  />
                </svg>
              </div>
              <p className="mt-1 text-sm font-semibold">{totalNotes}</p>
            </div>
            <div className={`rounded-xl py-3 flex flex-col items-center justify-center ${
              isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-amber-50 text-amber-700'
            }`}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l2 2m6-2a8 8 0 11-16 0 8 8 0 0116 0z"
                  />
                </svg>
              </div>
              <p className="mt-1 text-sm font-semibold">{reminderNotes}</p>
            </div>
            <div className={`rounded-xl py-3 flex flex-col items-center justify-center ${
              isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-sky-50 text-sky-700'
            }`}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L22 16M4 6h16v12H4z"
                  />
                </svg>
              </div>
              <p className="mt-1 text-sm font-semibold">{imageNotes}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-gradient-to-b from-black/5 to-transparent dark:from-white/5">
          <div className="h-full flex flex-col gap-4 p-4">
            {/* Tall sticker 1 */}
            <div
              className={`flex-1 rounded-3xl shadow-md flex items-center justify-center transform -rotate-2 ${
                isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-amber-100 to-yellow-100'
              }`}
            >
              <svg
                className="w-12 h-12 text-purple-500/80 dark:text-purple-300/80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h10v10H7zM9 5h6M9 19h6"
                />
              </svg>
            </div>

            {/* Tall sticker 2 */}
            <div
              className={`flex-1 rounded-3xl shadow-md flex items-center justify-center transform rotate-1 ${
                isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-sky-100 to-blue-100'
              }`}
            >
              <svg
                className="w-11 h-11 text-indigo-500/80 dark:text-indigo-300/80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l2 2m6-2a8 8 0 11-16 0 8 8 0 0116 0z"
                />
              </svg>
            </div>

            {/* Tall sticker 3 */}
            <div
              className={`flex-1 rounded-3xl shadow-md flex items-center justify-center transform -rotate-1 ${
                isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-emerald-100 to-teal-100'
              }`}
            >
              <svg
                className="w-11 h-11 text-emerald-500/80 dark:text-emerald-300/80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h10M4 14h7M4 18h4"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
