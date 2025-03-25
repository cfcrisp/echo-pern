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

type GoalStatus = 'active' | 'planned' | 'completed';

export type Goal = {
  id: string;
  title: string;
  description: string;
  status: GoalStatus;
  targetDate?: string;
};

type EditGoalModalProps = {
  goal: Goal;
  onUpdate: (id: string, updatedGoal: {
    title: string;
    description: string;
    status: GoalStatus;
    target_date?: string;
  }) => void;
  triggerButtonSize?: 'default' | 'sm' | 'lg' | 'icon';
};

export function EditGoalModal({ goal, onUpdate, triggerButtonSize = 'default' }: EditGoalModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active' as GoalStatus,
    target_date: ''
  });

  // Initialize form with goal data when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        title: goal.title,
        description: goal.description,
        status: goal.status,
        target_date: goal.targetDate || ''
      });
    }
  }, [open, goal]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onUpdate(goal.id, formData);
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
            Edit Goal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Goal</DialogTitle>
          <DialogDescription>
            Make changes to the goal "{goal.title}".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FormItem>
            <FormLabel htmlFor="title">Title</FormLabel>
            <Input 
              id="title" 
              value={formData.title} 
              onChange={(e) => handleChange('title', e.target.value)} 
              placeholder="E.g., Increase Customer Retention" 
            />
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="description">Description</FormLabel>
            <Textarea 
              id="description" 
              value={formData.description} 
              onChange={(e) => handleChange('description', e.target.value)} 
              placeholder="Describe the goal and expected outcomes" 
            />
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="status">Status</FormLabel>
            <Select 
              value={formData.status} 
              onValueChange={(value: GoalStatus) => handleChange('status', value)}
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
            <FormLabel htmlFor="target_date">Target Date</FormLabel>
            <Input 
              id="target_date" 
              type="date" 
              value={formData.target_date} 
              onChange={(e) => handleChange('target_date', e.target.value)} 
            />
          </FormItem>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Update Goal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 