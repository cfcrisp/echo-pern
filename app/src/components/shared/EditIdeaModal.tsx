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

type IdeaStatus = 'new' | 'planned' | 'completed' | 'rejected';
type IdeaPriority = 'urgent' | 'high' | 'medium' | 'low';
type IdeaEffort = 'xs' | 's' | 'm' | 'l' | 'xl';

export type Idea = {
  id: string;
  title: string;
  description: string;
  priority: IdeaPriority;
  effort: IdeaEffort;
  status: IdeaStatus;
  initiative?: string;
  initiativeId?: string;
  customer?: string;
  customerId?: string;
};

type Initiative = {
  id: string;
  title: string;
};

type Customer = {
  id: string;
  name: string;
};

type EditIdeaModalProps = {
  idea: Idea;
  initiatives: Initiative[];
  customers: Customer[];
  onUpdate: (id: string, updatedIdea: {
    title: string;
    description: string;
    priority: IdeaPriority;
    effort: IdeaEffort;
    status: IdeaStatus;
    initiativeId?: string;
    customerId?: string;
  }) => void;
  triggerButtonSize?: 'default' | 'sm' | 'lg' | 'icon';
};

export function EditIdeaModal({ 
  idea, 
  initiatives, 
  customers, 
  onUpdate, 
  triggerButtonSize = 'default' 
}: EditIdeaModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as IdeaPriority,
    effort: 'm' as IdeaEffort,
    status: 'new' as IdeaStatus,
    initiativeId: '',
    customerId: ''
  });

  // Initialize form with idea data when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        title: idea.title,
        description: idea.description,
        priority: idea.priority,
        effort: idea.effort,
        status: idea.status,
        initiativeId: idea.initiativeId || '',
        customerId: idea.customerId || ''
      });
    }
  }, [open, idea]);

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
    onUpdate(idea.id, submittedData);
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
            Edit Idea
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Idea</DialogTitle>
          <DialogDescription>
            Make changes to the idea "{idea.title}".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FormItem>
            <FormLabel htmlFor="title">Title</FormLabel>
            <Input 
              id="title" 
              value={formData.title} 
              onChange={(e) => handleChange('title', e.target.value)} 
              placeholder="E.g., Add export to PDF feature" 
            />
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="description">Description</FormLabel>
            <Textarea 
              id="description" 
              value={formData.description} 
              onChange={(e) => handleChange('description', e.target.value)} 
              placeholder="Describe the idea in detail" 
            />
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="priority">Priority</FormLabel>
            <Select 
              value={formData.priority} 
              onValueChange={(value: IdeaPriority) => handleChange('priority', value)}
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="effort">Effort</FormLabel>
            <Select 
              value={formData.effort} 
              onValueChange={(value: IdeaEffort) => handleChange('effort', value)}
            >
              <SelectTrigger id="effort">
                <SelectValue placeholder="Select effort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xs">XS (1-2 days)</SelectItem>
                <SelectItem value="s">S (3-5 days)</SelectItem>
                <SelectItem value="m">M (1-2 weeks)</SelectItem>
                <SelectItem value="l">L (3-4 weeks)</SelectItem>
                <SelectItem value="xl">XL (1+ months)</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="status">Status</FormLabel>
            <Select 
              value={formData.status} 
              onValueChange={(value: IdeaStatus) => handleChange('status', value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
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
                <SelectItem value="none">None</SelectItem>
                {initiatives.map(initiative => (
                  <SelectItem key={initiative.id} value={initiative.id}>{initiative.title}</SelectItem>
                ))}
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
                <SelectItem value="none">None</SelectItem>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Update Idea</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 