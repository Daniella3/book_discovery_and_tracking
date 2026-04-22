const fetchJson = (...args) => {
    if (typeof global.fetch === 'function') {
        return global.fetch(...args);
    }

    return import('node-fetch').then(({ default: fetch }) => fetch(...args));
};

const RESEND_API_URL = 'https://api.resend.com/emails';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM;

const sendVerificationEmail = async ({ to, verificationUrl }) => {
    if (!RESEND_API_KEY || !EMAIL_FROM) {
        throw new Error('Email service is not configured');
    }

    const response = await fetchJson(RESEND_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
            from: EMAIL_FROM,
            to: [to],
            subject: 'Verify your Book Discovery account',
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #3E2C23;">
                <h2>Verify your email</h2>
                <p>Thanks for creating an account. Click below to verify your email and unlock your dashboard.</p>
                <p style="margin: 24px 0;">
                  <a href="${verificationUrl}" style="background: #562F00; color: #FFF0BD; padding: 12px 20px; border-radius: 999px; text-decoration: none; font-weight: bold;">
                    Verify Email
                  </a>
                </p>
                <p>If the button does not work, use this link:</p>
                <p><a href="${verificationUrl}">${verificationUrl}</a></p>
              </div>
            `,
        }),
    });

    if (!response.ok) {
        const payload = await response.text();
        throw new Error(`Failed to send verification email: ${payload}`);
    }
};

module.exports = {
    sendVerificationEmail,
};
