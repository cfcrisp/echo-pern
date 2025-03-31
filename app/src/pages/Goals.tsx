import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronRight, Target, Pencil, Plus, Trash2, 
  Calendar, List, MoreHorizontal, BarChart 
} from 'lucide-react';
import { AddGoalModal, EditGoalModal } from "@/components/shared";
import apiClient from '@/services/apiClient';
import { useAuth } from '@/context/AuthContext';

type Goal = {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'planned' | 'completed';
  target_date?: string;
  // Additional fields to simulate relationships
  initiatives_count?: number;
  created_at?: string;
};

const getStatusColor = (status: Goal['status']) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'planned':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'completed':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400';
  }
};

// Format date to display in a more readable format
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const isThisYear = date.getFullYear() === now.getFullYear();
  
  // Options for date formatting
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  };
  
  if (!isThisYear) {
    options.year = 'numeric';
  }
  
  return date.toLocaleDateString('en-US', options);
};

// Calculate time remaining until target date
const getTimeRemaining = (dateString: string) => {
  const targetDate = new Date(dateString);
  const now = new Date();
  
  // If the target date is in the past, return null
  if (targetDate < now) {
    return null;
  }
  
  const diffTime = Math.abs(targetDate.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return '1 day remaining';
  } else if (diffDays < 30) {
    return `${diffDays} days remaining`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} remaining`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} ${years === 1 ? 'year' : 'years'} remaining`;
  }
};

// Calculate progress percentage based on creation date and target date
const calculateProgress = (createdAt?: string, targetDate?: string): number => {
  if (!createdAt || !targetDate) return 0;
  
  const createDate = new Date(createdAt);
  const target = new Date(targetDate);
  const today = new Date();
  
  // If target date is in the past, return 100%
  if (today > target) return 100;
  
  // Calculate total duration and elapsed duration
  const totalDuration = target.getTime() - createDate.getTime();
  const elapsedDuration = today.getTime() - createDate.getTime();
  
  // Calculate percentage (capped at 100%)
  const percentage = Math.min((elapsedDuration / totalDuration) * 100, 100);
  
  // Return rounded percentage
  return Math.round(percentage);
};

const GoalCard: React.FC<{ 
  goal: Goal; 
  onUpdate: (id: string, updatedGoal: {
    title: string;
    description: string;
    status: Goal['status'];
    target_date?: string;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  linkedInitiatives?: Array<{ id: string; title: string; status: string }>;
}> = ({ goal, onUpdate, onDelete, linkedInitiatives = [] }) => {
  const statusColor = getStatusColor(goal.status);
  const [showInitiatives, setShowInitiatives] = useState(false);
  const navigate = useNavigate();
  
  // Ensure initiatives_count is defined
  const initiatives_count = goal.initiatives_count ?? linkedInitiatives.length ?? 0;
  
  // Format the target date and get time remaining
  const formattedDate = goal.target_date ? formatDate(goal.target_date) : '';
  const timeRemaining = goal.target_date ? getTimeRemaining(goal.target_date) : null;
  
  // Calculate progress percentage
  const progressPercent = calculateProgress(goal.created_at, goal.target_date);
  
  // Handle navigation to initiative detail page
  const goToInitiative = (initiativeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/initiatives/${initiativeId}`);
  };
  
  // Toggle initiatives visibility
  const toggleInitiatives = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowInitiatives(!showInitiatives);
  };
  
  return (
    <Card 
      className="group transition-all duration-200 hover:shadow-md border border-slate-200 dark:border-gray-700 overflow-hidden dark:bg-card"
      onClick={(e) => {
        // If clicking on action buttons, don't trigger row click
        if (e.target instanceof Element && 
            (e.target.closest('button') || 
            e.target.closest('svg') ||
            e.target.closest('a'))) {
          return;
        }
        // Find and click the edit button to open the modal
        const editBtn = document.getElementById(`edit-goal-${goal.id}`);
        if (editBtn) editBtn.click();
      }}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-grow">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-medium mr-3 dark:text-gray-100">{goal.title}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-gray-300 mb-3 line-clamp-2">
              {goal.description}
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3 mb-3">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
            <div 
              className="bg-purple-500 dark:bg-purple-400 h-1.5 rounded-full transition-all" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 mt-2">
          {/* Target Date with Prominence */}
          {goal.target_date && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-md px-2 py-1 flex items-center text-xs">
              <Calendar className="h-3 w-3 mr-1 text-purple-600 dark:text-purple-400" />
              <span className="font-medium text-purple-800 dark:text-purple-300">{formattedDate}</span>
              {timeRemaining && (
                <span className="text-purple-600 dark:text-purple-400 ml-1"> · {timeRemaining}</span>
              )}
            </div>
          )}
          
          {/* Linked Initiatives Button */}
          {initiatives_count > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-xs text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800"
              onClick={toggleInitiatives}
            >
              <List className="h-3 w-3 mr-1" />
              <span>{initiatives_count} initiatives</span>
              <ChevronRight className={`h-3 w-3 ml-1 transition-transform ${showInitiatives ? 'rotate-90' : ''}`} />
            </Button>
          )}
        </div>
        
        {/* Initiative Indicators - Only shown when expanded */}
        {showInitiatives && linkedInitiatives && linkedInitiatives.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-gray-700">
            <div className="mb-1 text-xs font-medium text-slate-500 dark:text-gray-400 flex items-center">
              <Target className="h-3.5 w-3.5 mr-1.5 text-primary" />
              <span>Linked Initiatives</span>
            </div>
            <div className="space-y-2 mt-2">
              {linkedInitiatives.map(initiative => {
                // Determine status colors for initiatives
                let statusColor;
                switch(initiative.status) {
                  case 'active':
                    statusColor = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
                    break;
                  case 'planned':
                    statusColor = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
                    break;
                  case 'completed':
                    statusColor = 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400';
                    break;
                  default:
                    statusColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400';
                }
                
                return (
                  <div 
                    key={initiative.id} 
                    className="bg-white dark:bg-gray-800/40 rounded-md border border-slate-200 dark:border-gray-700 p-2 flex items-center justify-between hover:border-primary/20 hover:bg-primary/5 transition-colors cursor-pointer"
                    onClick={(e) => goToInitiative(initiative.id, e)}
                  >
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                      <span className="text-sm font-medium dark:text-gray-200">{initiative.title}</span>
                      <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${statusColor}`}>
                        {initiative.status}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 rounded-full"
                      onClick={(e) => goToInitiative(initiative.id, e)}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Debug logging
console.log('apiClient:', apiClient);
console.log('goals API:', apiClient.goals);

const Goals: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [initiatives, setInitiatives] = useState<Array<{
    id: string;
    title: string;
    status: string;
    goal_id?: string;
  }>>([]);
  // Track goals that are currently being deleted
  const [deletingGoals, setDeletingGoals] = useState<Set<string>>(new Set());
  // Track goals that have been deleted to prevent double deletion
  const [deletedGoals, setDeletedGoals] = useState<Set<string>>(new Set());

  // Fetch goals data from API when component mounts
  useEffect(() => {
    console.log('Goals component mounted, fetching data');
    
    const fetchGoals = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Calling apiClient.goals.getAll()');
        const goalsData = await apiClient.goals.getAll();
        console.log('Goals data received:', goalsData);
        
        // Also fetch initiatives to link with goals
        const initiativesData = await apiClient.initiatives.getAll();
        console.log('Initiatives data received:', initiativesData);
        
        // Handle error responses
        if (goalsData && goalsData.error) {
          console.error('Error in goals response:', goalsData.error);
          setError(goalsData.error);
          setGoals([]);
        } else {
          setGoals(goalsData || []);
        }
        
        if (initiativesData && !('error' in initiativesData)) {
          setInitiatives(initiativesData || []);
        }
      } catch (err) {
        console.error('Error fetching goals:', err);
        setError('Failed to load goals. Please try again later.');
        setGoals([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGoals();
  }, []);

  const handleSaveGoal = async (goalData: {
    title: string;
    description: string;
    status: 'active' | 'planned' | 'completed';
    target_date?: string;
    linked_initiatives?: string[];
  }) => {
    try {
      setLoading(true);
      
      // Extract linked initiatives if they exist
      const { linked_initiatives, ...goalDataForApi } = goalData;
      
      // Create the new goal via API - only send fields that exist in the database
      const newGoal = await apiClient.goals.create(goalDataForApi);
      
      // Validate that we got a valid goal back before updating state
      if (!newGoal || !newGoal.id) {
        throw new Error('Failed to create goal: Invalid response from server');
      }
      
      // Update initiatives to link them to the new goal
      if (linked_initiatives && linked_initiatives.length > 0 && newGoal.id) {
        console.log(`Linking ${linked_initiatives.length} initiatives to new goal ${newGoal.id}`);
        
        try {
          // Update each initiative to point to this goal
          const updatePromises = linked_initiatives.map(initiativeId => 
            apiClient.initiatives.update(initiativeId, { goal_id: newGoal.id })
          );
          
          await Promise.all(updatePromises);
          
          // Update the local initiatives state
          setInitiatives(prevInitiatives => 
            prevInitiatives.map(initiative => 
              linked_initiatives.includes(initiative.id) 
                ? { ...initiative, goal_id: newGoal.id }
                : initiative
            )
          );
          
          // Add initiatives count to the new goal for UI purposes
          newGoal.initiatives_count = linked_initiatives.length;
        } catch (linkError) {
          console.error('Error linking initiatives to goal:', linkError);
          // Don't fail the whole operation if linking fails
        }
      }
      
      // Update the local state with the new goal
      setGoals(prevGoals => [...prevGoals, newGoal]);
      
      // Close the modal
      setShowAddModal(false);
    } catch (err) {
      console.error('Error creating goal:', err);
      // Show error message to user
      alert('Failed to create goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGoal = async (id: string, goalData: {
    title: string;
    description: string;
    status: 'active' | 'planned' | 'completed';
    target_date?: string;
    linked_initiatives?: string[];
  }) => {
    try {
      setLoading(true);
      
      // Extract linked initiatives if they exist
      const { linked_initiatives, ...goalDataForApi } = goalData;
      
      // Update the goal via API - only send fields that exist in the database
      await apiClient.goals.update(id, goalDataForApi);
      
      // Handle updating initiative relationships if provided
      if (linked_initiatives) {
        // Find currently linked initiatives
        const currentlyLinked = initiatives.filter(initiative => initiative.goal_id === id)
                                          .map(initiative => initiative.id);
        
        // Find initiatives to link (not already linked)
        const toLink = linked_initiatives.filter(initiativeId => 
                                          !currentlyLinked.includes(initiativeId));
        
        // Find initiatives to unlink (no longer in the list)
        const toUnlink = currentlyLinked.filter(initiativeId => 
                                            !linked_initiatives.includes(initiativeId));
        
        // Update all initiatives that need changes
        const updatePromises = [
          ...toLink.map(initiativeId => 
            apiClient.initiatives.update(initiativeId, { goal_id: id })),
          ...toUnlink.map(initiativeId => 
            apiClient.initiatives.update(initiativeId, { goal_id: undefined }))
        ];
        
        if (updatePromises.length > 0) {
          await Promise.all(updatePromises);
          
          // Update local initiatives state
          setInitiatives(prevInitiatives => 
            prevInitiatives.map(initiative => {
              if (toLink.includes(initiative.id)) {
                return { ...initiative, goal_id: id };
              } else if (toUnlink.includes(initiative.id)) {
                return { ...initiative, goal_id: undefined };
              }
              return initiative;
            })
          );
        }
      }
      
      // Update the local state
      setGoals(prevGoals => 
        prevGoals.map(goal => 
          goal.id === id ? { 
            ...goal, 
            ...goalDataForApi,
            initiatives_count: linked_initiatives?.length || 0
          } : goal
        )
      );
    } catch (err) {
      console.error('Error updating goal:', err);
      alert('Failed to update goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      // Check if this goal is already being deleted or has been deleted
      if (deletingGoals.has(id)) {
        console.log(`Delete operation already in progress for goal: ${id}`);
        return;
      }
      
      if (deletedGoals.has(id)) {
        console.log(`Goal has already been deleted: ${id}`);
        return;
      }
      
      // Mark as being deleted to prevent multiple deletion attempts
      setDeletingGoals(prev => new Set([...prev, id]));
      setLoading(true);
      
      // First find the goal to check if it exists
      const goalToDelete = goals.find(g => g.id === id);
      if (!goalToDelete) {
        console.error(`Goal with ID ${id} not found in local state`);
        // If not found in local state, it might already be deleted on server
        setDeletedGoals(prev => new Set([...prev, id]));
        setLoading(false);
        return;
      }
      
      console.log(`Attempting to delete goal: ${id}`);
      
      // Delete the goal via API
      const result = await apiClient.goals.delete(id);
      
      if (result && result.success) {
        // Mark as deleted
        setDeletedGoals(prev => new Set([...prev, id]));
        
        // Update the local state
        setGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
        
        // Optionally show a subtle success message (toast would be ideal)
        console.log(`Goal "${goalToDelete.title}" successfully deleted`);
      } else {
        throw new Error('Failed to delete goal: Unexpected response from server');
      }
    } catch (err) {
      console.error('Error deleting goal:', err);
      alert('Failed to delete goal. Please try again.');
    } finally {
      // Remove from deleting set
      setDeletingGoals(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(id);
        return newSet;
      });
      setLoading(false);
    }
  };

  // Add safety helper functions
  const safeGoalTitle = (goal: any): string => {
    if (!goal) return '';
    if (typeof goal.title !== 'string') return '';
    return goal.title;
  };

  const safeGoalDescription = (goal: any): string => {
    if (!goal) return '';
    if (typeof goal.description !== 'string') return '';
    return goal.description;
  };

  // Filter goals based on the search term
  const filteredGoals = goals.filter(goal => {
    if (!goal) return false;
    
    const titleMatch = safeGoalTitle(goal).toLowerCase().includes(searchTerm.toLowerCase());
    const descriptionMatch = safeGoalDescription(goal).toLowerCase().includes(searchTerm.toLowerCase());
    
    return titleMatch || descriptionMatch;
  });

  // Filter goals based on the active tab
  const displayedGoals = activeTab === 'all' 
    ? filteredGoals 
    : filteredGoals.filter(goal => goal.status === activeTab);

  // Get initiatives linked to a specific goal
  const getLinkedInitiatives = (goalId: string) => {
    // Filter initiatives to get only those linked to this goal
    return initiatives.filter(initiative => initiative.goal_id === goalId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground">
            Set, track, and achieve strategic initiatives
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Goal
        </Button>
      </div>

      {/* Add Goal Modal */}
      <AddGoalModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSave={handleSaveGoal}
        initiatives={initiatives}
      />

      {/* Search and Filtering */}
      <div className="flex justify-between items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            className="w-full px-4 py-2 pl-10 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-800 dark:border-gray-700"
            placeholder="Search goals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100 dark:bg-slate-800/50">
          <TabsTrigger value="all">All Goals</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="planned">Planned</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-red-500 border border-red-300 bg-red-50 rounded-md dark:bg-red-900/20 dark:border-red-800">
              {error}
            </div>
          ) : displayedGoals.length === 0 ? (
            <div className="text-center py-10">
              <div className="mb-3">
                <Target className="h-12 w-12 mx-auto text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No goals found</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm 
                  ? "No goals match your search criteria." 
                  : "Get started by creating your first goal using the Add Goal button above."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {displayedGoals.map((goal) => (
                <GoalCard 
                  key={goal.id} 
                  goal={goal} 
                  onUpdate={handleUpdateGoal}
                  onDelete={handleDeleteGoal}
                  linkedInitiatives={getLinkedInitiatives(goal.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active" className="mt-4">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : displayedGoals.length === 0 ? (
            <div className="text-center py-10">
              <div className="mb-3">
                <Target className="h-12 w-12 mx-auto text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No active goals</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm 
                  ? "No active goals match your search criteria." 
                  : "Get started by creating an active goal using the Add Goal button above."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {displayedGoals.map((goal) => (
                <GoalCard 
                  key={goal.id} 
                  goal={goal} 
                  onUpdate={handleUpdateGoal}
                  onDelete={handleDeleteGoal}
                  linkedInitiatives={getLinkedInitiatives(goal.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="planned" className="mt-4">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : displayedGoals.length === 0 ? (
            <div className="text-center py-10">
              <div className="mb-3">
                <Target className="h-12 w-12 mx-auto text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No planned goals</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm 
                  ? "No planned goals match your search criteria." 
                  : "Get started by creating a planned goal using the Add Goal button above."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {displayedGoals.map((goal) => (
                <GoalCard 
                  key={goal.id} 
                  goal={goal} 
                  onUpdate={handleUpdateGoal}
                  onDelete={handleDeleteGoal}
                  linkedInitiatives={getLinkedInitiatives(goal.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : displayedGoals.length === 0 ? (
            <div className="text-center py-10">
              <div className="mb-3">
                <Target className="h-12 w-12 mx-auto text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No completed goals</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm 
                  ? "No completed goals match your search criteria." 
                  : "You haven't completed any goals yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {displayedGoals.map((goal) => (
                <GoalCard 
                  key={goal.id} 
                  goal={goal} 
                  onUpdate={handleUpdateGoal}
                  onDelete={handleDeleteGoal}
                  linkedInitiatives={getLinkedInitiatives(goal.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Hidden edit modal triggers and buttons */}
      <div className="hidden">
        {/* Add hidden buttons */}
        {goals.map(goal => (
          <button 
            key={`trigger-${goal.id}`} 
            id={`edit-goal-${goal.id}`}
            className="hidden"
          />
        ))}
        
        {/* EditGoalModal components */}
        {goals.map(goal => (
          <EditGoalModal 
            key={`hidden-edit-${goal.id}`}
            goal={goal}
            onUpdate={(updatedGoal) => handleUpdateGoal(goal.id, updatedGoal)}
            onDelete={handleDeleteGoal}
            triggerButtonId={`edit-goal-${goal.id}`}
            initiatives={getLinkedInitiatives(goal.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Goals;