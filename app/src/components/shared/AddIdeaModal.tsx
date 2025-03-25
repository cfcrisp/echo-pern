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

type IdeaStatus = 'new' | 'planned' | 'completed' | 'rejected';
type IdeaPriority = 'urgent' | 'high' | 'medium' | 'low';
type IdeaEffort = 'xs' | 's' | 'm' | 'l' | 'xl';

type IdeaModalProps = {
  onSave: (idea: {
    title: string;
    description: string;
    priority: IdeaPriority;
    effort: IdeaEffort;
    status: IdeaStatus;
    initiative_id?: string;
    customer_id?: string;
    source: string;
  }) => void;
  initiatives?: Array<{ id: string; title: string }>;
  customers?: Array<{ id: string; name: string }>;
  buttonLabel?: string;
};

export function AddIdeaModal({ 
  onSave, 
  initiatives = [], 
  customers = [],
  buttonLabel = "Add Idea" 
}: IdeaModalProps) {
  const [open, setOpen] = useState(false);
  const [idea, setIdea] = useState({
    title: '',
    description: '',
    priority: 'medium' as IdeaPriority,
    effort: 'm' as IdeaEffort,
    status: 'new' as IdeaStatus,
    initiative_id: undefined as string | undefined,
    customer_id: undefined as string | undefined,
    source: 'internal'
  });

  const handleChange = (field: string, value: string) => {
    setIdea(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const submittedData = {
      ...idea,
      initiative_id: idea.initiative_id === 'none' ? undefined : idea.initiative_id,
      customer_id: idea.customer_id === 'none' ? undefined : idea.customer_id
    };
    onSave(submittedData);
    setIdea({
      title: '',
      description: '',
      priority: 'medium' as IdeaPriority,
      effort: 'm' as IdeaEffort,
      status: 'new' as IdeaStatus,
      initiative_id: undefined,
      customer_id: undefined,
      source: 'internal'
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
          <DialogTitle>Add New Idea</DialogTitle>
          <DialogDescription>
            Capture a product idea from customers or team members.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FormItem>
            <FormLabel htmlFor="title">Title</FormLabel>
            <Input 
              id="title" 
              value={idea.title} 
              onChange={(e) => handleChange('title', e.target.value)} 
              placeholder="E.g., Add export to PDF feature" 
            />
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="description">Description</FormLabel>
            <Textarea 
              id="description" 
              value={idea.description} 
              onChange={(e) => handleChange('description', e.target.value)} 
              placeholder="Describe the idea in detail" 
            />
          </FormItem>
          <div className="grid grid-cols-2 gap-4">
            <FormItem>
              <FormLabel htmlFor="priority">Priority</FormLabel>
              <Select 
                value={idea.priority} 
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
                value={idea.effort} 
                onValueChange={(value: IdeaEffort) => handleChange('effort', value)}
              >
                <SelectTrigger id="effort">
                  <SelectValue placeholder="Select effort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xs">XS</SelectItem>
                  <SelectItem value="s">S</SelectItem>
                  <SelectItem value="m">M</SelectItem>
                  <SelectItem value="l">L</SelectItem>
                  <SelectItem value="xl">XL</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          </div>
          <FormItem>
            <FormLabel htmlFor="status">Status</FormLabel>
            <Select 
              value={idea.status} 
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
            <FormLabel htmlFor="source">Source</FormLabel>
            <Input 
              id="source" 
              value={idea.source} 
              onChange={(e) => handleChange('source', e.target.value)} 
              placeholder="E.g., internal, customer request, etc." 
            />
          </FormItem>
          {initiatives.length > 0 && (
            <FormItem>
              <FormLabel htmlFor="initiative_id">Related Initiative</FormLabel>
              <Select 
                value={idea.initiative_id || 'none'} 
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
          {customers.length > 0 && (
            <FormItem>
              <FormLabel htmlFor="customer_id">Related Customer</FormLabel>
              <Select 
                value={idea.customer_id || 'none'} 
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Idea</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 