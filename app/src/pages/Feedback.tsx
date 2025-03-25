import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronRight, MessageSquare, Pencil, Plus, Trash2 } from 'lucide-react';

type FeedbackItem = {
  id: string;
  title: string;
  description: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  customer: string;
  customerId: string;
  createdAt: string;
};

// Sample feedback data - in a real app, this would come from an API
const mockFeedbackData: FeedbackItem[] = [
  {
    id: "1",
    title: "Love the new dashboard layout!",
    description: "The new dashboard layout is much more intuitive and helps me find what I need quickly. Great improvement!",
    sentiment: "positive",
    customer: "Acme Corp",
    customerId: "1",
    createdAt: "2 days ago"
  },
  {
    id: "2",
    title: "Feature request for export options",
    description: "It would be helpful to have more export options for reports, especially PDF and Excel formats.",
    sentiment: "neutral",
    customer: "TechStart Ltd",
    customerId: "2",
    createdAt: "1 week ago"
  },
  {
    id: "3",
    title: "Mobile app keeps crashing",
    description: "The mobile app crashes whenever I try to create a new initiative. This has been happening for the last two updates.",
    sentiment: "negative",
    customer: "Enterprise Solutions Inc",
    customerId: "3",
    createdAt: "3 days ago"
  },
  {
    id: "4",
    title: "Great customer support experience",
    description: "Your support team was incredibly helpful in resolving my issue with data import. They went above and beyond!",
    sentiment: "positive",
    customer: "Startup Ventures",
    customerId: "4",
    createdAt: "5 days ago"
  },
  {
    id: "5",
    title: "Confusing navigation structure",
    description: "I find it difficult to navigate between different sections of the app. The menu structure is not intuitive.",
    sentiment: "negative",
    customer: "Global Industries",
    customerId: "5",
    createdAt: "1 day ago"
  },
  {
    id: "6",
    title: "Love the new reporting features",
    description: "The new reporting dashboard is amazing! So much easier to get insights now.",
    sentiment: "positive",
    customer: "Local Business LLC",
    customerId: "6",
    createdAt: "4 days ago"
  }
];

const getSentimentColor = (sentiment: FeedbackItem['sentiment']) => {
  switch (sentiment) {
    case 'positive':
      return 'bg-green-50 text-green-700';
    case 'neutral':
      return 'bg-slate-50 text-slate-700';
    case 'negative':
      return 'bg-red-50 text-red-700';
    default:
      return 'bg-slate-50 text-slate-700';
  }
};

const Feedback: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  
  const filteredFeedback = filter === 'all' 
    ? mockFeedbackData 
    : mockFeedbackData.filter(item => item.sentiment === filter);

  return (
    <div>
      {/* Header with breadcrumb and improved styling */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
            <Link to="/" className="hover:text-gray-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-700">Feedback</span>
          </div>
          <h1 className="text-2xl font-bold">Customer Feedback</h1>
          <p className="text-gray-500 mt-1">Collect and manage feedback from your customers.</p>
        </div>
        <div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Feedback
          </Button>
        </div>
      </div>
      
      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Feedback</TabsTrigger>
          <TabsTrigger value="positive">Positive</TabsTrigger>
          <TabsTrigger value="neutral">Neutral</TabsTrigger>
          <TabsTrigger value="negative">Negative</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <FeedbackTable feedback={filteredFeedback} />
        </TabsContent>
        
        <TabsContent value="positive" className="space-y-4">
          <FeedbackTable feedback={filteredFeedback} />
        </TabsContent>
        
        <TabsContent value="neutral" className="space-y-4">
          <FeedbackTable feedback={filteredFeedback} />
        </TabsContent>
        
        <TabsContent value="negative" className="space-y-4">
          <FeedbackTable feedback={filteredFeedback} />
        </TabsContent>
      </Tabs>
      
      {/* Empty state - will be shown conditionally when there's no feedback */}
      {filteredFeedback.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg mt-6">
          <div className="bg-gray-100 p-3 rounded-full mb-4">
            <MessageSquare className="h-6 w-6 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium mb-1">No feedback yet</h3>
          <p className="text-gray-500 text-center mb-4">Start collecting feedback from your customers to improve your product.</p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Feedback
          </Button>
        </div>
      )}
    </div>
  );
};

const FeedbackTable: React.FC<{ feedback: FeedbackItem[] }> = ({ feedback }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Feedback</TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            <TableHead className="w-[120px]">Customer</TableHead>
            <TableHead className="w-[100px]">Sentiment</TableHead>
            <TableHead className="w-[100px]">Date</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feedback.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No feedback found.
              </TableCell>
            </TableRow>
          ) : (
            feedback.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="max-w-md truncate">{item.description}</div>
                </TableCell>
                <TableCell>{item.customer}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(item.sentiment)}`}>
                    {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                  </span>
                </TableCell>
                <TableCell>{item.createdAt}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Feedback;