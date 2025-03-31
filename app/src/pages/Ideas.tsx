import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, Lightbulb, MessageSquare, X,
  MoreHorizontal, Trash2, Pencil, 
  Plus, Filter, ArrowUpDown, ArrowUp, ArrowDown, Users
} from 'lucide-react';
import React from 'react';
import { AddIdeaModal, EditIdeaModal } from "@/components/shared";
import type { UpdateIdeaData } from "@/components/shared/EditIdeaModal";
import apiClient from '@/services/apiClient';
import { useAuth } from '@/context/AuthContext';

// Define types for better type safety
type IdeaPriority = 'urgent' | 'high' | 'medium' | 'low';
type IdeaStatus = 'new' | 'planned' | 'in_progress' | 'completed' | 'rejected';
type IdeaEffort = 'xs' | 's' | 'm' | 'l' | 'xl';

type Idea = {
  id: string;
  title: string;
  description: string;
  status: IdeaStatus;
  priority: IdeaPriority;
  effort: IdeaEffort;
  customer_name?: string;
  customer_ids: string[];
  initiative_id?: string;
  initiative_name?: string;
  createdAt: string;
  votes?: number;
  initiatives?: Array<{ id: string; title: string }>;
};

type FilterState = {
  priority: IdeaPriority | 'all';
  status: IdeaStatus | 'all';
  customer: string | 'all';
};

type SortColumn = 'title' | 'priority' | 'status' | 'customer_name' | 'initiative_name' | null;
type SortDirection = 'asc' | 'desc';

// Ideas Component
const Ideas = () => {
  // State Variables
  const [activeTab, setActiveTab] = useState("all");
  const [showMenu, setShowMenu] = useState<Record<string, boolean>>({});
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    priority: 'all',
    status: 'all',
    customer: 'all'
  });
  
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [initiatives, setInitiatives] = useState<Array<{ id: string; title: string }>>([]);
  
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
  
  // Helper function to format idea data consistently
  const formatIdeaData = (item: any): Idea => {
    const { initiativeId, initiativeName } = extractInitiativeData(item);
    const { customerId, customerName } = extractCustomerData(item);
    
    return {
      id: item.id,
      title: item.title,
      description: item.description || '',
      priority: item.priority || 'medium',
      status: item.status || 'new',
      effort: item.effort || 'm',
      customer_name: customerName,
      customer_ids: item.customer_ids || [],
      initiative_id: initiativeId,
      initiative_name: initiativeName,
      createdAt: item.created_at || item.createdAt || 'Recently',
      votes: item.votes || 0,
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
  
  // Fetch ideas data when component mounts and initiatives load
  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        setLoading(true);
        
        // Fetch ideas even if initiatives aren't loaded yet
        const data = await apiClient.ideas.getAll();
        
        // Format the data consistently using our helper
        const formattedData = Array.isArray(data) 
          ? data.map(formatIdeaData) 
          : [];
        
        setIdeas(formattedData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching ideas:', err);
        // Set empty array instead of showing error for tenant not found
        if (err.message && err.message.includes('Tenant not found')) {
          console.log('No tenant found, showing empty ideas list');
          setIdeas([]);
          setError(null);
        } else {
          setError('Failed to load ideas. Please try again later.');
          setIdeas([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, []); // Don't depend on initiatives, fetch ideas independently
  
  // Toggle menu visibility
  const toggleMenu = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent event from bubbling up
    }
    
    setShowMenu(prev => {
      // Close all other menus
      const newState: Record<string, boolean> = {};
      Object.keys(prev).forEach(key => {
        newState[key] = key === id ? !prev[key] : false;
      });
      return newState;
    });
  };
  
  // Close all menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Don't close if clicking on a menu or dropdown-related element
      const target = e.target as HTMLElement;
      if (target.closest('.dropdown-menu') || target.closest('.dropdown-trigger')) {
        return;
      }
      setShowMenu({});
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  
  // Toggle filter menu
  const toggleFilterMenu = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent event from bubbling up
    }
    setShowFilterMenu(prev => !prev);
  };
  
  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const filterMenuElement = document.querySelector('.filter-menu-container');
      if (filterMenuElement && !filterMenuElement.contains(e.target as Node)) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  
  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      priority: 'all',
      status: 'all',
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

  // Handler for adding new idea
  const handleSaveIdea = async (ideaData: {
    title: string;
    description: string;
    priority: IdeaPriority;
    effort: IdeaEffort;
    status: IdeaStatus;
    initiative_id?: string;
    customer_ids: string[];
    source: string;
  }) => {
    try {
      setLoading(true);
      
      // Format the data for the API
      const apiIdea = {
        title: ideaData.title,
        description: ideaData.description,
        priority: ideaData.priority,
        effort: ideaData.effort,
        status: ideaData.status,
        initiative_id: ideaData.initiative_id === 'none' ? undefined : ideaData.initiative_id,
        customer_ids: ideaData.customer_ids,
        source: ideaData.source
      };
      
      console.log('Creating idea with data:', apiIdea);
      
      // Make the API call to create the idea
      const newIdea = await apiClient.ideas.create(apiIdea);
      
      if (!newIdea || !newIdea.id) {
        throw new Error('Failed to create idea - no data returned from API');
      }
      
      console.log('Successfully created idea with ID:', newIdea.id);
      
      // Find customer name for the UI display - use first customer if multiple
      const customerName = ideaData.customer_ids && ideaData.customer_ids.length > 0
        ? customers.find(c => c.id === ideaData.customer_ids[0])?.name || 'Unknown'
        : 'Unknown';
      
      // Find initiative name for the new idea if we have an initiative_id
      const initiativeName = apiIdea.initiative_id
        ? initiatives.find(i => i.id === apiIdea.initiative_id)?.title
        : undefined;
      
      // Update the local state with the new formatted idea
      setIdeas(prevIdeas => [
        ...prevIdeas,
        formatIdeaData({
          ...newIdea,
          id: newIdea.id,
          title: apiIdea.title,
          description: apiIdea.description,
          status: apiIdea.status,
          priority: apiIdea.priority,
          effort: apiIdea.effort,
          customer_ids: ideaData.customer_ids,
          customer_name: customerName,
          initiative_id: apiIdea.initiative_id,
          initiative_name: initiativeName,
          created_at: new Date().toISOString()
        })
      ]);
      
      // Optional: Refresh all ideas from the server to ensure data consistency
      setTimeout(async () => {
        try {
          const refreshedData = await apiClient.ideas.getAll();
          if (Array.isArray(refreshedData) && refreshedData.length > 0) {
            setIdeas(refreshedData.map(formatIdeaData));
          }
        } catch (refreshErr) {
          console.error('Error refreshing ideas after creation:', refreshErr);
        }
      }, 1000);
      
    } catch (err: any) {
      console.error('Error creating idea:', err);
      alert('Failed to create idea. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handler for deleting idea
  const handleDeleteIdea = async (id: string) => {
    try {
      setLoading(true);
      await apiClient.ideas.delete(id);
      setIdeas(prevIdeas => prevIdeas.filter(idea => idea.id !== id));
    } catch (err) {
      console.error('Error deleting idea:', err);
      alert('Failed to delete idea. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handler for updating an idea
  const handleUpdateIdea = async (id: string, updatedData: UpdateIdeaData) => {
    try {
      console.log('handleUpdateIdea called with:', id, updatedData);

      // Find the existing idea first to ensure we have all required data
      const existingIdea = ideas.find(i => i.id === id);
      if (!existingIdea) {
        console.error('Cannot update idea: idea not found');
        return;
      }
      
      // Normalize property names for consistency
      const customer_ids = updatedData.customer_ids;
      const initiative_id = updatedData.initiativeId;
      
      // Find customer and initiative names for UI
      const customerName = customer_ids.length > 0
        ? customers.find(c => c.id === customer_ids[0])?.name || 'Unknown'
        : existingIdea.customer_name;
        
      const initiativeName = initiative_id
        ? initiatives.find(i => i.id === initiative_id)?.title
        : existingIdea.initiative_name;

      // Update local state immediately with optimistic update
      setIdeas(prevIdeas => prevIdeas.map(idea => {
        if (idea.id === id) {
          return { 
            ...idea, 
            title: updatedData.title,
            description: updatedData.description,
            priority: updatedData.priority,
            effort: updatedData.effort,
            status: updatedData.status,
            customer_ids: customer_ids,
            initiative_id: initiative_id,
            customer_name: customerName,
            initiative_name: initiativeName
          };
        }
        return idea;
      }));
      
      // Show loading state
      setLoading(true);
      
      // Create API-compatible update object
      const apiUpdate = {
        title: updatedData.title,
        description: updatedData.description,
        priority: updatedData.priority,
        effort: updatedData.effort,
        status: updatedData.status,
        customer_ids: customer_ids,
        initiative_id: initiative_id
      };
      
      console.log('Making API call to update idea with:', apiUpdate);
      
      // Update the idea in the API
      await apiClient.ideas.update(id, apiUpdate);
      
      // Fetch the complete updated idea to ensure we have the latest data
      const refreshedIdea = await apiClient.ideas.getById(id);
      
      // Format and update the idea in state
      const formattedIdea = formatIdeaData({
        ...refreshedIdea,
        customer_ids: refreshedIdea.customer_ids || customer_ids,
        customer_name: customerName,
        initiative_id: refreshedIdea.initiative_id || initiative_id,
        initiative_name: initiativeName
      });
      
      console.log('Idea updated successfully, refreshed data:', formattedIdea);
      
      // Update the local state with the full refreshed idea
      setIdeas(prevIdeas => prevIdeas.map(idea => 
        idea.id === id ? formattedIdea : idea
      ));
      
    } catch (err) {
      console.error('Error updating idea:', err);
      alert('Failed to update the idea. Please try again.');
      
      // If API update fails, revert to original state by re-fetching
      try {
        const ideasData = await apiClient.ideas.getAll();
        const formattedData = Array.isArray(ideasData) 
          ? ideasData.map(item => formatIdeaData(item)) 
          : [];
        setIdeas(formattedData);
      } catch (refreshErr) {
        console.error('Error refreshing ideas after failed update:', refreshErr);
      }
    } finally {
      setLoading(false);
    }
  };

  // Get filtered ideas based on active tab and filters
  let filteredIdeas = ideas;
  
  // Filter by tab first (all, planned, completed)
  if (activeTab === 'planned') {
    filteredIdeas = filteredIdeas.filter(idea => 
      idea.status === 'planned' || idea.status === 'in_progress'
    );
  } else if (activeTab === 'completed') {
    filteredIdeas = filteredIdeas.filter(idea => 
      idea.status === 'completed'
    );
  }
  
  // Apply additional filters
  if (filters.priority !== 'all') {
    filteredIdeas = filteredIdeas.filter(idea => idea.priority === filters.priority);
  }
  
  if (filters.status !== 'all') {
    filteredIdeas = filteredIdeas.filter(idea => idea.status === filters.status);
  }
  
  if (filters.customer !== 'all') {
    filteredIdeas = filteredIdeas.filter(idea => 
      idea.customer_ids?.includes(filters.customer)
    );
  }
  
  // Sort ideas based on current sort state
  if (sortColumn) {
    filteredIdeas = [...filteredIdeas].sort((a, b) => {
      let aValue: any = a[sortColumn];
      let bValue: any = b[sortColumn];
      
      // Special handling for priority sorting (high > medium > low)
      if (sortColumn === 'priority') {
        const priorityValues = { high: 3, medium: 2, low: 1 };
        aValue = priorityValues[a.priority as keyof typeof priorityValues];
        bValue = priorityValues[b.priority as keyof typeof priorityValues];
      }
      
      // Convert to strings for comparison (handles undefined and null values)
      const aCompare = aValue != null ? String(aValue) : '';
      const bCompare = bValue != null ? String(bValue) : '';
      
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
  
  // Helper function to get priority badge styling
  const getPriorityBadgeClass = (priority: IdeaPriority): string => {
    switch(priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400';
    }
  };
  
  // Helper function to get status badge styling
  const getStatusBadgeClass = (status: IdeaStatus): string => {
    switch(status) {
      case 'new':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'planned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400';
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      {/* Header with breadcrumb and improved styling */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
            <Link to="/" className="hover:text-gray-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-700">Ideas</span>
          </div>
          <h1 className="text-2xl font-bold">Product Ideas</h1>
          <p className="text-gray-500 mt-1">Organize and prioritize feature requests from your customers.</p>
        </div>
        <div>
          <AddIdeaModal 
            onSave={handleSaveIdea} 
            initiatives={initiatives}
            customers={customers}
          />
        </div>
      </div>
      
      {/* Tabs for filtering ideas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Ideas</TabsTrigger>
          <TabsTrigger value="planned">
            <div className="flex items-center gap-1">
              <span>Planned</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {ideas.filter(idea => idea.status === 'planned' || idea.status === 'in_progress').length}
              </Badge>
            </div>
          </TabsTrigger>
          <TabsTrigger value="completed">
            <div className="flex items-center gap-1">
              <span>Completed</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {ideas.filter(idea => idea.status === 'completed').length}
              </Badge>
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

      {/* Ideas Table - Only show when not loading and no errors */}
      {!loading && !error && (
        <>
          {/* Filter row */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              {/* Active filters */}
              <div className="flex items-center flex-wrap gap-2">
                {filters.priority !== 'all' && (
                  <Badge variant="outline" className="pl-2 flex items-center gap-1 text-xs">
                    Priority: {filters.priority}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleFilterChange('priority', 'all')}
                      className="h-5 w-5 p-0 ml-1 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                
                {filters.status !== 'all' && (
                  <Badge variant="outline" className="pl-2 flex items-center gap-1 text-xs">
                    Status: {filters.status.replace('_', ' ')}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleFilterChange('status', 'all')}
                      className="h-5 w-5 p-0 ml-1 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                
                {filters.customer !== 'all' && (
                  <Badge variant="outline" className="pl-2 flex items-center gap-1 text-xs">
                    Customer: {customers.find(c => c.id === filters.customer)?.name || 'Unknown'}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleFilterChange('customer', 'all')}
                      className="h-5 w-5 p-0 ml-1 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                
                {(filters.priority !== 'all' || filters.status !== 'all' || filters.customer !== 'all') && (
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
              <div className="relative filter-menu-container">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => toggleFilterMenu(e)}
                  className="h-7 gap-1 text-xs"
                >
                  <Filter className="h-3 w-3" />
                  <span>Filter</span>
                </Button>
                
                {showFilterMenu && (
                  <div className="absolute left-0 mt-1 w-40 bg-white border border-gray-200 rounded shadow-lg z-10 dark:bg-card dark:border-gray-700">
                    <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                      <h4 className="text-xs font-medium mb-1">Priority</h4>
                      <div className="space-y-1">
                        {['all', 'high', 'medium', 'low'].map(priority => (
                          <label key={priority} className="flex items-center space-x-2 text-xs cursor-pointer">
                            <input 
                              type="radio"
                              checked={filters.priority === priority}
                              onChange={() => handleFilterChange('priority', priority)}
                              className="rounded-full"
                            />
                            <span>{priority === 'all' ? 'All Priorities' : priority}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                      <h4 className="text-xs font-medium mb-1">Status</h4>
                      <div className="space-y-1">
                        {['all', 'new', 'planned', 'in_progress', 'completed', 'rejected'].map(status => (
                          <label key={status} className="flex items-center space-x-2 text-xs cursor-pointer">
                            <input 
                              type="radio"
                              checked={filters.status === status}
                              onChange={() => handleFilterChange('status', status)}
                              className="rounded-full"
                            />
                            <span>{status === 'all' ? 'All Statuses' : status.replace('_', ' ')}</span>
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
              Showing <span className="font-medium text-gray-900 dark:text-gray-200">{filteredIdeas.length}</span> of <span className="font-medium text-gray-900 dark:text-gray-200">{ideas.length}</span> ideas
            </div>
          </div>
          
          {/* Ideas Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="w-[300px] cursor-pointer"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center">
                      Idea
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
                    className="w-[120px] cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {getSortIcon('status')}
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
                    className="hidden sm:table-cell w-[150px] cursor-pointer"
                    onClick={() => handleSort('initiative_name')}
                  >
                    <div className="flex items-center">
                      Initiative
                      {getSortIcon('initiative_name')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIdeas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No ideas found matching the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIdeas.map((idea) => (
                    <TableRow 
                      key={idea.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={(e) => {
                        // If clicking on action buttons, don't trigger row click
                        if (e.target instanceof Element && 
                            (e.target.closest('button') || 
                            e.target.closest('svg'))) {
                          return;
                        }
                        // Find and click the edit button
                        const editBtn = document.getElementById(`edit-idea-${idea.id}`);
                        if (editBtn) editBtn.click();
                      }}
                    >
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{idea.title}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(idea.priority)}`}>
                          {idea.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(idea.status)}`}>
                          {idea.status.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {idea.customer_name || 'Unknown'}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {idea.initiative_name || 'None'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Empty state - will be shown conditionally when there's no ideas */}
      {!loading && !error && ideas.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg mt-6 dark:border-gray-700">
          <div className="bg-gray-100 p-3 rounded-full mb-4 dark:bg-gray-800">
            <Lightbulb className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-1 dark:text-gray-200">No ideas yet</h3>
          <p className="text-gray-500 text-center mb-4 dark:text-gray-400">Start capturing feature requests and ideas from your customers using the Add Idea button above.</p>
        </div>
      )}
      
      {/* Hidden edit modal triggers that will be activated programmatically */}
      <div className="hidden">
        {ideas.map(idea => (
          <EditIdeaModal
            key={`hidden-edit-${idea.id}`}
            idea={{
              id: idea.id,
              title: idea.title,
              description: idea.description,
              priority: idea.priority,
              effort: idea.effort || 'm',
              status: idea.status === 'in_progress' ? 'planned' : idea.status,
              customerId: idea.customer_ids?.[0], // Get first customer ID if available
              customer: idea.customer_name,
              initiativeId: idea.initiative_id,
              initiative: idea.initiative_name,
              createdAt: idea.createdAt
            }}
            initiatives={initiatives}
            customers={customers}
            onUpdate={(id, updatedData: UpdateIdeaData) => {
              handleUpdateIdea(id, updatedData);
            }}
            onDelete={handleDeleteIdea}
            triggerButtonId={`edit-idea-${idea.id}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Ideas;