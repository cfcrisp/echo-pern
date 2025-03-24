import './App.css';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
            <NavItem icon={MessageSquare} label="Feedback" to="/feedback" />
            <NavItem icon={List} label="Initiatives" to="/initiatives" />
            <NavItem icon={Lightbulb} label="Ideas" to="/ideas" />
            <NavItem icon={Users} label="Customers" to="/customers" />
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
            <Route path="/initiatives" element={<Initiatives />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/ideas" element={<Ideas />} />
            <Route path="/customers" element={<Customers />} />
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
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>
    </Tabs>

    {/* Initiatives List */}
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {/* Initiative 1 */}
      <Card className="hover:shadow-md transition-shadow duration-200 border-t-4 border-t-blue-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-blue-600 text-xs font-medium">In Progress</span>
            <span className="text-xs text-gray-500">Q2 Goal</span>
          </div>
          <CardTitle className="text-lg font-medium">Reduce time to value (TTV) by 30% in Q2</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1 mb-2">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '40%' }}></div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">3 ideas</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Initiative 2 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Increase adoption of advanced reporting by 60%</CardTitle>
          <p className="text-gray-500">
            Users aren’t using advanced reporting as much as predicted. Define and resolve the reasons behind this.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <a href="#" className="text-blue-500 hover:underline">
                Become the go-to tool for remote teams
              </a>
              <span className="ml-2 text-gray-500">• 5 ideas</span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Initiative 3 */}
      <Card className="hover:shadow-md transition-shadow duration-200 border-t-4 border-t-purple-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-purple-600 text-xs font-medium">Planning</span>
            <span className="text-xs text-gray-500">Q3 Goal</span>
          </div>
          <CardTitle className="text-lg font-medium">Achieve feature parity across web, iOS, & Android</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1 mb-2">
              <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '10%' }}></div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">2 ideas</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Initiative 4 */}
      <Card className="hover:shadow-md transition-shadow duration-200 border-t-4 border-t-amber-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-amber-600 text-xs font-medium">Not Started</span>
            <span className="text-xs text-gray-500">Q4 Goal</span>
          </div>
          <CardTitle className="text-lg font-medium">Improve dashboard load time by 60%</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1 mb-2">
              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '0%' }}></div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">0 ideas</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
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