import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

type Goal = {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'planned' | 'completed';
  targetDate?: string;
};

const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Increase Customer Retention',
    description: 'Improve customer retention by 15% through enhanced product features and customer service.',
    status: 'active',
    targetDate: '2023-12-31',
  },
  {
    id: '2',
    title: 'Launch Mobile Application',
    description: 'Develop and launch a mobile application to expand our market reach.',
    status: 'planned',
    targetDate: '2024-03-15',
  },
  {
    id: '3',
    title: 'Optimize Onboarding Process',
    description: 'Streamline the customer onboarding process to reduce time-to-value.',
    status: 'completed',
    targetDate: '2023-09-30',
  },
  {
    id: '4',
    title: 'Expand to European Market',
    description: 'Research and implement strategy for European market expansion.',
    status: 'active',
    targetDate: '2024-06-30',
  },
  {
    id: '5',
    title: 'Implement AI-driven Analytics',
    description: 'Integrate AI capabilities into our analytics platform for predictive insights.',
    status: 'planned',
    targetDate: '2024-05-15',
  },
];

const getStatusColor = (status: Goal['status']) => {
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

const GoalCard: React.FC<{ goal: Goal }> = ({ goal }) => {
  const statusColor = getStatusColor(goal.status);
  
  return (
    <Card className="p-4 mb-4 border border-slate-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium">{goal.title}</h3>
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor}`}>
          {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
        </span>
      </div>
      <p className="text-sm text-slate-600 mb-3">{goal.description}</p>
      {goal.targetDate && (
        <div className="text-xs text-slate-500">
          Target: {new Date(goal.targetDate).toLocaleDateString()}
        </div>
      )}
    </Card>
  );
};

const Goals: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'planned' | 'completed'>('all');
  
  const filteredGoals = filter === 'all' 
    ? mockGoals 
    : mockGoals.filter(goal => goal.status === filter);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Goals</h1>
      
      <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="planned">Planned</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {filteredGoals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          {filteredGoals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </TabsContent>
        
        <TabsContent value="planned" className="space-y-4">
          {filteredGoals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {filteredGoals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Goals;