'use client'

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Modal } from "@/components/ui/Modal"
import { MapPin, Phone, User, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface CheckoutModalProps {
    isOpen: boolean
    onClose: () => void
    product: any
    quantity: number
    onSuccess: () => void
}

export function CheckoutModal({ isOpen, onClose, product, quantity, onSuccess }: CheckoutModalProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
        road_area: "",
        landmark: "",
        city: "",
        state: "",
        pincode: ""
    })
    const [locationLoading, setLocationLoading] = useState(false)

    const [addresses, setAddresses] = useState<any[]>([])
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)

    // Pre-fill name if logged in & Fetch Addresses
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setFormData(prev => ({
                    ...prev,
                    name: user.user_metadata?.full_name || ""
                }))

                // Fetch Addresses
                const { data: addressData } = await supabase
                    .from('user_addresses')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })

                if (addressData && addressData.length > 0) {
                    setAddresses(addressData)
                    // Auto-select most recent
                    // setSelectedAddressId(addressData[0].id)
                    // setFormData(prev => ({ ...prev, ...addressData[0] }))
                } else {
                    setShowAddressForm(true)
                }
            }
        }
        if (isOpen) init()
    }, [isOpen])

    const handleSelectAddress = (addr: any) => {
        setSelectedAddressId(addr.id)
        setFormData({
            name: addr.name,
            phone: addr.phone,
            address: addr.address,
            road_area: "", // Not stored explicitly in history yet, or maybe part of address
            landmark: "",
            city: addr.city,
            state: addr.state,
            pincode: addr.pincode
        })
        setShowAddressForm(false)
    }

    const handleUseLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser")
            return
        }

        setLocationLoading(true)
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                    const data = await response.json()

                    if (data && data.address) {
                        setFormData(prev => ({
                            ...prev,
                            address: `${data.address.road || ''} ${data.address.suburb || ''} ${data.address.neighbourhood || ''}`.trim(),
                            city: data.address.city || data.address.town || data.address.village || "",
                            state: data.address.state || "",
                            pincode: data.address.postcode || ""
                        }))
                    }
                } catch (error) {
                    console.error("Error fetching address:", error)
                    toast.error("Could not fetch address details", { description: "Please enter manually." })
                } finally {
                    setLocationLoading(false)
                }
            },
            (error) => {
                console.error("Geolocation error:", error)
                toast.error("Unable to retrieve location", { description: "Please ensure location services are enabled." })
                setLocationLoading(false)
            }
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            alert("Please login to place an order")
            setLoading(false)
            return
        }

        if (formData.phone.length !== 10) {
            alert("Please enter a valid 10-digit Indian phone number")
            setLoading(false)
            return
        }

        // Save Address for future use if it's a new entry (or if we want to save every used address)
        // Check if this address already exists to avoid duplicates? For now, just insert if filling form.
        if (showAddressForm) {
            await supabase.from('user_addresses').insert({
                user_id: user.id,
                name: formData.name,
                phone: formData.phone,
                address: `${formData.address}, ${formData.road_area}, ${formData.landmark || ''}`,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode
            })
        }

        const total_price = (product.sale_price * quantity)

        const { error } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                product_id: product.product_id,
                quantity: quantity,
                status: 'pending',
                total_price: total_price,
                shipping_name: formData.name,
                shipping_phone: formData.phone,
                shipping_address: `${formData.address}, ${formData.road_area}, ${formData.landmark || ''}`, // Combine for order
                shipping_city: formData.city,
                shipping_state: formData.state,
                shipping_pincode: formData.pincode
            })

        setLoading(false)

        if (error) {
            console.error(error)
            alert("Order failed: " + error.message)
        } else {
            onSuccess()
            onClose()
        }
    }

    const [step, setStep] = useState(1) // 1: Address, 2: Payment/Summary
    const [paymentMethod, setPaymentMethod] = useState('cod') // Default/Only option

    useEffect(() => {
        // ... existing init logic ...
        if (isOpen) {
            setStep(1) // Reset step on open
        }
    }, [isOpen])

    // ... existing helpers ...

    const handleContinueToPayment = () => {
        if (!selectedAddressId) return;
        setStep(2);
    }

    // Original handleSubmit modified to be callable from Step 2
    const handlePlaceOrder = async () => {
        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            toast.error("Please login to place an order")
            setLoading(false)
            return
        }

        // Address validation (should be safe if we are in Step 2)
        // If formData is empty but we selected an address, we ensure formData is populated via handleSelectAddress

        if (formData.phone.length !== 10) {
            toast.warning("Invalid Phone Number", { description: "Please enter a valid 10-digit Indian phone number" })
            setLoading(false)
            return
        }

        if (showAddressForm) {
            await supabase.from('user_addresses').insert({
                user_id: user.id,
                name: formData.name,
                phone: formData.phone,
                address: `${formData.address}, ${formData.road_area}, ${formData.landmark || ''}`,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode
            })
        }

        // Check for duplicate pending order
        const { data: existingOrder } = await supabase
            .from('orders')
            .select('id')
            .eq('user_id', user.id)
            .eq('product_id', product.product_id)
            .eq('status', 'pending')
            .single()

        if (existingOrder) {
            toast.warning("You already have a pending order for this product.", {
                description: "Please check 'My Orders' to track or manage it."
            })
            setLoading(false)
            return
        }

        // Calculate costs
        const itemTotal = Number((product.sale_price * quantity).toFixed(2))
        const deliveryFee = itemTotal > 199 ? 0 : 29
        const grandTotal = Number((itemTotal + deliveryFee).toFixed(2))

        const { data, error } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                product_id: product.product_id,
                quantity: quantity,
                status: 'pending',
                total_price: grandTotal,
                payment_method: 'COD', // Explicitly record COD
                shipping_name: formData.name,
                shipping_phone: formData.phone,
                shipping_address: `${formData.address}, ${formData.road_area}, ${formData.landmark || ''}`,
                shipping_city: formData.city,
                shipping_state: formData.state,
                shipping_pincode: formData.pincode,
                email: user.email // Save email for notifications
            })
            .select() // Select to get the ID back

        setLoading(false)

        if (error) {
            console.error(error)
            toast.error("Order failed", { description: error.message })
        } else {
            // Trigger Email Notification (Non-blocking)
            const newOrder = data[0]
            fetch('/api/emails/order-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: newOrder.id,
                    customerName: formData.name,
                    customerEmail: user.email,
                    totalAmount: grandTotal,
                    address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
                    products: [{
                        name: product.name,
                        id: product.product_id,
                        image_url: product.image_url,
                        quantity: quantity,
                        price: product.sale_price
                    }]
                })
            }).catch(err => console.error("Failed to send admin notification", err))

            onSuccess()
            onClose()
        }
    }

    const indianStates = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
        "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
        "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
        "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
        "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
        "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
        "Lakshadweep", "Puducherry"
    ]

    // Calculate for render
    const itemTotal = Number((product.sale_price * quantity).toFixed(2))
    const deliveryFee = itemTotal > 199 ? 0 : 29
    const grandTotal = Number((itemTotal + deliveryFee).toFixed(2))

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={step === 1 ? "Select Delivery Address" : "Order Summary & Payment"}>
            <div className="py-4">

                {/* STEP 1: ADDRESS SELECTION */}
                {step === 1 && (
                    <div className="space-y-6">
                        {/* Saved Addresses List */}
                        {!showAddressForm && addresses.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-foreground">Saved Addresses</h3>
                                <div className="grid gap-3">
                                    {addresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-gray-400 dark:hover:border-gray-600'}`}
                                            onClick={() => handleSelectAddress(addr)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-foreground">{addr.name}</p>
                                                    <p className="text-sm text-muted-foreground mt-1">{addr.address}</p>
                                                    <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} - {addr.pincode}</p>
                                                    <p className="text-sm text-muted-foreground mt-1">Phone: {addr.phone}</p>
                                                </div>
                                                {selectedAddressId === addr.id && <div className="h-4 w-4 rounded-full bg-primary" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" className="w-full mt-2" onClick={() => { setShowAddressForm(true); setSelectedAddressId(null); }}>
                                    + Add New Address
                                </Button>
                            </div>
                        )}

                        {/* Address Form */}
                        {(showAddressForm || addresses.length === 0) && (
                            <form onSubmit={(e) => { e.preventDefault(); handlePlaceOrder(); }} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                {addresses.length > 0 && (
                                    <Button type="button" variant="ghost" className="mb-2 pl-0 text-muted-foreground hover:text-foreground" onClick={() => setShowAddressForm(false)}>
                                        ← Back to Saved Addresses
                                    </Button>
                                )}

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                            <MapPin className="h-4 w-4 text-primary" /> New Address
                                        </h3>
                                        <Button type="button" variant="outline" size="sm" onClick={handleUseLocation} disabled={locationLoading} className="text-primary border-primary hover:bg-primary/5 h-8">
                                            {locationLoading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : "Use My Location"}
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        <Input placeholder="House no./ Building Name" required value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                        <Input placeholder="Road Name / Area / Colony" required value={formData.road_area} onChange={e => setFormData({ ...formData, road_area: e.target.value })} />
                                        <Input placeholder="Nearby Famous Place/Shop/School, etc. (Optional)" value={formData.landmark} onChange={e => setFormData({ ...formData, landmark: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input placeholder="City" required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} required>
                                            <option value="">Select State</option>
                                            {indianStates.map(state => <option key={state} value={state}>{state}</option>)}
                                        </select>
                                    </div>
                                    <Input placeholder="Pincode" required value={formData.pincode} onChange={e => setFormData({ ...formData, pincode: e.target.value })} />
                                </div>

                                <div className="space-y-4 pt-4 border-t border-border">
                                    <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                        <Phone className="h-4 w-4 text-primary" /> Contact Details
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <Input placeholder="Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} icon={<User className="h-4 w-4 text-muted-foreground" />} />
                                        <div className="space-y-1">
                                            <Input placeholder="Phone Number (10 digits)" required type="tel" maxLength={10} value={formData.phone} onChange={e => { const val = e.target.value.replace(/\D/g, ''); setFormData({ ...formData, phone: val }) }} />
                                            <p className="text-xs text-muted-foreground text-right">{formData.phone.length}/10</p>
                                        </div>
                                    </div>
                                </div>
                                {/* For New Address: "Continue" directly validates and moves to Step 2. 
                                    However, handleSubmit in step 1 was originally saving. 
                                    Let's change behavior: Form Submit -> Validates -> Sets Step 2. 
                                    We won't save to DB until Final Order Place to be consistent, OR we save address now.
                                    Let's keep simple: "Save and Continue to Payment"
                                 */}
                                <div className="pt-6">
                                    <Button type="button" className="w-full h-12 text-lg" onClick={() => {
                                        // Basic validation check before moving
                                        if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
                                            toast.warning("Missing Fields", { description: "Please fill all required fields" }); return;
                                        }
                                        if (formData.phone.length !== 10) { toast.warning("Invalid Phone"); return; }
                                        setStep(2);
                                    }}>
                                        Save Address & Continue
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* Continue Button for Selected Address (Step 1) */}
                        {!showAddressForm && selectedAddressId && (
                            <div className="pt-6 mt-4 border-t border-border">
                                <Button className="w-full h-12 text-lg" onClick={handleContinueToPayment}>
                                    Deliver Here
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 2: SUMMARY & PAYMENT */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-4 bg-secondary/50 p-4 rounded-xl border border-border">
                            <div className="h-20 w-20 rounded-lg overflow-hidden bg-background border border-border shrink-0">
                                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-foreground truncate">{product.name}</h4>
                                <p className="text-sm text-muted-foreground mt-1">Quantity: {quantity}</p>
                                <p className="text-sm font-medium text-foreground mt-1">₹{itemTotal}</p>
                            </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="space-y-3 pb-4 border-b border-border">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Item Total</span>
                                <span>₹{itemTotal}</span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Delivery Fee</span>
                                <span className={deliveryFee === 0 ? "text-emerald-600 font-medium" : "text-foreground"}>
                                    {deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-dashed border-border">
                                <span>Grand Total</span>
                                <span>₹{grandTotal}</span>
                            </div>
                        </div>

                        {/* Payment Options */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-foreground">Payment Method</h3>
                            <label className="flex items-center justify-between p-4 rounded-xl border-2 border-primary bg-primary/5 cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="payment"
                                        checked={paymentMethod === 'cod'}
                                        onChange={() => setPaymentMethod('cod')}
                                        className="h-4 w-4 text-primary border-border focus:ring-primary"
                                    />
                                    <span className="font-medium text-foreground">Cash on Delivery (COD)</span>
                                </div>
                                <span className="text-xs font-semibold bg-background text-foreground px-2 py-1 rounded border border-border">
                                    Cash
                                </span>
                            </label>
                            <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 p-3">
                                <p className="text-xs text-amber-800 dark:text-amber-300">
                                    Pay securely with cash when your order is delivered.
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(1)} disabled={loading}>
                                Back
                            </Button>
                            <Button className="flex-[2] h-12 text-lg" onClick={handlePlaceOrder} disabled={loading}>
                                {loading ? "Processing..." : `Place Order • ₹${grandTotal}`}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    )
}
