"use client"
import { useState } from 'react'
import { Modal } from './ui/Modal'
import { PRIVACY_POLICY, TERMS_OF_SERVICE } from '@/lib/legalContent'

export default function LegalLinks() {
    const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null)

    return (
        <>
            <li>
                <button onClick={() => setActiveModal('privacy')} className="text-sm text-gray-500 hover:text-black transition-colors text-left block w-full">
                    Privacy Policy
                </button>
            </li>
            <li>
                <button onClick={() => setActiveModal('terms')} className="text-sm text-gray-500 hover:text-black transition-colors text-left block w-full">
                    Terms of Service
                </button>
            </li>

            <Modal
                isOpen={activeModal === 'privacy'}
                onClose={() => setActiveModal(null)}
                title="Privacy Policy"
                className="max-w-3xl max-h-[85vh] overflow-y-auto"
            >
                <div className="whitespace-pre-line text-sm text-gray-600 leading-relaxed">
                    {PRIVACY_POLICY}
                </div>
            </Modal>

            <Modal
                isOpen={activeModal === 'terms'}
                onClose={() => setActiveModal(null)}
                title="Terms of Service"
                className="max-w-3xl max-h-[85vh] overflow-y-auto"
            >
                <div className="whitespace-pre-line text-sm text-gray-600 leading-relaxed">
                    {TERMS_OF_SERVICE}
                </div>
            </Modal>
        </>
    )
}
