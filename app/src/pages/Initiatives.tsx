import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight, Target, List, Plus, Clock, CalendarClock, ArrowUpFromLine, BarChart3, ArrowLeft, Lightbulb, MessageSquare, MoreHorizontal, Trash2, ChevronDown } from 'lucide-react';
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
  ideas_count?: number;
  feedback_count?: number;
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
  const [expandedInitiatives, setExpandedInitiatives] = useState<Record<string, boolean>>({});
  const [showMenu, setShowMenu] = useState<Record<string, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, Record<string, boolean>>>({});
  
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
            
            // Fetch goals in parallel for dropdown
            const goalsData = await apiClient.goals.getAll();
            const formattedGoals = (goalsData && !('error' in goalsData)) 
              ? goalsData.map((goal: { id: string; title: string }) => ({
                id: goal.id,
                title: goal.title
              }))
              : [];
            
            setGoals(formattedGoals);
            
            // Check if we got valid data
            if (initiativeData && !('error' in initiativeData)) {
              // Enrich initiative with goal data if it has a goal_id
              let enrichedInitiative = initiativeData;
              if (initiativeData.goal_id) {
                const matchingGoal = formattedGoals.find((g: {id: string; title: string}) => g.id === initiativeData.goal_id);
                if (matchingGoal) {
                  enrichedInitiative = {
                    ...initiativeData,
                    goal: {
                      id: matchingGoal.id,
                      title: matchingGoal.title
                    }
                  };
                }
              }
              
              setCurrentInitiative(enrichedInitiative);
              setInitiatives([enrichedInitiative]); // Still set this for consistency
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
            // Format goals data for the dropdown
            if (goalsData && !('error' in goalsData)) {
              const formattedGoals = goalsData.map((goal: { id: string; title: string }) => ({
                id: goal.id,
                title: goal.title
              }));
              setGoals(formattedGoals);
              
              // Enrich initiatives with goal data
              const enrichedInitiatives = (initiativesData || []).map((initiative: Initiative) => {
                if (initiative.goal_id) {
                  const matchingGoal = formattedGoals.find((g: {id: string; title: string}) => g.id === initiative.goal_id);
                  if (matchingGoal) {
                    return {
                      ...initiative,
                      goal: {
                        id: matchingGoal.id,
                        title: matchingGoal.title
                      }
                    };
                  }
                }
                return initiative;
              });
              
              setInitiatives(enrichedInitiatives);
            } else {
              setGoals([]);
              setInitiatives(initiativesData || []);
            }
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
      const updatedInitiative = await apiClient.initiatives.update(id, apiData);
      
      // Fetch the updated initiative with all its relationships to ensure accurate data
      const refreshedInitiative = await apiClient.initiatives.getById(id);
      
      // Find the matching goal if there is one
      let goalInfo = undefined;
      if (refreshedInitiative.goal_id) {
        const matchingGoal = goals.find(g => g.id === refreshedInitiative.goal_id);
        if (matchingGoal) {
          goalInfo = {
            id: matchingGoal.id,
            title: matchingGoal.title
          };
        }
      }
      
      // Create a complete initiative object with all data
      const completeInitiative = {
        ...refreshedInitiative,
        goal: goalInfo
      };
      
      // Update the local state
      setInitiatives(prev => prev.map(initiative => 
        initiative.id === id ? completeInitiative : initiative
      ));
      
      // If we're in single view, update the current initiative
      if (currentInitiative && currentInitiative.id === id) {
        setCurrentInitiative(completeInitiative);
      }
    } catch (err) {
      console.error('Error updating initiative:', err);
      alert('Failed to update initiative. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle expanded state for an initiative
  const toggleExpanded = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedInitiatives(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Toggle menu visibility
  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(prev => {
      // Close all other menus
      const newState: Record<string, boolean> = {};
      Object.keys(prev).forEach(key => {
        newState[key] = key === id ? !prev[key] : false;
      });
      return newState;
    });
  };
  
  // Toggle section expanded state (goals, ideas, feedback)
  const toggleSection = (initiativeId: string, section: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSections(prev => {
      const initiativeSections = prev[initiativeId] || {};
      return {
        ...prev,
        [initiativeId]: {
          ...initiativeSections,
          [section]: !initiativeSections[section]
        }
      };
    });
  };
  
  // Handle deleting an initiative
  const handleDeleteInitiative = async (id: string) => {
    if (!confirm('Are you sure you want to delete this initiative? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      // Delete the initiative via API
      await apiClient.initiatives.delete(id);
      
      // Update the local state
      setInitiatives(prevInitiatives => prevInitiatives.filter(initiative => initiative.id !== id));
      
      // If in single view and we deleted the current initiative, navigate back to list
      if (isSingleView && currentInitiative?.id === id) {
        navigate('/initiatives');
      }
    } catch (err) {
      console.error('Error deleting initiative:', err);
      alert('Failed to delete the initiative. Please try again.');
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

  const priorityLabels = ['High', 'Medium', 'Low', 'Very Low', 'Minimal'];
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 2: return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 3: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 4: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 5: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400';
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
          
          {/* Goal information - always shown */}
          <div className="flex items-center text-sm mb-4 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-md border border-gray-200 dark:border-gray-700">
            <Target 
              className={`h-5 w-5 mr-2 ${currentInitiative.goal ? "text-primary" : "text-gray-400"}`}
            />
            <div>
              {currentInitiative.goal ? (
                <>
                  <span className="font-medium">Linked Goal:</span> {currentInitiative.goal.title}
                  <Button 
                    variant="link" 
                    className="h-6 pl-1 text-primary"
                    onClick={() => navigate(`/goals?highlight=${currentInitiative.goal_id}`)}
                  >
                    View Goal
                  </Button>
                </>
              ) : (
                <span className="text-gray-500">No goal linked to this initiative</span>
              )}
            </div>
          </div>
          
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
                      className="p-5 hover:shadow-md transition-shadow"
                      onClick={(e) => {
                        // If clicking on action buttons, don't trigger row click
                        if (e.target instanceof Element && 
                            (e.target.closest('button') || 
                            e.target.closest('svg') ||
                            e.target.closest('a'))) {
                          return;
                        }
                        // Find and click the edit button to open the modal
                        const editBtn = document.getElementById(`edit-initiative-${initiative.id}`);
                        if (editBtn) editBtn.click();
                      }}
                    >
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{initiative.title}</h3>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(initiative.status)}`}>
                              {initiative.status.charAt(0).toUpperCase() + initiative.status.slice(1)}
                            </span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(initiative.priority)}`}>
                              {priorityLabels[initiative.priority - 1] || 'Unknown'} Priority
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm">
                            {/* Linked Goal - Always show (without dropdown) */}
                            <div className="flex items-center text-sm">
                              <Target 
                                className={`h-4 w-4 mr-1.5 ${initiative.goal ? "text-primary" : "text-gray-400"}`}
                              />
                              <span className={initiative.goal ? "text-primary" : "text-gray-500"}>
                                {initiative.goal ? (
                                  <Link 
                                    to={`/goals?highlight=${initiative.goal_id}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                    className="hover:underline"
                                  >
                                    Goal: {initiative.goal.title}
                                  </Link>
                                ) : (
                                  "No linked goal"
                                )}
                              </span>
                            </div>
                            
                            {/* Ideas Count - Always show */}
                            <div className="flex items-center text-xs text-slate-600 dark:text-gray-400">
                              <Lightbulb className="h-3.5 w-3.5 mr-1" />
                              <span>{initiative.ideas_count || 0} ideas</span>
                              {(initiative.ideas_count && initiative.ideas_count > 0) && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0 ml-1"
                                  onClick={(e) => toggleSection(initiative.id, 'ideas', e)}
                                >
                                  <ChevronDown className={`h-3 w-3 transition-transform ${
                                    expandedSections[initiative.id]?.ideas ? 'rotate-180' : ''
                                  }`} />
                                </Button>
                              )}
                            </div>
                            
                            {/* Feedback Count - Always show */}
                            <div className="flex items-center text-xs text-slate-600 dark:text-gray-400">
                              <MessageSquare className="h-3.5 w-3.5 mr-1" />
                              <span>{initiative.feedback_count || 0} feedback</span>
                              {(initiative.feedback_count && initiative.feedback_count > 0) && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0 ml-1"
                                  onClick={(e) => toggleSection(initiative.id, 'feedback', e)}
                                >
                                  <ChevronDown className={`h-3 w-3 transition-transform ${
                                    expandedSections[initiative.id]?.feedback ? 'rotate-180' : ''
                                  }`} />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {/* Related Ideas and Feedback - shown when expanded */}
                          {expandedInitiatives[initiative.id] && (
                            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                              {/* Goal Details Section removed - now directly linked in the header */}
                              
                              {/* Ideas Section */}
                              {(initiative.ideas_count && initiative.ideas_count > 0 && expandedSections[initiative.id]?.ideas) ? (
                                <div className="mb-3">
                                  <div className="flex items-center mb-2 text-xs font-medium text-slate-500">
                                    <Lightbulb className="h-3.5 w-3.5 mr-1.5 text-yellow-500" />
                                    <span>Related Ideas</span>
                                  </div>
                                  <div className="pl-2 border-l-2 border-yellow-200 dark:border-yellow-900/50">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-7 text-xs"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/ideas?initiative=${initiative.id}`);
                                      }}
                                    >
                                      View {initiative.ideas_count} related ideas
                                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                    </Button>
                                  </div>
                                </div>
                              ) : null}
                              
                              {/* Feedback Section */}
                              {(initiative.feedback_count && initiative.feedback_count > 0 && expandedSections[initiative.id]?.feedback) ? (
                                <div>
                                  <div className="flex items-center mb-2 text-xs font-medium text-slate-500">
                                    <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                                    <span>Related Feedback</span>
                                  </div>
                                  <div className="pl-2 border-l-2 border-blue-200 dark:border-blue-900/50">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-7 text-xs"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/feedback?initiative=${initiative.id}`);
                                      }}
                                    >
                                      View {initiative.feedback_count} related feedback
                                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                    </Button>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center space-x-2">
                            {/* Remove the EditInitiativeModal from here since we have it in the hidden container */}
                          </div>
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
                        className="p-5 hover:shadow-md transition-shadow"
                        onClick={(e) => {
                          // If clicking on action buttons, don't trigger row click
                          if (e.target instanceof Element && 
                              (e.target.closest('button') || 
                              e.target.closest('svg') ||
                              e.target.closest('a'))) {
                            return;
                          }
                          // Find and click the edit button to open the modal
                          const editBtn = document.getElementById(`edit-initiative-${initiative.id}`);
                          if (editBtn) editBtn.click();
                        }}
                      >
                        <div className="flex justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">{initiative.title}</h3>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(initiative.status)}`}>
                                {initiative.status.charAt(0).toUpperCase() + initiative.status.slice(1)}
                              </span>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(initiative.priority)}`}>
                                {priorityLabels[initiative.priority - 1] || 'Unknown'} Priority
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm">
                              {/* Linked Goal - Always show (without dropdown) */}
                              <div className="flex items-center text-sm">
                                <Target 
                                  className={`h-4 w-4 mr-1.5 ${initiative.goal ? "text-primary" : "text-gray-400"}`}
                                />
                                <span className={initiative.goal ? "text-primary" : "text-gray-500"}>
                                  {initiative.goal ? (
                                    <Link 
                                      to={`/goals?highlight=${initiative.goal_id}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                      className="hover:underline"
                                    >
                                      Goal: {initiative.goal.title}
                                    </Link>
                                  ) : (
                                    "No linked goal"
                                  )}
                                </span>
                              </div>
                              
                              {/* Ideas Count - Always show */}
                              <div className="flex items-center text-xs text-slate-600 dark:text-gray-400">
                                <Lightbulb className="h-3.5 w-3.5 mr-1" />
                                <span>{initiative.ideas_count || 0} ideas</span>
                                {(initiative.ideas_count && initiative.ideas_count > 0) && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0 ml-1"
                                    onClick={(e) => toggleSection(initiative.id, 'ideas', e)}
                                  >
                                    <ChevronDown className={`h-3 w-3 transition-transform ${
                                      expandedSections[initiative.id]?.ideas ? 'rotate-180' : ''
                                    }`} />
                                  </Button>
                                )}
                              </div>
                              
                              {/* Feedback Count - Always show */}
                              <div className="flex items-center text-xs text-slate-600 dark:text-gray-400">
                                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                                <span>{initiative.feedback_count || 0} feedback</span>
                                {(initiative.feedback_count && initiative.feedback_count > 0) && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0 ml-1"
                                    onClick={(e) => toggleSection(initiative.id, 'feedback', e)}
                                  >
                                    <ChevronDown className={`h-3 w-3 transition-transform ${
                                      expandedSections[initiative.id]?.feedback ? 'rotate-180' : ''
                                    }`} />
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            {/* Related Ideas and Feedback - shown when expanded */}
                            {expandedInitiatives[initiative.id] && (
                              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                                {/* Goal Details Section removed - now directly linked in the header */}
                                
                                {/* Ideas Section */}
                                {(initiative.ideas_count && initiative.ideas_count > 0 && expandedSections[initiative.id]?.ideas) ? (
                                  <div className="mb-3">
                                    <div className="flex items-center mb-2 text-xs font-medium text-slate-500">
                                      <Lightbulb className="h-3.5 w-3.5 mr-1.5 text-yellow-500" />
                                      <span>Related Ideas</span>
                                    </div>
                                    <div className="pl-2 border-l-2 border-yellow-200 dark:border-yellow-900/50">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-7 text-xs"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/ideas?initiative=${initiative.id}`);
                                        }}
                                      >
                                        View {initiative.ideas_count} related ideas
                                        <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                      </Button>
                                    </div>
                                  </div>
                                ) : null}
                                
                                {/* Feedback Section */}
                                {(initiative.feedback_count && initiative.feedback_count > 0 && expandedSections[initiative.id]?.feedback) ? (
                                  <div>
                                    <div className="flex items-center mb-2 text-xs font-medium text-slate-500">
                                      <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                                      <span>Related Feedback</span>
                                    </div>
                                    <div className="pl-2 border-l-2 border-blue-200 dark:border-blue-900/50">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-7 text-xs"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/feedback?initiative=${initiative.id}`);
                                        }}
                                      >
                                        View {initiative.feedback_count} related feedback
                                        <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                      </Button>
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center space-x-2">
                              {/* Remove the EditInitiativeModal from here since we have it in the hidden container */}
                            </div>
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

      {/* Hidden edit modal triggers and buttons */}
      <div className="hidden">
        {/* Add hidden buttons */}
        {displayedInitiatives.map(initiative => (
          <button 
            key={`trigger-${initiative.id}`} 
            id={`edit-initiative-${initiative.id}`}
            className="hidden"
          />
        ))}
        
        {/* EditInitiativeModal components */}
        {displayedInitiatives.map(initiative => (
          <EditInitiativeModal 
            key={`hidden-edit-${initiative.id}`}
            initiative={{
              id: initiative.id,
              title: initiative.title,
              description: initiative.description,
              status: initiative.status,
              priority: initiative.priority,
              goalId: initiative.goal_id
            }}
            goals={goals}
            onUpdate={handleUpdateInitiative}
            onDelete={handleDeleteInitiative}
            triggerButtonId={`edit-initiative-${initiative.id}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Initiatives;
