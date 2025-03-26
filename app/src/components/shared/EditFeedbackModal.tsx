import { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
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
  customerId?: string;
  customer?: string;
  initiativeId?: string;
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
    customerId?: string;
    initiativeId?: string;
  }) => void;
  triggerButtonSize?: 'default' | 'sm' | 'lg' | 'icon';
};

export function EditFeedbackModal({ 
  feedback, 
  initiatives, 
  customers, 
  onUpdate, 
  triggerButtonSize = 'default' 
}: EditFeedbackModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sentiment: 'neutral' as Sentiment,
    customerId: '',
    initiativeId: ''
  });

  // Initialize form with feedback data when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        title: feedback.title,
        description: feedback.description,
        sentiment: feedback.sentiment,
        customerId: feedback.customerId || '',
        initiativeId: feedback.initiativeId || ''
      });
    }
  }, [open, feedback]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Convert "none" values back to undefined before submission
    const submittedData = {
      ...formData,
      initiativeId: formData.initiativeId === 'none' ? undefined : formData.initiativeId,
      customerId: formData.customerId === 'none' ? undefined : formData.customerId
    };
    onUpdate(feedback.id, submittedData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButtonSize === 'icon' ? (
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Feedback</DialogTitle>
          <DialogDescription>
            Make changes to the feedback "{feedback.title}".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
              value={formData.customerId || 'none'} 
              onValueChange={(value) => handleChange('customerId', value)}
            >
              <SelectTrigger id="customer">
                <SelectValue placeholder="Select a customer (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None - General feedback (not customer-specific)</SelectItem>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>{customer.name} (Customer #{customer.id})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="initiative">Related Initiative</FormLabel>
            <Select 
              value={formData.initiativeId || 'none'} 
              onValueChange={(value) => handleChange('initiativeId', value)}
            >
              <SelectTrigger id="initiative">
                <SelectValue placeholder="Select an initiative (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None - Not related to a specific initiative</SelectItem>
                {initiatives.map(initiative => (
                  <SelectItem key={initiative.id} value={initiative.id}>{initiative.title} (Initiative #{initiative.id})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Update Feedback</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 