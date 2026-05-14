import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // true for port 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Instagram Clone" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};