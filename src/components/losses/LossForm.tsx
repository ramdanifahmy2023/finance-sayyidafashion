import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { IDRInput } from '@/components/ui/idr-input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface Loss {
  id: string;
  transaction_date: string;
  loss_type: string;
  description: string;
  amount: number;
}

interface LossFormProps {
  editingLoss: Loss | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const LOSS_TYPES = ['product_damage', 'theft', 'spoilage', 'return', 'other'];

const formatLossType = (type: string) => {
  switch (type) {
    case 'product_damage': return 'Kerusakan Produk';
    case 'theft': return 'Kehilangan/Pencurian';
    case 'spoilage': return 'Produk Rusak';
    case 'return': return 'Retur Pelanggan';
    case 'other': return 'Lainnya';
    default: return type;
  }
};

export function LossForm({ editingLoss, onSuccess, onCancel }: LossFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    transaction_date: editingLoss?.transaction_date || new Date().toISOString().split('T')[0],
    loss_type: editingLoss?.loss_type || '',
    amount: editingLoss?.amount.toString() || '',
    description: editingLoss?.description || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const lossData = {
        transaction_date: formData.transaction_date,
        loss_type: formData.loss_type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        user_id: user.id
      };

      if (editingLoss) {
        const { error } = await supabase
          .from('losses')
          .update(lossData)
          .eq('id', editingLoss.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Loss updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('losses')
          .insert([lossData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Loss added successfully"
        });
      }

      // Reset form for new entries
      if (!editingLoss) {
        setFormData({
          transaction_date: new Date().toISOString().split('T')[0],
          loss_type: '',
          amount: '',
          description: ''
        });
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('Error saving loss:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save loss",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingLoss ? 'Edit Loss' : 'Add New Loss'}</CardTitle>
        <CardDescription>
          {editingLoss ? 'Update loss information' : 'Enter loss details below'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transaction_date">Transaction Date</Label>
              <Input
                id="transaction_date"
                type="date"
                value={formData.transaction_date}
                onChange={(e) => setFormData(prev => ({ ...prev, transaction_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loss_type">Loss Type</Label>
              <Select 
                value={formData.loss_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, loss_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select loss type" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-lg z-50">
                  {LOSS_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatLossType(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <IDRInput
              label="Loss Amount (IDR)"
              value={formData.amount}
              onChange={(value) => setFormData(prev => ({ ...prev, amount: value }))}
              placeholder="Enter loss amount"
              required
            />

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the loss details..."
                rows={3}
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Saving...' : (editingLoss ? 'Update Loss' : 'Add Loss')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}