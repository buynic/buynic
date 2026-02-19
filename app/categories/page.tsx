'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { ArrowUpRight } from "lucide-react"

interface CategoryData {
    name: string
    image_url: string | null
    itemCount: number
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<CategoryData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('category, image_url, name')

                if (!error && data) {
                    const categoryMap = new Map<string, { image: string | null, count: number }>()

                    data.forEach((product: any) => {
                        if (product.category) {
                            const current = categoryMap.get(product.category) || { image: null, count: 0 }

                            // Use the first non-null image we find for the category
                            if (!current.image && product.image_url) {
                                current.image = product.image_url
                            }

                            categoryMap.set(product.category, {
                                image: current.image || product.image_url,
                                count: current.count + 1
                            })
                        }
                    })

                    const uniqueCats = Array.from(categoryMap.entries()).map(([name, info]) => ({
                        name,
                        image_url: info.image,
                        itemCount: info.count
                    }))

                    setCategories(uniqueCats)
                }
            } catch (error) {
                console.error("Error fetching categories:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchCategories()
    }, [])

    // A pattern for grid items to create an asymmetric look
    // 0: Large square (2x2)
    // 1: Tall portrait (1x2)
    // 2: Wide landscape (2x1) -- logic adjusted below for flow
    // 3: Normal square (1x1)

    // Grid class logic:
    // We'll use a cycle of 6 items to create a repeatable nice pattern on desktop (grid-cols-4)
    // Item 0: col-span-2 row-span-2 (Large feature)
    // Item 1: col-span-1 row-span-2 (Tall feature)
    // Item 2: col-span-1 row-span-1 (Standard)
    // Item 3: col-span-1 row-span-1 (Standard)
    // Item 4: col-span-2 row-span-1 (Wide feature)
    // Item 5: col-span-2 row-span-1 (Wide feature)

    const getGridClass = (index: number) => {
        const patternIndex = index % 6

        // Base classes for mobile (always full width or half) 
        // md: (tablet - 2 cols)
        // lg: (desktop - 4 cols)

        switch (patternIndex) {
            case 0:
                return "col-span-1 md:col-span-2 lg:col-span-2 row-span-2 h-96 md:h-full min-h-[400px]" // Large Feature
            case 1:
                return "col-span-1 md:col-span-1 lg:col-span-1 row-span-2 h-96 md:h-full min-h-[400px]" // Tall
            case 2:
                return "col-span-1 md:col-span-1 lg:col-span-1 row-span-1 h-64 md:h-auto min-h-[200px]" // Standard
            case 3:
                return "col-span-1 md:col-span-1 lg:col-span-1 row-span-1 h-64 md:h-auto min-h-[200px]" // Standard
            case 4:
                return "col-span-1 md:col-span-2 lg:col-span-2 row-span-1 h-64 md:h-auto min-h-[200px]" // Wide
            case 5:
                return "col-span-1 md:col-span-2 lg:col-span-2 row-span-1 h-64 md:h-auto min-h-[200px]" // Wide
            default:
                return "col-span-1 h-64"
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FDFDFD] py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="h-12 bg-gray-100 rounded-lg w-64 mb-12 animate-pulse" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[200px]">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className={`bg-gray-100 rounded-[2rem] animate-pulse ${getGridClass(i)}`} />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // Soft pastel/neutral colors for fallbacks or overlays
    const bgColors = [
        'bg-[#F2F0EA]', // Soft Beige
        'bg-[#E8EFF5]', // Soft Blue
        'bg-[#F5E8E8]', // Soft Pink
        'bg-[#E8F5EE]', // Soft Green
        'bg-[#F5F2E8]', // Soft Cream
        'bg-[#F0E8F5]', // Soft Purple
    ]

    return (
        <main className="min-h-screen bg-[#FDFDFD] py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <header className="mb-16">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-gray-900 mb-6">
                        Collections
                    </h1>
                    <p className="text-xl text-gray-500 max-w-xl font-light leading-relaxed">
                        Curated selections for your unique lifestyle. Explore our latest arrivals and timeless essentials.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[minmax(200px,auto)]">
                    {categories.map((category, index) => (
                        <Link
                            key={category.name}
                            href={`/category/${category.name}`}
                            className={`group relative overflow-hidden rounded-[2rem] transition-all duration-700 hover:shadow-2xl ${getGridClass(index)} ${!category.image_url ? bgColors[index % bgColors.length] : 'bg-gray-100'}`}
                        >
                            {/* Background Image with Zoom Effect */}
                            {category.image_url ? (
                                <div className="absolute inset-0 w-full h-full">
                                    <img
                                        src={category.image_url}
                                        alt={category.name}
                                        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                                    />
                                    {/* Gradient Overlay for Text Readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-70" />
                                </div>
                            ) : (
                                <div className="absolute inset-0 w-full h-full flex items-center justify-center opacity-10">
                                    <span className="text-9xl font-bold text-black">{category.name[0]}</span>
                                </div>
                            )}

                            {/* Content Overlay */}
                            <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between z-10 text-white">
                                <div className="flex justify-between items-start">
                                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                                        <ArrowUpRight className="w-5 h-5" />
                                    </span>
                                </div>

                                <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                                    <p className={`text-sm tracking-widest uppercase font-medium mb-2 ${!category.image_url ? 'text-gray-500' : 'text-white/80'}`}>
                                        {category.itemCount} Items
                                    </p>
                                    <h2 className={`text-3xl md:text-4xl font-bold tracking-tight capitalize ${!category.image_url ? 'text-gray-900' : 'text-white'}`}>
                                        {category.name}
                                    </h2>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {categories.length === 0 && (
                        <div className="col-span-full py-32 text-center text-gray-400">
                            <p className="text-xl">No collections available at result.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
