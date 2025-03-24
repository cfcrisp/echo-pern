import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronRight, Users, Pencil, Plus, Trash2 } from 'lucide-react';

// Customers Component
const Customers = () => {
  const [activeTab, setActiveTab] = useState("all");
  
  // Sample customers data - in a real app, this would come from an API
  const customersData = [
    {
      id: "1",
      name: "Acme Corp",
      revenue: "$250,000",
      status: "active",
      idea_count: 3,
      feedback_count: 2,
      createdAt: "2 months ago"
    },
    {
      id: "2",
      name: "TechStart Ltd",
      revenue: "$120,000",
      status: "active",
      idea_count: 1,
      feedback_count: 3,
      createdAt: "3 months ago"
    },
    {
      id: "3",
      name: "Enterprise Solutions Inc",
      revenue: "$500,000",
      status: "active",
      idea_count: 5,
      feedback_count: 4,
      createdAt: "1 year ago"
    },
    {
      id: "4",
      name: "Startup Ventures",
      revenue: "$50,000",
      status: "prospect",
      idea_count: 0,
      feedback_count: 1,
      createdAt: "2 weeks ago"
    },
    {
      id: "5",
      name: "Global Industries",
      revenue: "$750,000",
      status: "inactive",
      idea_count: 2,
      feedback_count: 0,
      createdAt: "6 months ago"
    },
    {
      id: "6",
      name: "Local Business LLC",
      revenue: "$80,000",
      status: "active",
      idea_count: 1,
      feedback_count: 2,
      createdAt: "4 months ago"
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
      createdAt: "8 months ago"
    }
  ];

  // Filter customers based on active tab
  const filteredCustomers = activeTab === "all" 
    ? customersData 
    : customersData.filter(item => item.status === activeTab);
  
  // Helper function to get status badge styling
  const getStatusBadgeStyle = (status: 'active' | 'inactive' | 'prospect'): string => {
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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
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
            <TableHead className="w-[250px]">Name</TableHead>
            <TableHead className="w-[120px]">Revenue</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[100px]">Ideas</TableHead>
            <TableHead className="w-[100px]">Feedback</TableHead>
            <TableHead className="hidden sm:table-cell w-[120px]">Added</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCustomers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No customers found.
              </TableCell>
            </TableRow>
          ) : (
            filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.revenue}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeStyle(customer.status as 'active' | 'inactive' | 'prospect')}`}>
                    {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>{customer.idea_count}</TableCell>
                <TableCell>{customer.feedback_count}</TableCell>
                <TableCell className="hidden sm:table-cell">{customer.createdAt}</TableCell>
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
    {filteredCustomers.length === 0 && (
      <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg mt-6">
        <div className="bg-gray-100 p-3 rounded-full mb-4">
          <Users className="h-6 w-6 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium mb-1">No customers yet</h3>
        <p className="text-gray-500 text-center mb-4">Start adding customers to track their feedback and ideas.</p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>
    )}
  </div>
  );
};

export default Customers;