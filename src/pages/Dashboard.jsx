import { useState, useEffect } from 'react';
import { collection, query,  onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import Sidebar from '../components/Sidebar';
import NoteCard from '../components/NoteCard';
import { useTheme } from '../contexts/ThemeContext';

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');
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

      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const notesData = [];
          querySnapshot.forEach((doc) => {
            notesData.push({ id: doc.id, ...doc.data() });
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

  const handleCreateNote = () => {
    setSelectedNote({
      id: null,
      title: '',
      content: '',
      isNew: true
    });
    setIsCreating(true);
  };

  const handleSaveNote = async (noteData) => {
    const user = auth.currentUser;
    if (!user) {
      setError('No user logged in');
      return;
    }

    try {
      if (noteData.id) {
        const noteRef = doc(db, 'users', user.uid, 'notes', noteData.id);
        await updateDoc(noteRef, {
          title: noteData.title,
          content: noteData.content,
          updatedAt: new Date()
        });
      } else {
        const newNote = {
          title: noteData.title,
          content: noteData.content,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await addDoc(collection(db, 'users', user.uid, 'notes'), newNote);
      }
      
      setIsCreating(false);
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
    setSelectedNote(note);
    setIsCreating(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If we're creating or editing a note, show the editor
  if (isCreating || selectedNote) {
    return (
      <div className="flex  bg-white dark:bg-gray-900 ">
        <Sidebar
          notes={notes}
          selectedNote={selectedNote}
          onSelectNote={handleSelectNote}
          onCreateNote={handleCreateNote}
          onDeleteNote={handleDeleteNote}
        />
        
        <div className="flex-1 overflow-auto p-6 h-screen ">
          <div className={`rounded-xl shadow-md p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedNote?.id ? 'Edit Note' : 'Create New Note'}
              </h1>
              <button
                onClick={() => setSelectedNote(null)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Back to Dashboard
              </button>
            </div>
            
            <div className={` rounded-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <input
                type="text"
                placeholder="Note title"
                className={`w-full text-2xl font-bold border-none bg-transparent focus:outline-none focus:ring-0 mb-4 ${
                  isDarkMode 
                    ? 'text-white placeholder-gray-400' 
                    : 'text-gray-900 placeholder-gray-500'
                }`}
                value={selectedNote?.title || ''}
                onChange={(e) => setSelectedNote({...selectedNote, title: e.target.value})}
              />
              
              <textarea
                placeholder="Start writing your note here..."
                className={`w-full h-64 resize-none border-none bg-transparent focus:outline-none focus:ring-0 ${
                  isDarkMode 
                    ? 'text-gray-300 placeholder-gray-400' 
                    : 'text-gray-700 placeholder-gray-500'
                }`}
                value={selectedNote?.content || ''}
                onChange={(e) => setSelectedNote({...selectedNote, content: e.target.value})}
              />
              
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={handleCancelCreate}
                  className={`px-4 py-2 rounded-md font-medium ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveNote(selectedNote)}
                  className=" bg-purple-600 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 hover:bg-gradient-to-r from-purple-500 to-indigo-500 transition-colors shadow-md"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default dashboard view with all notes in cards
  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      <Sidebar
        notes={notes}
        selectedNote={selectedNote}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
      />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>My Notes</h1>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </button>
        </div>

        {notes.length === 0 ? (
          <div className={`rounded-xl shadow-md p-8 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <svg className={`w-16 h-16 mx-auto ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className={`mt-4 text-xl font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No notes yet</h3>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Create your first note to get started</p>
            <button
              onClick={handleCreateNote}
              className="mt-4 bg-purple-600 hover:bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium py-2 px-4 rounded-md shadow-md"
            >
              Create Your First Note
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {notes.map(note => (
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
  );
};

export default Dashboard;