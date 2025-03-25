import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ChevronRight, Users, Pencil, Plus, Trash2, 
  ChevronDown, Lightbulb, MessageSquare, MoreHorizontal,
  ExternalLink, ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { AddCustomerModal, EditCustomerModal } from "@/components/shared";
import React from 'react';

// Define types for better type safety
type CustomerStatus = 'active' | 'inactive' | 'prospect';

type Idea = {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'new' | 'planned' | 'completed';
};

type Feedback = {
  id: string;
  title: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  date: string;
};

type Customer = {
  id: string;
  name: string;
  revenue: string;
  status: CustomerStatus;
  idea_count: number;
  feedback_count: number;
  createdAt: string;
  ideas?: Idea[];
  feedback?: Feedback[];
};

// Define sort types
type SortColumn = keyof Customer | null;
type SortDirection = 'asc' | 'desc';

// Customers Component
const Customers = () => {
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

  // Handler for saving new customers
  const handleSaveCustomer = (customer: {
    name: string;
    revenue: string;
    status: CustomerStatus;
  }) => {
    console.log('New customer:', customer);
    // In a real app, this would make an API call to save the customer
  };

  // In the Customers component, add a handler for updating customers
  const handleUpdateCustomer = (id: string, updatedCustomer: {
    name: string;
    revenue: string;
    status: CustomerStatus;
  }) => {
    console.log('Updating customer:', id, updatedCustomer);
    // In a real app, this would make an API call to update the customer
  };

  // Sample customers data - in a real app, this would come from an API
  const customersData: Customer[] = [
    {
      id: "1",
      name: "Acme Corp",
      revenue: "$250,000",
      status: "active",
      idea_count: 3,
      feedback_count: 2,
      createdAt: "2 months ago",
      ideas: [
        { id: "i1", title: "Customer portal redesign", priority: "high", status: "planned" },
        { id: "i2", title: "API integration tools", priority: "medium", status: "new" },
        { id: "i3", title: "Mobile responsive dashboard", priority: "high", status: "new" }
      ],
      feedback: [
        { id: "f1", title: "Love the new dashboard layout", sentiment: "positive", date: "2023-11-15" },
        { id: "f2", title: "Export feature is not intuitive", sentiment: "negative", date: "2023-12-01" }
      ]
    },
    {
      id: "2",
      name: "TechStart Ltd",
      revenue: "$120,000",
      status: "active",
      idea_count: 1,
      feedback_count: 3,
      createdAt: "3 months ago",
      ideas: [
        { id: "i4", title: "Customizable reporting", priority: "medium", status: "planned" }
      ],
      feedback: [
        { id: "f3", title: "Authentication system is reliable", sentiment: "positive", date: "2023-10-22" },
        { id: "f4", title: "Would like more export options", sentiment: "neutral", date: "2023-11-05" },
        { id: "f5", title: "Need better onboarding", sentiment: "negative", date: "2023-12-10" }
      ]
    },
    {
      id: "3",
      name: "Enterprise Solutions Inc",
      revenue: "$500,000",
      status: "active",
      idea_count: 5,
      feedback_count: 4,
      createdAt: "1 year ago",
      ideas: [
        { id: "i5", title: "Enterprise SSO integration", priority: "high", status: "planned" },
        { id: "i6", title: "Advanced audit logging", priority: "medium", status: "new" },
        { id: "i7", title: "Custom roles and permissions", priority: "high", status: "completed" },
        { id: "i8", title: "Bulk operations API", priority: "medium", status: "planned" },
        { id: "i9", title: "Data export to S3", priority: "low", status: "new" }
      ],
      feedback: [
        { id: "f6", title: "Very stable platform overall", sentiment: "positive", date: "2023-09-15" },
        { id: "f7", title: "API documentation could be improved", sentiment: "neutral", date: "2023-10-20" },
        { id: "f8", title: "Love the custom roles feature", sentiment: "positive", date: "2023-11-05" },
        { id: "f9", title: "Slow response in large dashboards", sentiment: "negative", date: "2023-12-10" }
      ]
    },
    {
      id: "4",
      name: "Startup Ventures",
      revenue: "$50,000",
      status: "prospect",
      idea_count: 0,
      feedback_count: 1,
      createdAt: "2 weeks ago",
      feedback: [
        { id: "f10", title: "Initial demo was impressive", sentiment: "positive", date: "2024-01-05" }
      ]
    },
    {
      id: "5",
      name: "Global Industries",
      revenue: "$750,000",
      status: "inactive",
      idea_count: 2,
      feedback_count: 0,
      createdAt: "6 months ago",
      ideas: [
        { id: "i10", title: "Multi-language support", priority: "high", status: "completed" },
        { id: "i11", title: "Regional data compliance", priority: "high", status: "completed" }
      ]
    },
    {
      id: "6",
      name: "Local Business LLC",
      revenue: "$80,000",
      status: "active",
      idea_count: 1,
      feedback_count: 2,
      createdAt: "4 months ago",
      ideas: [
        { id: "i12", title: "Simplified invoicing", priority: "medium", status: "new" }
      ],
      feedback: [
        { id: "f11", title: "Great customer support team", sentiment: "positive", date: "2023-11-15" },
        { id: "f12", title: "Need more template options", sentiment: "neutral", date: "2023-12-01" }
      ]
    },
    {
      id: "7",
      name: "Innovative Tech",
      revenue: "$320,000",
      status: "prospect",
      idea_count: 0,
      feedback_count: 0,
      createdAt: "1 month ago"
    },
    {
      id: "8",
      name: "Strategic Partners Co",
      revenue: "$420,000",
      status: "active",
      idea_count: 4,
      feedback_count: 3,
      createdAt: "8 months ago",
      ideas: [
        { id: "i13", title: "Partner dashboard", priority: "high", status: "planned" },
        { id: "i14", title: "White-label solution", priority: "high", status: "new" },
        { id: "i15", title: "Revenue sharing tools", priority: "medium", status: "new" },
        { id: "i16", title: "Integration marketplace", priority: "low", status: "planned" }
      ],
      feedback: [
        { id: "f13", title: "Partner API is excellent", sentiment: "positive", date: "2023-08-15" },
        { id: "f14", title: "Documentation needs examples", sentiment: "neutral", date: "2023-09-20" },
        { id: "f15", title: "Hard to track shared revenue", sentiment: "negative", date: "2023-10-10" }
      ]
    }
  ];

  // Filter customers based on active tab
  let filteredCustomers = activeTab === "all" 
    ? customersData 
    : customersData.filter(item => item.status === activeTab);
    
  // Sort customers based on current sort state
  if (sortColumn) {
    filteredCustomers = [...filteredCustomers].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      // Handle undefined values (treat them as empty strings for comparison)
      const aCompare = aValue !== undefined ? aValue : '';
      const bCompare = bValue !== undefined ? bValue : '';
      
      if (aCompare < bCompare) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aCompare > bCompare) {
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
  
  // Helper function to get status badge styling
  const getStatusBadgeStyle = (status: CustomerStatus): string => {
    switch(status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'prospect':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Helper function to get priority badge styling
  const getPriorityBadgeStyle = (priority: string): string => {
    switch(priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Helper function to get sentiment badge styling
  const getSentimentBadgeStyle = (sentiment: string): string => {
    switch(sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'neutral':
        return 'bg-gray-100 text-gray-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <span className="text-gray-700">Customers</span>
        </div>
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-gray-500 mt-1">Manage your customer relationships and track their feedback and ideas.</p>
      </div>
      <div>
        <AddCustomerModal onSave={handleSaveCustomer} />
      </div>
    </div>
    
    {/* Tabs for filtering customers */}
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
      <TabsList>
        <TabsTrigger value="all">All Customers</TabsTrigger>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="inactive">Inactive</TabsTrigger>
        <TabsTrigger value="prospect">Prospects</TabsTrigger>
      </TabsList>
    </Tabs>

    {/* Customers Table */}
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30px]"></TableHead>
            <TableHead 
              className="w-[250px] cursor-pointer"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                Name
                {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead 
              className="w-[120px] cursor-pointer"
              onClick={() => handleSort('revenue')}
            >
              <div className="flex items-center">
                Revenue
                {getSortIcon('revenue')}
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
              className="w-[100px] cursor-pointer"
              onClick={() => handleSort('idea_count')}
            >
              <div className="flex items-center">
                Ideas
                {getSortIcon('idea_count')}
              </div>
            </TableHead>
            <TableHead 
              className="w-[100px] cursor-pointer"
              onClick={() => handleSort('feedback_count')}
            >
              <div className="flex items-center">
                Feedback
                {getSortIcon('feedback_count')}
              </div>
            </TableHead>
            <TableHead 
              className="hidden sm:table-cell w-[120px] cursor-pointer"
              onClick={() => handleSort('createdAt')}
            >
              <div className="flex items-center">
                Added
                {getSortIcon('createdAt')}
              </div>
            </TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCustomers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No customers found.
              </TableCell>
            </TableRow>
          ) : (
            filteredCustomers.map((customer) => (
              <React.Fragment key={customer.id}>
                <TableRow className={expandedRows[customer.id] ? "border-b-0" : ""}>
                  <TableCell className="w-[30px] pr-0">
                    {(customer.idea_count > 0 || customer.feedback_count > 0) && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0"
                        onClick={() => toggleRowExpanded(customer.id)}
                      >
                        <ChevronDown className={`h-4 w-4 transition-transform ${expandedRows[customer.id] ? "transform rotate-180" : ""}`} />
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.revenue}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeStyle(customer.status)}`}>
                      {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {customer.idea_count > 0 ? (
                      <div className="flex items-center">
                        <Lightbulb className="h-3.5 w-3.5 mr-1 text-gray-500" />
                        <span>{customer.idea_count}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {customer.feedback_count > 0 ? (
                      <div className="flex items-center">
                        <MessageSquare className="h-3.5 w-3.5 mr-1 text-gray-500" />
                        <span>{customer.feedback_count}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{customer.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <EditCustomerModal
                        customer={customer}
                        onUpdate={handleUpdateCustomer}
                        triggerButtonSize="icon"
                      />
                      <div className="relative">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0"
                          onClick={() => toggleMenu(customer.id)}
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                        
                        {showMenu[customer.id] && (
                          <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded shadow-lg z-10">
                            <div 
                              className="px-3 py-2 text-xs hover:bg-gray-100 cursor-pointer flex items-center"
                              onClick={() => {
                                console.log('Edit customer', customer.id);
                                toggleMenu(customer.id);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                            </div>
                            <div 
                              className="px-3 py-2 text-xs hover:bg-gray-100 cursor-pointer flex items-center"
                              onClick={() => {
                                console.log('View customer details', customer.id);
                                toggleMenu(customer.id);
                              }}
                            >
                              <ExternalLink className="h-3.5 w-3.5 mr-2" /> View Details
                            </div>
                            <div 
                              className="px-3 py-2 text-xs hover:bg-gray-100 cursor-pointer flex items-center text-red-600"
                              onClick={() => {
                                console.log('Delete customer', customer.id);
                                toggleMenu(customer.id);
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
                {expandedRows[customer.id] && (
                  <TableRow className="bg-slate-50">
                    <TableCell colSpan={8} className="p-0">
                      <div className="p-4">
                        <div className="flex space-x-6">
                          {/* Ideas Section */}
                          {customer.ideas && customer.ideas.length > 0 && (
                            <div className="flex-1">
                              <h3 className="text-sm font-medium mb-2 flex items-center">
                                <Lightbulb className="h-4 w-4 mr-1 text-yellow-500" />
                                Ideas ({customer.ideas.length})
                              </h3>
                              <div className="space-y-2">
                                {customer.ideas.map(idea => (
                                  <div key={idea.id} className="bg-white p-2 rounded border border-slate-200 flex justify-between items-center">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-medium">{idea.title}</span>
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeStyle(idea.priority)}`}>
                                          {idea.priority}
                                        </span>
                                      </div>
                                      <span className="text-xs text-slate-500">Status: {idea.status}</span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-6 text-xs">
                                      View
                                    </Button>
                                  </div>
                                ))}
                              </div>
                              <Button variant="outline" size="sm" className="mt-2 h-7 text-xs">
                                <Plus className="h-3 w-3 mr-1" />
                                Add Idea
                              </Button>
                            </div>
                          )}
                          
                          {/* Feedback Section */}
                          {customer.feedback && customer.feedback.length > 0 && (
                            <div className="flex-1">
                              <h3 className="text-sm font-medium mb-2 flex items-center">
                                <MessageSquare className="h-4 w-4 mr-1 text-blue-500" />
                                Feedback ({customer.feedback.length})
                              </h3>
                              <div className="space-y-2">
                                {customer.feedback.map(feedback => (
                                  <div key={feedback.id} className="bg-white p-2 rounded border border-slate-200 flex justify-between items-center">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-medium">{feedback.title}</span>
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getSentimentBadgeStyle(feedback.sentiment)}`}>
                                          {feedback.sentiment}
                                        </span>
                                      </div>
                                      <span className="text-xs text-slate-500">
                                        {new Date(feedback.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                      </span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-6 text-xs">
                                      View
                                    </Button>
                                  </div>
                                ))}
                              </div>
                              <Button variant="outline" size="sm" className="mt-2 h-7 text-xs">
                                <Plus className="h-3 w-3 mr-1" />
                                Add Feedback
                              </Button>
                            </div>
                          )}
                          
                          {/* Empty state - if customer has no ideas and feedback */}
                          {(!customer.ideas || customer.ideas.length === 0) && 
                           (!customer.feedback || customer.feedback.length === 0) && (
                            <div className="w-full text-center py-6">
                              <p className="text-sm text-gray-500">No ideas or feedback available for this customer.</p>
                              <div className="flex justify-center gap-2 mt-2">
                                <Button variant="outline" size="sm" className="h-7 text-xs">
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Idea
                                </Button>
                                <Button variant="outline" size="sm" className="h-7 text-xs">
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Feedback
                                </Button>
                              </div>
                            </div>
                          )}
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
    {filteredCustomers.length === 0 && (
      <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg mt-6">
        <div className="bg-gray-100 p-3 rounded-full mb-4">
          <Users className="h-6 w-6 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium mb-1">No customers yet</h3>
        <p className="text-gray-500 text-center mb-4">Start adding customers to track their feedback and ideas.</p>
        <AddCustomerModal onSave={handleSaveCustomer} />
      </div>
    )}
  </div>
  );
};

export default Customers;