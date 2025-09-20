import { useState } from 'react';
import { auth, db } from '../firebase';
import { signOut, deleteUser, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useTheme } from '../contexts/ThemeContext';
import { deleteDoc, doc, collection, getDocs } from 'firebase/firestore';

const Profile = () => {
  const [user] = useAuthState(auth);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();

  // Function to delete all user data from Firestore
  const deleteUserData = async (userId) => {
    try {
      // Delete user document
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      
      // Delete all user notes
      const notesRef = collection(db, 'users', userId, 'notes');
      const querySnapshot = await getDocs(notesRef);
      
      const deletePromises = [];
      querySnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });
      
      await Promise.all(deletePromises);
      console.log('All user data deleted successfully');
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw new Error('Failed to delete user data');
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      await updateProfile(user, { displayName });
      setIsEditing(false);
    } catch (error) {
      setError(error.message);
    }
    
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!user || !window.confirm('Are you sure you want to delete your account? This will permanently delete all your notes and data. This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // First delete user data from Firestore
      await deleteUserData(user.uid);
      
      // Then delete the user from Firebase Authentication
      await deleteUser(user);
      
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      
      // Handle specific error cases
      if (error.code === 'auth/requires-recent-login') {
        setError('For security reasons, please log in again before deleting your account.');
        // Sign out and redirect to login
        await signOut(auth);
        navigate('/login');
      } else {
        setError(error.message || 'Failed to delete account. Please try again.');
      }
    }
    
    setLoading(false);
  };

  const handleLogout = () => {
    signOut(auth);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Profile</h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            {isDarkMode ? 'Light' : 'Dark'}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="flex items-center space-x-4 mb-6">
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="w-20 h-20 rounded-full"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          )}
          
          <div>
            <h2 className="text-xl font-semibold dark:text-white">{user?.displayName || 'User'}</h2>
            <p className="text-gray-600 dark:text-gray-300">{user?.email}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Display Name
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={!isEditing || loading}
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white"
            />
            {isEditing ? (
              <>
                <button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setDisplayName(user?.displayName || '');
                  }}
                  disabled={loading}
                  className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md text-sm font-medium"
              >
                Edit
              </button>
            )}
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Actions</h3>
          
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-md text-sm font-medium text-left"
            >
              Sign out of your account
            </button>
            
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="w-full bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-200 py-2 px-4 rounded-md text-sm font-medium text-left disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete your account and all data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;