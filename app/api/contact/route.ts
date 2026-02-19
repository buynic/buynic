import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
    try {
        const { firstName, lastName, email, message } = await request.json()

        // Validate input
        if (!firstName || !email || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        console.log("Attempting to send email via Brevo...")
        console.log("Host:", process.env.SMTP_HOST)
        console.log("User:", process.env.SMTP_USER)
        console.log("Password Length:", process.env.SMTP_PASSWORD?.length) // Check if password is being read
        // Create Transporter (Brevo SMTP)
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER?.trim(), // Ensure no spaces
                pass: process.env.SMTP_PASSWORD?.trim(), // Ensure no spaces
            },
        })

        // Email Content
        // Sending FROM the verified admin email (buynic.shop@gmail.com)
        // But authenticating with the Brevo SMTP user (a2bb3f001...)
        const senderEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.SMTP_USER;

        const mailOptions = {
            from: `"Buynic Contact Form" <${senderEmail}>`, // Display Name <email>
            to: process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.SMTP_USER, // Admin receives it
            replyTo: email, // Admin can reply directly to the user
            subject: `New Inquiry from ${firstName} ${lastName}`,
            text: `
        You have a new message from the Buynic contact form:

        Name: ${firstName} ${lastName}
        Email: ${email}

        Message:
        ${message}
      `,
            html: `
        <h3>New Inquiry from Buynic Website</h3>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <br/>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
        }

        // Send Email
        await transporter.sendMail(mailOptions)

        return NextResponse.json({ success: true, message: 'Email sent successfully!' })
    } catch (error: any) {
        console.error('Email API Error:', error)
        return NextResponse.json(
            { error: 'Failed to send email', details: error.message },
            { status: 500 }
        )
    }
}
