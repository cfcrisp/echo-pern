import './App.css';
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Home, Target, MessageSquare, List, Lightbulb, Settings, LogOut, ChevronRight, Users } from 'lucide-react';
import Ideas from './pages/Ideas';
import Customers from './pages/Customers';
import Goals from './pages/Goals';
import Feedback from './pages/Feedback';
import Initiatives from './pages/Initiatives';
import Landing from './pages/Landing';
import Dashboard from './pages/Home';
import { AddInitiativeModal } from "@/components/shared";
import { ThemeProvider } from '@/context/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';

// Navigation Item Component
const NavItem = ({ icon: Icon, label, to, onClick }: { icon: React.ElementType, label: string, to: string, onClick?: () => void }) => {
  // Use the useLocation hook to determine if this nav item is active
  const location = useLocation();
  const isActive = location.pathname === to || 
                  (to === '/dashboard' && location.pathname === '/dashboard') || 
                  (to !== '/' && to !== '/dashboard' && location.pathname.startsWith(to));
  
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 w-full text-left ${isActive 
          ? 'bg-primary/10 text-primary font-medium' 
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50'}`}
      >
        <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
        <span>{label}</span>
        {isActive && <ChevronRight className="h-4 w-4 ml-auto text-primary" />}
      </button>
    );
  }

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isActive 
        ? 'bg-primary/10 text-primary font-medium' 
        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50'}`}
    >
      <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
      <span>{label}</span>
      {isActive && <ChevronRight className="h-4 w-4 ml-auto text-primary" />}
    </Link>
  );
};

// Main App Component
function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isLandingPage = location.pathname === '/';

  const handleSaveInitiative = (initiative: {
    goal_id?: string;
    title: string;
    description: string;
    status: 'active' | 'planned' | 'completed';
    priority: number;
  }) => {
    console.log('New initiative:', initiative);
    // API call here
  };

  // Handle user logout
  const handleLogout = () => {
    // Use the logout function from AuthContext
    logout();
    
    // Redirect to landing page
    navigate('/');
  };

  // If we're on the landing page, don't show the app layout
  if (isLandingPage) {
    return (
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
        </Routes>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AuthGuard>
        <div className="flex min-h-screen w-full bg-gray-50 dark:bg-background text-foreground">
          {/* Left Navigation Panel - Fixed Full Height */}
          <aside
            className={`fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-card border-r border-gray-200 dark:border-border p-5 flex flex-col justify-between shadow-sm h-screen z-40 ${
              isSidebarOpen ? '' : 'hidden'
            }`}
          >
            <div>
              {/* Logo */}
              <div className="flex items-center justify-between mb-8">
                <Link to="/dashboard" className="flex items-center gap-2 px-2">
                  <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                    <span className="text-white font-bold">E</span>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Echo</span>
                </Link>
                <ThemeToggle />
              </div>

              {/* Navigation Links */}
              <nav className="space-y-2">
                <NavItem icon={Home} label="Home" to="/dashboard" />
                <NavItem icon={Target} label="Goals" to="/goals" />
                <NavItem icon={List} label="Initiatives" to="/initiatives" />
                <NavItem icon={Users} label="Customers" to="/customers" />
                <NavItem icon={MessageSquare} label="Feedback" to="/feedback" />
                <NavItem icon={Lightbulb} label="Ideas" to="/ideas" />
              </nav>
            </div>

            {/* Bottom Section (Settings and Log out) */}
            <div className="space-y-2">
              <NavItem icon={Settings} label="Settings" to="/settings" />
              <NavItem icon={LogOut} label="Log out" to="#" onClick={handleLogout} />
            </div>
          </aside>

          {/* Main Content Area - Scrollable */}
          <main className="ml-64 flex-1 overflow-auto min-h-screen">
            <div className="p-6 md:p-8">
              <div className="flex items-center mb-6">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mr-4 md:hidden" 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  <List className="h-5 w-5" />
                </Button>
              </div>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/initiatives" element={<Initiatives />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/ideas" element={<Ideas />} />
                {/* Add more routes in future iterations */}
                <Route path="*" element={<Dashboard />} /> {/* Default to Home */}
              </Routes>
            </div>
          </main>
        </div>
      </AuthGuard>
    </ThemeProvider>
  );
}

export default App;

// Note: Feedback component is imported from './pages/Feedback' at the top of the file