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
  initiative_id?: string;
  customer?: string;
  customerId?: string;
  customer_ids?: string[];
  createdAt?: string;
};

export type UpdateIdeaData = {
  title: string;
  description: string;
  priority: IdeaPriority;
  effort: IdeaEffort;
  status: IdeaStatus;
  initiativeId?: string;
  customer_ids: string[];
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
  onUpdate: (id: string, updatedIdea: UpdateIdeaData) => void;
  onDelete?: (id: string) => void;
  triggerButtonSize?: 'default' | 'sm' | 'lg' | 'icon';
  triggerButtonId?: string;
};

export function EditIdeaModal({ 
  idea, 
  initiatives, 
  customers, 
  onUpdate, 
  onDelete,
  triggerButtonSize = 'default',
  triggerButtonId
}: EditIdeaModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Idea>({
    ...idea,
    initiativeId: idea.initiativeId || idea.initiative_id,
    customerId: idea.customerId || (idea.customer_ids && idea.customer_ids[0])
  });

  // Initialize form with idea data when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        ...idea,
        initiativeId: idea.initiativeId || idea.initiative_id,
        customerId: idea.customerId || (idea.customer_ids && idea.customer_ids[0])
      });
    }
  }, [open, idea]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(idea.id, {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      effort: formData.effort,
      status: formData.status,
      initiativeId: formData.initiativeId,
      customer_ids: formData.customerId ? [formData.customerId] : []
    });
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
            Edit Idea
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Idea</DialogTitle>
          <DialogDescription>
            Make changes to your idea details below.
          </DialogDescription>
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
            <div>
              <span className="font-medium">Created:</span> {idea.createdAt || 'Recently'}
            </div>
            {idea.customer && (
              <div>
                <span className="font-medium">Customer:</span> {idea.customer}
              </div>
            )}
            <div>
              <span className="font-medium">Status:</span> {idea.status.replace('_', ' ')}
            </div>
          </div>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
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
                <SelectItem value="urgent">Urgent - Needs immediate attention</SelectItem>
                <SelectItem value="high">High - Critical importance</SelectItem>
                <SelectItem value="medium">Medium - Standard priority</SelectItem>
                <SelectItem value="low">Low - Can be addressed later</SelectItem>
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
                <SelectItem value="xs">XS (1-2 days) - Very quick implementation</SelectItem>
                <SelectItem value="s">S (3-5 days) - Small task</SelectItem>
                <SelectItem value="m">M (1-2 weeks) - Moderate complexity</SelectItem>
                <SelectItem value="l">L (3-4 weeks) - Significant undertaking</SelectItem>
                <SelectItem value="xl">XL (1+ months) - Major project</SelectItem>
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
                <SelectItem value="new">New - Recently submitted</SelectItem>
                <SelectItem value="planned">Planned - In the roadmap</SelectItem>
                <SelectItem value="completed">Completed - Successfully delivered</SelectItem>
                <SelectItem value="rejected">Rejected - Not feasible or aligned</SelectItem>
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
                <SelectItem value="none">None - Not linked to any initiative</SelectItem>
                {initiatives.map(initiative => (
                  <SelectItem key={initiative.id} value={initiative.id}>{initiative.title} (Initiative #{initiative.id})</SelectItem>
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
                <SelectItem value="none">None - Not associated with a customer</SelectItem>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>{customer.name} (Customer #{customer.id})</SelectItem>
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
                  onDelete(idea.id);
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
            <Button onClick={handleSubmit}>Update Idea</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 