import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0

export async function sendSimpleMessage(
  name: string,
  email: string,
  subject: string,
  text: string,
  html?: string
) {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY,
  });
  try {
    const domain = process.env.MAILGUN_DOMAIN;
    const fromName = process.env.MAILGUN_FROM_NAME;
    const from = `${fromName} <postmaster@${domain}>`;
    const data = await mg.messages.create(domain, {
      from,
      to: [`${name} <${email}>`],
      subject,
      text,
      ...(html ? { html } : {}),
    });

    return {
      ok: true,
      data,
    };
  } catch (error) {
    console.error(error); //logs any error
    return {
      ok: false,
      error: error,
    };
  }
}