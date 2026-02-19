"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ProductCard } from "@/components/ProductCard"

interface Product {
    product_id: string
    name: string
    image_url: string | null
    sale_price: number
    category?: string
}

export default function CategoryPage() {
    const params = useParams()
    const slug = params.slug as string
    const categoryName = decodeURIComponent(slug)

    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCategoryProducts = async () => {
            setLoading(true)
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('category', categoryName) // Assuming category is stored as exact string match

            if (!error && data) {
                setProducts(data)
            }
            setLoading(false)
        }

        if (categoryName) fetchCategoryProducts()
    }, [categoryName])

    return (
        <div className="bg-slate-50 min-h-screen py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 capitalize">{categoryName}</h1>
                    <p className="text-muted-foreground mt-1">Browse all products in {categoryName}</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
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
                        <p className="text-muted-foreground">No products found in this category.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
