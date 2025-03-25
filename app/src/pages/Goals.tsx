import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight, Target, Pencil, Plus, Trash2, Calendar } from 'lucide-react';

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
      return 'bg-green-100 text-green-800';
    case 'planned':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

const GoalCard: React.FC<{ goal: Goal }> = ({ goal }) => {
  const statusColor = getStatusColor(goal.status);
  
  return (
    <Card className="group transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-2 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${statusColor.split(' ')[0].replace('bg-', 'bg-')}`}></div>
            <span className={`text-sm font-medium ${statusColor.split(' ')[1]}`}>
              {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
            </span>
          </div>
          {goal.targetDate && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(goal.targetDate).toLocaleDateString()}
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold leading-tight">{goal.title}</h3>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-slate-600 mb-3">{goal.description}</p>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Goal</span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const Goals: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'planned' | 'completed'>('all');
  
  const filteredGoals = filter === 'all' 
    ? mockGoals 
    : mockGoals.filter(goal => goal.status === filter);

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
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Goal
          </Button>
        </div>
      </div>
      
      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Goals</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="planned">Planned</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
          
          {filteredGoals.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg mt-6">
              <div className="bg-gray-100 p-3 rounded-full mb-4">
                <Target className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">No goals yet</h3>
              <p className="text-gray-500 text-center mb-4">Start defining strategic goals for your organization.</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active" className="mt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
          
          {filteredGoals.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg mt-6">
              <div className="bg-gray-100 p-3 rounded-full mb-4">
                <Target className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">No active goals</h3>
              <p className="text-gray-500 text-center mb-4">Start defining active goals for your organization.</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="planned" className="mt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
          
          {filteredGoals.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg mt-6">
              <div className="bg-gray-100 p-3 rounded-full mb-4">
                <Target className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">No planned goals</h3>
              <p className="text-gray-500 text-center mb-4">Start defining planned goals for your organization.</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
          
          {filteredGoals.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg mt-6">
              <div className="bg-gray-100 p-3 rounded-full mb-4">
                <Target className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">No completed goals</h3>
              <p className="text-gray-500 text-center mb-4">Completed goals will appear here.</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Goals;