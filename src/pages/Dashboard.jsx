import { useState, useEffect, useRef } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import Sidebar from '../components/Sidebar';
import NoteCard from '../components/NoteCard';
import { useTheme } from '../contexts/ThemeContext';

// Soft pastel palette for note backgrounds
const NOTE_COLORS = [
  '#fef3c7', // amber-100
  '#e0f2fe', // sky-100
  '#e0f7fa', // cyan-100
  '#fce7f3', // pink-100
  '#ede9fe', // violet-100
  '#dcfce7', // green-100
];

const getRandomNoteColor = () => {
  const index = Math.floor(Math.random() * NOTE_COLORS.length);
  return NOTE_COLORS[index];
};

const Dashboard = ({ isSidebarOpen, onSidebarToggle }) => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [alerts, setAlerts] = useState([]); // automated reminders
  const alertedNoteIdsRef = useRef(new Set());
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setError('No user logged in');
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'users', user.uid, 'notes'),
        orderBy('updatedAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const notesData = [];
          querySnapshot.forEach((docSnap) => {
            notesData.push({ id: docSnap.id, ...docSnap.data() });
          });
          setNotes(notesData);
          setLoading(false);
          setError('');
        },
        (error) => {
          console.error('Firestore error:', error);
          setError('Error loading notes: ' + error.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up Firestore listener:', error);
      setError('Failed to load notes: ' + error.message);
      setLoading(false);
    }
  }, []);

  // Automated reminder alerts (runs in the background while on dashboard)
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const newAlerts = [];

      notes.forEach((note) => {
        if (!note.reminderAt) return;

        let reminderDate;
        try {
          // Firestore Timestamp has toDate(); fallback if already Date
          reminderDate = note.reminderAt.toDate ? note.reminderAt.toDate() : new Date(note.reminderAt);
        } catch {
          return;
        }

        if (reminderDate <= now && !alertedNoteIdsRef.current.has(note.id)) {
          alertedNoteIdsRef.current.add(note.id);
          newAlerts.push({
            id: note.id,
            title: note.title || 'Untitled note',
            message: 'Reminder time reached',
          });

          // Optional browser notification if allowed
          if ("Notification" in window && Notification.permission === 'granted') {
            new Notification('Note reminder', {
              body: note.title || 'You have a note reminder',
            });
          }
        }
      });

      if (newAlerts.length > 0) {
        setAlerts((prev) => [...prev, ...newAlerts]);
      }
    };

    // Ask for notification permission once
    if ("Notification" in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    const interval = setInterval(checkReminders, 30000); // every 30s
    return () => clearInterval(interval);
  }, [notes]);

  const handleCreateNote = () => {
    setSelectedNote({
      id: null,
      title: '',
      content: '',
      reminderAt: '',
      reminderEnabled: false,
      images: [],
      color: getRandomNoteColor(),
      isNew: true,
    });
    setIsCreating(true);
  };

  const handleSaveNote = async (noteData) => {
    const user = auth.currentUser;
    if (!user) {
      setError('No user logged in');
      return;
    }

    const reminderDate = noteData.reminderEnabled && noteData.reminderAt
      ? new Date(noteData.reminderAt)
      : null;
    const images = Array.isArray(noteData.images) ? noteData.images : [];
    const color = noteData.color || getRandomNoteColor();

    try {
      if (noteData.id) {
        const noteRef = doc(db, 'users', user.uid, 'notes', noteData.id);
        await updateDoc(noteRef, {
          title: noteData.title,
          content: noteData.content,
          updatedAt: new Date(),
          reminderEnabled: !!reminderDate,
          ...(reminderDate ? { reminderAt: reminderDate } : { reminderAt: null }),
          images,
          color,
        });
      } else {
        const newNote = {
          title: noteData.title,
          content: noteData.content,
          createdAt: new Date(),
          updatedAt: new Date(),
          reminderEnabled: !!reminderDate,
          ...(reminderDate ? { reminderAt: reminderDate } : {}),
          images,
          color,
        };
        await addDoc(collection(db, 'users', user.uid, 'notes'), newNote);
      }

      setIsCreating(false);
      setSelectedNote(null);
      setError('');
    } catch (error) {
      console.error('Error saving note:', error);
      setError('Failed to save note: ' + error.message);
    }
  };

  const handleDeleteNote = async (noteId) => {
    const user = auth.currentUser;
    if (!user) {
      setError('No user logged in');
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'notes', noteId));
      if (selectedNote && selectedNote.id === noteId) {
        setSelectedNote(null);
        setIsCreating(false);
      }
      setError('');
    } catch (error) {
      console.error('Error deleting note:', error);
      setError('Failed to delete note: ' + error.message);
    }
  };

  const handleCancelCreate = () => {
    setSelectedNote(null);
    setIsCreating(false);
  };

  const handleSelectNote = (note) => {
    // Normalize reminder for the datetime-local input
    let reminderAt = '';
    if (note.reminderAt) {
      try {
        const date = note.reminderAt.toDate ? note.reminderAt.toDate() : new Date(note.reminderAt);
        reminderAt = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
      } catch {
        reminderAt = '';
      }
    }

    setSelectedNote({
      ...note,
      reminderAt,
      reminderEnabled: !!note.reminderAt,
      images: Array.isArray(note.images) ? note.images : [],
      color: note.color || getRandomNoteColor(),
    });
    setIsCreating(false);
  };

  const handleImagesChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const readers = files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );

    try {
      const newImages = await Promise.all(readers);
      setSelectedNote((prev) => ({
        ...prev,
        images: [...(prev?.images || []), ...newImages],
      }));
    } catch (e) {
      console.error('Error reading images', e);
    } finally {
      event.target.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    setSelectedNote((prev) => ({
      ...prev,
      images: (prev?.images || []).filter((_, i) => i !== index),
    }));
  };

  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  // If we're creating or editing a note, show the editor
  if (isCreating || selectedNote) {
    return (
      <div className="h-screen w-screen bg-gray-50 dark:bg-gray-900">
        <div className="h-full pt-16">
          <div className="max-w-7xl mx-auto h-full flex">
            <Sidebar
              notes={notes}
              selectedNote={selectedNote}
              onSelectNote={handleSelectNote}
              onCreateNote={handleCreateNote}
              onDeleteNote={handleDeleteNote}
              isOpen={isSidebarOpen}
              onToggle={onSidebarToggle}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 pt-4 pb-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/80 backdrop-blur">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Editing</p>
                  <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedNote?.id ? 'Edit note' : 'New note'}
                  </h1>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCancelCreate}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isDarkMode
                        ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    Back to overview
                  </button>
                  <button
                    onClick={() => handleSaveNote(selectedNote)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 hover:bg-gradient-to-r from-purple-500 to-indigo-500 transition-colors shadow-md"
                  >
                    Save changes
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto px-6 pb-6 pt-4">
                {/* Alerts bar */}
                {alerts.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-center justify-between rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-amber-900 text-sm shadow-sm dark:bg-amber-900/20 dark:border-amber-600 dark:text-amber-100"
                      >
                        <div>
                          <p className="font-semibold">{alert.title}</p>
                          <p className="text-xs">{alert.message}</p>
                        </div>
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="ml-4 text-amber-700 hover:text-amber-900 dark:text-amber-200 dark:hover:text-amber-50"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className={`rounded-2xl shadow-sm border ${
                    isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                  }`}
                  style={selectedNote?.color ? { borderTop: `4px solid ${selectedNote.color}` } : undefined}
                >
                  <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <input
                      type="text"
                      placeholder="Give your note a clear, descriptive title"
                      className={`w-full text-2xl font-semibold border-none bg-transparent focus:outline-none focus:ring-0 ${
                        isDarkMode
                          ? 'text-white placeholder-gray-500'
                          : 'text-gray-900 placeholder-gray-400'
                      }`}
                      value={selectedNote?.title || ''}
                      onChange={(e) =>
                        setSelectedNote({
                          ...selectedNote,
                          title: e.target.value,
                        })
                      }
                    />

                    <div className="mt-2 md:mt-0 flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700 shadow-inner"
                        style={{ backgroundColor: selectedNote?.color || '#f9fafb' }}
                      />
                      <input
                        type="color"
                        className="w-9 h-9 p-0 border-none bg-transparent cursor-pointer"
                        value={selectedNote?.color || '#fef3c7'}
                        onChange={(e) =>
                          setSelectedNote({
                            ...selectedNote,
                            color: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="p-5 border-b border-gray-200 dark:border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Reminder
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedNote((prev) => {
                              const enabled = !prev?.reminderEnabled;
                              return {
                                ...prev,
                                reminderEnabled: enabled,
                                reminderAt: enabled ? prev?.reminderAt || '' : '',
                              };
                            })
                          }
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
                            selectedNote?.reminderEnabled ? 'bg-purple-500' : 'bg-gray-400'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                              selectedNote?.reminderEnabled ? 'translate-x-4' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <input
                        type="datetime-local"
                        className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          isDarkMode
                            ? 'bg-gray-900 border-gray-700 text-gray-100'
                            : 'bg-white border-gray-300 text-gray-900'
                        } ${!selectedNote?.reminderEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        value={selectedNote?.reminderAt || ''}
                        onChange={(e) =>
                          setSelectedNote({
                            ...selectedNote,
                            reminderAt: e.target.value,
                          })
                        }
                        disabled={!selectedNote?.reminderEnabled}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Quick colors
                      </label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {NOTE_COLORS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() =>
                              setSelectedNote({
                                ...selectedNote,
                                color: c,
                              })
                            }
                            className={`w-7 h-7 rounded-full border ${
                              selectedNote?.color === c ? 'border-purple-500 scale-110' : 'border-transparent'
                            } transition-transform`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Attach images
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImagesChange}
                        className="block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900/40 dark:file:text-purple-100"
                      />
                    </div>
                  </div>

                  {selectedNote?.images && selectedNote.images.length > 0 && (
                    <div className="px-5 pt-4">
                      <p className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Images
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {selectedNote.images.map((src, index) => (
                          <div
                            key={index}
                            className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                          >
                            <img
                              src={src}
                              alt={`Note image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-5">
                    <textarea
                      placeholder="Start writing your note here..."
                      className={`w-full min-h-[260px] resize-none border-none bg-transparent focus:outline-none focus:ring-0 text-sm leading-relaxed ${
                        isDarkMode
                          ? 'text-gray-100 placeholder-gray-500'
                          : 'text-gray-800 placeholder-gray-400'
                      }`}
                      value={selectedNote?.content || ''}
                      onChange={(e) =>
                        setSelectedNote({
                          ...selectedNote,
                          content: e.target.value,
                        })
                      }
                    />

                    {error && (
                      <p className="text-sm text-red-500 mt-2">{error}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
      </div>
    );
  }

  // Default dashboard view with all notes in cards
  return (
    <div className="h-screen w-screen bg-gray-50 dark:bg-gray-900">
      <div className="h-full pt-16">
        <div className="max-w-7xl mx-auto h-full flex">
          <Sidebar
            notes={notes}
            selectedNote={selectedNote}
            onSelectNote={handleSelectNote}
            onCreateNote={handleCreateNote}
            onDeleteNote={handleDeleteNote}
            isOpen={isSidebarOpen}
            onToggle={onSidebarToggle}
          />

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-4 pb-3 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/80 backdrop-blur">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Overview</p>
                <h1 className={`text-2xl md:text-3xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  My notes
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCreateNote}
                  className="hidden sm:inline-flex items-center bg-purple-600 hover:bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium px-4 py-2 rounded-md text-sm shadow-md"
                >
                  <span className="mr-2 text-lg">＋</span> New note
                </button>
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                    isDarkMode
                      ? 'bg-gray-800 text-gray-100 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {viewMode === 'grid' ? 'List view' : 'Grid view'}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto px-6 pb-6 pt-4">
              {/* Alerts bar */}
              {alerts.length > 0 && (
                <div className="mb-4 space-y-2">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-amber-900 text-sm shadow-sm dark:bg-amber-900/20 dark:border-amber-600 dark:text-amber-100"
                    >
                      <div>
                        <p className="font-semibold">{alert.title}</p>
                        <p className="text-xs">{alert.message}</p>
                      </div>
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="ml-4 text-amber-700 hover:text-amber-900 dark:text-amber-200 dark:hover:text-amber-50"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <p className="text-sm text-red-500 mb-4">{error}</p>
              )}

              {notes.length === 0 ? (
                <div className={`rounded-2xl shadow-sm border p-10 text-center ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                  <svg
                    className={`w-16 h-16 mx-auto ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className={`mt-4 text-xl font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    No notes yet
                  </h3>
                  <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Create your first note to get started.
                  </p>
                  <button
                    onClick={handleCreateNote}
                    className="mt-4 bg-purple-600 hover:bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium py-2 px-4 rounded-md shadow-md"
                  >
                    Create your first note
                  </button>
                </div>
              ) : (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
                      : 'space-y-4'
                  }
                >
                  {notes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      viewMode={viewMode}
                      onSelect={() => handleSelectNote(note)}
                      onDelete={() => handleDeleteNote(note.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
