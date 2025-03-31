import { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
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

type Sentiment = 'positive' | 'neutral' | 'negative';

export type Feedback = {
  id: string;
  title: string;
  description: string;
  sentiment: Sentiment;
  customer_id?: string;
  customer?: string;
  initiative_id?: string;
  createdAt?: string;
};

type Initiative = {
  id: string;
  title: string;
};

type Customer = {
  id: string;
  name: string;
};

type EditFeedbackModalProps = {
  feedback: Feedback;
  initiatives: Initiative[];
  customers: Customer[];
  onUpdate: (id: string, updatedFeedback: {
    title: string;
    description: string;
    sentiment: Sentiment;
    customer_id?: string;
    initiative_id?: string;
  }) => void;
  onDelete?: (id: string) => void;
  triggerButtonSize?: 'default' | 'sm' | 'lg' | 'icon';
  triggerButtonId?: string;
};

export function EditFeedbackModal({ 
  feedback, 
  initiatives, 
  customers, 
  onUpdate,
  onDelete,
  triggerButtonSize = 'default',
  triggerButtonId
}: EditFeedbackModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sentiment: 'neutral' as Sentiment,
    customer_id: '',
    initiative_id: ''
  });

  // Initialize form with feedback data when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        title: feedback.title,
        description: feedback.description,
        sentiment: feedback.sentiment,
        customer_id: feedback.customer_id || '',
        initiative_id: feedback.initiative_id || ''
      });
    }
  }, [open, feedback]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log('Form data before submission:', formData);
    console.log('Original customer_id:', formData.customer_id);
    
    // Convert "none" values back to undefined before submission
    const submittedData = {
      ...formData,
      initiative_id: formData.initiative_id === 'none' ? undefined : formData.initiative_id,
      customer_id: formData.customer_id === 'none' ? undefined : formData.customer_id
    };
    
    console.log('Submitted data after processing:', submittedData);
    console.log('Final customer_id value:', submittedData.customer_id);
    
    onUpdate(feedback.id, submittedData);
    setOpen(false);
  };

  // Handler for dialog open state changes (clicking outside will trigger this)
  const handleOpenChange = (newOpenState: boolean) => {
    setOpen(newOpenState);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButtonId ? (
          <Button id={triggerButtonId} variant="ghost" size="sm" className="hidden">
            Edit
          </Button>
        ) : triggerButtonSize === 'icon' ? (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" size={triggerButtonSize} className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit Feedback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Feedback</DialogTitle>
          <DialogDescription>
            Make changes to the feedback details below.
          </DialogDescription>
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
            <div>
              <span className="font-medium">Created:</span> {feedback.createdAt || 'Recently'}
            </div>
            {feedback.customer && (
              <div>
                <span className="font-medium">Customer:</span> {feedback.customer}
              </div>
            )}
          </div>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <FormItem>
            <FormLabel htmlFor="title">Title</FormLabel>
            <Input 
              id="title" 
              value={formData.title} 
              onChange={(e) => handleChange('title', e.target.value)} 
              placeholder="E.g., Love the new dashboard layout!" 
            />
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="description">Description</FormLabel>
            <Textarea 
              id="description" 
              value={formData.description} 
              onChange={(e) => handleChange('description', e.target.value)} 
              placeholder="Provide detailed feedback" 
            />
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="sentiment">Sentiment</FormLabel>
            <Select 
              value={formData.sentiment} 
              onValueChange={(value: Sentiment) => handleChange('sentiment', value)}
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
          <FormItem>
            <FormLabel htmlFor="customer">Customer</FormLabel>
            <Select 
              value={formData.customer_id || 'none'} 
              onValueChange={(value) => handleChange('customer_id', value)}
            >
              <SelectTrigger id="customer">
                <SelectValue placeholder="Select a customer (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None - General feedback (not customer-specific)</SelectItem>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="initiative">Related Initiative</FormLabel>
            <Select 
              value={formData.initiative_id || 'none'} 
              onValueChange={(value) => handleChange('initiative_id', value)}
            >
              <SelectTrigger id="initiative">
                <SelectValue placeholder="Select an initiative (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None - Not related to a specific initiative</SelectItem>
                {initiatives.map(initiative => (
                  <SelectItem key={initiative.id} value={initiative.id}>{initiative.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        </div>
        <DialogFooter className="flex items-center justify-between">
          <div>
            {onDelete && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => {
                  onDelete(feedback.id);
                  setOpen(false);
                }}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Update Feedback</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 