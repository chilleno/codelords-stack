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
    key: process.env.MAILGUN_API_KEY || "API_KEY",
  });
  try {
    const domain = process.env.MAILGUN_DOMAIN || "ticroom.cl";
    const from = `Masenlaces.com <postmaster@${domain}>`;
    const data = await mg.messages.create(domain, {
      from,
      to: [`${name}<${email}>`],
      subject,
      text,
      ...(html ? { html } : {}),
    });

    return {
      ok: true,
  data: data,
    };
  } catch (error) {
    console.error(error); //logs any error
    return {
      ok: false,
      error: error,
    };
  }
}