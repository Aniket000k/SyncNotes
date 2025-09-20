const NoteCard = ({ note, viewMode, onSelect, onDelete }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const preview = note.content.length > 100 
    ? note.content.substring(0, 100) + '...' 
    : note.content;

  if (viewMode === 'list') {
    return (
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700 "
        onClick={onSelect}
      >
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-800 dark:text-white truncate">{note.title || 'Untitled'}</h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 ml-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-line">{preview}</p>
        {note.updatedAt && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">{formatDate(note.updatedAt)}</p>
        )}
      </div>
    );
  }

  // Grid view (default)
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700 h-64 flex flex-col"
      onClick={onSelect}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-800 dark:text-white truncate text-lg">{note.title || 'Untitled'}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 ml-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <div className="flex-grow overflow-hidden">
        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line line-clamp-5">{preview}</p>
      </div>
      {note.updatedAt && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">{formatDate(note.updatedAt)}</p>
      )}
    </div>
  );
};

export default NoteCard;