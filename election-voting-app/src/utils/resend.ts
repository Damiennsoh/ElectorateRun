import { Resend } from 'resend';

const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;

if (!resendApiKey) {
  console.error('CRITICAL: Resend API key is missing! Check your .env file.');
}

export const resend = new Resend(resendApiKey || 'missing-key');

export interface EmailOptions {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    const { data, error } = await resend.emails.send(options);
    
    if (error) {
      console.error('Resend API error:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to send email via Resend:', error);
    throw error;
  }
};
