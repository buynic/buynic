import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import ProductClient from './ProductClient'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ product_id: string }>
}

// Data fetching helper
async function getProduct(id: string) {
  const { data } = await supabase.from('products').select('*').eq('product_id', id).single()
  return data
}

async function getReviews(id: string) {
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', id)
    .neq('comment', '')
    .order('created_at', { ascending: false })
  return data || []
}

// ... (Metadata function remains mostly same, ensuring it works)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { product_id } = await params
  const product = await getProduct(product_id)

  if (!product) return { title: 'Product Not Found' }

  return {
    title: product.name,
    description: product.description?.slice(0, 160) || 'Premium product from Buynic.',
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
      images: [product.image_url || '/og-image.jpg'],
    },
  }
}

// Server Component
export default async function ProductPage({ params }: PageProps) {
  const { product_id } = await params
  const product = await getProduct(product_id)

  if (!product) {
    notFound()
  }

  const reviews = await getReviews(product_id)

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image_url ? [product.image_url] : [],
    description: product.description,
    sku: product.product_id,
    offers: {
      '@type': 'Offer',
      price: product.sale_price,
      priceCurrency: 'INR',
      availability: product.stock_status === 'out_of_stock' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
    },
    aggregateRating: product.average_rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.average_rating,
      reviewCount: product.total_reviews,
    } : undefined,
    // Add review data if available
    review: reviews.length > 0 ? reviews.map((r: any) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: r.reviewer_name || 'Anonymous',
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
      },
      reviewBody: r.comment,
    })) : undefined
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductClient product={product} reviews={reviews} />
    </>
  )
}
