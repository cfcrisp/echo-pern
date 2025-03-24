import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

type Initiative = {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'planned' | 'completed';
  priority: number;
  goalId?: string;
};

const mockInitiatives: Initiative[] = [
  {
    id: '1',
    title: 'Redesign User Interface',
    description: 'Improve the user experience by redesigning the interface with modern design principles.',
    status: 'active',
    priority: 1,
    goalId: '1',
  },
  {
    id: '2',
    title: 'Implement New Authentication System',
    description: 'Enhance security by implementing a new authentication system with multi-factor authentication.',
    status: 'planned',
    priority: 2,
    goalId: '2',
  },
  {
    id: '3',
    title: 'Optimize Database Queries',
    description: 'Improve application performance by optimizing database queries and indexing.',
    status: 'completed',
    priority: 3,
    goalId: '3',
  },
  {
    id: '4',
    title: 'Develop API Documentation',
    description: 'Create comprehensive API documentation for developers.',
    status: 'active',
    priority: 2,
    goalId: '4',
  },
  {
    id: '5',
    title: 'Implement Analytics Dashboard',
    description: 'Create a dashboard to visualize key performance metrics.',
    status: 'planned',
    priority: 1,
    goalId: '5',
  },
];

const getStatusColor = (status: Initiative['status']) => {
  switch (status) {
    case 'active':
      return 'bg-slate-100 text-slate-700';
    case 'planned':
      return 'bg-slate-50 text-slate-600';
    case 'completed':
      return 'bg-slate-200 text-slate-800';
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

const InitiativeCard: React.FC<{ initiative: Initiative }> = ({ initiative }) => {
  const statusColor = getStatusColor(initiative.status);
  
  return (
    <Card className="p-4 mb-4 border border-slate-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium">{initiative.title}</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500">
            Priority: {getPriorityLabel(initiative.priority)}
          </span>
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor}`}>
            {initiative.status.charAt(0).toUpperCase() + initiative.status.slice(1)}
          </span>
        </div>
      </div>
      <p className="text-sm text-slate-600 mb-3">{initiative.description}</p>
      {initiative.goalId && (
        <div className="text-xs text-slate-500">
          Goal ID: {initiative.goalId}
        </div>
      )}
    </Card>
  );
};

const Initiatives: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'planned' | 'completed'>('all');
  
  const filteredInitiatives = filter === 'all' 
    ? mockInitiatives 
    : mockInitiatives.filter(initiative => initiative.status === filter);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Initiatives</h1>
      
      <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="planned">Planned</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {filteredInitiatives.map(initiative => (
            <InitiativeCard key={initiative.id} initiative={initiative} />
          ))}
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          {filteredInitiatives.map(initiative => (
            <InitiativeCard key={initiative.id} initiative={initiative} />
          ))}
        </TabsContent>
        
        <TabsContent value="planned" className="space-y-4">
          {filteredInitiatives.map(initiative => (
            <InitiativeCard key={initiative.id} initiative={initiative} />
          ))}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {filteredInitiatives.map(initiative => (
            <InitiativeCard key={initiative.id} initiative={initiative} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Initiatives;