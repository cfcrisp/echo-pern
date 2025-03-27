import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight, Target, List, Plus, Clock, CalendarClock, ArrowUpFromLine, BarChart3, ArrowLeft } from 'lucide-react';
import { AddInitiativeModal, EditInitiativeModal } from "@/components/shared";
import apiClient from '@/services/apiClient';
import { useAuth } from '@/context/AuthContext';

// Debug logging
console.log('apiClient:', apiClient);
console.log('initiatives API:', apiClient.initiatives);

type Initiative = {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'planned' | 'completed';
  priority: number;
  goal_id?: string;
  goal?: {
    id: string;
    title: string;
  };
};

const Initiatives = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [goals, setGoals] = useState<Array<{ id: string; title: string }>>([]);
  
  // Get initiative ID from URL if available
  const { id: initiativeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Track the current initiative if viewing a single one
  const [currentInitiative, setCurrentInitiative] = useState<Initiative | null>(null);
  const isSingleView = !!initiativeId;

  // Fetch initiatives data from the API when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // If we have an initiative ID in the URL, fetch just that initiative
        if (initiativeId) {
          console.log('Fetching single initiative:', initiativeId);
          
          try {
            const initiativeData = await apiClient.initiatives.getById(initiativeId);
            
            // Check if we got valid data
            if (initiativeData && !('error' in initiativeData)) {
              setCurrentInitiative(initiativeData);
              setInitiatives([initiativeData]); // Still set this for consistency
            } else {
              // Handle error
              setError('Initiative not found or could not be loaded');
              setCurrentInitiative(null);
            }
          } catch (err) {
            console.error('Error fetching initiative:', err);
            setError('Failed to load initiative details');
            setCurrentInitiative(null);
          }
          
          // Fetch goals in parallel for dropdown
          const goalsData = await apiClient.goals.getAll();
          if (goalsData && !('error' in goalsData)) {
            setGoals(goalsData.map((goal: { id: string; title: string }) => ({
              id: goal.id,
              title: goal.title
            })));
          }
        } else {
          // Fetch all initiatives and goals (original behavior)
          console.log('Calling apiClient.initiatives.getAll()');
          
          // Fetch both initiatives and goals in parallel
          const [initiativesData, goalsData] = await Promise.all([
            apiClient.initiatives.getAll(),
            apiClient.goals.getAll()
          ]);
          
          console.log('Initiatives data received:', initiativesData);
          console.log('Goals data received:', goalsData);
          
          // Check for error responses
          if (initiativesData && 'error' in initiativesData) {
            console.error('Error in initiatives response:', initiativesData.error);
            setError(`Error: ${initiativesData.error}`);
            setInitiatives([]);
          } else {
            setInitiatives(initiativesData || []);
          }
          
          // Format goals data for the dropdown
          if (goalsData && !('error' in goalsData)) {
            setGoals(goalsData.map((goal: { id: string; title: string }) => ({
              id: goal.id,
              title: goal.title
            })));
          } else {
            setGoals([]);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        // Set empty array to prevent mapping over undefined
        setInitiatives([]);
        setGoals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [initiativeId]); // Re-run when initiativeId changes

  const handleSaveInitiative = async (initiativeData: {
    goal_id?: string;
    title: string;
    description: string;
    status: Initiative['status'];
    priority: number;
  }) => {
    try {
      setLoading(true);
      
      // Create initiative via API
      const newInitiative = await apiClient.initiatives.create(initiativeData);
      
      // Update the local state if successful
      if (newInitiative && newInitiative.id) {
        // If there's a goal, add the goal info
        let goalInfo = undefined;
        if (initiativeData.goal_id) {
          const matchingGoal = goals.find(g => g.id === initiativeData.goal_id);
          if (matchingGoal) {
            goalInfo = {
              id: matchingGoal.id,
              title: matchingGoal.title
            };
          }
        }
        
        setInitiatives(prev => [...prev, {
          ...newInitiative,
          goal: goalInfo
        }]);
      }
    } catch (err) {
      console.error('Error creating initiative:', err);
      // Show error message to user
      alert('Failed to create initiative. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle updating an initiative
  const handleUpdateInitiative = async (id: string, updatedData: {
    title: string;
    description: string;
    status: Initiative['status'];
    priority: number;
    goalId?: string;
  }) => {
    try {
      setLoading(true);
      
      // Map the data to match API expectations
      const apiData = {
        title: updatedData.title,
        description: updatedData.description,
        status: updatedData.status,
        priority: updatedData.priority,
        goal_id: updatedData.goalId
      };
      
      // Update via API
      await apiClient.initiatives.update(id, apiData);
      
      // Update the local state
      setInitiatives(prev => prev.map(initiative => {
        if (initiative.id === id) {
          // Find the matching goal if there is one
          let goalInfo = undefined;
          if (updatedData.goalId) {
            const matchingGoal = goals.find(g => g.id === updatedData.goalId);
            if (matchingGoal) {
              goalInfo = {
                id: matchingGoal.id,
                title: matchingGoal.title
              };
            }
          }
          
          return {
            ...initiative,
            title: updatedData.title,
            description: updatedData.description,
            status: updatedData.status,
            priority: updatedData.priority,
            goal_id: updatedData.goalId,
            goal: goalInfo
          };
        }
        return initiative;
      }));
      
      // If we're in single view, update the current initiative
      if (currentInitiative && currentInitiative.id === id) {
        setCurrentInitiative(prev => {
          if (!prev) return null;
          
          let goalInfo = prev.goal;
          if (updatedData.goalId !== prev.goal_id) {
            if (updatedData.goalId) {
              const matchingGoal = goals.find(g => g.id === updatedData.goalId);
              if (matchingGoal) {
                goalInfo = {
                  id: matchingGoal.id,
                  title: matchingGoal.title
                };
              }
            } else {
              goalInfo = undefined;
            }
          }
          
          return {
            ...prev,
            title: updatedData.title,
            description: updatedData.description,
            status: updatedData.status,
            priority: updatedData.priority,
            goal_id: updatedData.goalId,
            goal: goalInfo
          };
        });
      }
    } catch (err) {
      console.error('Error updating initiative:', err);
      alert('Failed to update initiative. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter initiatives based on search term
  const filteredInitiatives = initiatives.filter(initiative => 
    initiative.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    initiative.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter initiatives based on the active tab
  const displayedInitiatives = activeTab === 'all' 
    ? filteredInitiatives 
    : filteredInitiatives.filter(initiative => initiative.status === activeTab);

  const priorityLabels = ['Low', 'Medium', 'High', 'Critical'];
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 2: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 3: return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 4: return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: Initiative['status']) => {
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

  // Render detailed view of a single initiative
  const renderInitiativeDetail = () => {
    if (!currentInitiative) {
      return (
        <div className="p-4 text-red-500 border border-red-300 bg-red-50 rounded-md dark:bg-red-900/20 dark:border-red-800">
          Initiative not found
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="mb-4"
          onClick={() => navigate('/initiatives')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Initiatives
        </Button>
        
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold">{currentInitiative.title}</h2>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(currentInitiative.status)}`}>
              {currentInitiative.status.charAt(0).toUpperCase() + currentInitiative.status.slice(1)}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(currentInitiative.priority)}`}>
              {priorityLabels[currentInitiative.priority - 1] || 'Unknown'} Priority
            </span>
          </div>
          
          {currentInitiative.goal && (
            <div className="flex items-center text-sm text-primary mb-4 bg-primary/5 p-3 rounded-md border border-primary/10">
              <Target className="h-5 w-5 mr-2" />
              <div>
                <span className="font-medium">Linked Goal:</span> {currentInitiative.goal.title}
                <Button 
                  variant="link" 
                  className="h-6 pl-1 text-primary"
                  onClick={() => navigate(`/goals?highlight=${currentInitiative.goal_id}`)}
                >
                  View Goal
                </Button>
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {currentInitiative.description || "No description provided."}
            </p>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <Button variant="outline">
                <Clock className="h-4 w-4 mr-2" /> Track Progress
              </Button>
              <Button variant="outline">
                <List className="h-4 w-4 mr-2" /> Add Tasks
              </Button>
              <EditInitiativeModal 
                initiative={{
                  id: currentInitiative.id,
                  title: currentInitiative.title,
                  description: currentInitiative.description,
                  status: currentInitiative.status,
                  priority: currentInitiative.priority,
                  goalId: currentInitiative.goal_id
                }}
                goals={goals}
                onUpdate={handleUpdateInitiative}
              />
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header - conditionally show different UI based on single vs. list view */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isSingleView ? 'Initiative Details' : 'Initiatives'}
          </h1>
          <p className="text-muted-foreground">
            {isSingleView 
              ? 'View and manage initiative details' 
              : 'Track and manage your product initiatives'}
          </p>
        </div>
        {!isSingleView && (
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Initiative
          </Button>
        )}
      </div>

      {/* Add Initiative Modal */}
      <AddInitiativeModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSave={handleSaveInitiative}
        goals={goals}
      />

      {/* Conditional rendering based on view type */}
      {isSingleView ? (
        // Single initiative detailed view
        renderInitiativeDetail()
      ) : (
        // List view with tabs and filtering
        <>
          {/* Search and Filtering */}
          <div className="flex justify-between items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                className="w-full px-4 py-2 pl-10 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-800 dark:border-gray-700"
                placeholder="Search initiatives..."
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
              <TabsTrigger value="all">All Initiatives</TabsTrigger>
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
              ) : displayedInitiatives.length === 0 ? (
                <div className="text-center py-10">
                  <div className="mb-3">
                    <List className="h-12 w-12 mx-auto text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No initiatives found</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {searchTerm 
                      ? "No initiatives match your search criteria." 
                      : "Get started by creating your first initiative using the Add Initiative button above."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedInitiatives.map((initiative) => (
                    <Card key={initiative.id} 
                      className="p-5 hover:shadow-md transition-shadow cursor-pointer" 
                      onClick={() => navigate(`/initiatives/${initiative.id}`)}
                    >
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{initiative.title}</h3>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(initiative.status)}`}>
                              {initiative.status.charAt(0).toUpperCase() + initiative.status.slice(1)}
                            </span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(initiative.priority)}`}>
                              {priorityLabels[initiative.priority - 1] || 'Unknown'} Priority
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{initiative.description}</p>
                          
                          {initiative.goal && (
                            <div className="flex items-center text-sm text-primary mb-2">
                              <Target className="h-4 w-4 mr-1.5" />
                              <span>Goal: {initiative.goal.title}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/initiatives/${initiative.id}`);
                            }}
                          >
                            <BarChart3 className="h-3.5 w-3.5 mr-1.5" /> Details
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Other tab contents - we can condense these to reduce repetition */}
            {['active', 'planned', 'completed'].map((status) => (
              <TabsContent key={status} value={status} className="mt-4">
                {loading ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : displayedInitiatives.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="mb-3">
                      <List className="h-12 w-12 mx-auto text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No {status} initiatives</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {searchTerm 
                        ? `No ${status} initiatives match your search criteria.` 
                        : `Get started by creating a ${status} initiative using the Add Initiative button above.`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayedInitiatives.map((initiative) => (
                      <Card key={initiative.id} 
                        className="p-5 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/initiatives/${initiative.id}`)}
                      >
                        <div className="flex justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">{initiative.title}</h3>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(initiative.status)}`}>
                                {initiative.status.charAt(0).toUpperCase() + initiative.status.slice(1)}
                              </span>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(initiative.priority)}`}>
                                {priorityLabels[initiative.priority - 1] || 'Unknown'} Priority
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{initiative.description}</p>
                            
                            {initiative.goal && (
                              <div className="flex items-center text-sm text-primary mb-2">
                                <Target className="h-4 w-4 mr-1.5" />
                                <span>Goal: {initiative.goal.title}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/initiatives/${initiative.id}`);
                              }}
                            >
                              <BarChart3 className="h-3.5 w-3.5 mr-1.5" /> Details
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Initiatives;
