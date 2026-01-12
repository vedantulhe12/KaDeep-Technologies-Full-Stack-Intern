import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProductImage, useImageLoader } from '@/components/product-image';
import { 
  Users, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  Plus, 
  Loader2,
  Edit,
  Trash2
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  inStock: boolean;
  stockCount: number;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface Order {
  id: string;
  sessionId: string;
  status: string;
  total: number;
  createdAt: string;
}

export function AdminPanel() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0 });
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    stockCount: ''
  });

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    stockCount: ''
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      // Fetch admin stats
      const statsResponse = await fetch('/api/admin/stats', { credentials: 'include' });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('Fetched stats:', statsData);
        // Ensure we have all required fields with proper fallbacks
        setStats({
          totalUsers: statsData.totalUsers || 0,
          totalProducts: statsData.totalProducts || 0,
          totalOrders: statsData.totalOrders || 0,
          totalRevenue: statsData.totalRevenue || 0
        });
      } else {
        console.error('Failed to fetch stats:', await statsResponse.text());
      }

      // Fetch products
      const productsResponse = await fetch('/api/admin/products', { credentials: 'include' });
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        console.log('Fetched products:', productsData);
        setProducts(productsData);
      } else {
        console.error('Failed to fetch products:', await productsResponse.text());
      }

      // Fetch users
      const usersResponse = await fetch('/api/admin/users', { credentials: 'include' });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      // Fetch orders
      const ordersResponse = await fetch('/api/admin/orders', { credentials: 'include' });
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(ordersData);
      }
    } catch (error) {
      setError('Failed to fetch admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stockCount: parseInt(newProduct.stockCount),
        inStock: parseInt(newProduct.stockCount) > 0,
        rating: 0,
        reviewCount: 0,
        isPrime: false,
        isFeatured: false,
        isDeal: false
      };

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const createdProduct = await response.json();
        console.log('Product created successfully:', createdProduct);
        setNewProduct({ name: '', description: '', price: '', category: '', imageUrl: '', stockCount: '' });
        fetchAdminData(); // Refresh data
      } else {
        const errorText = await response.text();
        console.error('Failed to create product:', errorText);
        setError('Failed to create product: ' + errorText);
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditProduct({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      imageUrl: product.imageUrl,
      stockCount: product.stockCount.toString()
    });
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    setIsLoading(true);
    setError('');

    try {
      const productData = {
        name: editProduct.name,
        description: editProduct.description,
        price: parseFloat(editProduct.price),
        category: editProduct.category,
        imageUrl: editProduct.imageUrl,
        stockCount: parseInt(editProduct.stockCount),
        inStock: parseInt(editProduct.stockCount) > 0
      };

      const response = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        console.log('Product updated successfully');
        setEditingProduct(null);
        setEditProduct({ name: '', description: '', price: '', category: '', imageUrl: '', stockCount: '' });
        fetchAdminData(); // Refresh data
      } else {
        const errorText = await response.text();
        console.error('Failed to update product:', errorText);
        setError('Failed to update product: ' + errorText);
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        console.log('Product deleted successfully');
        fetchAdminData(); // Refresh data
      } else {
        const errorText = await response.text();
        console.error('Failed to delete product:', errorText);
        setError('Failed to delete product: ' + errorText);
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive">
          <AlertDescription>Access denied. Admin privileges required.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.username}</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <Package className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="mr-2 h-5 w-5" />
                    Add New Product
                  </CardTitle>
                  <CardDescription>
                    <strong>Image URL Tips:</strong> Use direct image links (ending in .jpg, .png, .webp). 
                    Try free sources like <a href="https://unsplash.com" target="_blank" className="text-blue-600 hover:underline">Unsplash</a>, 
                    <a href="https://pixabay.com" target="_blank" className="text-blue-600 hover:underline mx-1">Pixabay</a>, or 
                    <a href="https://pexels.com" target="_blank" className="text-blue-600 hover:underline mx-1">Pexels</a>. 
                    Avoid Google Images as they often have CORS restrictions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="product-name">Product Name</Label>
                      <Input
                        id="product-name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="product-price">Price</Label>
                      <Input
                        id="product-price"
                        type="number"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="product-category">Category</Label>
                      <Input
                        id="product-category"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="product-stock">Stock Count</Label>
                      <Input
                        id="product-stock"
                        type="number"
                        value={newProduct.stockCount}
                        onChange={(e) => setNewProduct({ ...newProduct, stockCount: e.target.value })}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="product-description">Description</Label>
                      <Input
                        id="product-description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="product-image">Image URL</Label>
                      <Input
                        id="product-image"
                        type="url"
                        value={newProduct.imageUrl}
                        onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                        required
                      />
                      {newProduct.imageUrl && (
                        <div className="mt-2">
                          <Label>Preview:</Label>
                          <div className="w-32 h-32 border rounded-md overflow-hidden bg-muted">
                            <ProductImage
                              src={newProduct.imageUrl}
                              alt="Product preview"
                              className="w-full h-full object-cover"
                              showFallbackIcon={true}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Product
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>Manage your product inventory</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                              <ProductImage
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                showFallbackIcon={true}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>${product.price}</TableCell>
                          <TableCell>{product.stockCount}</TableCell>
                          <TableCell>
                            <Badge variant={product.inStock ? "default" : "destructive"}>
                              {product.inStock ? "In Stock" : "Out of Stock"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Edit Product Modal */}
              {editingProduct && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Edit className="mr-2 h-5 w-5" />
                      Edit Product: {editingProduct.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-product-name">Product Name</Label>
                        <Input
                          id="edit-product-name"
                          value={editProduct.name}
                          onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-product-price">Price</Label>
                        <Input
                          id="edit-product-price"
                          type="number"
                          step="0.01"
                          value={editProduct.price}
                          onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-product-category">Category</Label>
                        <Input
                          id="edit-product-category"
                          value={editProduct.category}
                          onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-product-stock">Stock Count</Label>
                        <Input
                          id="edit-product-stock"
                          type="number"
                          value={editProduct.stockCount}
                          onChange={(e) => setEditProduct({ ...editProduct, stockCount: e.target.value })}
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="edit-product-description">Description</Label>
                        <Input
                          id="edit-product-description"
                          value={editProduct.description}
                          onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="edit-product-image">Image URL</Label>
                        <Input
                          id="edit-product-image"
                          type="url"
                          value={editProduct.imageUrl}
                          onChange={(e) => setEditProduct({ ...editProduct, imageUrl: e.target.value })}
                          required
                        />
                        {editProduct.imageUrl && (
                          <div className="mt-2">
                            <Label>Preview:</Label>
                            <div className="w-32 h-32 border rounded-md overflow-hidden bg-muted">
                              <ProductImage
                                src={editProduct.imageUrl}
                                alt="Product preview"
                                className="w-full h-full object-cover"
                                showFallbackIcon={true}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="md:col-span-2 flex space-x-2">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Update Product
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setEditingProduct(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
                <CardDescription>View and manage customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>
                          <Badge>{order.status}</Badge>
                        </TableCell>
                        <TableCell>${order.total}</TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>Manage user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? "default" : "secondary"}>
                            {user.role}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}