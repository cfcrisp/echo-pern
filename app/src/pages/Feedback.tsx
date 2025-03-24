import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

type FeedbackItem = {
  id: string;
  title: string;
  description: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  customer: string;
  createdAt: string;
};

// Sample feedback data - in a real app, this would come from an API
const mockFeedbackData: FeedbackItem[] = [
  {
    id: "1",
    title: "Love the new dashboard layout!",
    description: "The new dashboard layout is much more intuitive and helps me find what I need quickly. Great improvement!",
    sentiment: "positive",
    customer: "John D.",
    createdAt: "2 days ago"
  },
  {
    id: "2",
    title: "Feature request for export options",
    description: "It would be helpful to have more export options for reports, especially PDF and Excel formats.",
    sentiment: "neutral",
    customer: "Sarah M.",
    createdAt: "1 week ago"
  },
  {
    id: "3",
    title: "Mobile app keeps crashing",
    description: "The mobile app crashes whenever I try to create a new initiative. This has been happening for the last two updates.",
    sentiment: "negative",
    customer: "Michael T.",
    createdAt: "3 days ago"
  },
  {
    id: "4",
    title: "Great customer support experience",
    description: "Your support team was incredibly helpful in resolving my issue with data import. They went above and beyond!",
    sentiment: "positive",
    customer: "Emily R.",
    createdAt: "5 days ago"
  },
  {
    id: "5",
    title: "Confusing navigation structure",
    description: "I find it difficult to navigate between different sections of the app. The menu structure is not intuitive.",
    sentiment: "negative",
    customer: "Alex W.",
    createdAt: "1 day ago"
  },
  {
    id: "6",
    title: "Love the new reporting features",
    description: "The new reporting dashboard is amazing! So much easier to get insights now.",
    sentiment: "positive",
    customer: "Jessica K.",
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Customer Feedback</h1>
      
      <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as any)}>
        <TabsList className="mb-4">
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
    </div>
  );
};

const FeedbackTable: React.FC<{ feedback: FeedbackItem[] }> = ({ feedback }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Feedback</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Sentiment</TableHead>
            <TableHead className="text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feedback.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-gray-500 truncate max-w-md">{item.description}</div>
                </div>
              </TableCell>
              <TableCell>{item.customer}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${getSentimentColor(item.sentiment)}`}>
                  {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                </span>
              </TableCell>
              <TableCell className="text-right">{item.createdAt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Feedback;