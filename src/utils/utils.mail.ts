import { createTransport } from 'nodemailer';
import { MailOption } from './types/utils.types';

export const sendMail = async (options: MailOption) => {
  const transporter = createTransport({
    host: process.env.SMPT_HOST,
    port: +process.env.SMPT_PORT! || 0,
    secure: true,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Chessalx" ${process.env.SMPT_MAIL}`,
    ...options,
  };
  await transporter.sendMail(mailOptions);
};
