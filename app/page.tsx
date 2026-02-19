import Link from "next/link"
import { ArrowUpRight, Heart, ShoppingBag } from "lucide-react"
import { TrustSection } from "@/components/TrustSection"
import ProductGrid from "@/components/ProductGrid"
import { Button } from "@/components/ui/Button"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      {/* Hero / Bento Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-[1400px] mx-auto">

        {/* Header Title Area */}
        <RevealOnScroll>
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14 relative">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-gray-900 leading-[1.2] mb-4">
              Curated Essentials <br className="hidden md:block" />
              <span className="text-gray-500 italic">for Modern Living</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-lg mx-auto font-light">
              Discover aesthetic products for your home, work, and play. Quality items that elevate your everyday.
            </p>
          </div>
        </RevealOnScroll>

        {/* Bento Grid - 12 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 auto-rows-[160px] md:auto-rows-[120px]">

          {/* 1. Headphones (Tech) */}
          <div className="col-span-12 md:col-span-6 lg:col-span-3 row-span-4">
            <RevealOnScroll delay={100} className="h-full">
              <div className="bg-[#F5E6D3] rounded-[2rem] relative group overflow-hidden shadow-sm transition-all hover:shadow-xl h-full">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800"
                  alt="Premium Headphones"
                  className="object-cover h-full w-full transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-gray-800">
                  Audio
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* 2. Watch (Accessories) */}
          <div className="col-span-12 md:col-span-6 lg:col-span-3 row-span-4">
            <RevealOnScroll delay={200} className="h-full">
              <div className="bg-[#E8F5E9] rounded-[2rem] relative group overflow-hidden shadow-sm transition-all hover:shadow-xl h-full">
                <img
                  src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=800"
                  alt="Elegant Watch"
                  className="object-cover h-full w-full transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4">
                  <button className="bg-white/40 backdrop-blur-md p-2 rounded-full text-gray-800 hover:bg-white transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* 3. Stacked Group: Vase + CTA */}
          <div className="col-span-12 md:col-span-6 lg:col-span-3 row-span-4 flex flex-col gap-4 md:gap-6">

            {/* Vase (Top Half) */}
            <RevealOnScroll delay={300} className="flex-1 h-full min-h-0">
              <div className="bg-[#FFF3E0] rounded-[2rem] relative group overflow-hidden shadow-sm transition-all hover:shadow-xl h-full">
                <img
                  src="https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=800"
                  alt="Aesthetic Vase"
                  className="object-cover h-full w-full transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-3 left-4">
                  <span className="text-gray-800 font-medium bg-white/60 backdrop-blur-md px-3 py-1 rounded-full text-xs">Home Decor</span>
                </div>
              </div>
            </RevealOnScroll>

            {/* CTA Button (Bottom Half) */}
            <RevealOnScroll delay={400} className="flex-1 h-full min-h-0">
              <Link href="/shop" className="w-full h-full block">
                <div className="bg-gray-900 text-white rounded-[2rem] h-full w-full flex flex-col items-center justify-center p-6 group cursor-pointer hover:bg-black transition-colors text-center">
                  <div className="bg-white/20 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-lg">Shop Collection</span>
                  <span className="text-sm text-gray-400 mt-1">Discover New Arrivals</span>
                </div>
              </Link>
            </RevealOnScroll>
          </div>

          {/* 4. Modern Chair (Lifestyle) */}
          <div className="col-span-12 md:col-span-6 lg:col-span-3 row-span-4">
            <RevealOnScroll delay={500} className="h-full">
              <div className="bg-[#E3F2FD] rounded-[2rem] relative group overflow-hidden shadow-sm transition-all hover:shadow-xl h-full">
                <img
                  src="https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=800"
                  alt="Modern Chair"
                  className="object-cover h-full w-full transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white font-medium text-lg">Living Space</p>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* Bottom Row - Wide Spans */}

          {/* 5. Toys/Gadgets (Fun) */}
          <div className="col-span-12 md:col-span-6 lg:col-span-6 row-span-2">
            <RevealOnScroll delay={600} className="h-full">
              <div className="bg-[#FCE4EC] rounded-[2rem] relative group overflow-hidden shadow-sm transition-all hover:shadow-xl h-full">
                <img
                  src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800"
                  alt="Wooden Toys"
                  className="object-cover h-full w-full transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-pink-600">Kids & Play</span>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* 6. Desk Setup (Work) */}
          <div className="col-span-12 md:col-span-6 lg:col-span-6 row-span-2">
            <RevealOnScroll delay={700} className="h-full">
              <div className="bg-gray-50 rounded-[2rem] relative group overflow-hidden shadow-sm transition-all hover:shadow-xl h-full">
                <img
                  src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1200"
                  alt="Modern Interior"
                  className="object-cover h-full w-full transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-xl">
                  <h3 className="font-semibold text-gray-900">Workspace Essentials</h3>
                </div>
              </div>
            </RevealOnScroll>
          </div>

        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-white py-12 md:py-16 border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Trending Now</h2>
            <p className="mt-4 text-gray-500">Selection of our most popular items.</p>
          </div>
          <ProductGrid limit={4} showViewAll />
        </div>
      </section>

      <TrustSection />
    </main>
  )
}
