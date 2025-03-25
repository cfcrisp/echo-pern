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
  triggerButtonSize?: 'default' | 'sm' | 'lg' | 'icon';
};

export function EditInitiativeModal({ initiative, goals, onUpdate, triggerButtonSize = 'default' }: EditInitiativeModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active' as InitiativeStatus,
    priority: 2,
    goalId: ''
  });

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
            Edit Initiative
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Initiative</DialogTitle>
          <DialogDescription>
            Make changes to the initiative "{initiative.title}".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
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
                <SelectItem value="1">High</SelectItem>
                <SelectItem value="2">Medium</SelectItem>
                <SelectItem value="3">Low</SelectItem>
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
                <SelectItem value="none">None</SelectItem>
                {goals.map(goal => (
                  <SelectItem key={goal.id} value={goal.id}>{goal.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Update Initiative</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 