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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    customer_ids: string[];
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
    customer_ids: [] as string[],
    source: 'internal'
  });
  const [openCustomerCombobox, setOpenCustomerCombobox] = useState(false);
  const [openInitiativeCombobox, setOpenInitiativeCombobox] = useState(false);

  const handleChange = (field: string, value: any) => {
    setIdea(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomerToggle = (customerId: string) => {
    console.log('Toggling customer:', customerId);
    console.log('Current customer_ids:', idea.customer_ids);
    
    setIdea(prev => {
      const currentCustomers = [...prev.customer_ids];
      const index = currentCustomers.indexOf(customerId);
      
      if (index === -1) {
        // Add customer
        console.log('Adding customer to selection');
        return { ...prev, customer_ids: [...currentCustomers, customerId] };
      } else {
        // Remove customer
        console.log('Removing customer from selection');
        currentCustomers.splice(index, 1);
        return { ...prev, customer_ids: currentCustomers };
      }
    });
  };

  const handleSubmit = () => {
    const submittedData = {
      ...idea,
      initiative_id: idea.initiative_id === 'none' ? undefined : idea.initiative_id
    };
    console.log('Submitting idea with customer_ids:', submittedData.customer_ids);
    onSave(submittedData);
    setIdea({
      title: '',
      description: '',
      priority: 'medium' as IdeaPriority,
      effort: 'm' as IdeaEffort,
      status: 'new' as IdeaStatus,
      initiative_id: undefined,
      customer_ids: [],
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
                  <SelectItem value="urgent">Urgent - Critical for business (fix now)</SelectItem>
                  <SelectItem value="high">High - Important feature (next sprint)</SelectItem>
                  <SelectItem value="medium">Medium - Valuable improvement</SelectItem>
                  <SelectItem value="low">Low - Nice to have</SelectItem>
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
                  <SelectItem value="xs">XS - Hours (very easy)</SelectItem>
                  <SelectItem value="s">S - Days (simple)</SelectItem>
                  <SelectItem value="m">M - 1-2 Weeks (moderate)</SelectItem>
                  <SelectItem value="l">L - 2-4 Weeks (complex)</SelectItem>
                  <SelectItem value="xl">XL - Months (major project)</SelectItem>
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
                <SelectItem value="new">New - Just captured</SelectItem>
                <SelectItem value="planned">Planned - On the roadmap</SelectItem>
                <SelectItem value="completed">Completed - Already implemented</SelectItem>
                <SelectItem value="rejected">Rejected - Not feasible/valuable</SelectItem>
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
                value={idea.customer_ids.length > 0 ? idea.customer_ids[0] : 'none'} 
                onValueChange={(value: string) => {
                  // Handle 'none' selection specially
                  if (value === 'none') {
                    handleChange('customer_ids', []);
                  } else {
                    handleChange('customer_ids', [value]);
                  }
                }}
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
              {idea.customer_ids.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {idea.customer_ids.map(id => {
                    const customer = customers.find(c => c.id === id);
                    return customer ? (
                      <Badge key={id} variant="secondary" className="mr-1 mb-1">
                        {customer.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
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