import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Sidebar = ({ notes, selectedNote, onSelectNote, onCreateNote, onDeleteNote, isOpen, onToggle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { isDarkMode } = useTheme();

  const normalizedSearch = searchTerm.toLowerCase();
  const filteredNotes = notes.filter((note) => {
    const title = (note.title || '').toLowerCase();
    const content = (note.content || '').toLowerCase();
    return (
      title.includes(normalizedSearch) || content.includes(normalizedSearch)
    );
  });

  return (
    <div className="relative">
      {/* Mobile Header */}
      <div
        className={`md:hidden fixed top-0 left-0 right-0 h-16 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } z-20 flex items-center px-4 border-b`}
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
        className={`fixed md:relative w-64 md:w-80 flex flex-col h-screen transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } z-20 shadow-lg`}
      >
        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={onCreateNote}
            className="w-full text-white py-2 px-4 rounded-md font-medium flex items-center justify-center bg-purple-600 transition-colors shadow-md hover:bg-gradient-to-r from-purple-500 to-indigo-500"
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

          <div className="mt-4 relative">
            <input
              type="text"
              placeholder="Search notes..."
              className={`w-full pl-10 pr-10 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-xs"
              >
                ×
              </button>
            )}
          </div>
          <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {filteredNotes.length} note{filteredNotes.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto sidebar-scroll">
          {filteredNotes.length === 0 ? (
            <div
              className={`p-4 text-center ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              {searchTerm ? 'No notes match your search.' : 'No notes yet. Create one!'}
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                    selectedNote?.id === note.id
                      ? isDarkMode
                        ? 'border-purple-500 bg-gray-700'
                        : 'bg-purple-50 border-purple-500'
                      : isDarkMode
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => onSelectNote(note)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <h3
                        className={`font-semibold truncate max-w-[10rem] ${
                          isDarkMode ? 'text-white' : 'text-gray-800'
                        }`}
                      >
                        {note.title || 'Untitled'}
                      </h3>
                      {note.reminderAt && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">
                          ⏰
                        </span>
                      )}
                      {Array.isArray(note.images) && note.images.length > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800">
                          🖼 {note.images.length}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNote(note.id);
                      }}
                      className="text-gray-400 hover:text-red-500 ml-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                  <p
                    className={`text-sm mt-1 whitespace-pre-line ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {(note.content || '').length > 100
                      ? `${note.content.substring(0, 100)}...`
                      : note.content}
                  </p>
                  {note.updatedAt && (
                    <p
                      className={`text-xs mt-2 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}
                    >
                      {new Date(
                        note.updatedAt.toDate
                          ? note.updatedAt.toDate()
                          : note.updatedAt
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
