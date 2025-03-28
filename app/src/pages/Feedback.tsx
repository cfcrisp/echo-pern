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
  expanded?: boolean; // Add this property to track expanded state
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
  
  // Fetch feedback data when component mounts
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        // Only proceed if we have initiatives loaded
        if (initiatives.length === 0) return;
        
        setLoading(true);
        const data = await apiClient.feedback.getAll();
        
        // Format the data to match our Feedback type if needed
        const formattedData = Array.isArray(data) ? data.map((item: any) => {
          // Find initiative name if available
          const initiativeName = item.initiative_id
            ? initiatives.find(i => i.id === item.initiative_id)?.title
            : undefined;
            
          return {
            id: item.id,
            title: item.title,
            description: item.description || '',
            sentiment: item.sentiment || 'neutral',
            customer_name: item.customer_name || 'Unknown',
            customer_id: item.customer_id,
            createdAt: item.created_at || 'Recently',
            initiative_id: item.initiative_id,
            initiative_name: initiativeName
          };
        }) : [];
        
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
      // Close all other menus
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
  }) => {
    try {
      setLoading(true);
      // Create new feedback via API with correct property mapping
      const apiFeedback = {
        content: feedbackItem.title, // Required for compatibility with the API
        title: feedbackItem.title,
        description: feedbackItem.description,
        customer_id: feedbackItem.customer_id || '',
        sentiment: feedbackItem.sentiment,
        source: 'manual',
        initiative_ids: feedbackItem.initiative_ids || []
      };
      
      console.log('Creating feedback with data:', apiFeedback);
      const newFeedback = await apiClient.feedback.create(apiFeedback);
      
      // Find initiative name if provided
      const initiativeName = newFeedback.initiative_id
        ? initiatives.find(i => i.id === newFeedback.initiative_id)?.title
        : undefined;
      
      // Update the local state with the new feedback
      setFeedback(prevFeedback => [...prevFeedback, {
        id: newFeedback.id,
        title: feedbackItem.title,
        description: feedbackItem.description,
        sentiment: feedbackItem.sentiment,
        customer_name: newFeedback.customer_name || 'Unknown',
        customer_id: feedbackItem.customer_id,
        createdAt: 'Just now',
        initiative_id: newFeedback.initiative_id,
        initiative_name: initiativeName
      }]);
    } catch (err: any) {
      console.error('Error creating feedback:', err);
      alert('Failed to create feedback. Please try again.');
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
  }) => {
    try {
      console.log('handleUpdateFeedback called with:', id, updatedFeedback);
      
      // Find the existing feedback first to ensure we have all required data
      const existingFeedback = feedback.find(f => f.id === id);
      if (!existingFeedback) {
        console.error('Cannot update feedback: feedback item not found');
        return;
      }
      console.log('Found existing feedback:', existingFeedback);

      // Update local state immediately with optimistic update
      setFeedback(prevFeedback => prevFeedback.map(item => {
        if (item.id === id) {
          // Find related customer for displaying in the UI
          const customerName = updatedFeedback.customer_id 
            ? customers.find(c => c.id === updatedFeedback.customer_id)?.name || 'Unknown' 
            : item.customer_name;
          
          // Preserve all existing feedback properties while updating only changed fields
          return { 
            ...item, 
            title: updatedFeedback.title || item.title,
            description: updatedFeedback.description || item.description,
            sentiment: updatedFeedback.sentiment || item.sentiment,
            customer_id: updatedFeedback.customer_id !== undefined ? updatedFeedback.customer_id : item.customer_id,
            customer_name: customerName,
            initiative_id: updatedFeedback.initiative_id !== undefined ? updatedFeedback.initiative_id : item.initiative_id
          };
        }
        return item;
      }));
      
      setLoading(true);
      
      // Create API-compatible update object
      const apiUpdate: any = {};
      
      if (updatedFeedback.title || updatedFeedback.description) {
        // Get the current feedback item
        const currentFeedback = feedback.find(f => f.id === id);
        if (currentFeedback) {
          const title = updatedFeedback.title || currentFeedback.title;
          const description = updatedFeedback.description || currentFeedback.description;
          apiUpdate.content = `${title}: ${description}`;
        }
      }
      
      if (updatedFeedback.sentiment) {
        apiUpdate.sentiment = updatedFeedback.sentiment;
      }
      
      if (updatedFeedback.customer_id !== undefined) {
        apiUpdate.customer_id = updatedFeedback.customer_id;
      }
      
      if (updatedFeedback.initiative_id !== undefined) {
        apiUpdate.initiative_id = updatedFeedback.initiative_id;
      }
      
      console.log('Making API call to update feedback with:', apiUpdate);
      
      // Update feedback via API
      await apiClient.feedback.update(id, apiUpdate);
      
      // Fetch the complete updated feedback to ensure we have the latest data
      const refreshedFeedback = await apiClient.feedback.getById(id);
      
      console.log('DEBUG: Refreshed feedback from API:', refreshedFeedback);
      console.log('DEBUG: Initiative data from API:', refreshedFeedback.initiative_id, refreshedFeedback.initiatives);
      
      // Find related customer for displaying in the UI
      const customerName = refreshedFeedback.customer_id 
        ? customers.find(c => c.id === refreshedFeedback.customer_id)?.name || 'Unknown' 
        : undefined;
      
      // Find related initiative for displaying in the UI
      const initiativeName = refreshedFeedback.initiative_id
        ? initiatives.find(i => i.id === refreshedFeedback.initiative_id)?.title
        : undefined;
      
      // Create a complete feedback object with all UI-necessary data
      const completeFeedback = {
        ...refreshedFeedback,
        // Ensure frontend properties are set correctly
        title: updatedFeedback.title || refreshedFeedback.title,
        description: updatedFeedback.description || refreshedFeedback.description,
        customer_name: customerName || refreshedFeedback.customer_name,
        initiative_name: initiativeName,
        initiative_id: refreshedFeedback.initiative_id,
        createdAt: refreshedFeedback.createdAt || refreshedFeedback.created_at
      };
      
      console.log('Feedback updated successfully, refreshed data:', completeFeedback);
      
      // Update the local state with the full refreshed feedback
      setFeedback(prevFeedback => prevFeedback.map(item => 
        item.id === id ? completeFeedback : item
      ));
    } catch (err: any) {
      console.error('Error updating feedback:', err);
      alert('Failed to update feedback. Please try again.');
      
      // If API update fails, revert to original state by re-fetching
      try {
        const feedbackData = await apiClient.feedback.getAll();
        setFeedback(feedbackData);
      } catch (refreshErr) {
        console.error('Error refreshing feedback after failed update:', refreshErr);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handler for deleting feedback
  const handleDeleteFeedback = async (id: string) => {
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

  // Toggle feedback expansion
  const toggleFeedbackExpanded = (id: string) => {
    setFeedback(prevFeedback => prevFeedback.map(item => 
      item.id === id ? { ...item, expanded: !item.expanded } : item
    ));
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
      
      // Handle undefined values (treat them as empty strings)
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
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedback.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No feedback found matching the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFeedback.map((item) => (
                    <React.Fragment key={item.id}>
                      <TableRow 
                        className={`cursor-pointer hover:bg-muted/50 ${item.expanded ? 'bg-muted/50' : ''}`}
                        onClick={() => toggleFeedbackExpanded(item.id)}
                      >
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              <ChevronRight className={`h-4 w-4 transition-transform ${item.expanded ? 'rotate-90' : ''}`} />
                              {item.title}
                            </div>
                            {!item.expanded && (
                              <div className="text-sm text-gray-500 line-clamp-1 dark:text-gray-400 pl-6">
                                {item.description}
                              </div>
                            )}
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
                          {item.initiative_name || (item.initiative_id ? initiatives.find(i => i.id === item.initiative_id)?.title : null) || 'None'}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <EditFeedbackModal
                              feedback={{
                                id: item.id,
                                title: item.title,
                                description: item.description,
                                sentiment: item.sentiment,
                                customerId: item.customer_id || '',
                                customer: item.customer_name,
                                initiativeId: item.initiative_id || ''
                              }}
                              initiatives={initiatives}
                              customers={customers.map(c => ({ id: c.id, name: c.name }))}
                              onUpdate={(id, updatedData) => {
                                // Enhanced debugging 
                                console.log('EditFeedbackModal submitted data:', updatedData);
                                console.log('Customer ID from modal:', updatedData.customerId);
                                console.log('Initiative ID from modal:', updatedData.initiativeId);
                                
                                // Map EditFeedbackModal fields to our API format
                                // When customerId/initiativeId is undefined, it means "none" was selected - we want to clear the ID
                                const customerIdToUse = updatedData.customerId === undefined ? undefined : updatedData.customerId;
                                const initiativeIdToUse = updatedData.initiativeId === undefined ? undefined : updatedData.initiativeId;
                                
                                console.log('Using customer_id for API:', customerIdToUse);
                                console.log('Using initiative_id for API:', initiativeIdToUse);
                                
                                handleUpdateFeedback(id, {
                                  title: updatedData.title,
                                  description: updatedData.description,
                                  sentiment: updatedData.sentiment,
                                  customer_id: customerIdToUse,
                                  initiative_id: initiativeIdToUse
                                });
                              }}
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
                                <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded shadow-lg z-10 dark:bg-card dark:border-border">
                                  <div 
                                    className="px-3 py-2 text-xs hover:bg-gray-100 cursor-pointer flex items-center dark:hover:bg-gray-800/50 dark:text-gray-200"
                                    onClick={() => {
                                      console.log('View feedback details', item.id);
                                      toggleMenu(item.id);
                                    }}
                                  >
                                    <ExternalLink className="h-3.5 w-3.5 mr-2" /> View Details
                                  </div>
                                  <div 
                                    className="px-3 py-2 text-xs hover:bg-gray-100 cursor-pointer flex items-center text-red-600 dark:hover:bg-gray-800/50"
                                    onClick={() => {
                                      handleDeleteFeedback(item.id);
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
                      
                      {/* Expanded description row */}
                      {item.expanded && (
                        <TableRow>
                          <TableCell colSpan={5} className="bg-muted/30 border-t-0 pt-0 pb-4">
                            <div className="p-4">
                              <h4 className="text-sm font-medium mb-1">Description</h4>
                              <div className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-white dark:bg-card p-3 rounded border dark:border-gray-800">
                                {item.description || "No description provided."}
                              </div>
                              
                              <div className="flex flex-wrap gap-3 mt-4">
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  <span className="font-medium">Created:</span> {item.createdAt}
                                </div>
                                
                                {item.customer_name && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    <span className="font-medium">Customer:</span> {item.customer_name}
                                  </div>
                                )}
                                
                                {item.initiative_id && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    <span className="font-medium">Initiative:</span> {item.initiative_name || initiatives.find(i => i.id === item.initiative_id)?.title || 'Unknown'}
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
    </div>
  );
};

export default Feedback;