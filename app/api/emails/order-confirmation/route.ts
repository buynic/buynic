
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { emailTemplates } from '@/lib/email-templates'
import { supabase } from '@/lib/supabase' // This is client supabase, safer to pass data in body for now OR use service role if needed.
// actually, for this route, we can just pass the email and details from the Admin frontend to avoid complexity with Service Role for now.
// The Admin Page already has the order data.

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { customerName, customerEmail, orderId, products, totalAmount } = body

        if (!customerEmail || !orderId) {
            return NextResponse.json({ error: 'Missing Email or Order ID' }, { status: 400 })
        }

        const html = emailTemplates.orderConfirmation(customerName, orderId, totalAmount, products)

        await sendEmail({
            to: customerEmail,
            subject: `Order Confirmed: #${orderId} 📦`,
            html: html
        })

        return NextResponse.json({ success: true, message: 'Confirmation sent to customer' })

    } catch (error: any) {
        console.error('Confirmation Email Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
