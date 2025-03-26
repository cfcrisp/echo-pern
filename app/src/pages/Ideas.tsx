import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ChevronRight, Lightbulb, Pencil, Plus, Trash2, 
  ChevronDown, MoreHorizontal, ExternalLink,
  ArrowUpDown, ArrowUp, ArrowDown, Target, Users, MessageSquare
} from 'lucide-react';
import { AddIdeaModal, EditIdeaModal } from "@/components/shared";
import React from 'react';

// Define types for better type safety
type IdeaStatus = 'new' | 'planned' | 'completed' | 'rejected';
type IdeaPriority = 'urgent' | 'high' | 'medium' | 'low';
type IdeaEffort = 'xs' | 's' | 'm' | 'l' | 'xl';

type Idea = {
  id: string;
  title: string;
  description: string;
  priority: IdeaPriority;
  effort: IdeaEffort;
  status: IdeaStatus;
  initiative: string;
  customer: string;
  createdAt: string;
};

// Define sort types
type SortColumn = keyof Idea | null;
type SortDirection = 'asc' | 'desc';

// Ideas Component
const Ideas = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [showMenu, setShowMenu] = useState<Record<string, boolean>>({});
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Toggle expanded state for a row
  const toggleRowExpanded = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Toggle menu visibility
  const toggleMenu = (id: string) => {
    setShowMenu(prev => {
      // Close all other menus
      const newState: Record<string, boolean> = {};
      Object.keys(prev).forEach(key => {
        newState[key] = key === id ? !prev[key] : false;
      });
      return newState;
    });
  };
  
  // Handle column sort
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // If already sorting by this column, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If sorting by a new column, set it and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Handler for saving new ideas
  const handleSaveIdea = (idea: {
    title: string;
    description: string;
    priority: IdeaPriority;
    effort: IdeaEffort;
    status: IdeaStatus;
    initiativeId?: string;
    customerId?: string;
  }) => {
    console.log('New idea:', idea);
    // In a real app, this would make an API call to save the idea
  };

  // Handler for updating existing ideas
  const handleUpdateIdea = (id: string, updatedIdea: {
    title: string;
    description: string;
    priority: IdeaPriority;
    effort: IdeaEffort;
    status: IdeaStatus;
    initiativeId?: string;
    customerId?: string;
  }) => {
    console.log('Updating idea:', id, updatedIdea);
    // In a real app, this would make an API call to update the idea
  };

  // Mock initiatives data for dropdown
  const mockInitiatives = [
    { id: '1', title: 'Redesign User Interface' },
    { id: '2', title: 'Implement New Authentication System' },
    { id: '3', title: 'Optimize Database Queries' },
    { id: '4', title: 'Develop API Documentation' },
    { id: '5', title: 'Implement Analytics Dashboard' },
  ];

  // Mock customers data for dropdown
  const mockCustomers = [
    { id: '1', name: 'Acme Corp' },
    { id: '2', name: 'TechStart Ltd' },
    { id: '3', name: 'Enterprise Solutions Inc' },
    { id: '4', name: 'Startup Ventures' },
    { id: '5', name: 'Global Industries' },
    { id: '6', name: 'Local Business LLC' },
    { id: '7', name: 'Innovative Tech' },
    { id: '8', name: 'Strategic Partners Co' },
  ];
  
  // Sample ideas data - in a real app, this would come from an API
  const ideasData: Idea[] = [
    {
      id: "1",
      title: "Add export to PDF feature",
      description: "Allow users to export reports and dashboards to PDF format for easier sharing.",
      priority: "high",
      effort: "m",
      status: "planned",
      initiative: "Improve reporting capabilities",
      customer: "Acme Corp",
      createdAt: "3 days ago"
    },
    {
      id: "2",
      title: "Mobile app dark mode",
      description: "Implement dark mode for the mobile application to improve user experience in low-light environments.",
      priority: "medium",
      effort: "s",
      status: "new",
      initiative: "Mobile app enhancements",
      customer: "Various",
      createdAt: "1 week ago"
    },
    {
      id: "3",
      title: "Bulk import of customer data",
      description: "Add functionality to import customer data in bulk via CSV or Excel files.",
      priority: "urgent",
      effort: "l",
      status: "planned",
      initiative: "Streamline onboarding",
      customer: "Enterprise Solutions Inc",
      createdAt: "2 days ago"
    },
    {
      id: "4",
      title: "Automated email digests",
      description: "Send weekly email digests summarizing key metrics and activities to stakeholders.",
      priority: "low",
      effort: "m",
      status: "completed",
      initiative: "Enhance communication",
      customer: "Internal",
      createdAt: "2 weeks ago"
    },
    {
      id: "5",
      title: "Integration with Slack",
      description: "Create a Slack integration to notify teams about new feedback and ideas.",
      priority: "medium",
      effort: "m",
      status: "new",
      initiative: "Improve collaboration",
      customer: "TechStart Ltd",
      createdAt: "5 days ago"
    },
    {
      id: "6",
      title: "Custom dashboard widgets",
      description: "Allow users to create and customize their own dashboard widgets.",
      priority: "high",
      effort: "xl",
      status: "planned",
      initiative: "Dashboard improvements",
      customer: "Various",
      createdAt: "1 week ago"
    },
    {
      id: "7",
      title: "AI-powered insights",
      description: "Implement AI algorithms to provide insights and recommendations based on collected data.",
      priority: "medium",
      effort: "xl",
      status: "new",
      initiative: "Data intelligence",
      customer: "Premium clients",
      createdAt: "3 days ago"
    },
    {
      id: "8",
      title: "Improved search functionality",
      description: "Enhance search capabilities with filters, tags, and natural language processing.",
      priority: "high",
      effort: "l",
      status: "planned",
      initiative: "UX improvements",
      customer: "All",
      createdAt: "4 days ago"
    }
  ];

  // Filter ideas based on active tab
  let filteredIdeas = activeTab === "all" 
    ? ideasData 
    : ideasData.filter(item => item.status === activeTab);
    
  // Sort ideas based on current sort state
  if (sortColumn) {
    filteredIdeas = [...filteredIdeas].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
  
  // Helper function to display sort indicator
  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-1 h-3 w-3" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-1 h-3 w-3" />
      : <ArrowDown className="ml-1 h-3 w-3" />;
  };
  
  // Helper function to get priority badge styling
  const getPriorityBadgeStyle = (priority: IdeaPriority): string => {
    switch(priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400';
    }
  };

  // Helper function to get effort badge styling
  const getEffortBadgeStyle = (effort: IdeaEffort): string => {
    switch(effort) {
      case 'xs':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 's':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'm':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'l':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'xl':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400';
    }
  };
  
  // Helper function to get status badge styling
  const getStatusBadgeStyle = (status: IdeaStatus): string => {
    switch(status) {
      case 'new':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'planned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400';
    }
  };
  
  return (
  <div>
    {/* Header with breadcrumb and improved styling */}
    <div className="flex justify-between items-center mb-6">
      <div>
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
          <Link to="/" className="hover:text-gray-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-700">Ideas</span>
        </div>
        <h1 className="text-2xl font-bold">Ideas</h1>
        <p className="text-gray-500 mt-1">Collect and manage product ideas from customers and team members.</p>
      </div>
      <div>
        <AddIdeaModal 
          onSave={handleSaveIdea} 
          initiatives={mockInitiatives} 
          customers={mockCustomers} 
        />
      </div>
    </div>
    
    {/* Tabs for filtering ideas */}
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
      <TabsList>
        <TabsTrigger value="all">All Ideas</TabsTrigger>
        <TabsTrigger value="new">New</TabsTrigger>
        <TabsTrigger value="planned">Planned</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
        <TabsTrigger value="rejected">Rejected</TabsTrigger>
      </TabsList>
    </Tabs>

    {/* Ideas Table */}
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30px]"></TableHead>
            <TableHead 
              className="w-[250px] cursor-pointer"
              onClick={() => handleSort('title')}
            >
              <div className="flex items-center">
                Title
                {getSortIcon('title')}
              </div>
            </TableHead>
            <TableHead 
              className="w-[100px] cursor-pointer"
              onClick={() => handleSort('priority')}
            >
              <div className="flex items-center">
                Priority
                {getSortIcon('priority')}
              </div>
            </TableHead>
            <TableHead 
              className="w-[80px] cursor-pointer"
              onClick={() => handleSort('effort')}
            >
              <div className="flex items-center">
                Effort
                {getSortIcon('effort')}
              </div>
            </TableHead>
            <TableHead 
              className="w-[100px] cursor-pointer"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center">
                Status
                {getSortIcon('status')}
              </div>
            </TableHead>
            <TableHead 
              className="hidden sm:table-cell w-[120px] cursor-pointer"
              onClick={() => handleSort('customer')}
            >
              <div className="flex items-center">
                Customer
                {getSortIcon('customer')}
              </div>
            </TableHead>
            <TableHead 
              className="w-[100px] cursor-pointer"
              onClick={() => handleSort('createdAt')}
            >
              <div className="flex items-center">
                Date
                {getSortIcon('createdAt')}
              </div>
            </TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredIdeas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No ideas found.
              </TableCell>
            </TableRow>
          ) : (
            filteredIdeas.map((idea) => (
              <React.Fragment key={idea.id}>
                <TableRow className={expandedRows[idea.id] ? "border-b-0" : ""}>
                  <TableCell className="w-[30px] pr-0">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => toggleRowExpanded(idea.id)}
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform ${expandedRows[idea.id] ? "transform rotate-180" : ""}`} />
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">{idea.title}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeStyle(idea.priority)}`}>
                      {idea.priority.charAt(0).toUpperCase() + idea.priority.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEffortBadgeStyle(idea.effort)}`}>
                      {idea.effort.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeStyle(idea.status)}`}>
                      {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{idea.customer}</TableCell>
                  <TableCell>{idea.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <EditIdeaModal
                        idea={idea}
                        initiatives={mockInitiatives}
                        customers={mockCustomers}
                        onUpdate={handleUpdateIdea}
                        triggerButtonSize="icon"
                      />
                      <div className="relative">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0"
                          onClick={() => toggleMenu(idea.id)}
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                        
                        {showMenu[idea.id] && (
                          <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded shadow-lg z-10 dark:bg-card dark:border-border">
                            <div 
                              className="px-3 py-2 text-xs hover:bg-gray-100 cursor-pointer flex items-center dark:hover:bg-gray-800/50 dark:text-gray-200"
                              onClick={() => {
                                console.log('Edit idea', idea.id);
                                toggleMenu(idea.id);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                            </div>
                            <div 
                              className="px-3 py-2 text-xs hover:bg-gray-100 cursor-pointer flex items-center dark:hover:bg-gray-800/50 dark:text-gray-200"
                              onClick={() => {
                                console.log('View idea details', idea.id);
                                toggleMenu(idea.id);
                              }}
                            >
                              <ExternalLink className="h-3.5 w-3.5 mr-2" /> View Details
                            </div>
                            <div 
                              className="px-3 py-2 text-xs hover:bg-gray-100 cursor-pointer flex items-center text-red-600 dark:hover:bg-gray-800/50"
                              onClick={() => {
                                console.log('Delete idea', idea.id);
                                toggleMenu(idea.id);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
                
                {/* Expanded Row Section */}
                {expandedRows[idea.id] && (
                  <TableRow className="bg-slate-50 dark:bg-gray-800/50">
                    <TableCell colSpan={8} className="p-0">
                      <div className="p-4">
                        <div className="space-y-4">
                          {/* Description section with cleaner layout */}
                          <div className="mb-4">
                            <h4 className="text-xs font-semibold mb-2 text-slate-700 dark:text-gray-300 uppercase tracking-wider">Description</h4>
                            <p className="text-sm text-slate-600 dark:text-gray-300">{idea.description}</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Left column */}
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-xs font-semibold mb-2 text-slate-700 dark:text-gray-300 uppercase tracking-wider">Initiative</h4>
                                <div className="bg-slate-50 dark:bg-gray-800/70 p-3 rounded-lg border border-slate-200 dark:border-gray-700 hover:border-slate-300 dark:hover:border-gray-600 transition-colors">
                                  <div className="flex items-center">
                                    <Target className="h-3.5 w-3.5 mr-2 text-primary/70 dark:text-primary/50" />
                                    <p className="text-sm font-medium dark:text-gray-200">{idea.initiative}</p>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="w-full justify-start mt-2 text-xs h-7 text-slate-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                                  >
                                    <ChevronRight className="h-3 w-3 mr-1" />
                                    View Initiative Details
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            {/* Right column - Customer info */}
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-xs font-semibold mb-2 text-slate-700 dark:text-gray-300 uppercase tracking-wider">Customer</h4>
                                <div className="bg-slate-50 dark:bg-gray-800/70 p-3 rounded-lg border border-slate-200 dark:border-gray-700 hover:border-slate-300 dark:hover:border-gray-600 transition-colors">
                                  <div className="flex items-center">
                                    <Users className="h-3.5 w-3.5 mr-2 text-blue-500/70 dark:text-blue-400/50" />
                                    <p className="text-sm font-medium dark:text-gray-200">{idea.customer}</p>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="w-full justify-start mt-2 text-xs h-7 text-slate-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                                  >
                                    <ChevronRight className="h-3 w-3 mr-1" />
                                    View Customer Details
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Quick action buttons */}
                          <div className="flex flex-wrap gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-gray-700">
                            <h4 className="text-xs font-semibold text-slate-700 dark:text-gray-300 mr-2 self-center">Quick Actions:</h4>
                            <Button variant="outline" size="sm" className="h-7 text-xs">
                              <Target className="h-3 w-3 mr-1 text-primary" />
                              View Initiative
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 text-xs">
                              <Users className="h-3 w-3 mr-1 text-blue-500" />
                              View Customer
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 text-xs">
                              <MessageSquare className="h-3 w-3 mr-1 text-blue-500" />
                              Add Feedback
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))
          )}
        </TableBody>
      </Table>
    </div>
    
    {/* Empty state - will be shown conditionally in a real implementation */}
    {filteredIdeas.length === 0 && (
      <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg mt-6 dark:border-gray-700">
        <div className="bg-gray-100 p-3 rounded-full mb-4 dark:bg-gray-800">
          <Lightbulb className="h-6 w-6 text-gray-500 dark:text-gray-400" />
        </div>
        <h3 className="text-lg font-medium mb-1 dark:text-gray-200">No ideas yet</h3>
        <p className="text-gray-500 text-center mb-4 dark:text-gray-400">Start collecting ideas from your team and customers to improve your product.</p>
        <AddIdeaModal 
          onSave={handleSaveIdea} 
          initiatives={mockInitiatives} 
          customers={mockCustomers} 
        />
      </div>
    )}
  </div>
  );
};

export default Ideas;