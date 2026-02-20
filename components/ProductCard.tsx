"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

interface Product {
    product_id: string
    name: string
    image_url: string | null
    sale_price: number
    category?: string
}

interface ProductCardProps {
    product: Product
    className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
    return (
        <div className={cn("group relative", className)}>
            <div className="aspect-square overflow-hidden rounded-lg bg-secondary relative">
                <Link href={`/product/${product.product_id}`}>
                    <img
                        src={product.image_url || "https://via.placeholder.com/400x400?text=Product"}
                        alt={product.name}
                        className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                </Link>
                {/* Quick Add Button (Visible on Hover) */}
                <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <Button size="icon" className="rounded-full shadow-lg">
                        <ShoppingCart className="h-4 w-4" />
                        <span className="sr-only">Add to cart</span>
                    </Button>
                </div>
            </div>
            <div className="mt-4 flex flex-col items-center text-center lg:flex-row lg:justify-between lg:items-start lg:text-left">
                <div>
                    <h3 className="text-sm font-medium text-foreground">
                        <Link href={`/product/${product.product_id}`}>
                            <span aria-hidden="true" className="absolute inset-0" />
                            {product.name}
                        </Link>
                    </h3>
                    {product.category && (
                        <p className="mt-1 text-sm text-muted-foreground">{product.category}</p>
                    )}
                </div>
                <p className="text-sm font-medium text-foreground mt-2 lg:mt-0">₹{product.sale_price}</p>
            </div>
        </div>
    )
}
