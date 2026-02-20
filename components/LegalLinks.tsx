import Link from 'next/link'

export default function LegalLinks() {
    return (
        <>
            <li>
                <Link href="/privacy" className="text-sm text-gray-500 hover:text-black transition-colors block w-full">
                    Privacy Policy
                </Link>
            </li>
            <li>
                <Link href="/terms" className="text-sm text-gray-500 hover:text-black transition-colors block w-full">
                    Terms of Service
                </Link>
            </li>
        </>
    )
}
