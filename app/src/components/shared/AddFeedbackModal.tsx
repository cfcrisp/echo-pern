import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormItem, FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

type FeedbackSentiment = 'positive' | 'neutral' | 'negative';

type FeedbackModalProps = {
  onSave: (feedback: {
    title: string;
    description: string;
    sentiment: FeedbackSentiment;
    customer_id?: string;
    initiative_ids?: string[];
    initiative_id?: string;
  }) => void;
  initiatives?: Array<{ id: string; title: string }>;
  customers?: Array<{ id: string; name: string }>;
  buttonLabel?: string;
};

export function AddFeedbackModal({ 
  onSave, 
  initiatives = [], 
  customers = [],
  buttonLabel = "Add Feedback" 
}: FeedbackModalProps) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState({
    title: '',
    description: '',
    sentiment: 'neutral' as FeedbackSentiment,
    customer_id: undefined as string | undefined,
    initiative_id: undefined as string | undefined,
  });

  const handleChange = (field: string, value: any) => {
    if ((field === 'customer_id' || field === 'initiative_id') && value === 'none') {
      setFeedback(prev => ({ ...prev, [field]: undefined }));
    } else {
      setFeedback(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = () => {
    // Validate title
    if (!feedback.title?.trim()) {
      alert('Please enter a title for the feedback');
      return;
    }

    // Send data to parent component
    onSave({
      ...feedback,
      title: feedback.title.trim(),
      initiative_ids: feedback.initiative_id ? [feedback.initiative_id] : []
    });
    
    // Reset form and close modal
    setFeedback({
      title: '',
      description: '',
      sentiment: 'neutral',
      customer_id: undefined,
      initiative_id: undefined,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <MessageSquare className="h-4 w-4" />
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Customer Feedback</DialogTitle>
          <DialogDescription>
            Record feedback from customers or team members.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FormItem>
            <FormLabel htmlFor="title">Title</FormLabel>
            <Input 
              id="title" 
              value={feedback.title} 
              onChange={(e) => handleChange('title', e.target.value)} 
              placeholder="Brief summary of feedback" 
            />
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="description">Description</FormLabel>
            <Textarea 
              id="description" 
              value={feedback.description} 
              onChange={(e) => handleChange('description', e.target.value)} 
              placeholder="Detailed feedback content" 
            />
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="sentiment">Sentiment</FormLabel>
            <Select 
              value={feedback.sentiment} 
              onValueChange={(value: FeedbackSentiment) => handleChange('sentiment', value)}
            >
              <SelectTrigger id="sentiment">
                <SelectValue placeholder="Select sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="positive">Positive - Praise/Good feedback</SelectItem>
                <SelectItem value="neutral">Neutral - Suggestion/Question</SelectItem>
                <SelectItem value="negative">Negative - Complaint/Issue</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="customer">Customer</FormLabel>
            <Select 
              value={feedback.customer_id || 'none'} 
              onValueChange={(value) => handleChange('customer_id', value)}
            >
              <SelectTrigger id="customer">
                <SelectValue placeholder="Select customer..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (General feedback)</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="initiative">Related Initiative</FormLabel>
            <Select 
              value={feedback.initiative_id || 'none'} 
              onValueChange={(value) => handleChange('initiative_id', value)}
            >
              <SelectTrigger id="initiative">
                <SelectValue placeholder="Select initiative..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Not related to any initiative)</SelectItem>
                {initiatives.map((initiative) => (
                  <SelectItem key={initiative.id} value={initiative.id}>{initiative.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Feedback</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 