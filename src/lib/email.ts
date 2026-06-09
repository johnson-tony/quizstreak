import nodemailer from 'nodemailer';

const EMAIL = process.env.EMAIL;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD; // You'll need to set this in .env.local

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  if (!EMAIL || !EMAIL_PASSWORD) {
    console.error('Email credentials not set');
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL,
      pass: EMAIL_PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"QuizStreak Support" <${EMAIL}>`,
      to,
      subject,
      text,
      html: html || text,
    });
    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
