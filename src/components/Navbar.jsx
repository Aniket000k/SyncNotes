import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const handleLogout = () => {
    signOut(auth);
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-gradient from-purple-500 to-indigo-100 text-xl font-bold dark:text-white">SyncNotes</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-gray-600 dark:text-gray-300 hover:text-purple-400 dark:hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            <Link
              to="/profile"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium"
            >
              {user?.photoURL && (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span>{user?.displayName || user?.email}</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="bg-purple-500 dark:bg-purple-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-100 dark:text-gray-100 px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;