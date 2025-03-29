import { useState, useEffect } from 'react';
import { Pencil, Trash2, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
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

type InitiativeStatus = 'active' | 'planned' | 'completed';

export type Initiative = {
  id: string;
  title: string;
  description: string;
  status: InitiativeStatus;
  priority: number;
  goalId?: string;
};

type Goal = {
  id: string;
  title: string;
};

type EditInitiativeModalProps = {
  initiative: Initiative;
  goals: Goal[];
  onUpdate: (id: string, updatedInitiative: {
    title: string;
    description: string;
    status: InitiativeStatus;
    priority: number;
    goalId?: string;
  }) => void;
  onDelete?: (id: string) => void;
  triggerButtonSize?: 'default' | 'sm' | 'lg' | 'icon';
  triggerButtonId?: string;
};

export function EditInitiativeModal({ 
  initiative, 
  goals, 
  onUpdate, 
  onDelete,
  triggerButtonSize = 'default',
  triggerButtonId 
}: EditInitiativeModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active' as InitiativeStatus,
    priority: 2,
    goalId: ''
  });

  // Special handling for triggerButtonId - if provided, we need to setup a click handler
  useEffect(() => {
    if (triggerButtonId) {
      const triggerButton = document.getElementById(triggerButtonId);
      if (triggerButton) {
        const handleTriggerClick = () => {
          setOpen(true);
        };
        triggerButton.addEventListener('click', handleTriggerClick);
        return () => {
          triggerButton.removeEventListener('click', handleTriggerClick);
        };
      }
    }
  }, [triggerButtonId]);

  // Initialize form with initiative data when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        title: initiative.title,
        description: initiative.description,
        status: initiative.status,
        priority: initiative.priority,
        goalId: initiative.goalId || ''
      });
    }
  }, [open, initiative]);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Convert "none" value back to empty string for goalId before submission
    const submittedData = {
      ...formData,
      goalId: formData.goalId === 'none' ? undefined : formData.goalId
    };
    onUpdate(initiative.id, submittedData);
    setOpen(false);
  };

  // Handler for dialog open state changes (clicking outside will trigger this)
  const handleOpenChange = (newOpenState: boolean) => {
    console.log('Dialog state changing:', { current: open, new: newOpenState });
    setOpen(newOpenState);
  };

  const priorityLabels = ['High (1) - Critical for business success', 'Medium (2) - Important but not urgent', 'Low (3) - Desirable improvement', 'Very Low (4) - Minor enhancement', 'Minimal (5) - Nice to have'];

  return (
    <Dialog 
      open={open} 
      onOpenChange={handleOpenChange}
      modal={true}
    >
      <DialogTrigger asChild>
        {triggerButtonId ? (
          <span className="hidden"></span> // Use a span instead of a button to avoid creating another button
        ) : triggerButtonSize === 'icon' ? (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" size={triggerButtonSize} className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit Initiative
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Initiative</DialogTitle>
          <DialogDescription className="mt-2">
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">Priority:</span> {priorityLabels[initiative.priority - 1] || 'Unknown'}
              </div>
              <div>
                <span className="font-medium">Status:</span> {initiative.status.charAt(0).toUpperCase() + initiative.status.slice(1)}
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <FormItem>
            <FormLabel htmlFor="title">Title</FormLabel>
            <Input 
              id="title" 
              value={formData.title} 
              onChange={(e) => handleChange('title', e.target.value)} 
              placeholder="E.g., Redesign User Interface" 
            />
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="description">Description</FormLabel>
            <Textarea 
              id="description" 
              value={formData.description} 
              onChange={(e) => handleChange('description', e.target.value)} 
              placeholder="Describe the initiative in detail" 
            />
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="status">Status</FormLabel>
            <Select 
              value={formData.status} 
              onValueChange={(value: InitiativeStatus) => handleChange('status', value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active - Currently in progress</SelectItem>
                <SelectItem value="planned">Planned - Scheduled for future work</SelectItem>
                <SelectItem value="completed">Completed - Successfully delivered</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="priority">Priority</FormLabel>
            <Select 
              value={formData.priority.toString()} 
              onValueChange={(value) => handleChange('priority', parseInt(value))}
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">High (1) - Critical for business success</SelectItem>
                <SelectItem value="2">Medium (2) - Important but not urgent</SelectItem>
                <SelectItem value="3">Low (3) - Desirable improvement</SelectItem>
                <SelectItem value="4">Very Low (4) - Minor enhancement</SelectItem>
                <SelectItem value="5">Minimal (5) - Nice to have</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="goal">Related Goal</FormLabel>
            <Select 
              value={formData.goalId || 'none'} 
              onValueChange={(value) => handleChange('goalId', value)}
            >
              <SelectTrigger id="goal">
                <SelectValue placeholder="Select a goal (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None - Not connected to a specific goal</SelectItem>
                {goals.map(goal => (
                  <SelectItem key={goal.id} value={goal.id}>{goal.title} (Goal #{goal.id})</SelectItem>
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
                  if (window.confirm("Are you sure you want to delete this initiative? This action cannot be undone.")) {
                    onDelete(initiative.id);
                    setOpen(false);
                  }
                }}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="gap-1">
                <X className="h-4 w-4" />
                Close
              </Button>
            </DialogClose>
            <Button onClick={handleSubmit}>Update Initiative</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 