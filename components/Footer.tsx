import Link from 'next/link'
import LegalLinks from './LegalLinks'

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold tracking-tight">Buynic</h3>
                        <p className="text-sm text-gray-500 max-w-xs">
                            Elevating your lifestyle with curated premium essentials. Quality meets modern design.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Shop</h4>
                        <ul className="space-y-3">
                            <li><Link href="/shop" className="text-sm text-gray-500 hover:text-black transition-colors">All Products</Link></li>
                            <li><Link href="/shop?sort=newest" className="text-sm text-gray-500 hover:text-black transition-colors">New Arrivals</Link></li>
                            <li><Link href="/shop?sort=featured" className="text-sm text-gray-500 hover:text-black transition-colors">Featured</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Support</h4>
                        <ul className="space-y-3">
                            <li><Link href="/contact" className="text-sm text-gray-500 hover:text-black transition-colors">Contact Us</Link></li>
                            <li><Link href="/orders" className="text-sm text-gray-500 hover:text-black transition-colors">Track Order</Link></li>
                            <li><Link href="/contact" className="text-sm text-gray-500 hover:text-black transition-colors">FAQ</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Legal</h4>
                        <ul className="space-y-3">
                            <LegalLinks />
                            <li><Link href="/contact" className="text-sm text-gray-500 hover:text-black transition-colors">Returns</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-400">
                        &copy; {new Date().getFullYear()} Buynic. All rights reserved.
                    </p>
                    <div className="flex space-x-6">
                        {/* Social icons could go here */}
                    </div>
                </div>
            </div>
        </footer>
    )
}
