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
  target_date?: string;
  linked_initiatives?: string[];
  created_at?: string;
};

type EditGoalModalProps = {
  goal: Goal;
  onUpdate: (updatedGoal: {
    title: string;
    description: string;
    status: GoalStatus;
    target_date?: string;
    linked_initiatives?: string[];
  }) => void;
  triggerButtonSize?: 'default' | 'sm' | 'lg' | 'icon';
  initiatives?: Array<{ id: string; title: string; status: string }>;
};

export function EditGoalModal({ 
  goal, 
  onUpdate, 
  triggerButtonSize = 'default',
  initiatives = []
}: EditGoalModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active' as GoalStatus,
    target_date: '',
    linked_initiatives: [] as string[]
  });

  // Initialize form with goal data when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        title: goal.title,
        description: goal.description,
        status: goal.status,
        target_date: goal.target_date || '',
        linked_initiatives: goal.linked_initiatives || []
      });
    }
  }, [open, goal]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInitiativeToggle = (initiativeId: string) => {
    setFormData(prev => {
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
    onUpdate(formData);
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
              value={formData.target_date} 
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
                        id={`initiative-edit-${initiative.id}`}
                        checked={formData.linked_initiatives.includes(initiative.id)}
                        onChange={() => handleInitiativeToggle(initiative.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label 
                        htmlFor={`initiative-edit-${initiative.id}`}
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
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Update Goal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 