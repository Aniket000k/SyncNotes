const NoteCard = ({ note, viewMode, onSelect, onDelete }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const previewSource = note.content || '';
  const preview = previewSource.length > 100
    ? previewSource.substring(0, 100) + '...'
    : previewSource;

  const hasReminder = !!note.reminderAt;
  const hasImages = Array.isArray(note.images) && note.images.length > 0;

  if (viewMode === 'list') {
    return (
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
        onClick={onSelect}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-800 dark:text-white truncate max-w-[9rem]">
              {note.title || 'Untitled'}
            </h3>
            {hasReminder && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">
                ⏰
              </span>
            )}
            {hasImages && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800">
                🖼 {note.images.length}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 ml-2"
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
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-line">{preview}</p>
        {note.updatedAt && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
            {formatDate(note.updatedAt)}
          </p>
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
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-gray-800 dark:text-white truncate text-lg max-w-[9rem]">
            {note.title || 'Untitled'}
          </h3>
          {hasReminder && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">
              ⏰
            </span>
          )}
          {hasImages && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800">
              🖼 {note.images.length}
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 ml-2"
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
      <div className="flex-grow overflow-hidden">
        {hasImages && (
          <div className="flex space-x-1 mb-2">
            {note.images.slice(0, 3).map((src, index) => (
              <div
                key={index}
                className="w-10 h-10 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <img
                  src={src}
                  alt={`Note image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line line-clamp-5">{preview}</p>
      </div>
      {note.updatedAt && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
          {formatDate(note.updatedAt)}
        </p>
      )}
    </div>
  );
};

export default NoteCard;
