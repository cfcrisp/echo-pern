import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  ChevronRight, Plus, Pencil, Trash2, Target, 
  MessageSquare, Lightbulb, ChevronDown, MoreHorizontal 
} from 'lucide-react';
import { AddInitiativeModal, EditInitiativeModal } from "@/components/shared";

type Initiative = {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'planned' | 'completed';
  priority: number;
  goalId?: string;
  // Additional fields to simulate relationships
  ideasCount?: number;
  feedbackCount?: number;
};

const mockInitiatives: Initiative[] = [
  {
    id: '1',
    title: 'Redesign User Interface',
    description: 'Improve the user experience by redesigning the interface with modern design principles.',
    status: 'active',
    priority: 1,
    goalId: '1',
    ideasCount: 3,
    feedbackCount: 2,
  },
  {
    id: '2',
    title: 'Implement New Authentication System',
    description: 'Enhance security by implementing a new authentication system with multi-factor authentication.',
    status: 'planned',
    priority: 2,
    goalId: '2',
    ideasCount: 1,
    feedbackCount: 0,
  },
  {
    id: '3',
    title: 'Optimize Database Queries',
    description: 'Improve application performance by optimizing database queries and indexing.',
    status: 'completed',
    priority: 3,
    goalId: '3',
    ideasCount: 0,
    feedbackCount: 1,
  },
  {
    id: '4',
    title: 'Develop API Documentation',
    description: 'Create comprehensive API documentation for developers.',
    status: 'active',
    priority: 2,
    goalId: '4',
    ideasCount: 2,
    feedbackCount: 3,
  },
  {
    id: '5',
    title: 'Implement Analytics Dashboard',
    description: 'Create a dashboard to visualize key performance metrics.',
    status: 'planned',
    priority: 1,
    goalId: '5',
    ideasCount: 4,
    feedbackCount: 2,
  },
];

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

const getPriorityColor = (priority: number) => {
  switch (priority) {
    case 1:
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 2:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 3:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-400';
  }
};

const getPriorityLabel = (priority: number) => {
  switch (priority) {
    case 1:
      return 'High';
    case 2:
      return 'Medium';
    case 3:
      return 'Low';
    default:
      return 'Medium';
  }
};

const InitiativeCard: React.FC<{ initiative: Initiative; goals: { id: string; title: string }[] }> = ({ initiative, goals }) => {
  const statusColor = getStatusColor(initiative.status);
  const priorityColor = getPriorityColor(initiative.priority);
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // Ensure ideasCount and feedbackCount are defined
  const ideasCount = initiative.ideasCount ?? 0;
  const feedbackCount = initiative.feedbackCount ?? 0;
  
  // Find the related goal
  const relatedGoal = initiative.goalId ? goals.find(g => g.id === initiative.goalId) : null;
  
  // Handle initiative updates
  const handleUpdateInitiative = (id: string, updatedInitiative: {
    title: string;
    description: string;
    status: Initiative['status'];
    priority: number;
    goalId?: string;
  }) => {
    console.log('Updating initiative:', id, updatedInitiative);
    // In a real app, this would make an API call to update the initiative
  };
  
  // Mock high priority ideas related to this initiative (for example purposes)
  const relatedIdeas = ideasCount > 0 ? [
    { id: 'i1', title: 'Add export feature', priority: 'high' },
    { id: 'i2', title: 'Improve response time', priority: 'high' }
  ].slice(0, Math.min(ideasCount, 2)) : [];
  
  // Mock recent feedback related to this initiative (for example purposes)
  const recentFeedback = feedbackCount > 0 ? [
    { id: 'f1', title: 'Great improvement in UX', date: '3 days ago', sentiment: 'positive' },
    { id: 'f2', title: 'Still needs performance work', date: '1 week ago', sentiment: 'neutral' }
  ].slice(0, Math.min(feedbackCount, 2)) : [];
  
  return (
    <Card className="group transition-all duration-200 hover:shadow-md border border-slate-200 dark:border-gray-700 overflow-hidden dark:bg-card">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-grow">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-medium mr-3 dark:text-gray-100">{initiative.title}</h3>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColor}`}>
                  {getPriorityLabel(initiative.priority)}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                  {initiative.status.charAt(0).toUpperCase() + initiative.status.slice(1)}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-gray-300 mb-3 line-clamp-2">
              {initiative.description}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <EditInitiativeModal
              initiative={initiative}
              goals={goals}
              onUpdate={handleUpdateInitiative}
              triggerButtonSize="icon"
            />
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              
              {showMenu && (
                <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded shadow-lg z-10 dark:bg-card dark:border-border">
                  <div 
                    className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center dark:hover:bg-gray-800/50 dark:text-gray-200"
                    onClick={() => {
                      console.log('Edit initiative', initiative.id);
                      setShowMenu(false);
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" /> Edit
                  </div>
                  <div 
                    className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center text-red-600 dark:hover:bg-gray-800/50"
                    onClick={() => {
                      console.log('Delete initiative', initiative.id);
                      setShowMenu(false);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 mt-2">
          {relatedGoal && (
            <div className="flex items-center text-xs text-slate-500 dark:text-gray-400">
              <Target className="h-3 w-3 mr-1" />
              <span>Goal: {relatedGoal.title}</span>
            </div>
          )}
          {ideasCount > 0 && (
            <div className="flex items-center text-xs text-slate-500 dark:text-gray-400">
              <Lightbulb className="h-3 w-3 mr-1" />
              <span>{ideasCount} ideas</span>
            </div>
          )}
          {feedbackCount > 0 && (
            <div className="flex items-center text-xs text-slate-500 dark:text-gray-400">
              <MessageSquare className="h-3 w-3 mr-1" />
              <span>{feedbackCount} feedback</span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto text-xs text-slate-500 dark:text-gray-400 p-0 h-6"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Hide details' : 'Show details'}
            <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${expanded ? 'transform rotate-180' : ''}`} />
          </Button>
        </div>
        
        {expanded && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-gray-700">
            {/* Description section with cleaner layout */}
            <div className="mb-4">
              <p className="text-sm text-slate-600 dark:text-gray-300">{initiative.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Left column */}
              <div className="space-y-3">
                {relatedGoal && (
                  <div>
                    <h4 className="text-xs font-semibold mb-2 text-slate-700 dark:text-gray-300 uppercase tracking-wider">Related Goal</h4>
                    <div className="bg-slate-50 dark:bg-gray-800/70 p-3 rounded-lg border border-slate-200 dark:border-gray-700 hover:border-slate-300 dark:hover:border-gray-600 transition-colors">
                      <div className="flex items-center">
                        <Target className="h-3.5 w-3.5 mr-2 text-primary/70 dark:text-primary/50" />
                        <p className="text-sm font-medium dark:text-gray-200">{relatedGoal.title}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start mt-2 text-xs h-7 text-slate-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                      >
                        <ChevronRight className="h-3 w-3 mr-1" />
                        View Goal Details
                      </Button>
                    </div>
                  </div>
                )}
                
                {relatedIdeas.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-2 text-slate-700 dark:text-gray-300 uppercase tracking-wider">High Priority Ideas</h4>
                    <div className="space-y-2">
                      {relatedIdeas.map(idea => (
                        <div key={idea.id} className="bg-slate-50 dark:bg-gray-800/70 p-3 rounded-lg border border-slate-200 dark:border-gray-700 hover:border-slate-300 dark:hover:border-gray-600 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Lightbulb className="h-3.5 w-3.5 mr-2 text-amber-500 dark:text-amber-400" />
                              <p className="text-sm font-medium dark:text-gray-200">{idea.title}</p>
                            </div>
                            <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                              {idea.priority}
                            </span>
                          </div>
                        </div>
                      ))}
                      {ideasCount > relatedIdeas.length && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start text-xs h-7 text-slate-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                        >
                          <ChevronRight className="h-3 w-3 mr-1" />
                          View All {ideasCount} Ideas
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right column */}
              <div className="space-y-3">
                {recentFeedback.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-2 text-slate-700 dark:text-gray-300 uppercase tracking-wider">Recent Feedback</h4>
                    <div className="space-y-2">
                      {recentFeedback.map(feedback => (
                        <div key={feedback.id} className="bg-slate-50 dark:bg-gray-800/70 p-3 rounded-lg border border-slate-200 dark:border-gray-700 hover:border-slate-300 dark:hover:border-gray-600 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <MessageSquare className={`h-3.5 w-3.5 mr-2 ${
                                feedback.sentiment === 'positive' ? 'text-green-500 dark:text-green-400' : 
                                feedback.sentiment === 'negative' ? 'text-red-500 dark:text-red-400' : 
                                'text-blue-500 dark:text-blue-400'
                              }`} />
                              <p className="text-sm font-medium dark:text-gray-200">{feedback.title}</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                              feedback.sentiment === 'positive' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                              feedback.sentiment === 'negative' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 
                              'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                              {feedback.sentiment}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-gray-400">{feedback.date}</span>
                          </div>
                        </div>
                      ))}
                      {feedbackCount > recentFeedback.length && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start text-xs h-7 text-slate-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                        >
                          <ChevronRight className="h-3 w-3 mr-1" />
                          View All {feedbackCount} Feedback Items
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Quicker action buttons */}
            {(relatedGoal || ideasCount > 0 || feedbackCount > 0) && (
              <div className="flex flex-wrap gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-gray-700">
                <h4 className="text-xs font-semibold text-slate-700 dark:text-gray-300 mr-2 self-center">Quick Actions:</h4>
                {relatedGoal && (
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    <Target className="h-3 w-3 mr-1 text-primary" />
                    View Goal
                  </Button>
                )}
                {ideasCount > 0 && (
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    <Lightbulb className="h-3 w-3 mr-1 text-amber-500" />
                    View Ideas
                  </Button>
                )}
                {feedbackCount > 0 && (
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    <MessageSquare className="h-3 w-3 mr-1 text-blue-500" />
                    View Feedback
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

const Initiatives: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'planned' | 'completed'>('all');
  
  const filteredInitiatives = filter === 'all' 
    ? mockInitiatives 
    : mockInitiatives.filter(initiative => initiative.status === filter);

  // Handler for saving new initiatives
  const handleSaveInitiative = (initiative: {
    title: string;
    description: string;
    status: 'active' | 'planned' | 'completed';
    priority: number;
    goalId?: string;
  }) => {
    console.log('New initiative:', initiative);
    // In a real app, this would make an API call to save the initiative
  };

  // Mock goals data for the dropdown in the modal
  const mockGoals = [
    { id: '1', title: 'Increase Customer Retention' },
    { id: '2', title: 'Launch Mobile Application' },
    { id: '3', title: 'Optimize Onboarding Process' },
    { id: '4', title: 'Expand to European Market' },
    { id: '5', title: 'Implement AI-driven Analytics' },
  ];

  return (
    <div>
      {/* Header with breadcrumb and improved styling */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
            <Link to="/" className="hover:text-gray-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-700">Initiatives</span>
          </div>
          <h1 className="text-2xl font-bold">Initiatives</h1>
          <p className="text-gray-500 mt-1">Manage your initiatives to achieve strategic goals.</p>
        </div>
        <div>
          <AddInitiativeModal onSave={handleSaveInitiative} goals={mockGoals} />
        </div>
      </div>
      
      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Initiatives</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="planned">Planned</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-3">
          {filteredInitiatives.map(initiative => (
            <InitiativeCard key={initiative.id} initiative={initiative} goals={mockGoals} />
          ))}
          
          {filteredInitiatives.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg mt-6 dark:border-gray-700">
              <div className="bg-gray-100 p-3 rounded-full mb-4 dark:bg-gray-800">
                <Target className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-1 dark:text-gray-200">No initiatives yet</h3>
              <p className="text-gray-500 text-center mb-4 dark:text-gray-400">Start creating initiatives to achieve your strategic goals.</p>
              <AddInitiativeModal onSave={handleSaveInitiative} goals={mockGoals} />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active" className="space-y-3">
          {filteredInitiatives.map(initiative => (
            <InitiativeCard key={initiative.id} initiative={initiative} goals={mockGoals} />
          ))}
          
          {filteredInitiatives.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg mt-6 dark:border-gray-700">
              <div className="bg-gray-100 p-3 rounded-full mb-4 dark:bg-gray-800">
                <Target className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-1 dark:text-gray-200">No active initiatives</h3>
              <p className="text-gray-500 text-center mb-4 dark:text-gray-400">Start creating active initiatives to track your current work.</p>
              <AddInitiativeModal onSave={handleSaveInitiative} goals={mockGoals} />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="planned" className="space-y-3">
          {filteredInitiatives.map(initiative => (
            <InitiativeCard key={initiative.id} initiative={initiative} goals={mockGoals} />
          ))}
          
          {filteredInitiatives.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg mt-6 dark:border-gray-700">
              <div className="bg-gray-100 p-3 rounded-full mb-4 dark:bg-gray-800">
                <Target className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-1 dark:text-gray-200">No planned initiatives</h3>
              <p className="text-gray-500 text-center mb-4 dark:text-gray-400">Start creating planned initiatives for future work.</p>
              <AddInitiativeModal onSave={handleSaveInitiative} goals={mockGoals} />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-3">
          {filteredInitiatives.map(initiative => (
            <InitiativeCard key={initiative.id} initiative={initiative} goals={mockGoals} />
          ))}
          
          {filteredInitiatives.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg mt-6 dark:border-gray-700">
              <div className="bg-gray-100 p-3 rounded-full mb-4 dark:bg-gray-800">
                <Target className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-1 dark:text-gray-200">No completed initiatives</h3>
              <p className="text-gray-500 text-center mb-4 dark:text-gray-400">Completed initiatives will appear here.</p>
              <AddInitiativeModal onSave={handleSaveInitiative} goals={mockGoals} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Initiatives;
