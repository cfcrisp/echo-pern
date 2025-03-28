import { useState, useEffect } from 'react';
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
import apiClient from '@/services/apiClient';
import { useAuth } from '@/context/AuthContext';

// Define types for better type safety
type CustomerStatus = 'active' | 'inactive' | 'prospect';

type SortColumn = 'name' | 'revenue' | 'status' | 'idea_count' | 'feedback_count' | 'createdAt' | null;
type SortDirection = 'asc' | 'desc';

type CustomerIdea = {
  id: string;
  title: string;
  priority: string;
  status: string;
};

type CustomerFeedback = {
  id: string;
  title: string;
  sentiment: string;
  date: string;
};

type Customer = {
  id: string;
  name: string;
  revenue: string;
  status: CustomerStatus;
  idea_count?: number;
  feedback_count?: number;
  createdAt: string;
  ideas?: CustomerIdea[];
  feedback?: CustomerFeedback[];
  email?: string;
  company?: string;
};

// Customers Component
const Customers = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [showMenu, setShowMenu] = useState<Record<string, boolean>>({});
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Fetch customers data when component mounts
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const data = await apiClient.customers.getAll();
        
        // Format the data to match our Customer type if needed
        const formattedData = Array.isArray(data) ? data.map((customer: any) => ({
          id: customer.id || '',
          name: customer.name || '',
          email: customer.email || '',  // Ensure email is never undefined
          company: customer.company || '',  // Ensure company is never undefined
          revenue: customer.revenue || '$0',
          status: customer.status || 'active',
          idea_count: customer.idea_count || 0,
          feedback_count: customer.feedback_count || 0,
          createdAt: customer.created_at || 'Recently',
          ideas: customer.ideas || [],
          feedback: customer.feedback || []
        })) : [];
        
        console.log('Formatted customer data:', formattedData);
        setCustomers(formattedData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching customers:', err);
        if (err.message === 'Tenant not found') {
          // If tenant not found, set empty array and don't show error
          setCustomers([]);
          setError(null);
        } else {
          setError('Failed to load customers. Please try again later.');
          setCustomers([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);
  
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

  // Create a new customer
  const handleSaveCustomer = async (customer: {
    name: string;
    email: string;
    company?: string;
    status: CustomerStatus;
  }) => {
    try {
      setLoading(true);
      
      // Convert status for API compatibility if needed
      const apiStatus: 'active' | 'inactive' = 
        customer.status === 'prospect' ? 'active' : 
        (customer.status as 'active' | 'inactive');
      
      // Create the new customer via API
      const newCustomer = await apiClient.customers.create({
        ...customer,
        status: apiStatus
      });
      
      // Update the local state with the new customer
      setCustomers(prevCustomers => [...prevCustomers, {
        ...newCustomer,
        revenue: '$0',
        idea_count: 0,
        feedback_count: 0,
        createdAt: 'Just now',
        ideas: [],
        feedback: []
      }]);
    } catch (err) {
      console.error('Error creating customer:', err);
      alert('Failed to create customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update a customer
  const handleUpdateCustomer = async (
    id: string, 
    updatedCustomer: { 
      name: string; 
      revenue: string; 
      status: CustomerStatus;
    }
  ) => {
    try {
      console.log('handleUpdateCustomer called with:', id, updatedCustomer);
      
      // Find the existing customer first to ensure we have all required data
      const existingCustomer = customers.find(c => c.id === id);
      if (!existingCustomer) {
        console.error('Cannot update customer: customer not found');
        return;
      }
      console.log('Found existing customer:', existingCustomer);

      // Update local state immediately with optimistic update
      setCustomers(prevCustomers => prevCustomers.map(customer => {
        if (customer.id === id) {
          // Preserve all existing customer properties while updating only changed fields
          return { 
            ...customer, 
            name: updatedCustomer.name,
            revenue: updatedCustomer.revenue,
            status: updatedCustomer.status
          };
        }
        return customer;
      }));
      
      // Convert status for API compatibility - API only accepts 'active' or 'inactive'
      const apiStatus: 'active' | 'inactive' = 
        updatedCustomer.status === 'prospect' ? 'active' : 
        (updatedCustomer.status as 'active' | 'inactive');
      
      console.log('Making API call to update customer with:', {
        name: updatedCustomer.name,
        status: apiStatus,
        email: existingCustomer.email || "",
        company: existingCustomer.company
      });
      
      // Then update the customer in the API - only send compatible fields
      await apiClient.customers.update(id, {
        name: updatedCustomer.name,
        status: apiStatus,
        email: existingCustomer.email || "", // Use existing email or empty string as fallback
        company: existingCustomer.company // Use existing company
      });
      
      console.log('Customer updated successfully');
    } catch (error) {
      console.error('Error updating customer:', error);
      
      // If API update fails, revert to original state
      setCustomers(prevCustomers => prevCustomers.map(customer => {
        if (customer.id === id) {
          // Find the existing customer again in case customers state has changed
          const originalCustomer = customers.find(c => c.id === id);
          return originalCustomer || customer; // Fallback to current if original not found
        }
        return customer;
      }));
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        setLoading(true);
        // Delete the customer via API
        await apiClient.customers.delete(id);
        
        // Update the local state
        setCustomers(prevCustomers => prevCustomers.filter(customer => customer.id !== id));
      } catch (err) {
        console.error('Error deleting customer:', err);
        alert('Failed to delete customer. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Filter customers based on active tab
  let filteredCustomers = activeTab === "all" 
    ? customers 
    : customers.filter(item => item.status === activeTab);
    
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
  const getStatusBadgeStyle = (status: CustomerStatus | undefined): string => {
    switch(status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive':
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
            <span className="text-gray-700">Customers</span>
          </div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-gray-500 mt-1">Manage your customer relationships and track their feedback and ideas.</p>
        </div>
        <div>
          <AddCustomerModal onSave={(customerFromModal) => {
            // Transform the data from the modal to match what our API expects
            const apiCustomer = {
              name: customerFromModal.name,
              status: customerFromModal.status,
              email: '', // Add default email since modal doesn't collect it
              company: '' // Add default company since modal doesn't collect it
            };
            handleSaveCustomer(apiCustomer);
          }} />
        </div>
      </div>
      
      {/* Tabs for filtering customers */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Customers</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 text-red-500 border border-red-300 bg-red-50 rounded-md dark:bg-red-900/20 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Customers Table - Only show when not loading and no errors */}
      {!loading && !error && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeStyle(customer.status)}`}>
                        {customer.status ? (customer.status.charAt(0).toUpperCase() + customer.status.slice(1)) : 'Unknown'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link 
                        to={`/ideas?customer=${customer.id}`} 
                        className="text-primary hover:underline"
                      >
                        {customer.idea_count || 0}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link 
                        to={`/feedback?customer=${customer.id}`} 
                        className="text-primary hover:underline"
                      >
                        {customer.feedback_count || 0}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <EditCustomerModal 
                          customer={customer}
                          onUpdate={(id, updatedCustomer) => {
                            console.log('Updating customer with data:', id, updatedCustomer);
                            handleUpdateCustomer(id, updatedCustomer);
                          }} 
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
                            <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded shadow-lg z-10 dark:bg-card dark:border-border">
                              <div 
                                className="px-3 py-2 text-xs hover:bg-gray-100 cursor-pointer flex items-center dark:hover:bg-gray-800/50 dark:text-gray-200"
                                onClick={() => {
                                  console.log('View customer details', customer.id);
                                  toggleMenu(customer.id);
                                }}
                              >
                                <ExternalLink className="h-3.5 w-3.5 mr-2" /> View Details
                              </div>
                              <div 
                                className="px-3 py-2 text-xs hover:bg-gray-100 cursor-pointer flex items-center text-red-600 dark:hover:bg-gray-800/50"
                                onClick={() => {
                                  handleDeleteCustomer(customer.id);
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Empty state - will be shown conditionally when there's no customers */}
      {!loading && !error && filteredCustomers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg mt-6 dark:border-gray-700">
          <div className="bg-gray-100 p-3 rounded-full mb-4 dark:bg-gray-800">
            <Users className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-1 dark:text-gray-200">No customers yet</h3>
          <p className="text-gray-500 text-center mb-4 dark:text-gray-400">Start adding customers using the Add Customer button in the top right.</p>
        </div>
      )}
    </div>
  );
};

export default Customers;