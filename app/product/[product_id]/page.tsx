'use client'

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Star, Truck, ShieldCheck, RefreshCw, Minus, Plus, ShoppingCart, AlertCircle } from "lucide-react"
import { toast } from "sonner"

import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/Button"
import { CheckoutModal } from "@/components/CheckoutModal"
import { cn } from "@/lib/utils"

// Define Product type locally to ensure we have what we need
interface Product {
  product_id: string
  name: string
  description?: string
  image_url: string | null
  sale_price: number
  actual_price?: number
  category?: string
  return_available?: boolean
  stock_status?: string // 'in_stock' | 'out_of_stock' | 'fast_selling'
  average_rating?: number
  total_reviews?: number
}

export default function ProductDetails() {
  const params = useParams()
  const productId = params.product_id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [user, setUser] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    getUser()
  }, [])


  const [reviews, setReviews] = useState<any[]>([])

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('product_id', productId)
        .single()

      if (!error && data) {
        setProduct(data)
      }
      setLoading(false)
    }

    const fetchReviews = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .neq('comment', '') // Only fetch if comment is not empty string
        .neq('comment', null) // And not null
        .order('created_at', { ascending: false })

      if (data) {
        // Double check filter in JS just in case
        const visibleReviews = data.filter(r => r.comment && r.comment.trim().length > 0)
        setReviews(visibleReviews)
      }
    }

    if (productId) {
      fetchProduct()
      fetchReviews()

      // Realtime subscription for product updates
      const channel = supabase
        .channel(`product-${productId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'products',
            filter: `product_id=eq.${productId}`,
          },
          (payload) => {
            console.log('Product updated event received:', payload)
            // Re-fetch to guarantee fresh data
            fetchProduct()
            toast.info("Product updated directly from server!")
          }
        )
        .subscribe((status) => {
          console.log(`Realtime subscription status for product ${productId}:`, status)
        })

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [productId])

  const handleBuyNow = async () => {
    if (!user) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.href
        }
      })
      return
    }

    // Check stock before opening modal
    if (product?.stock_status === 'out_of_stock') {
      toast.error("Sorry, this item is out of stock.")
      return
    }

    setIsCheckoutOpen(true)
  }

  const handleOrderSuccess = () => {
    toast.success("Order placed successfully!", {
      description: "Check your email for confirmation."
    })
    // Optionally redirect to orders page
    // window.location.href = "/orders" // Let user decide or auto-redirect after delay if needed. 
    // For now, staying on page is fine or we can redirect.
    setTimeout(() => window.location.href = "/orders", 1500)
  }

  if (loading) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          <div className="animate-pulse bg-gray-200 aspect-square rounded-lg"></div>
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Product not found.</p>
      </div>
    )
  }

  const isOutOfStock = product.stock_status === 'out_of_stock'
  const isFastSelling = product.stock_status === 'fast_selling'

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-white">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image gallery */}
          <div className="flex flex-col-reverse justify-center">
            <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100 relative group">
              <img
                src={product.image_url || "https://via.placeholder.com/600x600?text=No+Image"}
                alt={product.name}
                className={cn(
                  "h-full w-full object-cover object-center transition duration-500",
                  isOutOfStock ? "grayscale opacity-80" : "group-hover:scale-105"
                )}
              />
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <span className="bg-red-600 text-white px-6 py-2 rounded-full text-lg font-bold shadow-lg transform -rotate-12">OUT OF STOCK</span>
                </div>
              )}
              {isFastSelling && !isOutOfStock && (
                <div className="absolute top-4 left-4">
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md animate-pulse">FAST SELLING</span>
                </div>
              )}
            </div>
          </div>

          {/* Product info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0 text-center lg:text-left">
            <div className="mb-6">
              {product.category && (
                <span className="text-sm text-primary font-medium tracking-wide uppercase">
                  {product.category}
                </span>
              )}
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 leading-tight">
                {product.name}
              </h1>
              <p className="text-xs text-gray-400 mt-1">Product ID: {product.product_id}</p>
            </div>

            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <div className="flex items-baseline justify-center lg:justify-start gap-4">
                <p className="text-3xl tracking-tight text-gray-900">₹{product.sale_price}</p>
                {product.actual_price && product.actual_price > product.sale_price && (
                  <p className="text-lg text-gray-500 line-through">₹{product.actual_price}</p>
                )}
              </div>
            </div>

            {/* Reviews Summary */}
            <div className="mt-3">
              <div className="flex items-center justify-center lg:justify-start">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Star
                      key={rating}
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        (product.average_rating || 0) >= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
                      )}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className="sr-only">{product.average_rating} out of 5 stars</p>
                <span className="ml-3 text-sm font-medium text-primary hover:text-primary/80">
                  {Number(product.average_rating).toFixed(2)} <span className="text-gray-500">({product.total_reviews || 0} reviews)</span>
                </span>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <div className="space-y-6 text-base text-gray-700">
                <p>{product.description || "Experience premium quality with this exceptional product, designed to enhance your lifestyle with style and functionality."}</p>
              </div>
            </div>

            <div className="mt-10 border-t border-gray-200 pt-10">
              {isOutOfStock ? (
                <div className="rounded-md bg-red-50 p-4 mb-6">
                  <div className="flex justify-center lg:justify-start">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3 text-left">
                      <h3 className="text-sm font-medium text-red-800">Out of Stock</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>This item is currently unavailable. Please check back later.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between mb-6 max-w-xs mx-auto lg:max-w-none lg:mx-0">
                  <span className="text-sm font-medium text-gray-900">Quantity</span>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      className="p-2 hover:bg-gray-100 transition disabled:opacity-50"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                    <button
                      className="p-2 hover:bg-gray-100 transition disabled:opacity-50"
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      disabled={quantity >= 10}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              <Button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                size="lg"
                className={cn("w-full h-14 text-lg", isOutOfStock && "opacity-50 cursor-not-allowed")}
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  {isOutOfStock ? "Out of Stock" : "Buy Now"}
                </span>
              </Button>
            </div>

            <section aria-labelledby="details-heading" className="mt-12">
              <div className="grid grid-cols-1 gap-y-4 pt-4">
                <div className="flex items-center justify-center lg:justify-start gap-3 text-sm text-gray-500">
                  <Truck className="h-5 w-5 text-gray-400" />
                  <span>Free shipping on all orders over ₹199</span>
                </div>
                {product.return_available && (
                  <div className="flex items-center justify-center lg:justify-start gap-3 text-sm text-gray-500">
                    <RefreshCw className="h-5 w-5 text-gray-400" />
                    <span>Return available within 7 days</span>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6 text-center lg:text-left">Customer Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center lg:text-left">No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {reviews.map((review) => (
                <div key={review.id} className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-200 rounded-full p-2">
                        <span className="font-bold text-gray-600 px-1">{review.reviewer_name?.charAt(0) || 'U'}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{review.reviewer_name || 'Anonymous'}</p>
                        {review.verified_purchase && (
                          <span className="flex items-center text-xs text-green-600 gap-1">
                            <ShieldCheck className="h-3 w-3" /> Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Star
                        key={rating}
                        className={cn(
                          "h-4 w-4",
                          review.rating >= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm mb-4">{review.comment}</p>
                  {review.review_image_url && (
                    <img
                      src={review.review_image_url}
                      alt="Review"
                      className="h-24 w-24 object-cover rounded-md border border-gray-200 cursor-pointer hover:opacity-90"
                      onClick={() => window.open(review.review_image_url, '_blank')}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {product && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          product={product}
          quantity={quantity}
          onSuccess={handleOrderSuccess}
        />
      )}
    </div>
  )
}
