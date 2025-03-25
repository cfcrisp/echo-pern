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

type GoalStatus = 'active' | 'planned' | 'completed';

type GoalModalProps = {
  onSave: (goal: {
    title: string;
    description: string;
    status: GoalStatus;
    target_date: string;
  }) => void;
  buttonLabel?: string;
};

export function AddGoalModal({ onSave, buttonLabel = "Add Goal" }: GoalModalProps) {
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState({
    title: '',
    description: '',
    status: 'active' as GoalStatus,
    target_date: ''
  });

  const handleChange = (field: string, value: string) => {
    setGoal(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave(goal);
    setGoal({
      title: '',
      description: '',
      status: 'active' as GoalStatus,
      target_date: ''
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
          <DialogTitle>Add New Goal</DialogTitle>
          <DialogDescription>
            Create a new strategic goal for your organization.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FormItem>
            <FormLabel htmlFor="title">Title</FormLabel>
            <Input 
              id="title" 
              value={goal.title} 
              onChange={(e) => handleChange('title', e.target.value)} 
              placeholder="E.g., Increase Customer Retention" 
            />
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="description">Description</FormLabel>
            <Textarea 
              id="description" 
              value={goal.description} 
              onChange={(e) => handleChange('description', e.target.value)} 
              placeholder="Describe the goal and expected outcomes" 
            />
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="status">Status</FormLabel>
            <Select 
              value={goal.status} 
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
              value={goal.target_date} 
              onChange={(e) => handleChange('target_date', e.target.value)} 
            />
          </FormItem>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Goal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 