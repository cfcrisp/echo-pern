import { useState } from 'react';
import { Plus, X, ChevronDown, Check } from 'lucide-react';
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
import React from 'react';

type GoalStatus = 'active' | 'planned' | 'completed';

type GoalModalProps = {
  onSave: (goal: {
    title: string;
    description: string;
    status: GoalStatus;
    target_date?: string;
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
    // Create a copy of the goal object
    const { linked_initiatives, ...goalData } = goal;
    
    // Remove empty target_date
    const cleanGoalData = {
      ...goalData,
      target_date: goalData.target_date ? goalData.target_date : undefined
    };
    
    // Only pass fields that exist in the database schema to the server
    onSave(cleanGoalData);
    
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

  const [showInitiativesDropdown, setShowInitiativesDropdown] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Handle clicks outside the dropdown to close it
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowInitiativesDropdown(false);
      }
    };

    // Add event listener when dropdown is open
    if (showInitiativesDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInitiativesDropdown]);

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
              <div className="relative">
                <div 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer"
                  onClick={() => {
                    // Toggle dropdown
                    setShowInitiativesDropdown(!showInitiativesDropdown);
                  }}
                >
                  <div className="flex flex-wrap gap-1">
                    {goal.linked_initiatives.length === 0 ? (
                      <span className="text-muted-foreground">Select initiatives to link</span>
                    ) : (
                      goal.linked_initiatives.map(id => {
                        const initiative = initiatives.find(i => i.id === id);
                        return initiative ? (
                          <span key={id} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-secondary text-secondary-foreground mb-1">
                            {initiative.title}
                            <button
                              className="ml-1 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Remove this initiative
                                setGoal(prev => ({
                                  ...prev,
                                  linked_initiatives: prev.linked_initiatives.filter(i => i !== id)
                                }));
                              }}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ) : null;
                      })
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </div>
                
                {showInitiativesDropdown && (
                  <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md" ref={dropdownRef}>
                    <div className="p-1">
                      {initiatives.map(initiative => {
                        const isSelected = goal.linked_initiatives.includes(initiative.id);
                        return (
                          <div
                            key={initiative.id}
                            className={`relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${isSelected ? 'bg-accent/50' : ''}`}
                            onClick={() => {
                              // Toggle this initiative
                              setGoal(prev => {
                                const newLinkedInitiatives = [...prev.linked_initiatives];
                                const index = newLinkedInitiatives.indexOf(initiative.id);
                                if (index === -1) {
                                  newLinkedInitiatives.push(initiative.id);
                                } else {
                                  newLinkedInitiatives.splice(index, 1);
                                }
                                return {
                                  ...prev,
                                  linked_initiatives: newLinkedInitiatives
                                };
                              });
                            }}
                          >
                            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                              {isSelected && <Check className="h-4 w-4" />}
                            </span>
                            {initiative.title}
                            <span className="ml-2 text-xs text-gray-500">
                              ({initiative.status})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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