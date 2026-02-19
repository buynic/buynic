"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, SlidersHorizontal } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { ProductCard } from "@/components/ProductCard"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
// Native select used for now

interface Product {
    product_id: string
    name: string
    image_url: string | null
    sale_price: number
    category?: string
    created_at?: string
}

import { Suspense } from "react"

function ShopContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")
    const [category, setCategory] = useState(searchParams.get("category") || "all")
    const [sort, setSort] = useState(searchParams.get("sort") || "newest")
    const [categories, setCategories] = useState<string[]>([])

    useEffect(() => {
        fetchProducts()
        fetchCategories()
    }, [searchParams])

    // Update URL on filter change
    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== "all") {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`/shop?${params.toString()}`)
    }

    const fetchCategories = async () => {
        // Get unique categories
        const { data } = await supabase
            .from('products')
            .select('category')

        if (data) {
            const uniqueCats = Array.from(new Set(data.map(p => p.category).filter(Boolean))) as string[]
            setCategories(uniqueCats)
        }
    }

    const fetchProducts = async () => {
        setLoading(true)
        try {
            let query = supabase
                .from("products")
                .select("*")

            const categoryParam = searchParams.get("category")
            const sortParam = searchParams.get("sort") || "newest"
            const searchParam = searchParams.get("q")

            if (categoryParam && categoryParam !== "all") {
                query = query.eq("category", categoryParam)
            }

            if (searchParam) {
                query = query.or(`name.ilike.%${searchParam}%,product_id.ilike.%${searchParam}%`)
            }

            if (sortParam === "price_asc") {
                query = query.order("sale_price", { ascending: true })
            } else if (sortParam === "price_desc") {
                query = query.order("sale_price", { ascending: false })
            } else {
                query = query.order("created_at", { ascending: false })
            }

            const { data, error } = await query
            if (error) throw error
            setProducts(data || [])
        } catch (error) {
            console.error("Error loading products:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        updateFilters("q", searchTerm)
    }

    return (
        <div className="bg-slate-50 min-h-screen py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Shop</h1>
                        <p className="text-muted-foreground mt-1">Explore our latest collection</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                className="pl-8 w-full sm:w-[250px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </form>

                        <select
                            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value)
                                updateFilters("category", e.target.value)
                            }}
                        >
                            <option value="all">All Categories</option>
                            {categories.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>

                        <select
                            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={sort}
                            onChange={(e) => {
                                setSort(e.target.value)
                                updateFilters("sort", e.target.value)
                            }}
                        >
                            <option value="newest">Newest</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to High</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            </div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                        {products.map((product) => (
                            <ProductCard key={product.product_id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <h3 className="text-lg font-semibold text-gray-900">No products found</h3>
                        <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
                        <Button
                            variant="link"
                            onClick={() => {
                                setSearchTerm("")
                                setCategory("all")
                                router.push("/shop")
                            }}
                        >
                            Clear all filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading shop...</div>}>
            <ShopContent />
        </Suspense>
    )
}
