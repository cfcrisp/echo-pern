import * as React from "react"
import { X, Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "./badge"

export interface MultiSelectProps {
  children?: React.ReactNode
  value: string[]
  onValueChange: (value: string[]) => void
  className?: string
  placeholder?: string
}

export interface MultiSelectContentProps {
  children: React.ReactNode
  toggleValue?: (value: string) => void
  value?: string[]
  onClose?: () => void
}

export interface MultiSelectItemProps {
  children: React.ReactNode
  value: string
  toggleValue?: (value: string) => void
  isSelected?: boolean
  onClose?: () => void
}

export const MultiSelect = (props: MultiSelectProps) => {
  const { value, onValueChange, children, className, placeholder = "Select options..." } = props;
  
  // Create a controlled wrapper around the Select component
  const [open, setOpen] = React.useState(false);
  
  // Toggles a value in the selection
  const toggleValue = (val: string) => {
    const newValue = [...value];
    const index = newValue.indexOf(val);
    if (index === -1) {
      newValue.push(val);
    } else {
      newValue.splice(index, 1);
    }
    onValueChange(newValue);
  };
  
  return (
    <div className={cn("relative w-full", className)}>
      <div
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => setOpen(true)}
      >
        <div className="flex flex-wrap gap-1">
          {value.length === 0 && (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          {value.map((val) => (
            <Badge key={val} variant="secondary" className="mb-1">
              {val}
              <button
                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleValue(val);
                }}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
        </div>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>
      
      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="p-1">
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child as React.ReactElement, {
                  toggleValue,
                  value,
                  onClose: () => setOpen(false),
                });
              }
              return child;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const MultiSelectContent = ({ children, toggleValue, value, onClose }: MultiSelectContentProps) => {
  return (
    <div className="py-1">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement, {
            toggleValue,
            isSelected: value?.includes((child as any).props.value),
            onClose,
          });
        }
        return child;
      })}
    </div>
  );
};

export const MultiSelectItem = ({ 
  children, 
  value, 
  toggleValue, 
  isSelected, 
  onClose 
}: MultiSelectItemProps) => {
  const handleClick = () => {
    if (toggleValue) {
      toggleValue(value);
    }
  };
  
  return (
    <div
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        isSelected ? "bg-accent/50" : ""
      )}
      onClick={handleClick}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  );
};

MultiSelectItem.displayName = "MultiSelectItem";
MultiSelectContent.displayName = "MultiSelectContent";
MultiSelect.displayName = "MultiSelect"; 