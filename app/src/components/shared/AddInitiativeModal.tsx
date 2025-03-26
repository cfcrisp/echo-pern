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

type InitiativeStatus = 'active' | 'planned' | 'completed';

type InitiativeModalProps = {
  onSave: (initiative: {
    goal_id?: string;
    title: string;
    description: string;
    status: InitiativeStatus;
    priority: number;
  }) => void;
  goals?: Array<{ id: string; title: string }>;
  buttonLabel?: string;
};

export function AddInitiativeModal({ 
  onSave, 
  goals = [], 
  buttonLabel = "Add Initiative" 
}: InitiativeModalProps) {
  const [open, setOpen] = useState(false);
  const [initiative, setInitiative] = useState({
    goal_id: undefined as string | undefined,
    title: '',
    description: '',
    status: 'active' as InitiativeStatus,
    priority: 3
  });

  const handleChange = (field: string, value: string | number) => {
    setInitiative(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const submittedData = {
      ...initiative,
      goal_id: initiative.goal_id === 'none' ? undefined : initiative.goal_id
    };
    onSave(submittedData);
    setInitiative({
      goal_id: undefined,
      title: '',
      description: '',
      status: 'active' as InitiativeStatus,
      priority: 3
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
          <DialogTitle>Add New Initiative</DialogTitle>
          <DialogDescription>
            Create a new initiative to help achieve your strategic goals.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FormItem>
            <FormLabel htmlFor="title">Title</FormLabel>
            <Input 
              id="title" 
              value={initiative.title} 
              onChange={(e) => handleChange('title', e.target.value)} 
              placeholder="E.g., Redesign User Interface" 
            />
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="description">Description</FormLabel>
            <Textarea 
              id="description" 
              value={initiative.description} 
              onChange={(e) => handleChange('description', e.target.value)} 
              placeholder="Describe the initiative in detail" 
            />
          </FormItem>
          {goals.length > 0 && (
            <FormItem>
              <FormLabel htmlFor="goal_id">Related Goal</FormLabel>
              <Select 
                value={initiative.goal_id || 'none'} 
                onValueChange={(value: string) => handleChange('goal_id', value)}
              >
                <SelectTrigger id="goal_id">
                  <SelectValue placeholder="Select a goal (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None - Not connected to a specific goal</SelectItem>
                  {goals.map(goal => (
                    <SelectItem key={goal.id} value={goal.id}>{goal.title} (Goal #{goal.id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Connecting to a goal helps track progress toward strategic objectives
              </p>
            </FormItem>
          )}
          <FormItem>
            <FormLabel htmlFor="status">Status</FormLabel>
            <Select 
              value={initiative.status} 
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
              value={initiative.priority.toString()} 
              onValueChange={(value: string) => handleChange('priority', parseInt(value))}
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
            <p className="text-xs text-muted-foreground mt-1">
              Example high priority initiatives: "Redesign User Interface", "Implement Analytics Dashboard"
            </p>
          </FormItem>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Initiative</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 