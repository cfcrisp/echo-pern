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
import { FormItem, FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

type CustomerStatus = 'active' | 'inactive' | 'prospect';

export type Customer = {
  id: string;
  name: string;
  revenue: string;
  status: CustomerStatus;
};

type EditCustomerModalProps = {
  customer: Customer;
  onUpdate: (id: string, updatedCustomer: {
    name: string;
    revenue: string;
    status: CustomerStatus;
  }) => void;
  triggerButtonSize?: 'default' | 'sm' | 'lg' | 'icon';
};

export function EditCustomerModal({ customer, onUpdate, triggerButtonSize = 'default' }: EditCustomerModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    revenue: '',
    status: 'active' as CustomerStatus
  });

  // Initialize form with customer data when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: customer.name,
        revenue: customer.revenue,
        status: customer.status
      });
    }
  }, [open, customer]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onUpdate(customer.id, formData);
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
            Edit Customer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogDescription>
            Make changes to the customer "{customer.name}".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FormItem>
            <FormLabel htmlFor="name">Name</FormLabel>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => handleChange('name', e.target.value)} 
              placeholder="E.g., Acme Corp" 
            />
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="revenue">Annual Revenue</FormLabel>
            <Input 
              id="revenue" 
              value={formData.revenue} 
              onChange={(e) => handleChange('revenue', e.target.value)} 
              placeholder="E.g., $100,000" 
            />
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="status">Status</FormLabel>
            <Select 
              value={formData.status} 
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
          <Button onClick={handleSubmit}>Update Customer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 