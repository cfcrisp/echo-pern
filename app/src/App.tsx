import './App.css';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { Home, Target, MessageSquare, List, Lightbulb, Settings, LogOut, Pencil, Trash2, Plus, ChevronRight, Users } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Ideas from './pages/Ideas';
import Customers from './pages/Customers';
import Goals from './pages/Goals';
import Feedback from './pages/Feedback';
 
// Navigation Item Component
const NavItem = ({ icon: Icon, label, to }: { icon: React.ElementType, label: string, to: string }) => {
  // Use the useLocation hook to determine if this nav item is active
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  
  return (
  <Link
    to={to}
    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isActive 
      ? 'bg-primary/10 text-primary font-medium' 
      : 'text-gray-700 hover:bg-gray-100'}`}
  >
    <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
    <span>{label}</span>
    {isActive && <ChevronRight className="h-4 w-4 ml-auto text-primary" />}
  </Link>
  );
};

// Main Dashboard Component
function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {/* Left Navigation Panel - Flush with Left Side */}
      <aside
        className={`w-64 bg-white border-r border-gray-200 p-5 flex flex-col justify-between shadow-sm ${
          isSidebarOpen ? '' : 'hidden'
        }`}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8 px-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-bold">E</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Echo</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            <NavItem icon={Home} label="Dashboard" to="/dashboard" />
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
          <NavItem icon={LogOut} label="Log out" to="/logout" />
        </div>
      </aside>

      {/* Main Content Area - Full Width */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="w-full">
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
            <Route path="/goals" element={<Goals />} />
            <Route path="/initiatives" element={<Initiatives />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/ideas" element={<Ideas />} />
            {/* Add more routes in future iterations */}
            <Route path="*" element={<Goals />} /> {/* Default to Goals */}
          </Routes>
        </div>
      </main>
    </div>
  );
}

// Initiatives Component
const Initiatives = () => {
  const [activeTab, setActiveTab] = useState("all");
  
  return (
  <div>
    {/* Header with breadcrumb and improved styling */}
    <div className="flex justify-between items-center mb-6">
      <div>
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
          <Link to="/" className="hover:text-gray-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-700">Initiatives</span>
        </div>
        <h1 className="text-2xl font-bold">Initiatives</h1>
        <p className="text-gray-500 mt-1">Create initiatives to achieve your strategic goals.</p>
      </div>
      <div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Initiative
        </Button>
      </div>
    </div>
    
    {/* Tabs for filtering initiatives */}
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
      <TabsList>
        <TabsTrigger value="all">All Initiatives</TabsTrigger>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="planned">Planned</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>
    </Tabs>

    {/* Initiatives List */}
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {/* Initiative Card Template */}
      <Card className="group transition-all duration-200 hover:shadow-lg">
        <CardHeader className="pb-2 border-b">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium text-blue-600">In Progress</span>
            </div>
            <span className="text-xs text-gray-500">Q2 Goal</span>
          </div>
          <CardTitle className="text-lg font-semibold leading-tight">
            Reduce time to value (TTV) by 30% in Q2
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>40%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all" 
                  style={{ width: '40%' }}
                ></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">3 ideas</span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional cards following the same pattern */}
      <Card className="group transition-all duration-200 hover:shadow-lg">
        <CardHeader className="pb-2 border-b">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-slate-500"></div>
              <span className="text-sm font-medium text-slate-600">Planned</span>
            </div>
            <span className="text-xs text-gray-500">Q3 Goal</span>
          </div>
          <CardTitle className="text-lg font-semibold leading-tight">
            Achieve feature parity across platforms
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>10%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all" 
                  style={{ width: '10%' }}
                ></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">2 ideas</span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* You can repeat this pattern for other cards */}
    </div>
    
    {/* Empty state - will be shown conditionally in a real implementation */}
    {false && (
      <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg mt-6">
        <div className="bg-gray-100 p-3 rounded-full mb-4">
          <List className="h-6 w-6 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium mb-1">No initiatives yet</h3>
        <p className="text-gray-500 text-center mb-4">Create your first initiative to start tracking your strategic goals.</p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Initiative
        </Button>
      </div>
    )}
  </div>
  );
};



export default App;


// Note: Feedback component is imported from './pages/Feedback' at the top of the file