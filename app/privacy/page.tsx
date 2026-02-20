import { PRIVACY_POLICY } from '@/lib/legalContent'

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-slate-50/50 py-12 md:py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 pb-6 border-b border-gray-100">
                        Privacy Policy
                    </h1>
                    <div className="prose prose-slate max-w-none text-gray-600 whitespace-pre-line leading-relaxed">
                        {PRIVACY_POLICY}
                    </div>
                </div>
            </div>
        </main>
    )
}
