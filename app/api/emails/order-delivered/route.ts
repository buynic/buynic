
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { emailTemplates } from '@/lib/email-templates'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { customerName, customerEmail, orderId, products } = body

        if (!customerEmail || !orderId) {
            return NextResponse.json({ error: 'Missing Email or Order ID' }, { status: 400 })
        }

        const html = emailTemplates.orderDelivered(customerName, orderId, products)

        await sendEmail({
            to: customerEmail,
            subject: `Your Order #${orderId} has been Delivered! 🎁`,
            html: html
        })

        return NextResponse.json({ success: true, message: 'Delivered email sent' })

    } catch (error: any) {
        console.error('Delivered Email Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
