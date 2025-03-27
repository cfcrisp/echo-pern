import { useState, useEffect } from 'react';
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

type FeedbackSentiment = 'positive' | 'neutral' | 'negative';

type FeedbackModalProps = {
  onSave: (feedback: {
    title: string;
    description: string;
    sentiment: FeedbackSentiment;
    customer_id?: string;
    initiative_ids?: string[];
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
    initiative_ids: [] as string[]
  });
  const [openCustomerCombobox, setOpenCustomerCombobox] = useState(false);
  const [openInitiativeCombobox, setOpenInitiativeCombobox] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFeedback(prev => ({ ...prev, [field]: value }));
  };

  const handleInitiativeToggle = (initiativeId: string) => {
    setFeedback(prev => {
      const currentInitiatives = [...prev.initiative_ids];
      const index = currentInitiatives.indexOf(initiativeId);
      
      if (index === -1) {
        // Add initiative
        return { ...prev, initiative_ids: [...currentInitiatives, initiativeId] };
      } else {
        // Remove initiative
        currentInitiatives.splice(index, 1);
        return { ...prev, initiative_ids: currentInitiatives };
      }
    });
  };

  const handleSubmit = () => {
    onSave(feedback);
    setFeedback({
      title: '',
      description: '',
      sentiment: 'neutral',
      customer_id: undefined,
      initiative_ids: []
    });
    setOpen(false);
  };

  const getInitiativeTitles = () => {
    return feedback.initiative_ids
      .map(id => initiatives.find(initiative => initiative.id === id)?.title)
      .filter(title => title !== undefined)
      .join(', ');
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
          {customers.length > 0 && (
            <FormItem>
              <FormLabel htmlFor="customer">Customer</FormLabel>
              <Popover open={openCustomerCombobox} onOpenChange={setOpenCustomerCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCustomerCombobox}
                    className="w-full justify-between"
                  >
                    {feedback.customer_id
                      ? customers.find((customer) => customer.id === feedback.customer_id)?.name
                      : "Select customer..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search customer..." />
                    <CommandEmpty>No customer found.</CommandEmpty>
                    <CommandGroup>
                      <ScrollArea className="h-[200px]">
                        {customers.map((customer) => (
                          <CommandItem
                            key={customer.id}
                            value={customer.id}
                            onSelect={() => {
                              handleChange('customer_id', customer.id === feedback.customer_id ? undefined : customer.id);
                              setOpenCustomerCombobox(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                feedback.customer_id === customer.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {customer.name}
                          </CommandItem>
                        ))}
                      </ScrollArea>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
          {initiatives.length > 0 && (
            <FormItem>
              <FormLabel htmlFor="initiatives">Related Initiatives</FormLabel>
              <Popover open={openInitiativeCombobox} onOpenChange={setOpenInitiativeCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openInitiativeCombobox}
                    className="w-full justify-between"
                  >
                    {feedback.initiative_ids.length > 0
                      ? `${feedback.initiative_ids.length} selected`
                      : "Select initiatives..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search initiatives..." />
                    <CommandEmpty>No initiative found.</CommandEmpty>
                    <CommandGroup>
                      <ScrollArea className="h-[200px]">
                        {initiatives.map((initiative) => (
                          <CommandItem
                            key={initiative.id}
                            value={initiative.id}
                            onSelect={() => handleInitiativeToggle(initiative.id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                feedback.initiative_ids.includes(initiative.id) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {initiative.title}
                          </CommandItem>
                        ))}
                      </ScrollArea>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {feedback.initiative_ids.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {feedback.initiative_ids.map(id => {
                    const initiative = initiatives.find(i => i.id === id);
                    return initiative ? (
                      <Badge key={id} variant="secondary" className="mr-1 mb-1">
                        {initiative.title}
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
          <Button onClick={handleSubmit}>Save Feedback</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 