import { useState, useEffect } from 'react';
import { Pencil, Trash2, X, ChevronDown, Check } from 'lucide-react';
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
import React from 'react';

type GoalStatus = 'active' | 'planned' | 'completed';

export type Goal = {
  id: string;
  title: string;
  description: string;
  status: GoalStatus;
  target_date?: string;
  created_at?: string;
};

type EditGoalModalProps = {
  goal: Goal;
  onUpdate: (goal: {
    title: string;
    description: string;
    status: GoalStatus;
    target_date?: string;
    linked_initiatives?: string[];
  }) => void;
  onDelete?: (id: string) => void;
  triggerButtonSize?: 'default' | 'sm' | 'lg' | 'icon';
  triggerButtonId?: string;
  initiatives?: Array<{ id: string; title: string; status: string; goal_id?: string }>;
};

export function EditGoalModal({ 
  goal, 
  onUpdate,
  onDelete,
  triggerButtonSize = 'default',
  triggerButtonId,
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
  const [initiativesDropdownOpen, setInitiativesDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

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

  // Initialize form with goal data when modal opens
  useEffect(() => {
    if (open) {
      // Find initiatives linked to this goal
      const linkedInitiativesIds = initiatives
        .filter(initiative => initiative.goal_id === goal.id)
        .map(initiative => initiative.id);
      
      // Set initial form state with current goal data
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        status: goal.status || 'active',
        target_date: goal.target_date || '',
        linked_initiatives: linkedInitiativesIds || []
      });
    }
  }, [open, goal, initiatives]);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setInitiativesDropdownOpen(false);
      }
    };

    // Add event listener when dropdown is open
    if (initiativesDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [initiativesDropdownOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Process form data before submitting
    const processedData = {
      ...formData,
      target_date: formData.target_date ? formData.target_date : undefined
    };
    
    onUpdate(processedData);
    setOpen(false);
  };

  // Handler for dialog open state changes (clicking outside will trigger this)
  const handleOpenChange = (newOpenState: boolean) => {
    console.log('Goal dialog state changing:', { current: open, new: newOpenState });
    setOpen(newOpenState);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(goal.id);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal={true}>
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
              <div className="relative">
                <div 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer"
                  onClick={() => {
                    // Toggle dropdown
                    setInitiativesDropdownOpen(!initiativesDropdownOpen);
                  }}
                >
                  <div className="flex flex-wrap gap-1">
                    {formData.linked_initiatives.length === 0 ? (
                      <span className="text-muted-foreground">Select initiatives to link</span>
                    ) : (
                      formData.linked_initiatives.map(id => {
                        const initiative = initiatives.find(i => i.id === id);
                        return initiative ? (
                          <span key={id} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-secondary text-secondary-foreground mb-1">
                            {initiative.title}
                            <button
                              className="ml-1 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Remove this initiative
                                setFormData(prev => ({
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
                
                {initiativesDropdownOpen && (
                  <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md" ref={dropdownRef}>
                    <div className="p-1">
                      {initiatives.map(initiative => {
                        const isSelected = formData.linked_initiatives.includes(initiative.id);
                        return (
                          <div
                            key={initiative.id}
                            className={`relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${isSelected ? 'bg-accent/50' : ''}`}
                            onClick={() => {
                              // Toggle this initiative
                              setFormData(prev => {
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
        <DialogFooter className="flex items-center justify-between">
          <div>
            {onDelete && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleDelete}
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
            <Button onClick={handleSubmit}>Update Goal</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 