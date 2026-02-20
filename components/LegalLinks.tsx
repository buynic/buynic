import Link from 'next/link'

export default function LegalLinks() {
    return (
        <>
            <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors block w-full">
                    Privacy Policy
                </Link>
            </li>
            <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors block w-full">
                    Terms of Service
                </Link>
            </li>
        </>
    )
}
