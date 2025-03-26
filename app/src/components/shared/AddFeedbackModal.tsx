import { useState } from 'react';
import { Plus } from 'lucide-react';
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
    initiative_id?: string;
  }) => void;
  customers?: Array<{ id: string; name: string }>;
  initiatives?: Array<{ id: string; title: string }>;
  buttonLabel?: string;
};

export function AddFeedbackModal({ 
  onSave, 
  customers = [],
  initiatives = [],
  buttonLabel = "Add Feedback" 
}: FeedbackModalProps) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState({
    title: '',
    description: '',
    sentiment: 'neutral' as FeedbackSentiment,
    customer_id: undefined as string | undefined,
    initiative_id: undefined as string | undefined
  });

  const handleChange = (field: string, value: string) => {
    setFeedback(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const submittedData = {
      ...feedback,
      customer_id: feedback.customer_id === 'none' ? undefined : feedback.customer_id,
      initiative_id: feedback.initiative_id === 'none' ? undefined : feedback.initiative_id
    };
    onSave(submittedData);
    setFeedback({
      title: '',
      description: '',
      sentiment: 'neutral' as FeedbackSentiment,
      customer_id: undefined,
      initiative_id: undefined
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Feedback</DialogTitle>
          <DialogDescription>
            Record feedback from your customers.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FormItem>
            <FormLabel htmlFor="title">Title</FormLabel>
            <Input 
              id="title" 
              value={feedback.title} 
              onChange={(e) => handleChange('title', e.target.value)} 
              placeholder="E.g., Love the new dashboard layout" 
            />
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="description">Description</FormLabel>
            <Textarea 
              id="description" 
              value={feedback.description} 
              onChange={(e) => handleChange('description', e.target.value)} 
              placeholder="Detailed feedback" 
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
                <SelectItem value="positive">Positive - Favorable feedback or praise</SelectItem>
                <SelectItem value="neutral">Neutral - Balanced or informational</SelectItem>
                <SelectItem value="negative">Negative - Complaints or issues</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
          {customers.length > 0 && (
            <FormItem>
              <FormLabel htmlFor="customer_id">Customer</FormLabel>
              <Select 
                value={feedback.customer_id || 'none'} 
                onValueChange={(value: string) => handleChange('customer_id', value)}
              >
                <SelectTrigger id="customer_id">
                  <SelectValue placeholder="Select a customer (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
          {initiatives.length > 0 && (
            <FormItem>
              <FormLabel htmlFor="initiative_id">Related Initiative</FormLabel>
              <Select 
                value={feedback.initiative_id || 'none'} 
                onValueChange={(value: string) => handleChange('initiative_id', value)}
              >
                <SelectTrigger id="initiative_id">
                  <SelectValue placeholder="Select an initiative (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {initiatives.map(initiative => (
                    <SelectItem key={initiative.id} value={initiative.id}>{initiative.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Feedback</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 