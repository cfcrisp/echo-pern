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
      return 'bg-green-100 text-green-800';
    case 'planned':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

const getPriorityColor = (priority: number) => {
  switch (priority) {
    case 1:
      return 'bg-red-100 text-red-800';
    case 2:
      return 'bg-yellow-100 text-yellow-800';
    case 3:
    case 4:
    case 5:
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-slate-100 text-slate-700';
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
  
  return (
    <Card className="group transition-all duration-200 hover:shadow-md border border-slate-200 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-grow">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-medium mr-3">{initiative.title}</h3>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColor}`}>
                  {getPriorityLabel(initiative.priority)}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                  {initiative.status.charAt(0).toUpperCase() + initiative.status.slice(1)}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
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
                <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded shadow-lg z-10">
                  <div 
                    className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={() => {
                      console.log('Edit initiative', initiative.id);
                      setShowMenu(false);
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" /> Edit
                  </div>
                  <div 
                    className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center text-red-600"
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
          {initiative.goalId && (
            <div className="flex items-center text-xs text-slate-500">
              <Target className="h-3 w-3 mr-1" />
              <span>Goal {initiative.goalId}</span>
            </div>
          )}
          {ideasCount > 0 && (
            <div className="flex items-center text-xs text-slate-500">
              <Lightbulb className="h-3 w-3 mr-1" />
              <span>{ideasCount} ideas</span>
            </div>
          )}
          {feedbackCount > 0 && (
            <div className="flex items-center text-xs text-slate-500">
              <MessageSquare className="h-3 w-3 mr-1" />
              <span>{feedbackCount} feedback</span>
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
            <p className="text-sm text-slate-600 mb-2">{initiative.description}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Target className="h-3 w-3 mr-1" />
                View Goal
              </Button>
              {ideasCount > 0 && (
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <Lightbulb className="h-3 w-3 mr-1" />
                  View Ideas
                </Button>
              )}
              {feedbackCount > 0 && (
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  View Feedback
                </Button>
              )}
            </div>
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
            <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg mt-6">
              <div className="bg-gray-100 p-3 rounded-full mb-4">
                <Target className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">No initiatives yet</h3>
              <p className="text-gray-500 text-center mb-4">Start creating initiatives to achieve your strategic goals.</p>
              <AddInitiativeModal onSave={handleSaveInitiative} goals={mockGoals} />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active" className="space-y-3">
          {filteredInitiatives.map(initiative => (
            <InitiativeCard key={initiative.id} initiative={initiative} goals={mockGoals} />
          ))}
          
          {filteredInitiatives.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg mt-6">
              <div className="bg-gray-100 p-3 rounded-full mb-4">
                <Target className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">No active initiatives</h3>
              <p className="text-gray-500 text-center mb-4">Start creating active initiatives to track your current work.</p>
              <AddInitiativeModal onSave={handleSaveInitiative} goals={mockGoals} />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="planned" className="space-y-3">
          {filteredInitiatives.map(initiative => (
            <InitiativeCard key={initiative.id} initiative={initiative} goals={mockGoals} />
          ))}
          
          {filteredInitiatives.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg mt-6">
              <div className="bg-gray-100 p-3 rounded-full mb-4">
                <Target className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">No planned initiatives</h3>
              <p className="text-gray-500 text-center mb-4">Start creating planned initiatives for future work.</p>
              <AddInitiativeModal onSave={handleSaveInitiative} goals={mockGoals} />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-3">
          {filteredInitiatives.map(initiative => (
            <InitiativeCard key={initiative.id} initiative={initiative} goals={mockGoals} />
          ))}
          
          {filteredInitiatives.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg mt-6">
              <div className="bg-gray-100 p-3 rounded-full mb-4">
                <Target className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">No completed initiatives</h3>
              <p className="text-gray-500 text-center mb-4">Completed initiatives will appear here.</p>
              <AddInitiativeModal onSave={handleSaveInitiative} goals={mockGoals} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Initiatives;
