'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Package, Truck, Plus, Search, Trash2, Edit, TrendingUp, Users, DollarSign, CheckCircle, Clock, XCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Modal } from "@/components/ui/Modal"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Order {
  id: string
  quantity: number
  status: string
  user_id: string
  created_at: string
  total_price?: number
  products: {
    name: string
    image_url: string
    sale_price: number
    wholesale_price?: number
  }
  shipping_name?: string
  shipping_phone?: string
  shipping_address?: string
  shipping_city?: string
  shipping_state?: string

  shipping_pincode?: string
  email?: string
  product_id: string
}

interface Product {
  product_id: string
  name: string
  description: string
  category: string
  actual_price: number
  wholesale_price?: number
  sale_price: number
  image_url: string
  return_available: boolean
  stock_status?: string
  average_rating?: number
  total_reviews?: number
}


interface ProductForm {
  product_id: string
  name: string
  description: string
  category: string
  actual_price: string
  wholesale_price: string
  sale_price: string
  image_url: string
  return_available: boolean
  stock_status?: string
  initial_rating: string
  initial_reviews_count: string
  review_images: string
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  // Review Seeding State
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false)
  const [reviewForm, setReviewForm] = useState({ reviewer_name: "", rating: 5, comment: "", image_url: "" })

  const [view, setView] = useState<'orders' | 'products'>('orders')

  // Order Filtering & Sorting State
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  // Product Form State
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState<ProductForm>({
    product_id: "",
    name: "",
    description: "",
    category: "",
    actual_price: "",
    wholesale_price: "",
    sale_price: "",
    image_url: "",
    return_available: true,
    stock_status: "in_stock",
    initial_rating: "4.5",
    initial_reviews_count: "10",
    review_images: ""
  })

  // Cancel Confirmation State
  const [cancelModal, setCancelModal] = useState<{ isOpen: boolean, order: Order | null }>({ isOpen: false, order: null })

  // Delete Confirmation State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean, productId: string | null }>({ isOpen: false, productId: null })

  // ⭐ CHANGE THIS TO YOUR GOOGLE EMAIL
  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL

  const fetchData = async () => {
    setLoading(true)
    await Promise.all([fetchOrders(), fetchProducts()])
    setLoading(false)
  }

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        quantity,
        status,
        user_id,
        created_at,
        total_price,
        shipping_name,
        shipping_phone,
        shipping_address,
        shipping_city,
        shipping_state,
        shipping_state,
        shipping_pincode,
        email,
        product_id,
        products (
          name,
          image_url,
          sale_price,
          wholesale_price
        )
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setOrders(data as unknown as Order[])
    }
  }

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setProducts(data)
    }
  }

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        await supabase.auth.signInWithOAuth({ provider: 'google' })
        return
      }
      setUser(session.user)
      if (session.user.email !== ADMIN_EMAIL) {
        toast.error("Access Denied", { description: "This account is not authorized for admin access." })
        setTimeout(() => window.location.href = "/", 2000)
        return
      }
      fetchData()
    }
    checkAdmin()

    // Realtime subscription for Admin Dashboard
    const channel = supabase
      .channel('admin-dashboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log("Admin: Order change detected", payload)
          if (payload.eventType === 'INSERT') {
            toast.success("New Order Received! 🚀")
          }
          fetchOrders()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          console.log("Admin: Product change detected")
          fetchProducts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const updateOrderStatus = async (order: Order, newStatus: string) => {
    // 1. Check for Cancellation Restriction (Cannot cancel if Delivered)
    if (newStatus === 'cancelled') {
      if (order.status === 'delivered') {
        toast.error("Action Denied", { description: "You cannot cancel an order that has already been delivered." })
        return
      }

      // Open Custom Modal instead of window.confirm
      setCancelModal({ isOpen: true, order: order })
      return
    }

    // Standard Forward Flow Logic for non-cancelled updates
    const statusOrder = ['pending', 'ordered', 'shipped', 'delivered']
    const oldIndex = statusOrder.indexOf(order.status)
    const newIndex = statusOrder.indexOf(newStatus)

    if (order.status === 'cancelled') {
      toast.error("Order is Cancelled", { description: "You cannot reactivate a cancelled order." })
      return
    }

    if (newIndex <= oldIndex) {
      toast.error("Cannot revert order status", {
        description: "Orders must move forward (Pending → Ordered → Shipped → Delivered)"
      })
      return
    }

    executeStatusUpdate(order, newStatus)
  }

  // Extracted function to execute the update (used by Modal and direct select)
  const executeStatusUpdate = async (order: Order, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', order.id)

    if (!error) {
      fetchOrders()
      toast.success(newStatus === 'cancelled' ? "Order cancelled" : "Order status updated")

      // Send Confirmation Email if status changed to 'ordered'
      if (newStatus === 'ordered' && order.status !== 'ordered' && order.email) {
        fetch('/api/emails/order-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: order.shipping_name || "Customer",
            customerEmail: order.email,
            orderId: order.id,
            totalAmount: order.total_price || 0,
            products: [{
              name: order.products.name,
              id: order.product_id || "N/A",
              image_url: order.products.image_url,
              quantity: order.quantity || 1,
              price: order.products.sale_price || 0
            }]
          })
        }).then(() => toast.success("Confirmation email sent to customer"))
          .catch(err => console.error("Failed to send confirmation email", err))
      }

      // Send Delivered Email if status changed to 'delivered'
      if (newStatus === 'delivered' && order.status !== 'delivered' && order.email) {
        fetch('/api/emails/order-delivered', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: order.shipping_name || "Customer",
            customerEmail: order.email,
            orderId: order.id,
            products: [{
              name: order.products.name,
              id: order.product_id || "N/A",
              image_url: order.products.image_url
            }]
          })
        }).then(() => toast.success("Delivered email sent to customer"))
          .catch(err => console.error("Failed to send delivered email", err))
      }

      // Send Cancelled Email
      if (newStatus === 'cancelled' && order.status !== 'cancelled' && order.email) {
        fetch('/api/emails/order-cancelled', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: order.shipping_name || "Customer",
            customerEmail: order.email,
            orderId: order.id,
            products: [{
              name: order.products.name,
              id: order.product_id || "N/A",
              image_url: order.products.image_url
            }]
          })
        }).then(() => toast.success("Cancellation email sent"))
          .catch(err => console.error("Email failed"))
      }

    } else {
      toast.error("Failed to update status", { description: error.message })
    }
  }

  // Handler for Modal Confirmation
  const confirmCancellation = () => {
    if (cancelModal.order) {
      executeStatusUpdate(cancelModal.order, 'cancelled')
      setCancelModal({ isOpen: false, order: null })
    }
  }

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productForm.category) {
      toast.warning("Please select a category")
      return
    }

    const payload: any = {
      name: productForm.name,
      description: productForm.description,
      category: productForm.category,
      actual_price: parseFloat(productForm.actual_price),
      wholesale_price: parseFloat(productForm.wholesale_price) || 0,
      sale_price: parseFloat(productForm.sale_price),
      image_url: productForm.image_url,
      return_available: productForm.return_available,
      stock_status: productForm.stock_status
    }

    if (currentProduct) {
      // Update
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('product_id', currentProduct.product_id)

      if (!error) {
        toast.success("Product updated successfully")
        setIsEditProductOpen(false)
        fetchProducts()
      } else {
        toast.error("Update failed", { description: error.message })
      }
    } else {
      // Create with Manual ID and Initial Stats
      if (!productForm.product_id) {
        toast.warning("Product ID is required")
        return
      }
      payload.product_id = productForm.product_id
      payload.average_rating = parseFloat(productForm.initial_rating) || 0
      payload.total_reviews = parseInt(productForm.initial_reviews_count) || 0

      const { error } = await supabase.from('products').insert(payload)

      if (!error) {
        // Handle Review Seeding if images provided
        if (productForm.review_images) {
          const imageUrls = productForm.review_images.split('\n').map(s => s.trim()).filter(Boolean)
          const reviewsToInsert = imageUrls.map(url => ({
            product_id: productForm.product_id,
            reviewer_name: "Buynic Customer",
            rating: Math.min(5, Math.max(1, parseFloat(productForm.initial_rating))), // Use initial rating
            comment: "Great product!",
            review_image_url: url,
            verified_purchase: true
          }))

          if (reviewsToInsert.length > 0) {
            await supabase.from('reviews').insert(reviewsToInsert)
          }
        }

        toast.success("Product added successfully!")
        setIsAddProductOpen(false)
        fetchProducts()
      } else {
        toast.error("Creation failed", { description: error.message })
      }
    }

    // Reset form
    if (!currentProduct && !isEditProductOpen) {
      setProductForm({
        product_id: "",
        name: "",
        description: "",
        category: "",
        actual_price: "",
        wholesale_price: "",
        sale_price: "",
        image_url: "",
        return_available: true,
        stock_status: "in_stock",
        initial_rating: "4.5",
        initial_reviews_count: "10",
        review_images: ""
      })
    }
  }

  const openEditModal = (product: Product) => {
    setCurrentProduct(product)
    setProductForm({
      product_id: product.product_id, // Read-only in edit
      name: product.name,
      description: product.description || "",
      category: product.category || "",
      actual_price: product.actual_price.toString(),
      wholesale_price: (product.wholesale_price || "").toString(),
      sale_price: product.sale_price.toString(),
      image_url: product.image_url || "",
      return_available: product.return_available ?? true,
      stock_status: product.stock_status || "in_stock",
      initial_rating: "0", // Not used for edit
      initial_reviews_count: "0", // Not used for edit
      review_images: ""
    })
    setIsEditProductOpen(true)
  }

  const handleDeleteProductClick = (id: string) => {
    setDeleteConfirmation({ isOpen: true, productId: id })
  }

  const confirmDeleteProduct = async () => {
    if (!deleteConfirmation.productId) return

    const { error } = await supabase.from('products').delete().eq('product_id', deleteConfirmation.productId)
    if (!error) {
      toast.success("Product deleted successfully")
      fetchProducts()
    } else {
      toast.error("Delete failed", { description: error.message })
    }
    setDeleteConfirmation({ isOpen: false, productId: null })
  }

  const stats = [
    { name: 'Total Orders', value: orders.filter(o => o.status !== 'cancelled').length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Total Products', value: products.length, icon: Search, color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length, icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
    { name: 'Revenue', value: `₹${orders.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + (o.total_price || (o.products?.sale_price * o.quantity) || 0), 0).toLocaleString()}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
    {
      name: 'Total Profit', value: `₹${orders.filter(o => o.status !== 'cancelled').reduce((acc, o) => {
        const sale = (o.total_price || (o.products?.sale_price * o.quantity) || 0);
        const cost = (o.products?.wholesale_price || 0) * o.quantity;
        return acc + (sale - cost);
      }, 0).toLocaleString()}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100'
    },
  ]

  const predefinedCategories = ["Electronics", "Fashion", "Home", "Beauty", "Sports"]

  if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div></div>

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentProduct) return

    // Admin seeds review manually - updates Rating too
    // New logic: Weighted Average Update
    const currentRating = currentProduct.average_rating || 0 // Assuming we add this to Product type or fetch it
    const currentReviews = currentProduct.total_reviews || 0 // Assuming we add this to Product type or fetch it
    const newRatingVal = reviewForm.rating

    const newTotalReviews = currentReviews + 1
    const newAverageRating = ((currentRating * currentReviews) + newRatingVal) / newTotalReviews

    const { error } = await supabase
      .from('reviews')
      .insert({
        product_id: currentProduct.product_id,
        reviewer_name: reviewForm.reviewer_name,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        review_image_url: reviewForm.image_url,
        verified_purchase: false // Admin seeded
      })

    if (error) {
      toast.error("Failed to add review", { description: error.message })
    } else {
      // Update Product stats
      await supabase.from('products').update({
        average_rating: newAverageRating,
        total_reviews: newTotalReviews
      }).eq('product_id', currentProduct.product_id)

      toast.success("Review added manually!")
      setIsAddReviewOpen(false)
      setReviewForm({ reviewer_name: "", rating: 5, comment: "", image_url: "" })
      fetchProducts() // Refresh to see new rating
    }
  }

  const filteredOrders = orders
    .filter(order => statusFilter === 'all' || order.status === statusFilter)
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })

  return (
    <main className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage orders and products</p>
          </div>
          <div className="flex gap-3">
            <Button variant={view === 'orders' ? 'default' : 'outline'} onClick={() => setView('orders')}>Orders</Button>
            <Button variant={view === 'products' ? 'default' : 'outline'} onClick={() => setView('products')}>Products</Button>
            <Button onClick={() => { setCurrentProduct(null); setIsAddProductOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.name} className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center">
                <div className={cn("p-3 rounded-lg mr-4", stat.bg)}>
                  <Icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            )
          })}
        </div>

        {view === 'orders' ? (
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-secondary/50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
              <div className="flex gap-2">
                <select
                  className="text-sm border-border rounded-md shadow-sm focus:border-primary focus:ring-primary bg-background text-foreground py-1.5 pl-3 pr-8"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="ordered">Ordered</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
                <select
                  className="text-sm border-border rounded-md shadow-sm focus:border-primary focus:ring-primary bg-background text-foreground py-1.5 pl-3 pr-8"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
            <div className="divide-y divide-border">
              {filteredOrders.map((order) => {
                const total = order.total_price || ((order.products?.sale_price || 0) * order.quantity)
                return (
                  <div key={order.id} className="p-6 flex flex-col gap-4 hover:bg-secondary/50 transition">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                      <div className="flex-shrink-0">
                        <img
                          src={order.products?.image_url || "https://via.placeholder.com/100"}
                          alt={order.products?.name}
                          className="h-16 w-16 object-cover rounded-md border border-border"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-purple-600 truncate">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <h3 className="text-base font-semibold text-foreground mt-1">{order.products?.name}</h3>
                        <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Qty: {order.quantity}</span>
                          <span>Total: ₹{total}</span>
                          <span>{order.shipping_name && `• ${order.shipping_name}`}</span>
                        </div>
                      </div>
                      <div className="w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end gap-3">
                        <span className={cn("px-3 py-1 rounded-full text-xs font-medium capitalize", statusColor(order.status))}>
                          {order.status}
                        </span>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order, e.target.value)}
                          className="text-sm border-border rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-background text-foreground py-1 pl-2 pr-7"
                        >
                          <option value="pending">Pending</option>
                          <option value="ordered">Ordered</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled" disabled={order.status === 'delivered'}>Cancelled</option>
                        </select>
                      </div>
                    </div>
                    {/* Expanded Address Details */}
                    {order.shipping_address && (
                      <div className="mt-2 pt-3 border-t border-border text-sm text-muted-foreground bg-secondary/30 p-3 rounded-md">
                        <p className="font-semibold text-foreground mb-1 flex items-center gap-2"><Truck className="h-3 w-3" /> Delivery Details:</p>
                        <p>{order.shipping_name} | {order.shipping_phone}</p>
                        <p>{order.shipping_address}, {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</p>
                      </div>
                    )}
                  </div>
                )
              })}
              {filteredOrders.length === 0 && <div className="p-10 text-center text-muted-foreground">No orders found.</div>}
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-secondary/50">
              <h2 className="text-lg font-semibold text-foreground">Products Inventory</h2>
            </div>
            <div className="divide-y divide-border">
              {products.map((product) => (
                <div key={product.product_id} className="p-6 flex items-center justify-between hover:bg-secondary/50 transition">
                  <div className="flex items-center gap-4">
                    <img src={product.image_url || "https://via.placeholder.com/100"} className="h-16 w-16 object-cover rounded-md border border-border" />
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.category} • ₹{product.sale_price}</p>
                      <p className="text-xs text-muted-foreground">ID: {product.product_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => { setCurrentProduct(product); setIsAddReviewOpen(true); }}><TrendingUp className="h-4 w-4 text-yellow-500" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(product)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 dark:hover:text-red-400" onClick={() => handleDeleteProductClick(product.product_id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
              {products.length === 0 && <div className="p-10 text-center text-muted-foreground">No products found.</div>}
            </div>
          </div>
        )}

      </div>

      {/* Cancel Order Confirmation Modal */}
      <Modal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, order: null })}
        title="Confirm Cancellation"
        className="sm:max-w-md"
      >
        <div className="py-2">
          <p className="text-muted-foreground mb-6">
            Are you sure you want to <strong>CANCEL</strong> this order?
            <br />
            This action will notify the customer immediately and cannot be undone from the dashboard.
          </p>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setCancelModal({ isOpen: false, order: null })}
            >
              No, Keep Order
            </Button>
            <Button
              variant="default"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmCancellation}
            >
              Yes, Cancel Order
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Review Modal */}
      <Modal
        isOpen={isAddReviewOpen}
        onClose={() => setIsAddReviewOpen(false)}
        title="Seed Review"
      >
        <form onSubmit={handleAddReview} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto px-1">
          <div className="space-y-2">
            <label className="text-sm font-medium">Reviewer Name</label>
            <Input
              required
              value={reviewForm.reviewer_name}
              onChange={e => setReviewForm({ ...reviewForm, reviewer_name: e.target.value })}
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rating (1-5)</label>
            <Input
              type="number"
              min={1}
              max={5}
              step="0.1"
              required
              value={reviewForm.rating}
              onChange={e => setReviewForm({ ...reviewForm, rating: parseFloat(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Comment</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={reviewForm.comment}
              onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
              placeholder="Review text..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Image URL (Optional)</label>
            <Input
              value={reviewForm.image_url}
              onChange={e => setReviewForm({ ...reviewForm, image_url: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsAddReviewOpen(false)}>Cancel</Button>
            <Button type="submit">Add Review</Button>
          </div>
        </form>
      </Modal>

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={isAddProductOpen || isEditProductOpen}
        onClose={() => { setIsAddProductOpen(false); setIsEditProductOpen(false); setCurrentProduct(null); }}
        title={currentProduct ? "Edit Product" : "Add New Product"}
        className="sm:max-w-[600px]"
      >
        <form onSubmit={handleProductSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
          <div className="space-y-2">
            <label className="text-sm font-medium">Product ID (Unique)</label>
            <Input
              required
              disabled={!!currentProduct}
              value={productForm.product_id}
              onChange={e => setProductForm({ ...productForm, product_id: e.target.value })}
              placeholder="e.g. NIKE-AIR-001"
              className="uppercase"
            />
            {currentProduct && <p className="text-xs text-muted-foreground">ID cannot be changed after creation.</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Name</label>
              <Input
                required
                value={productForm.name}
                onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                placeholder="Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={productForm.category}
                onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                required
              >
                <option value="">Select Category</option>
                {predefinedCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={productForm.description}
              onChange={e => setProductForm({ ...productForm, description: e.target.value })}
              placeholder="Details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Actual Price (₹)</label>
              <Input type="number" required value={productForm.actual_price} onChange={e => setProductForm({ ...productForm, actual_price: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sale Price (₹)</label>
              <Input type="number" required value={productForm.sale_price} onChange={e => setProductForm({ ...productForm, sale_price: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Wholesale Price (₹)</label>
              <Input type="number" value={productForm.wholesale_price} onChange={e => setProductForm({ ...productForm, wholesale_price: e.target.value })} />
            </div>
            <div className="space-y-2 flex items-end pb-2">
              <div className={cn("text-sm font-medium px-3 py-2 rounded-md w-full",
                (parseFloat(productForm.sale_price) - (parseFloat(productForm.wholesale_price) || 0)) > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              )}>
                Profit: ₹{(parseFloat(productForm.sale_price) - (parseFloat(productForm.wholesale_price) || 0)).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Image URL</label>
            <Input type="url" required value={productForm.image_url} onChange={e => setProductForm({ ...productForm, image_url: e.target.value })} />
          </div>

          {/* New Fields for Seeding - visible only on ADD */}
          {!currentProduct && (
            <div className="bg-secondary/50 p-4 rounded-md space-y-4 border border-border">
              <h4 className="font-semibold text-sm">Rating Seeding (Optional)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Initial Rating (1-5)</label>
                  <Input type="number" step="0.1" value={productForm.initial_rating} onChange={e => setProductForm({ ...productForm, initial_rating: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Review Count</label>
                  <Input type="number" value={productForm.initial_reviews_count} onChange={e => setProductForm({ ...productForm, initial_reviews_count: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Seed Review Images (One URL per line)</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={productForm.review_images}
                  onChange={e => setProductForm({ ...productForm, review_images: e.target.value })}
                  placeholder="https://example.com/review1.jpg&#10;https://example.com/review2.jpg"
                />
                <p className="text-xs text-muted-foreground">Will create dummy 'Buynic Customer' reviews with these images.</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary"
              checked={productForm.return_available}
              onChange={e => setProductForm({ ...productForm, return_available: e.target.checked })}
            />
            <label className="text-sm font-medium">Return Available</label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Stock Status</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={productForm.stock_status}
              onChange={e => setProductForm({ ...productForm, stock_status: e.target.value })}
            >
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="fast_selling">Fast Selling</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => { setIsAddProductOpen(false); setIsEditProductOpen(false); }}>Cancel</Button>
            <Button type="submit">{currentProduct ? "Update Product" : "Add Product"}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, productId: null })}
        title="Delete Product"
      >
        <div className="py-4 space-y-4">
          <p className="text-muted-foreground">
            Are you sure you want to delete this product? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteConfirmation({ isOpen: false, productId: null })}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmDeleteProduct}
            >
              Delete Product
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  )
}

function statusColor(status: string) {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'ordered': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400'
  }
}
