import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronRight, Target, Pencil, Plus, Trash2, 
  Calendar, List, ChevronDown, MoreHorizontal 
} from 'lucide-react';
import { AddGoalModal, EditGoalModal } from "@/components/shared";

type Goal = {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'planned' | 'completed';
  targetDate?: string;
  // Additional fields to simulate relationships
  initiativesCount?: number;
};

const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Increase Customer Retention',
    description: 'Improve customer retention by 15% through enhanced product features and customer service.',
    status: 'active',
    targetDate: '2023-12-31',
    initiativesCount: 3,
  },
  {
    id: '2',
    title: 'Launch Mobile Application',
    description: 'Develop and launch a mobile application to expand our market reach.',
    status: 'planned',
    targetDate: '2024-03-15',
    initiativesCount: 2,
  },
  {
    id: '3',
    title: 'Optimize Onboarding Process',
    description: 'Streamline the customer onboarding process to reduce time-to-value.',
    status: 'completed',
    targetDate: '2023-09-30',
    initiativesCount: 4,
  },
  {
    id: '4',
    title: 'Expand to European Market',
    description: 'Research and implement strategy for European market expansion.',
    status: 'active',
    targetDate: '2024-06-30',
    initiativesCount: 1,
  },
  {
    id: '5',
    title: 'Implement AI-driven Analytics',
    description: 'Integrate AI capabilities into our analytics platform for predictive insights.',
    status: 'planned',
    targetDate: '2024-05-15',
    initiativesCount: 2,
  },
];

const getStatusColor = (status: Goal['status']) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'planned':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-slate-100 text-slate-700';
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

const GoalCard: React.FC<{ goal: Goal }> = ({ goal }) => {
  const statusColor = getStatusColor(goal.status);
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // Ensure initiativesCount is defined
  const initiativesCount = goal.initiativesCount ?? 0;
  
  // Format the target date and get time remaining
  const formattedDate = goal.targetDate ? formatDate(goal.targetDate) : '';
  const timeRemaining = goal.targetDate ? getTimeRemaining(goal.targetDate) : null;
  
  // Handle goal updates
  const handleUpdateGoal = (id: string, updatedGoal: {
    title: string;
    description: string;
    status: Goal['status'];
    target_date?: string;
  }) => {
    console.log('Updating goal:', id, updatedGoal);
    // In a real app, this would make an API call to update the goal
  };
  
  return (
    <Card className="group transition-all duration-200 hover:shadow-md border border-slate-200 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-grow">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-medium mr-3">{goal.title}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
              {goal.description}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <EditGoalModal 
              goal={goal}
              onUpdate={handleUpdateGoal}
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
                <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded shadow-lg z-10">
                  <div 
                    className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={() => {
                      console.log('Edit goal', goal.id);
                      setShowMenu(false);
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" /> Edit
                  </div>
                  <div 
                    className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center text-red-600"
                    onClick={() => {
                      console.log('Delete goal', goal.id);
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
          {/* Target Date with Prominence */}
          {goal.targetDate && (
            <div className="bg-purple-50 rounded-md px-2 py-1 flex items-center text-xs">
              <Calendar className="h-3 w-3 mr-1 text-purple-600" />
              <span className="font-medium text-purple-800">{formattedDate}</span>
              {timeRemaining && (
                <span className="text-purple-600 ml-1"> · {timeRemaining}</span>
              )}
            </div>
          )}
          
          {/* Linked Initiatives */}
          {initiativesCount > 0 && (
            <div className="flex items-center text-xs text-slate-500">
              <List className="h-3 w-3 mr-1" />
              <span>{initiativesCount} initiatives</span>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto text-xs text-slate-500 p-0 h-6"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Hide details' : 'Show details'}
            <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${expanded ? 'transform rotate-180' : ''}`} />
          </Button>
        </div>
        
        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-sm text-slate-600 mb-2">{goal.description}</p>
            
            {/* Mock Initiatives related to this goal */}
            {initiativesCount > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium mb-2">Related Initiatives</h4>
                <div className="space-y-2">
                  {Array.from({ length: Math.min(initiativesCount, 3) }).map((_, idx) => (
                    <div key={idx} className="bg-slate-50 p-2 rounded-md flex justify-between items-center">
                      <div>
                        <span className="text-xs font-medium">
                          Initiative {idx + 1}
                        </span>
                        <p className="text-xs text-slate-500">
                          {idx === 0 ? 'Redesign User Interface' : 
                           idx === 1 ? 'Improve Customer Journey' : 'Optimize Performance'}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 text-xs">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
                
                {initiativesCount > 3 && (
                  <Button variant="outline" size="sm" className="w-full mt-2 text-xs h-8">
                    View All {initiativesCount} Initiatives
                  </Button>
                )}
                
                <Button variant="outline" size="sm" className="mt-3 h-8 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Initiative
                </Button>
              </div>
            )}
            
            {/* Additional details section */}
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Progress</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Overall Completion</span>
                  <span>{Math.floor(Math.random() * 100)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div 
                    className="bg-purple-500 h-1.5 rounded-full transition-all" 
                    style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

const Goals: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'planned' | 'completed'>('all');
  
  const filteredGoals = filter === 'all' 
    ? mockGoals 
    : mockGoals.filter(goal => goal.status === filter);

  const handleSaveGoal = (goal: {
    title: string;
    description: string;
    status: 'active' | 'planned' | 'completed';
    targetDate?: string;
  }) => {
    console.log('New goal:', goal);
    // In a real app, this would make an API call to save the goal
  };

  return (
    <div>
      {/* Header with breadcrumb and improved styling */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
            <Link to="/" className="hover:text-gray-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-700">Goals</span>
          </div>
          <h1 className="text-2xl font-bold">Strategic Goals</h1>
          <p className="text-gray-500 mt-1">Define and track your organization's strategic goals.</p>
        </div>
        <div>
          <AddGoalModal onSave={handleSaveGoal} />
        </div>
      </div>
      
      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Goals</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="planned">Planned</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6 space-y-3">
          {filteredGoals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
          
          {filteredGoals.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg mt-6">
              <div className="bg-gray-100 p-3 rounded-full mb-4">
                <Target className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">No goals yet</h3>
              <p className="text-gray-500 text-center mb-4">Start defining strategic goals for your organization.</p>
              <AddGoalModal onSave={handleSaveGoal} />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active" className="mt-6 space-y-3">
          {filteredGoals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
          
          {filteredGoals.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg mt-6">
              <div className="bg-gray-100 p-3 rounded-full mb-4">
                <Target className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">No active goals</h3>
              <p className="text-gray-500 text-center mb-4">Start defining active goals for your organization.</p>
              <AddGoalModal onSave={handleSaveGoal} />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="planned" className="mt-6 space-y-3">
          {filteredGoals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
          
          {filteredGoals.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg mt-6">
              <div className="bg-gray-100 p-3 rounded-full mb-4">
                <Target className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">No planned goals</h3>
              <p className="text-gray-500 text-center mb-4">Start defining planned goals for your organization.</p>
              <AddGoalModal onSave={handleSaveGoal} />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6 space-y-3">
          {filteredGoals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
          
          {filteredGoals.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg mt-6">
              <div className="bg-gray-100 p-3 rounded-full mb-4">
                <Target className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">No completed goals</h3>
              <p className="text-gray-500 text-center mb-4">Completed goals will appear here.</p>
              <AddGoalModal onSave={handleSaveGoal} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Goals;