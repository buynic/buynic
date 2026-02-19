
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { emailTemplates } from '@/lib/email-templates'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { orderId, customerName, customerEmail, products, totalAmount, address } = body

        // Validate
        if (!orderId || !customerEmail || !products) {
            return NextResponse.json({ error: 'Missing Required Fields' }, { status: 400 })
        }

        const html = emailTemplates.newOrder(orderId, customerName, customerEmail, products, totalAmount, address)

        await sendEmail({
            to: process.env.NEXT_PUBLIC_ADMIN_EMAIL!, // Send to Admin
            subject: `New Order #${orderId} - ${customerName}`,
            html: html
        })

        return NextResponse.json({ success: true, message: 'Admin notification sent' })

    } catch (error: any) {
        console.error('Email Notification Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
