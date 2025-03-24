import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronRight, Lightbulb, Pencil, Plus, Trash2 } from 'lucide-react';

// Ideas Component
const Ideas = () => {
  const [activeTab, setActiveTab] = useState("all");
  
  // Sample ideas data - in a real app, this would come from an API
  const ideasData = [
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
  const filteredIdeas = activeTab === "all" 
    ? ideasData 
    : ideasData.filter(item => item.status === activeTab);
  
  // Helper function to get priority badge styling
  const getPriorityBadgeStyle = (priority: 'urgent' | 'high' | 'medium' | 'low'): string => {
    switch(priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get effort badge styling
  const getEffortBadgeStyle = (effort: 'xs' | 's' | 'm' | 'l' | 'xl'): string => {
    switch(effort) {
      case 'xs':
        return 'bg-green-100 text-green-800';
      case 's':
        return 'bg-blue-100 text-blue-800';
      case 'm':
        return 'bg-yellow-100 text-yellow-800';
      case 'l':
        return 'bg-orange-100 text-orange-800';
      case 'xl':
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
          <span className="text-gray-700">Ideas</span>
        </div>
        <h1 className="text-2xl font-bold">Ideas</h1>
        <p className="text-gray-500 mt-1">Collect and manage product ideas from customers and team members.</p>
      </div>
      <div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Idea
        </Button>
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
            <TableHead className="w-[250px]">Title</TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            <TableHead className="w-[100px]">Priority</TableHead>
            <TableHead className="w-[80px]">Effort</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="hidden sm:table-cell w-[120px]">Customer</TableHead>
            <TableHead className="w-[100px]">Date</TableHead>
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
              <TableRow key={idea.id}>
                <TableCell className="font-medium">{idea.title}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="max-w-md truncate">{idea.description}</div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeStyle(idea.priority as 'urgent' | 'high' | 'medium' | 'low')}`}>
                    {idea.priority.charAt(0).toUpperCase() + idea.priority.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEffortBadgeStyle(idea.effort as 'xs' | 's' | 'm' | 'l' | 'xl')}`}>
                    {idea.effort.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${idea.status === 'new' ? 'bg-purple-100 text-purple-800' : 
                    idea.status === 'planned' ? 'bg-blue-100 text-blue-800' : 
                    idea.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                    {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{idea.customer}</TableCell>
                <TableCell>{idea.createdAt}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
    
    {/* Empty state - will be shown conditionally in a real implementation */}
    {filteredIdeas.length === 0 && (
      <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg mt-6">
        <div className="bg-gray-100 p-3 rounded-full mb-4">
          <Lightbulb className="h-6 w-6 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium mb-1">No ideas yet</h3>
        <p className="text-gray-500 text-center mb-4">Start collecting ideas from your team and customers to improve your product.</p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Idea
        </Button>
      </div>
    )}
  </div>
  );
};

export default Ideas;