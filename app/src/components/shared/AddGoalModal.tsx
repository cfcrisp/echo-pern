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
    linked_initiatives?: string[];
  }) => void;
  buttonLabel?: string;
  isOpen?: boolean;
  onClose?: () => void;
  initiatives?: Array<{ id: string; title: string; status: string }>;
};

export function AddGoalModal({ 
  onSave, 
  buttonLabel = "Add Goal", 
  isOpen, 
  onClose,
  initiatives = [] 
}: GoalModalProps) {
  // If isOpen and onClose are provided, use those, otherwise manage internally
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const handleOpenChange = (newOpen: boolean) => {
    if (onClose && !newOpen) {
      onClose();
    }
    setInternalOpen(newOpen);
  };

  const [goal, setGoal] = useState({
    title: '',
    description: '',
    status: 'active' as GoalStatus,
    target_date: '',
    linked_initiatives: [] as string[]
  });

  const handleChange = (field: string, value: string) => {
    setGoal(prev => ({ ...prev, [field]: value }));
  };

  const handleInitiativeToggle = (initiativeId: string) => {
    setGoal(prev => {
      const currentInitiatives = [...prev.linked_initiatives];
      const index = currentInitiatives.indexOf(initiativeId);
      
      if (index !== -1) {
        // Remove if already selected
        currentInitiatives.splice(index, 1);
      } else {
        // Add if not already selected
        currentInitiatives.push(initiativeId);
      }
      
      return {
        ...prev,
        linked_initiatives: currentInitiatives
      };
    });
  };

  const handleSubmit = () => {
    onSave(goal);
    setGoal({
      title: '',
      description: '',
      status: 'active' as GoalStatus,
      target_date: '',
      linked_initiatives: []
    });
    if (onClose) {
      onClose();
    } else {
      setInternalOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* Only render the trigger if we're not controlling the open state from outside */}
      {isOpen === undefined && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {buttonLabel}
          </Button>
        </DialogTrigger>
      )}
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
                <SelectItem value="active">Active - Currently in progress</SelectItem>
                <SelectItem value="planned">Planned - Coming up next</SelectItem>
                <SelectItem value="completed">Completed - Finished successfully</SelectItem>
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
          
          {initiatives.length > 0 && (
            <FormItem>
              <FormLabel>Linked Initiatives</FormLabel>
              <div className="mt-2 border rounded-md p-3 max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  {initiatives.map(initiative => (
                    <div 
                      key={initiative.id} 
                      className="flex items-center space-x-2"
                    >
                      <input 
                        type="checkbox" 
                        id={`initiative-${initiative.id}`}
                        checked={goal.linked_initiatives.includes(initiative.id)}
                        onChange={() => handleInitiativeToggle(initiative.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label 
                        htmlFor={`initiative-${initiative.id}`}
                        className="text-sm flex-1 cursor-pointer"
                      >
                        {initiative.title}
                        <span className="ml-2 text-xs text-gray-500">
                          ({initiative.status})
                        </span>
                      </label>
                    </div>
                  ))}
                  
                  {initiatives.length === 0 && (
                    <p className="text-sm text-gray-500">No initiatives available to link</p>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Link relevant initiatives to this goal for better tracking
              </p>
            </FormItem>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Goal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 