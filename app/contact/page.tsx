'use client'

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Mail, MapPin, Phone } from "lucide-react"

import { useState } from "react"

import { toast } from "sonner"

export default function ContactPage() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        message: ""
    })
    const [loading, setLoading] = useState(false)

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to send message')
            }

            toast.success("Message sent successfully!", {
                description: "We'll get back to you shortly."
            })

            // Reset form
            setFormData({ firstName: "", lastName: "", email: "", message: "" })
        } catch (error: any) {
            toast.error("Failed to send message", {
                description: error.message
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:mx-0">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Contact Us</h2>
                    <p className="mt-2 text-lg leading-8 text-gray-600">
                        Have a question or feedback? We'd love to hear from you.
                    </p>
                </div>

                <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 text-base leading-7 sm:grid-cols-2 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-4">
                    <div>
                        <h3 className="border-l border-primary pl-6 font-semibold text-gray-900">General Inquiries</h3>
                        <address className="border-l border-gray-200 pl-6 pt-2 not-italic text-gray-600">
                            <p>buynic.shop@gmail.com</p>
                        </address>
                    </div>
                    <div>
                        <h3 className="border-l border-primary pl-6 font-semibold text-gray-900">Support</h3>
                        <address className="border-l border-gray-200 pl-6 pt-2 not-italic text-gray-600">
                            <p>buynic.shop@gmail.com</p>
                            <a href="https://www.instagram.com/buynic.shop/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors block mt-1">
                                DM @buynic.shop
                            </a>
                        </address>
                    </div>
                    <div className="col-span-2">
                        {/* Placeholder for form if needed, or just info */}
                    </div>
                </div>

                <div className="mt-16 bg-slate-50 rounded-2xl p-8 sm:p-12">
                    <form onSubmit={handleContactSubmit} className="max-w-xl mx-auto space-y-6">
                        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="first-name" className="block text-sm font-semibold leading-6 text-gray-900">First name</label>
                                <div className="mt-2.5">
                                    <Input
                                        type="text"
                                        id="first-name"
                                        autoComplete="given-name"
                                        required
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="last-name" className="block text-sm font-semibold leading-6 text-gray-900">Last name</label>
                                <div className="mt-2.5">
                                    <Input
                                        type="text"
                                        id="last-name"
                                        autoComplete="family-name"
                                        required
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-900">Email</label>
                            <div className="mt-2.5">
                                <Input
                                    type="email"
                                    id="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-semibold leading-6 text-gray-900">Message</label>
                            <div className="mt-2.5">
                                <textarea
                                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="mt-10">
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Sending..." : "Let's talk"}
                            </Button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    )
}
