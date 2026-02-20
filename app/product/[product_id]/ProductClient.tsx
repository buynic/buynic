'use client'

import { useEffect, useState } from "react"
// import { useParams } from "next/navigation" // No longer needed for ID, but keeping if needed
import { Star, Truck, ShieldCheck, RefreshCw, Minus, Plus, ShoppingCart, AlertCircle } from "lucide-react"
import { toast } from "sonner"

import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/Button"
import { CheckoutModal } from "@/components/CheckoutModal"
import { cn } from "@/lib/utils"
// Import analytics
import { analytics } from "@/lib/analytics"

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

interface ProductClientProps {
    product: Product
    reviews: any[]
}

export default function ProductClient({ product: initialProduct, reviews: initialReviews }: ProductClientProps) {
    // const params = useParams()
    // const productId = params.product_id as string
    // Use prop product ID
    const productId = initialProduct.product_id

    const [product, setProduct] = useState<Product | null>(initialProduct)
    const [user, setUser] = useState<any>(null)
    const [quantity, setQuantity] = useState(1)
    // const [loading, setLoading] = useState(true) // No loading state needed for initial render
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
    const [reviews, setReviews] = useState<any[]>(initialReviews)

    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser()
            setUser(data.user)
        }
        getUser()
    }, [])

    useEffect(() => {
        const fetchProduct = async () => {
            // setLoading(true)
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('product_id', productId)
                .single()

            if (!error && data) {
                setProduct(data)
                // Track View
                analytics.trackProductView(data.product_id, data.name)
            }
            // setLoading(false)
        }

        // We don't fetch initial data here, but we listen for updates
        if (productId) {
            // Initial fetch to ensure analytics is tracked even if initialProduct is from SSR
            // and to get the latest data if SSR data is stale.
            fetchProduct()

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

        // Track Add to Cart / Begin Checkout
        if (product) {
            analytics.trackAddToCart(product.product_id, product.name, product.sale_price)
        }

        setIsCheckoutOpen(true)
    }

    const handleOrderSuccess = () => {
        // We don't have Order ID accessible here easily without modifying CheckoutModal callback, 
        // but we know it was successful. We can track generic success or try to pass ID back.
        // For now, track event without specific ID or use a placeholder if needed, 
        // but ideally CheckoutModal passes it back. 
        // Assuming CheckoutModal doesn't pass ID yet, we'll track 'Order Placed' generically or update Modal later.
        // Let's just track it.
        analytics.trackOrderPlaced("recent", product?.sale_price || 0) // Approximation

        toast.success("Order placed successfully!", {
            description: "Check your email for confirmation."
        })
        setTimeout(() => window.location.href = "/orders", 1500)
    }

    // Removed loading check as we have initial data
    // if (loading) { ... }

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
        <div className="bg-background">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-background">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
                    {/* Image gallery */}
                    <div className="flex flex-col-reverse justify-center">
                        <div className="aspect-square w-full overflow-hidden rounded-lg bg-secondary relative group">
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
                            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground leading-tight">
                                {product.name}
                            </h1>
                            <p className="text-xs text-muted-foreground mt-1">Product ID: {product.product_id}</p>
                        </div>

                        <div className="mt-3">
                            <h2 className="sr-only">Product information</h2>
                            <div className="flex items-baseline justify-center lg:justify-start gap-4">
                                <p className="text-3xl tracking-tight text-foreground">₹{product.sale_price}</p>
                                {product.actual_price && product.actual_price > product.sale_price && (
                                    <p className="text-lg text-muted-foreground line-through">₹{product.actual_price}</p>
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
                                    {Number(product.average_rating).toFixed(2)} <span className="text-muted-foreground">({product.total_reviews || 0} reviews)</span>
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="sr-only">Description</h3>
                            <div className="space-y-6 text-base text-muted-foreground">
                                <p>{product.description || "Experience premium quality with this exceptional product, designed to enhance your lifestyle with style and functionality."}</p>
                            </div>
                        </div>

                        <div className="mt-10 border-t border-border pt-10">
                            {isOutOfStock ? (
                                <div className="rounded-md bg-destructive/10 p-4 mb-6">
                                    <div className="flex justify-center lg:justify-start">
                                        <div className="flex-shrink-0">
                                            <AlertCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
                                        </div>
                                        <div className="ml-3 text-left">
                                            <h3 className="text-sm font-medium text-destructive">Out of Stock</h3>
                                            <div className="mt-2 text-sm text-destructive/80">
                                                <p>This item is currently unavailable. Please check back later.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between mb-6 max-w-xs mx-auto lg:max-w-none lg:mx-0">
                                    <span className="text-sm font-medium text-foreground">Quantity</span>
                                    <div className="flex items-center border border-border rounded-md">
                                        <button
                                            className="p-2 hover:bg-secondary transition disabled:opacity-50"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            disabled={quantity <= 1}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                                        <button
                                            className="p-2 hover:bg-secondary transition disabled:opacity-50"
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
                                <div className="flex items-center justify-center lg:justify-start gap-3 text-sm text-muted-foreground">
                                    <Truck className="h-5 w-5 text-muted-foreground/70" />
                                    <span>Free shipping on all orders over ₹199</span>
                                </div>
                                {product.return_available && (
                                    <div className="flex items-center justify-center lg:justify-start gap-3 text-sm text-muted-foreground">
                                        <RefreshCw className="h-5 w-5 text-muted-foreground/70" />
                                        <span>Return available within 7 days</span>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-16 border-t border-border pt-10">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6 text-center lg:text-left">Customer Reviews</h2>
                    {reviews.length === 0 ? (
                        <p className="text-muted-foreground text-center lg:text-left">No reviews yet. Be the first to review this product!</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {reviews.map((review) => (
                                <div key={review.id} className="bg-secondary/50 p-6 rounded-lg border border-border">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-secondary rounded-full p-2">
                                                <span className="font-bold text-foreground px-1">{review.reviewer_name?.charAt(0) || 'U'}</span>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground">{review.reviewer_name || 'Anonymous'}</p>
                                                {review.verified_purchase && (
                                                    <span className="flex items-center text-xs text-green-600 gap-1">
                                                        <ShieldCheck className="h-3 w-3" /> Verified Purchase
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
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
                                    <p className="text-muted-foreground text-sm mb-4">{review.comment}</p>
                                    {review.review_image_url && (
                                        <img
                                            src={review.review_image_url}
                                            alt="Review"
                                            className="h-24 w-24 object-cover rounded-md border border-border cursor-pointer hover:opacity-90"
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
