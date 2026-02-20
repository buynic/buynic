import { PRIVACY_POLICY } from '@/lib/legalContent'
import Link from 'next/link'
import { X } from 'lucide-react'

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-background py-12 md:py-20 relative">
            {/* Floating Close Button */}
            <Link
                href="/"
                className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex items-center justify-center gap-2 rounded-full bg-secondary text-secondary-foreground shadow-lg hover:bg-secondary/80 border border-border px-4 py-2 transition-all font-medium text-sm"
            >
                <X className="h-4 w-4" /> Close
            </Link>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-card rounded-2xl shadow-sm border border-border p-8 md:p-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8 pb-6 border-b border-border">
                        Privacy Policy
                    </h1>
                    <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {PRIVACY_POLICY}
                    </div>
                </div>
            </div>
        </main>
    )
}
