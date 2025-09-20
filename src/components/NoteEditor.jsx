import { useState, useEffect } from 'react';

const NoteEditor = ({ note, isCreating, onSave, onCancel, onDelete }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
    } else {
      setTitle('');
      setContent('');
    }
  }, [note]);

  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    await onSave({
      id: note?.id,
      title: title.trim(),
      content: content.trim()
    });
    setIsSaving(false);
  };

  const handleDelete = () => {
    if (note?.id && window.confirm('Are you sure you want to delete this note?')) {
      onDelete(note.id);
    }
  };

  // Check if we have a note to display (either existing or new)
  const hasNote = note !== null;

  if (!hasNote) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 h-screen ">
        <div className="text-center p-8 max-w-md">
          <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-xl font-medium text-gray-900">Welcome to SyncNotes</h3>
          <p className="mt-2 text-gray-500">Select a note from the sidebar or create a new one to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white ">
      <div className="border-b border-gray-200 p-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Note title"
          className="text-xl font-semibold w-full border-none focus:outline-none focus:ring-0"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex space-x-2">
          {isCreating && (
            <button
              onClick={onCancel}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className=" bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 hover:bg-gradient-to-r from-purple-500 to-indigo-500 transition-colors shadow-md"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          {!isCreating && note?.id && (
            <button
              onClick={handleDelete}
              className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-md text-sm font-medium"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 p-4">
        <textarea
          placeholder="Start writing your note here..."
          className="w-full h-full resize-none border-none focus:outline-none focus:ring-0 text-gray-700"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
    </div>
  );
};

export default NoteEditor;