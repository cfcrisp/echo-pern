import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ChevronRight, MessageSquare, Pencil, Plus, Trash2,
  ChevronDown, MoreHorizontal, ExternalLink,
  ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { AddFeedbackModal, EditFeedbackModal } from "@/components/shared";

type Sentiment = 'positive' | 'neutral' | 'negative';

type FeedbackItem = {
  id: string;
  title: string;
  description: string;
  sentiment: Sentiment;
  customer: string;
  customerId: string;
  createdAt: string;
};

// Define sort types
type SortColumn = keyof FeedbackItem | null;
type SortDirection = 'asc' | 'desc';

// Sample feedback data - in a real app, this would come from an API
const mockFeedbackData: FeedbackItem[] = [
  {
    id: "1",
    title: "Love the new dashboard layout!",
    description: "The new dashboard layout is much more intuitive and helps me find what I need quickly. Great improvement!",
    sentiment: "positive",
    customer: "Acme Corp",
    customerId: "1",
    createdAt: "2 days ago"
  },
  {
    id: "2",
    title: "Feature request for export options",
    description: "It would be helpful to have more export options for reports, especially PDF and Excel formats.",
    sentiment: "neutral",
    customer: "TechStart Ltd",
    customerId: "2",
    createdAt: "1 week ago"
  },
  {
    id: "3",
    title: "Mobile app keeps crashing",
    description: "The mobile app crashes whenever I try to create a new initiative. This has been happening for the last two updates.",
    sentiment: "negative",
    customer: "Enterprise Solutions Inc",
    customerId: "3",
    createdAt: "3 days ago"
  },
  {
    id: "4",
    title: "Great customer support experience",
    description: "Your support team was incredibly helpful in resolving my issue with data import. They went above and beyond!",
    sentiment: "positive",
    customer: "Startup Ventures",
    customerId: "4",
    createdAt: "5 days ago"
  },
  {
    id: "5",
    title: "Confusing navigation structure",
    description: "I find it difficult to navigate between different sections of the app. The menu structure is not intuitive.",
    sentiment: "negative",
    customer: "Global Industries",
    customerId: "5",
    createdAt: "1 day ago"
  },
  {
    id: "6",
    title: "Love the new reporting features",
    description: "The new reporting dashboard is amazing! So much easier to get insights now.",
    sentiment: "positive",
    customer: "Local Business LLC",
    customerId: "6",
    createdAt: "4 days ago"
  }
];

const getSentimentColor = (sentiment: Sentiment) => {
  switch (sentiment) {
    case 'positive':
      return 'bg-green-100 text-green-700';
    case 'neutral':
      return 'bg-slate-100 text-slate-700';
    case 'negative':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

const Feedback: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  
  const filteredFeedback = filter === 'all' 
    ? mockFeedbackData 
    : mockFeedbackData.filter(item => item.sentiment === filter);

  // Handler for saving new feedback
  const handleSaveFeedback = (feedback: {
    title: string;
    description: string;
    sentiment: Sentiment;
    customerId?: string;
    initiativeId?: string;
  }) => {
    console.log('New feedback:', feedback);
    // In a real app, this would make an API call to save the feedback
  };

  // Handler for updating existing feedback
  const handleUpdateFeedback = (id: string, updatedFeedback: {
    title: string;
    description: string;
    sentiment: Sentiment;
    customerId?: string;
    initiativeId?: string;
  }) => {
    console.log('Updating feedback:', id, updatedFeedback);
    // In a real app, this would make an API call to update the feedback
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

  return (
    <div>
      {/* Header with breadcrumb and improved styling */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
            <Link to="/" className="hover:text-gray-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-700">Feedback</span>
          </div>
          <h1 className="text-2xl font-bold">Customer Feedback</h1>
          <p className="text-gray-500 mt-1">Collect and manage feedback from your customers.</p>
        </div>
        <div>
          <AddFeedbackModal 
            onSave={handleSaveFeedback} 
            customers={mockCustomers}
            initiatives={mockInitiatives} 
          />
        </div>
      </div>
      
      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Feedback</TabsTrigger>
          <TabsTrigger value="positive">Positive</TabsTrigger>
          <TabsTrigger value="neutral">Neutral</TabsTrigger>
          <TabsTrigger value="negative">Negative</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <FeedbackTable 
            feedback={filteredFeedback} 
            initiatives={mockInitiatives}
            customers={mockCustomers}
            onUpdateFeedback={handleUpdateFeedback}
          />
        </TabsContent>
        
        <TabsContent value="positive" className="space-y-4">
          <FeedbackTable 
            feedback={filteredFeedback} 
            initiatives={mockInitiatives}
            customers={mockCustomers}
            onUpdateFeedback={handleUpdateFeedback}
          />
        </TabsContent>
        
        <TabsContent value="neutral" className="space-y-4">
          <FeedbackTable 
            feedback={filteredFeedback} 
            initiatives={mockInitiatives}
            customers={mockCustomers}
            onUpdateFeedback={handleUpdateFeedback}
          />
        </TabsContent>
        
        <TabsContent value="negative" className="space-y-4">
          <FeedbackTable 
            feedback={filteredFeedback} 
            initiatives={mockInitiatives}
            customers={mockCustomers}
            onUpdateFeedback={handleUpdateFeedback}
          />
        </TabsContent>
      </Tabs>
      
      {/* Empty state - will be shown conditionally when there's no feedback */}
      {filteredFeedback.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg mt-6">
          <div className="bg-gray-100 p-3 rounded-full mb-4">
            <MessageSquare className="h-6 w-6 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium mb-1">No feedback yet</h3>
          <p className="text-gray-500 text-center mb-4">Start collecting feedback from your customers to improve your product.</p>
          <AddFeedbackModal 
            onSave={handleSaveFeedback} 
            customers={mockCustomers}
            initiatives={mockInitiatives} 
          />
        </div>
      )}
    </div>
  );
};

const FeedbackTable: React.FC<{ 
  feedback: FeedbackItem[];
  initiatives: { id: string; title: string }[];
  customers: { id: string; name: string }[];
  onUpdateFeedback: (id: string, updatedFeedback: {
    title: string;
    description: string;
    sentiment: Sentiment;
    customerId?: string;
    initiativeId?: string;
  }) => void;
}> = ({ feedback, initiatives, customers, onUpdateFeedback }) => {
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
  
  // Sort feedback based on current sort state
  let sortedFeedback = [...feedback];
  if (sortColumn) {
    sortedFeedback = sortedFeedback.sort((a, b) => {
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
  
  return (
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
                Feedback
                {getSortIcon('title')}
              </div>
            </TableHead>
            <TableHead 
              className="w-[120px] cursor-pointer"
              onClick={() => handleSort('customer')}
            >
              <div className="flex items-center">
                Customer
                {getSortIcon('customer')}
              </div>
            </TableHead>
            <TableHead 
              className="w-[100px] cursor-pointer"
              onClick={() => handleSort('sentiment')}
            >
              <div className="flex items-center">
                Sentiment
                {getSortIcon('sentiment')}
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
          {sortedFeedback.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No feedback found.
              </TableCell>
            </TableRow>
          ) : (
            sortedFeedback.map((item) => (
              <React.Fragment key={item.id}>
                <TableRow className={expandedRows[item.id] ? "border-b-0" : ""}>
                  <TableCell className="w-[30px] pr-0">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => toggleRowExpanded(item.id)}
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform ${expandedRows[item.id] ? "transform rotate-180" : ""}`} />
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.customer}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(item.sentiment)}`}>
                      {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>{item.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <EditFeedbackModal
                        feedback={item}
                        initiatives={initiatives}
                        customers={customers}
                        onUpdate={onUpdateFeedback}
                        triggerButtonSize="icon"
                      />
                      <div className="relative">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0"
                          onClick={() => toggleMenu(item.id)}
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                        
                        {showMenu[item.id] && (
                          <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded shadow-lg z-10">
                            <div 
                              className="px-3 py-2 text-xs hover:bg-gray-100 cursor-pointer flex items-center"
                              onClick={() => {
                                console.log('Edit feedback', item.id);
                                toggleMenu(item.id);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                            </div>
                            <div 
                              className="px-3 py-2 text-xs hover:bg-gray-100 cursor-pointer flex items-center"
                              onClick={() => {
                                console.log('View feedback details', item.id);
                                toggleMenu(item.id);
                              }}
                            >
                              <ExternalLink className="h-3.5 w-3.5 mr-2" /> View Details
                            </div>
                            <div 
                              className="px-3 py-2 text-xs hover:bg-gray-100 cursor-pointer flex items-center text-red-600"
                              onClick={() => {
                                console.log('Delete feedback', item.id);
                                toggleMenu(item.id);
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
                {expandedRows[item.id] && (
                  <TableRow className="bg-slate-50">
                    <TableCell colSpan={6} className="p-0">
                      <div className="p-4">
                        <div className="space-y-4">
                          {/* Description Section */}
                          <div>
                            <h3 className="text-sm font-medium mb-2">Description</h3>
                            <p className="text-sm text-slate-600">{item.description}</p>
                          </div>
                          
                          {/* Additional Actions */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h3 className="text-sm font-medium mb-2">Customer Details</h3>
                              <div className="bg-white p-2 rounded border border-slate-200">
                                <div className="flex items-center">
                                  <span className="text-sm">{item.customer}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-sm font-medium mb-2">Actions</h3>
                              <div className="flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" className="text-xs h-8">
                                  <ChevronRight className="h-3 w-3 mr-1" />
                                  View Customer
                                </Button>
                                <Button variant="outline" size="sm" className="text-xs h-8">
                                  <Plus className="h-3 w-3 mr-1" />
                                  Create Idea
                                </Button>
                              </div>
                            </div>
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
  );
};

export default Feedback;