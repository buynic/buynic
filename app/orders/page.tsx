'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
// import { User } from "@supabase/supabase-js" // Remove unused import
import { Check, Clock, Package, Truck, Star, Trash2 } from "lucide-react" // Added Trash2
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { Input } from "@/components/ui/Input"

interface Order {
  id: string
  quantity: number
  status: string
  created_at: string
  product_id: string
  total_price?: number // Use saved total or calc
  products: {
    name: string
    image_url: string
    sale_price: number
  }
}

export default function OrdersPage() {
  // ... (State remains same) ...
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // ... (Review Modal State remains same) ...
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "", image_url: "" })
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean, order: Order | null }>({ isOpen: false, order: null })

  const fetchOrders = async (userId: string) => {
    // ... (fetchOrder implementation remains same) ...
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        quantity,
        status,
        created_at,
        total_price,
        product_id,
        products (
          name,
          image_url,
          sale_price
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setOrders(data as unknown as Order[])
    }
    setLoading(false)
  }

  // New Cancel Handler
  const handleCancelOrder = (order: Order) => {
    if (order.status === 'pending') {
      setDeleteConfirmation({ isOpen: true, order })
    } else {
      toast.error("Cannot cancel this order", {
        description: "Please request cancellation with the delivery partner."
      })
    }
  }

  const confirmDeleteOrder = async () => {
    if (!deleteConfirmation.order) return

    const { error } = await supabase.from('orders').delete().eq('id', deleteConfirmation.order.id)

    if (error) {
      toast.error("Failed to cancel order", { description: error.message })
    } else {
      toast.success("Order cancelled and removed successfully")
      if (user) fetchOrders(user.id)
    }
    setDeleteConfirmation({ isOpen: false, order: null })
  }

  // ... (Review handlers remain same) ...
  const openReviewModal = (order: Order) => {
    // ...
    setSelectedOrder(order)
    setReviewForm({ rating: 5, comment: "", image_url: "" })
    setIsReviewModalOpen(true)
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    // ... (implementation same as before) ...
    e.preventDefault()
    if (!selectedOrder || !user) return

    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('product_id', selectedOrder.product_id)
      .eq('user_id', user.id)
      .single()

    if (existingReview) {
      toast.error("You have already reviewed this product.")
      setIsReviewModalOpen(false)
      return
    }

    // 2. Fetch current product stats for calculation
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('average_rating, total_reviews')
      .eq('product_id', selectedOrder.product_id)
      .single()

    if (productError || !productData) {
      console.error("Error fetching product stats:", productError)
      toast.error("Failed to submit review. Please try again.")
      return
    }

    const currentRating = productData.average_rating || 0
    const currentReviews = productData.total_reviews || 0
    const newRating = reviewForm.rating

    // 3. Insert Review
    const { error } = await supabase
      .from('reviews')
      .insert({
        product_id: selectedOrder.product_id,
        user_id: user.id,
        reviewer_name: user.user_metadata?.full_name || "Verified Customer",
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        review_image_url: reviewForm.image_url,
        verified_purchase: true
      })

    if (error) {
      console.error(error)
      toast.error("Failed to submit review: " + error.message)
    } else {
      // 4. Update Product Stats
      const newTotalReviews = currentReviews + 1
      const newAverageRating = ((currentRating * currentReviews) + newRating) / newTotalReviews

      await supabase.from('products').update({
        average_rating: newAverageRating,
        total_reviews: newTotalReviews
      }).eq('product_id', selectedOrder.product_id)

      toast.success("Review submitted successfully!")
      setIsReviewModalOpen(false)
    }
  }

  // ... (useEffect remains same) ...
  useEffect(() => {
    const loadOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = "/"
        return
      }
      setUser(session.user)
      fetchOrders(session.user.id)
    }
    loadOrders()
  }, [])

  // ... (Realtime effect remains same) ...
  // Realtime effect
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log("Order update received:", payload)
          if (payload.eventType === 'UPDATE') {
            toast.info(`Order status updated: ${payload.new.status}`)
          }
          fetchOrders(user.id)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user])

  // ... (Helpers remain same) ...
  const getStatusStep = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 1
      case 'ordered': return 2
      case 'shipped': return 3
      case 'delivered': return 4
      default: return 1
    }
  }

  const steps = [
    { name: 'Order Placed', icon: Clock },
    { name: 'Processing', icon: Package },
    { name: 'Shipped', icon: Truck },
    { name: 'Delivered', icon: Check },
  ]

  if (loading) {
    // ...
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 max-w-4xl mx-auto space-y-6">
        <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        {[1, 2].map(i => (
          <div key={i} className="bg-white p-6 rounded-xl h-40 animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Orders</h1>
          <p className="text-muted-foreground mt-1">Track and manage your recent purchases</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-border shadow-sm">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground">No orders yet</h3>
            <p className="text-muted-foreground mt-1">Start shopping to see your orders here.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => {
              const currentStep = getStatusStep(order.status)
              const price = order.total_price || (order.products?.sale_price * order.quantity) || 0

              return (
                <div key={order.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="flex-shrink-0">
                        <img
                          src={order.products?.image_url || "https://via.placeholder.com/150"}
                          alt={order.products?.name}
                          className="h-24 w-24 rounded-lg object-cover border border-border"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">{order.products?.name}</h3>
                            <div className="flex flex-col mt-1">
                              <p className="text-sm text-muted-foreground">Ordered on {new Date(order.created_at).toLocaleDateString()}</p>
                              {(order.status === 'ordered' || order.status === 'shipped') && (
                                <p className="text-sm font-medium text-emerald-600 mt-1">
                                  Expected delivery: on or before {new Date(new Date(order.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Price & Delete Action */}
                          <div className="flex flex-col items-end gap-2">
                            <p className="text-lg font-bold text-foreground">₹{price}</p>

                            <button
                              onClick={() => handleCancelOrder(order)}
                              className={cn(
                                "p-2 rounded-full transition-colors",
                                order.status === 'pending'
                                  ? "text-red-500 hover:bg-destructive/10"
                                  : "text-muted-foreground/30 cursor-not-allowed hover:text-muted-foreground/50"
                              )}
                              title={order.status === 'pending' ? "Cancel Order" : "Cannot cancel this order"}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>

                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          Quantity: <span className="font-medium text-foreground">{order.quantity}</span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="mt-8 relative">
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-secondary -translate-y-1/2 rounded-full" />
                      <div
                        className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                      />
                      <div className="relative flex justify-between">
                        {steps.map((step, index) => {
                          const isCompleted = index + 1 <= currentStep
                          const Icon = step.icon
                          return (
                            <div key={step.name} className="flex flex-col items-center group">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 transition-colors duration-300",
                                isCompleted ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-muted-foreground"
                              )}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <span className={cn(
                                "text-xs mt-2 font-medium transition-colors duration-300 absolute -bottom-6 w-max",
                                isCompleted ? "text-primary dark:text-foreground" : "text-muted-foreground"
                              )}>
                                {step.name}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    {/* Review Button for Delivered Orders */}
                    {order.status === 'delivered' && (
                      <div className="mt-4 pt-4 border-t border-border flex justify-end">
                        <Button size="sm" variant="outline" onClick={() => openReviewModal(order)}>
                          <Star className="h-4 w-4 mr-2" /> Rate & Review Product
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="bg-secondary/40 px-6 py-3 border-t border-border flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-muted-foreground">ID: {order.id}</span>
                      <span className="text-sm font-medium text-foreground capitalize">Status: {order.status}</span>
                    </div>
                    {order.status === 'pending' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium text-foreground">Note:</span> Our executive will confirm your order via call before it moves to the <span className="font-medium">Processing</span> stage.
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Confirmation Modal */}
        <Modal
          isOpen={deleteConfirmation.isOpen}
          onClose={() => setDeleteConfirmation({ isOpen: false, order: null })}
          title="Cancel Order"
        >
          <div className="py-4 space-y-4">
            <p className="text-gray-600">
              Are you sure you want to cancel this order for <span className="font-semibold">{deleteConfirmation.order?.products?.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeleteConfirmation({ isOpen: false, order: null })}>
                Keep Order
              </Button>
              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={confirmDeleteOrder}
              >
                Yes, Cancel Order
              </Button>
            </div>
          </div>
        </Modal>

        {/* Review Modal */}
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          title="Rate Product"
        >
          <form onSubmit={handleReviewSubmit} className="space-y-6 py-4">
            <div className="flex flex-col items-center gap-2 mb-6">
              <p className="text-sm text-gray-500">How was your experience with</p>
              <p className="font-semibold">{selectedOrder?.products?.name}</p>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                    className="focus:outline-none transition transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "h-8 w-8",
                        reviewForm.rating >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
                      )}
                    />
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <label className="text-sm font-medium text-gray-700">Or enter precise rating:</label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  className="w-20 text-center"
                  value={reviewForm.rating || ''}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    if (val >= 0 && val <= 5) {
                      setReviewForm(prev => ({ ...prev, rating: val }));
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Write a review</label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="What did you like or dislike?"
                value={reviewForm.comment}
                onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Add Photo (Optional)</label>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Image URL (e.g. https://...)"
                  value={reviewForm.image_url}
                  onChange={e => setReviewForm(prev => ({ ...prev, image_url: e.target.value }))}
                />
                {/* In a real app, this would be a file upload to Storage. For MVP, we use URL. */}
              </div>
              <p className="text-xs text-muted-foreground">Paste an image URL to show your product.</p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsReviewModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={reviewForm.rating === 0}>Submit Review</Button>
            </div>
          </form>
        </Modal>
      </div>
    </main>
  )
}
