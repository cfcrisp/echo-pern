import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ChevronRight, MessageSquare, Pencil, Plus, Trash2, 
  MoreHorizontal, ExternalLink, Users,
  ArrowUpDown, ArrowUp, ArrowDown, Filter, X
} from 'lucide-react';
import React from 'react';
import { AddFeedbackModal, EditFeedbackModal } from "@/components/shared";
import apiClient from '@/services/apiClient';
import { useAuth } from '@/context/AuthContext';

// Define types for better type safety
type FeedbackSentiment = 'positive' | 'neutral' | 'negative';

type SortColumn = 'title' | 'sentiment' | 'customer_name' | 'createdAt' | 'initiative_id' | null;
type SortDirection = 'asc' | 'desc';

type FilterState = {
  sentiment: FeedbackSentiment | 'all';
  customer: string | 'all';
};

type Feedback = {
  id: string;
  title: string;
  description: string;
  sentiment: FeedbackSentiment;
  customer_name?: string;
  customer_id?: string;
  createdAt: string;
  initiative_id?: string;
  initiative_name?: string;
  expanded?: boolean;
  initiatives?: Array<{ id: string; title: string }>;
};

// Feedback Component
const Feedback = () => {
  // State variables
  const [activeTab, setActiveTab] = useState("all");
  const [showMenu, setShowMenu] = useState<Record<string, boolean>>({});
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [initiatives, setInitiatives] = useState<Array<{ id: string; title: string }>>([]);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    sentiment: 'all',
    customer: 'all'
  });
  
  // Helper function to extract initiative data from various API response formats
  const extractInitiativeData = (item: any) => {
    // Initialize with default values
    let initiativeId = item.initiative_id;
    let initiativeName;
    
    // Check for initiatives array from server
    if (!initiativeId && item.initiatives && item.initiatives.length > 0) {
      initiativeId = item.initiatives[0].id;
      initiativeName = item.initiatives[0].title;
    } else if (initiativeId) {
      // Find initiative name if we have the ID
      initiativeName = initiatives.find(i => i.id === initiativeId)?.title;
    }
    
    return { initiativeId, initiativeName };
  };
  
  // Helper function to extract customer data
  const extractCustomerData = (item: any) => {
    // Get customer ID from the item
    const customerId = item?.customer_id || null;
    
    // If we have a customer ID, look up the name
    let customerName = item?.customer_name || null;
    
    if (customerId && customers.length > 0 && (!customerName || customerName === 'Unknown')) {
      // Find the customer in our local state
      const customer = customers.find(c => c.id === customerId);
      if (customer?.name) {
        customerName = customer.name;
      }
    }
    
    return { 
      customerId, 
      customerName: customerName || 'Unknown' 
    };
  };
  
  // Helper function to format feedback data consistently
  const formatFeedbackData = (item: any): Feedback => {
    const { initiativeId, initiativeName } = extractInitiativeData(item);
    const { customerId, customerName } = extractCustomerData(item);
    
    return {
      id: item.id,
      title: item.title,
      description: item.description || '',
      sentiment: item.sentiment || 'neutral',
      customer_name: customerName,
      customer_id: customerId,
      createdAt: item.created_at || item.createdAt || 'Recently',
      initiative_id: initiativeId,
      initiative_name: initiativeName,
      initiatives: item.initiatives
    };
  };
  
  // Fetch customers and initiatives when the component mounts
  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        // Fetch customers
        const customersData = await apiClient.customers.getAll();
        if (Array.isArray(customersData)) {
          setCustomers(
            customersData.map((customer: any) => ({
              id: customer.id,
              name: customer.name
            }))
          );
        }
        
        // Fetch initiatives
        const initiativesData = await apiClient.initiatives.getAll();
        if (Array.isArray(initiativesData)) {
          setInitiatives(
            initiativesData.map((initiative: any) => ({
              id: initiative.id,
              title: initiative.title
            }))
          );
        }
      } catch (err) {
        console.error('Error fetching related data:', err);
      }
    };
    
    fetchRelatedData();
  }, []);
  
  // Fetch feedback data when component mounts and initiatives load
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        // Only proceed if we have initiatives loaded
        if (initiatives.length === 0) return;
        
        setLoading(true);
        const data = await apiClient.feedback.getAll();
        
        // Format the data consistently using our helper
        const formattedData = Array.isArray(data) 
          ? data.map(formatFeedbackData) 
          : [];
        
        setFeedback(formattedData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching feedback:', err);
        if (err.message === 'Tenant not found') {
          // If tenant not found, set empty array and don't show error
          setFeedback([]);
          setError(null);
        } else {
          setError('Failed to load feedback. Please try again later.');
          setFeedback([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [initiatives]);
  
  // Toggle menu visibility
  const toggleMenu = (id: string) => {
    setShowMenu(prev => {
      const newState: Record<string, boolean> = {};
      Object.keys(prev).forEach(key => {
        newState[key] = key === id ? !prev[key] : false;
      });
      return newState;
    });
  };
  
  // Toggle filter menu
  const toggleFilterMenu = () => {
    setShowFilterMenu(prev => !prev);
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      sentiment: 'all',
      customer: 'all'
    });
  };
  
  // Handle filter changes
  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
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

  // Handler for saving new feedback
  const handleSaveFeedback = async (feedbackItem: {
    title: string;
    description: string;
    sentiment: FeedbackSentiment;
    customer_id?: string;
    initiative_ids?: string[];
    initiative_id?: string;
  }) => {
    try {
      // Validate title
      const trimmedTitle = feedbackItem.title.trim();
      if (!trimmedTitle) {
        alert('Title cannot be empty');
        return;
      }
      
      setLoading(true);
      
      // Get auth token from any available storage location
      const token = localStorage.getItem('authToken') || 
                   localStorage.getItem('jwt') || 
                   sessionStorage.getItem('authToken') || 
                   sessionStorage.getItem('jwt') || '';
      
      // Create feedback payload with server-expected structure
      const payload = {
        title: trimmedTitle,
        content: trimmedTitle, // Include both to ensure it's received
        description: feedbackItem.description,
        sentiment: feedbackItem.sentiment,
        tenant_id: user?.tenant_id || ''
      };
      
      // Create URL with query parameters for customer_id and initiative_id
      const url = new URL('http://localhost:3000/feedback');
      
      // Add customer_id as query parameter if provided and not 'none'
      if (feedbackItem.customer_id && feedbackItem.customer_id !== 'none') {
        url.searchParams.append('customer_id', feedbackItem.customer_id);
      }
      
      // Add initiative_id as query parameter if provided and not 'none'
      if (feedbackItem.initiative_id && feedbackItem.initiative_id !== 'none') {
        url.searchParams.append('initiative_id', feedbackItem.initiative_id);
      }
      
      // Make direct fetch request with auth headers
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Tenant-ID': user?.tenant_id || '',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      
      // Handle error responses
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      
      // Parse successful response
      const data = await response.json();
      
      // Check if we got an ID back
      if (!data.id) {
        throw new Error('Failed to create feedback: No ID returned');
      }
      
      // Get the complete feedback data using the ID
      const newFeedback = await apiClient.feedback.getById(data.id);
      
      // Ensure customer information is included
      const customerName = feedbackItem.customer_id && feedbackItem.customer_id !== 'none'
        ? customers.find(c => c.id === feedbackItem.customer_id)?.name || 'Unknown'
        : 'Unknown';
        
      // Add customer data to the feedback if not already present
      if (!newFeedback.customer_name && feedbackItem.customer_id && feedbackItem.customer_id !== 'none') {
        newFeedback.customer_name = customerName;
        newFeedback.customer_id = feedbackItem.customer_id;
      }
      
      // Format and add to state
      const formattedFeedback = formatFeedbackData(newFeedback);
      setFeedback(prev => [formattedFeedback, ...prev]);
      
      // Remove success alert
    } catch (error) {
      console.error('Error creating feedback:', error);
      alert(`Failed to create feedback: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Handler for updating feedback
  const handleUpdateFeedback = async (id: string, updatedFeedback: {
    title?: string;
    description?: string;
    sentiment?: FeedbackSentiment;
    customer_id?: string;
    initiative_id?: string;
    customerId?: string;  // For backward compatibility
    initiativeId?: string;  // For backward compatibility
  }) => {
    try {
      // Find the existing feedback
      const existingFeedback = feedback.find(f => f.id === id);
      if (!existingFeedback) {
        console.error('Cannot update feedback: feedback item not found');
        return;
      }
      
      // Normalize property names for consistency
      const customer_id = updatedFeedback.customer_id || updatedFeedback.customerId;
      const initiative_id = updatedFeedback.initiative_id || updatedFeedback.initiativeId;
      
      // Find customer and initiative names for UI
      const customerName = customer_id
        ? customers.find(c => c.id === customer_id)?.name || 'Unknown' 
        : existingFeedback.customer_name;
        
      const initiativeName = initiative_id
        ? initiatives.find(i => i.id === initiative_id)?.title
        : existingFeedback.initiative_name;

      // Update local state immediately (optimistic update)
      setFeedback(prevFeedback => prevFeedback.map(item => 
        item.id === id 
          ? { 
              ...item, 
              title: updatedFeedback.title || item.title,
              description: updatedFeedback.description || item.description,
              sentiment: updatedFeedback.sentiment || item.sentiment,
              customer_id: customer_id || item.customer_id,
              customer_name: customerName,
              initiative_id: initiative_id || item.initiative_id,
              initiative_name: initiativeName
            }
          : item
      ));
      
      setLoading(true);
      
      // Create API-compatible update object with only defined fields
      const apiUpdate: Record<string, any> = {};
      
      // Only add fields that were provided in the update
      if (updatedFeedback.title !== undefined) {
        apiUpdate.title = updatedFeedback.title;
      }
      
      if (updatedFeedback.description !== undefined) {
        apiUpdate.description = updatedFeedback.description;
      }
      
      if (updatedFeedback.sentiment !== undefined) {
        apiUpdate.sentiment = updatedFeedback.sentiment;
      }
      
      // Handle customer_id, using null to clear the association if explicitly set to undefined
      if ('customer_id' in updatedFeedback || 'customerId' in updatedFeedback) {
        apiUpdate.customer_id = customer_id === 'none' ? null : customer_id;
      }
      
      // Handle initiative_id, using null to clear the association if explicitly set to undefined
      if ('initiative_id' in updatedFeedback || 'initiativeId' in updatedFeedback) {
        apiUpdate.initiative_id = initiative_id === 'none' ? null : initiative_id;
      }
      
      // Update feedback via API
      await apiClient.feedback.update(id, apiUpdate);
      
      // Fetch the complete updated feedback to ensure we have the latest data
      const refreshedFeedback = await apiClient.feedback.getById(id);
      
      // Format and update the feedback in state
      const formattedFeedback = formatFeedbackData({
        ...refreshedFeedback,
        customer_id: refreshedFeedback.customer_id || customer_id,
        customer_name: customerName
      });
      
      // Update the local state with the refreshed data
      setFeedback(prevFeedback => prevFeedback.map(item => 
        item.id === id ? formattedFeedback : item
      ));
    } catch (err) {
      console.error('Error updating feedback:', err);
      alert('Failed to update feedback. Please try again.');
      
      // Refresh the data on error to ensure UI is consistent
      refreshFeedbackData();
    } finally {
      setLoading(false);
    }
  };
  
  // Helper to refresh feedback data after errors
  const refreshFeedbackData = async () => {
    try {
      const feedbackData = await apiClient.feedback.getAll();
      const formattedData = Array.isArray(feedbackData) 
        ? feedbackData.map(item => formatFeedbackData(item)) 
        : [];
      setFeedback(formattedData);
    } catch (refreshErr) {
      console.error('Error refreshing feedback data:', refreshErr);
    }
  };

  // Handler for deleting feedback
  const handleDeleteFeedback = async (id: string) => {
    // Use the window.confirm dialog for simplicity
    if (window.confirm("Are you sure you want to delete this feedback item? This action cannot be undone.")) {
      try {
        setLoading(true);
        // Delete feedback via API
        await apiClient.feedback.delete(id);
        
        // Update the local state
        setFeedback(prevFeedback => prevFeedback.filter(item => item.id !== id));
      } catch (err) {
        console.error('Error deleting feedback:', err);
        alert('Failed to delete feedback. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Get filtered feedback based on active tab and filters
  let filteredFeedback = feedback;
  
  // Filter by tab first (all, positive, negative)
  if (activeTab === 'positive') {
    filteredFeedback = filteredFeedback.filter(item => item.sentiment === 'positive');
  } else if (activeTab === 'negative') {
    filteredFeedback = filteredFeedback.filter(item => item.sentiment === 'negative');
  }
  
  // Apply additional filters
  if (filters.sentiment !== 'all') {
    filteredFeedback = filteredFeedback.filter(item => item.sentiment === filters.sentiment);
  }
  
  if (filters.customer !== 'all') {
    filteredFeedback = filteredFeedback.filter(item => item.customer_id === filters.customer);
  }
  
  // Sort feedback based on current sort state
  if (sortColumn) {
    filteredFeedback = [...filteredFeedback].sort((a, b) => {
      // Special case for initiative_id - we want to sort by initiative title
      if (sortColumn === 'initiative_id') {
        const aInitiative = a.initiative_id ? initiatives.find(i => i.id === a.initiative_id)?.title || '' : '';
        const bInitiative = b.initiative_id ? initiatives.find(i => i.id === b.initiative_id)?.title || '' : '';
        
        if (aInitiative < bInitiative) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if (aInitiative > bInitiative) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      }
      
      // Handle regular columns
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];
      
      // Handle undefined values
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
  
  // Helper function to get sentiment badge styling
  const getSentimentBadgeClass = (sentiment: FeedbackSentiment): string => {
    switch(sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'neutral':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'negative':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400';
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customer Feedback</h1>
        <div className="flex items-center space-x-2">
          <AddFeedbackModal 
            onSave={handleSaveFeedback} 
            initiatives={initiatives}
            customers={customers}
          />
        </div>
      </div>
      
      {/* Tabs for filtering feedback */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Feedback</TabsTrigger>
          <TabsTrigger value="positive">
            <div className="flex items-center gap-1 text-green-500 dark:text-green-400">
              <span>Positive</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="negative">
            <div className="flex items-center gap-1 text-red-500 dark:text-red-400">
              <span>Negative</span>
            </div>
          </TabsTrigger>
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

      {/* Feedback Table - Only show when not loading and no errors */}
      {!loading && !error && (
        <>
          {/* Filter row */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              {/* Active filters */}
              <div className="flex items-center flex-wrap gap-2">
                {filters.sentiment !== 'all' && (
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                    Sentiment: 
                    <span className={`ml-1 ${
                      filters.sentiment === 'positive' ? 'text-green-600 dark:text-green-400' : 
                      filters.sentiment === 'negative' ? 'text-red-600 dark:text-red-400' : 
                      'text-blue-600 dark:text-blue-400'
                    }`}>
                      {filters.sentiment}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleFilterChange('sentiment', 'all')}
                      className="h-5 w-5 p-0 ml-1 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                
                {filters.customer !== 'all' && (
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                    Customer: {customers.find(c => c.id === filters.customer)?.name || 'Unknown'}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleFilterChange('customer', 'all')}
                      className="h-5 w-5 p-0 ml-1 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                
                {(filters.sentiment !== 'all' || filters.customer !== 'all') && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 hidden sm:flex"
                    onClick={clearAllFilters}
                  >
                    Clear all
                  </Button>
                )}
              </div>
              
              {/* Filter button */}
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleFilterMenu}
                  className="h-7 gap-1 text-xs"
                >
                  <Filter className="h-3 w-3" />
                  <span>Filter</span>
                </Button>
                
                {showFilterMenu && (
                  <div className="absolute left-0 mt-1 w-40 bg-white border border-gray-200 rounded shadow-lg z-10 dark:bg-card dark:border-gray-700">
                    <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                      <h4 className="text-xs font-medium mb-1">Sentiment</h4>
                      <div className="space-y-1">
                        {['all', 'positive', 'neutral', 'negative'].map(sentiment => (
                          <label key={sentiment} className="flex items-center space-x-2 text-xs cursor-pointer">
                            <input 
                              type="radio"
                              checked={filters.sentiment === sentiment}
                              onChange={() => handleFilterChange('sentiment', sentiment)}
                              className="rounded-full"
                            />
                            <span>{sentiment === 'all' ? 'All Sentiments' : sentiment}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    {customers.length > 0 && (
                      <div className="p-2">
                        <h4 className="text-xs font-medium mb-1">Customer</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          <label className="flex items-center space-x-2 text-xs cursor-pointer">
                            <input 
                              type="radio"
                              checked={filters.customer === 'all'}
                              onChange={() => handleFilterChange('customer', 'all')}
                              className="rounded-full"
                            />
                            <span>All Customers</span>
                          </label>
                          {customers.map(customer => (
                            <label key={customer.id} className="flex items-center space-x-2 text-xs cursor-pointer">
                              <input 
                                type="radio"
                                checked={filters.customer === customer.id}
                                onChange={() => handleFilterChange('customer', customer.id as string)}
                                className="rounded-full"
                              />
                              <span>{customer.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between p-2 border-t border-gray-100 dark:border-gray-800">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={clearAllFilters}
                      >
                        Clear all
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={toggleFilterMenu}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900 dark:text-gray-200">{filteredFeedback.length}</span> of <span className="font-medium text-gray-900 dark:text-gray-200">{feedback.length}</span> feedback items
            </div>
          </div>
          
          {/* Feedback Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="w-[300px] cursor-pointer"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center">
                      Feedback
                      {getSortIcon('title')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="w-[120px] cursor-pointer"
                    onClick={() => handleSort('sentiment')}
                  >
                    <div className="flex items-center">
                      Sentiment
                      {getSortIcon('sentiment')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="hidden sm:table-cell w-[150px] cursor-pointer"
                    onClick={() => handleSort('customer_name')}
                  >
                    <div className="flex items-center">
                      Customer
                      {getSortIcon('customer_name')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="hidden sm:table-cell w-[120px] cursor-pointer"
                    onClick={() => handleSort('initiative_id')}
                  >
                    <div className="flex items-center">
                      Initiative
                      {getSortIcon('initiative_id')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedback.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No feedback found matching the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFeedback.map((item) => (
                    <React.Fragment key={item.id}>
                      <TableRow 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={(e) => {
                          // If clicking on action buttons, don't trigger row click
                          if (e.target instanceof Element && 
                              (e.target.closest('button') || 
                               e.target.closest('svg') ||
                               e.target.closest('a'))) {
                            return;
                          }
                          // Find and click the edit button to open the modal
                          const editBtn = document.getElementById(`edit-feedback-${item.id}`);
                          if (editBtn) editBtn.click();
                        }}
                      >
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-medium">{item.title}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSentimentBadgeClass(item.sentiment)}`}>
                            {item.sentiment}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {item.customer_name || 'Unknown'}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-gray-500 dark:text-gray-400">
                          {item.initiative_name || 'None'}
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Empty state - will be shown conditionally when there's no feedback */}
      {!loading && !error && feedback.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg mt-6 dark:border-gray-700">
          <div className="bg-gray-100 p-3 rounded-full mb-4 dark:bg-gray-800">
            <MessageSquare className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-1 dark:text-gray-200">No feedback yet</h3>
          <p className="text-gray-500 text-center mb-4 dark:text-gray-400">Start collecting feedback from your customers using the Add Feedback button above.</p>
        </div>
      )}
      
      {/* Hidden edit modal triggers container - moved outside of table structure */}
      <div className="hidden">
        {filteredFeedback.map((item) => (
          <EditFeedbackModal
            key={`hidden-edit-${item.id}`}
            feedback={{
              id: item.id,
              title: item.title,
              description: item.description,
              sentiment: item.sentiment,
              customer_id: item.customer_id || '',
              customer: item.customer_name,
              initiative_id: item.initiative_id || '',
              createdAt: item.createdAt
            }}
            initiatives={initiatives}
            customers={customers.map(c => ({ id: c.id, name: c.name }))}
            onUpdate={(id, updatedData) => {
              const customerIdToUse = updatedData.customer_id === 'none' ? undefined : updatedData.customer_id;
              const initiativeIdToUse = updatedData.initiative_id === 'none' ? undefined : updatedData.initiative_id;
              
              handleUpdateFeedback(id, {
                title: updatedData.title,
                description: updatedData.description,
                sentiment: updatedData.sentiment,
                customer_id: customerIdToUse,
                initiative_id: initiativeIdToUse
              });
            }}
            onDelete={handleDeleteFeedback}
            triggerButtonId={`edit-feedback-${item.id}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Feedback;