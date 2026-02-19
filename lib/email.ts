
import nodemailer from 'nodemailer'

interface EmailPayload {
    to: string
    subject: string
    html: string
}

const smtpOptions = {
    host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
}

export const sendEmail = async (data: EmailPayload) => {
    const transporter = nodemailer.createTransport({
        ...smtpOptions,
    })

    // Sending FROM the verified admin email (or SMTP user as fallback)
    // But authenticating with the Brevo SMTP user credential
    const senderEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.SMTP_USER;

    return await transporter.sendMail({
        from: `"Buynic Shop" <${senderEmail}>`,
        ...data,
    })
}
