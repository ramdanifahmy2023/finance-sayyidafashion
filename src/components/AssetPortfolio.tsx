import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CurrencyInput } from '@/components/ui/currency-input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Edit, Trash2, TrendingUp, Wallet, CreditCard } from 'lucide-react';

interface Asset {
  id: string;
  type: 'asset' | 'liability';
  category: string;
  name: string;
  current_value: number;
  initial_price: number;
}

const ASSET_CATEGORIES = ['emas', 'kripto', 'kendaraan', 'properti', 'elektronik', 'lainnya'];
const LIABILITY_CATEGORIES = ['hutang_bank', 'cicilan_kendaraan', 'pinjaman_pribadi', 'lainnya'];

export function AssetPortfolio() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    type: 'asset' as 'asset' | 'liability',
    category: '',
    name: '',
    current_value: '',
    initial_price: ''
  });

  useEffect(() => {
    if (user) {
      loadAssets();
    }
  }, [user]);

  const loadAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets((data || []) as Asset[]);
    } catch (error) {
      console.error('Error loading assets:', error);
      toast({
        title: "Error",
        description: "Failed to load assets data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'asset',
      category: '',
      name: '',
      current_value: '',
      initial_price: ''
    });
    setEditingAsset(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const assetData = {
        type: formData.type,
        category: formData.category,
        name: formData.name,
        current_value: parseFloat(formData.current_value),
        initial_price: parseFloat(formData.initial_price),
        user_id: user.id
      };

      if (editingAsset) {
        const { error } = await supabase
          .from('assets')
          .update(assetData)
          .eq('id', editingAsset.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Asset updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('assets')
          .insert([assetData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Asset added successfully"
        });
      }

      resetForm();
      loadAssets();
    } catch (error: any) {
      console.error('Error saving asset:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save asset",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (asset: Asset) => {
    setFormData({
      type: asset.type,
      category: asset.category,
      name: asset.name,
      current_value: asset.current_value.toString(),
      initial_price: asset.initial_price.toString()
    });
    setEditingAsset(asset);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Asset deleted successfully"
      });
      
      loadAssets();
    } catch (error: any) {
      console.error('Error deleting asset:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete asset",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCategoryColor = (type: 'asset' | 'liability', category: string) => {
    if (type === 'asset') {
      switch(category) {
        case 'emas': return 'bg-yellow-100 text-yellow-800';
        case 'kripto': return 'bg-blue-100 text-blue-800';
        case 'kendaraan': return 'bg-green-100 text-green-800';
        case 'properti': return 'bg-purple-100 text-purple-800';
        case 'elektronik': return 'bg-orange-100 text-orange-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    } else {
      return 'bg-red-100 text-red-800';
    }
  };

  // Calculate totals
  const totalAssets = assets.filter(a => a.type === 'asset').reduce((sum, asset) => sum + asset.current_value, 0);
  const totalLiabilities = assets.filter(a => a.type === 'liability').reduce((sum, asset) => sum + asset.current_value, 0);
  const netWorth = totalAssets - totalLiabilities;

  const availableCategories = formData.type === 'asset' ? ASSET_CATEGORIES : LIABILITY_CATEGORIES;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Asset Portfolio</h1>
          <p className="text-muted-foreground mt-1">Manage your assets and liabilities</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)} 
          className="bg-primary hover:bg-primary-dark"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-success-light rounded-lg">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Assets</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(totalAssets)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-destructive-light rounded-lg">
                <CreditCard className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Liabilities</p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(totalLiabilities)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-light rounded-lg">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Worth</p>
                <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(netWorth)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</CardTitle>
            <CardDescription>
              {editingAsset ? 'Update asset information' : 'Enter asset details below'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: 'asset' | 'liability') => {
                      setFormData(prev => ({ ...prev, type: value, category: '' }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-lg z-50">
                      <SelectItem value="asset">Asset</SelectItem>
                      <SelectItem value="liability">Liability</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-lg z-50">
                      {availableCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {formatCategory(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Asset Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter asset name"
                    required
                  />
                </div>

                <CurrencyInput
                  label="Nilai Saat Ini (IDR)"
                  value={formData.current_value}
                  onChange={(value) => setFormData(prev => ({ ...prev, current_value: value }))}
                  placeholder="100.000"
                  required
                />

                <div className="md:col-span-2">
                  <CurrencyInput
                    label="Harga Beli Awal (IDR)"
                    value={formData.initial_price}
                    onChange={(value) => setFormData(prev => ({ ...prev, initial_price: value }))}
                    placeholder="80.000"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (editingAsset ? 'Update Asset' : 'Add Asset')}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
          <CardDescription>All your assets and liabilities</CardDescription>
        </CardHeader>
        <CardContent>
          {assets.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No assets recorded yet</p>
              <Button 
                onClick={() => setShowForm(true)} 
                variant="outline" 
                className="mt-4"
              >
                Add Your First Asset
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Current Value</TableHead>
                    <TableHead>Initial Price</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => {
                    const change = asset.current_value - asset.initial_price;
                    const changePercent = asset.initial_price > 0 ? (change / asset.initial_price) * 100 : 0;
                    
                    return (
                      <TableRow key={asset.id}>
                        <TableCell>
                          <Badge variant={asset.type === 'asset' ? 'default' : 'destructive'}>
                            {asset.type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(asset.type, asset.category)}>
                            {formatCategory(asset.category)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{asset.name}</TableCell>
                        <TableCell>{formatCurrency(asset.current_value)}</TableCell>
                        <TableCell>{formatCurrency(asset.initial_price)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className={change >= 0 ? 'text-success' : 'text-destructive'}>
                              {change >= 0 ? '+' : ''}{formatCurrency(change)}
                            </span>
                            <span className={`text-xs ${change >= 0 ? 'text-success' : 'text-destructive'}`}>
                              ({change >= 0 ? '+' : ''}{changePercent.toFixed(1)}%)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(asset)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(asset.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}