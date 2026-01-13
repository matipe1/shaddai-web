import emailjs from '@emailjs/browser';
import { globalInfo } from '../data';

interface EmailData {
    email: string;
    name: string;
    subject: string;
    message: string;
    time: string;
}

export const sendEmail = async (data: EmailData): Promise<void> => {
  try {
    const result = await emailjs.send(
      'service_4ikpd6s',
      'template_1yxhf9p',
      {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        time: data.time,
        to_email: globalInfo.email,
      },
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );
    console.log('Email enviado exitosamente:', result.text);
  } catch (error) {
    console.error('Error enviando email:', error);
    throw error;
  }
};