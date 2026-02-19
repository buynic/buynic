'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { ProductCard } from "@/components/ProductCard"
import { Button } from "@/components/ui/Button"
import Link from "next/link"

interface Product {
  product_id: string
  name: string
  image_url: string | null
  sale_price: number
  category?: string
}

interface ProductGridProps {
  limit?: number
  title?: string
  showViewAll?: boolean
}

export default function ProductGrid({ limit, title, showViewAll }: ProductGridProps) {

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        let query = supabase
          .from("products")
          .select("product_id, name, image_url, sale_price, category")
          .order('created_at', { ascending: false }) // Show newest first by default

        if (limit) {
          query = query.limit(limit)
        }

        const { data, error } = await query

        if (error) {
          console.error("Supabase error:", error)
          return
        }

        // Map data to match Product interface if needed (Supabase returns object)
        setProducts(data || [])
      } catch (err) {
        console.error("Unexpected error:", err)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [limit])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[...Array(limit || 4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {(title || showViewAll) && (
        <div className="flex items-center justify-between">
          {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
          {showViewAll && (
            <Link href="/shop">
              <Button variant="ghost" className="hidden sm:flex">View all products &rarr;</Button>
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        {products.map((product) => (
          <ProductCard key={product.product_id} product={product} />
        ))}
      </div>

      {showViewAll && (
        <div className="mt-8 text-center sm:hidden">
          <Link href="/shop">
            <Button variant="outline">View all products</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
