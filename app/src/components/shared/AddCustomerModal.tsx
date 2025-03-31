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
import { FormItem, FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

type CustomerStatus = 'active' | 'inactive' | 'prospect';

type CustomerModalProps = {
  onSave: (customer: {
    name: string;
    revenue: string;
    status: CustomerStatus;
  }) => void;
  buttonLabel?: string;
};

export function AddCustomerModal({ 
  onSave, 
  buttonLabel = "Add Customer" 
}: CustomerModalProps) {
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState({
    name: '',
    revenue: '',
    status: 'active' as CustomerStatus
  });

  const handleChange = (field: string, value: string) => {
    setCustomer(prev => ({ ...prev, [field]: value }));
  };

  const handleRevenueChange = (value: string) => {
    // Only allow numeric input with decimals
    const formatted = value.replace(/[^0-9.]/g, '');
    handleChange('revenue', formatted);
  };

  const handleSubmit = () => {
    // Validate name field
    if (!customer.name.trim()) {
      alert('Customer name is required');
      return;
    }
    
    // Format the revenue as a dollar amount
    const formattedCustomer = {
      ...customer,
      revenue: customer.revenue ? 
        `$${parseFloat(customer.revenue).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : 
        "$0.00"
    };
    
    console.log('Formatted customer data before sending to parent:', formattedCustomer);
    onSave(formattedCustomer);
    
    // Reset form
    setCustomer({
      name: '',
      revenue: '',
      status: 'active' as CustomerStatus
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
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Add a new customer to your organization.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FormItem>
            <FormLabel htmlFor="name">Name</FormLabel>
            <Input 
              id="name" 
              value={customer.name} 
              onChange={(e) => handleChange('name', e.target.value)} 
              placeholder="E.g., Acme Corporation" 
            />
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="revenue">Revenue</FormLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <Input 
                id="revenue" 
                value={customer.revenue} 
                onChange={(e) => handleRevenueChange(e.target.value)}
                className="pl-7" 
                placeholder="0.00" 
              />
            </div>
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="status">Status</FormLabel>
            <Select 
              value={customer.status} 
              onValueChange={(value: CustomerStatus) => handleChange('status', value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active - Current paying customer</SelectItem>
                <SelectItem value="inactive">Inactive - Former customer</SelectItem>
                <SelectItem value="prospect">Prospect - Potential future customer</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Customer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 