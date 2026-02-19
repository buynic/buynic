import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

import { Analytics } from "@vercel/analytics/react"

export const metadata = {
  title: {
    template: '%s | Buynic',
    default: 'Buynic - Premium Online Shopping',
  },
  description: 'Discover curated premium essentials for your lifestyle at Buynic. Shop top-quality electronics, fashion, and home goods.',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://buynic.shop',
    siteName: 'Buynic',
    images: [
      {
        url: '/og-image.jpg', // Ensure this exists or fallback
        width: 1200,
        height: 630,
        alt: 'Buynic - Premium Online Shopping',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@buynic',
    creator: '@buynic',
  },
  metadataBase: new URL('https://buynic.shop'),
  alternates: {
    canonical: '/',
  },
  verification: {
    google: "Ox7J-U-z64a2N8_kVszItxZxSEVWXd-VY5eV7hNWt8o",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased no-scrollbar",
        inter.variable
      )}>
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
