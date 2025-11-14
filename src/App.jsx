import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';

// Wrapper component to apply dark mode to the entire app
function AppWrapper() {
  const { isDarkMode } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'} App h-full`}>
      <Router>
        <div className="App">
          {auth.currentUser && <Navbar onSidebarToggle={handleSidebarToggle} />}
          <Routes>
            <Route 
              path="/" 
              element={auth.currentUser ? (
                <Dashboard isSidebarOpen={isSidebarOpen} onSidebarToggle={handleSidebarToggle} />
              ) : (
                <Navigate to="/login" />
              )} 
            />
            <Route 
              path="/login" 
              element={!auth.currentUser ? <Login /> : <Navigate to="/" />} 
            />
            <Route 
              path="/signup" 
              element={!auth.currentUser ? <Signup /> : <Navigate to="/" />} 
            />
            <Route 
              path="/profile" 
              element={auth.currentUser ? <Profile /> : <Navigate to="/login" />} 
            />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AppWrapper />
    </ThemeProvider>
  );
}

export default App;