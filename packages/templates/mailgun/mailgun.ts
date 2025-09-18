import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0

export async function sendSimpleMessage(
  name: string,
  email: string,
  subject: string,
  text: string,
  html?: string
) {
  // Basic input validation
  const isNonEmptyString = (v: string) => v.trim().length > 0;
  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  if (!isNonEmptyString(name)) {
    throw new Error("Parameter 'name' is required and must be a non-empty string.");
  }
  if (!isValidEmail(email)) {
    throw new Error("Parameter 'email' must be a valid email address.");
  }
  if (!isNonEmptyString(subject)) {
    throw new Error("Parameter 'subject' is required and must be a non-empty string.");
  }
  if (!isNonEmptyString(text)) {
    throw new Error("Parameter 'text' is required and must be a non-empty string.");
  }

  // Validate required environment variables
  const apiKey = process.env.MAILGUN_API_KEY;
  if (!apiKey) {
    throw new Error("MAILGUN_API_KEY is required but not set in environment variables.");
  }
  const domain = process.env.MAILGUN_DOMAIN;
  if (!domain) {
    throw new Error("MAILGUN_DOMAIN is required but not set in environment variables.");
  }
  const fromName = process.env.MAILGUN_FROM_NAME;
  if (!fromName) {
    throw new Error("MAILGUN_FROM_NAME is required but not set in environment variables.");
  }

  const toName = name.trim();
  const toEmail = email.trim();
  const from = `${fromName} <postmaster@${domain}>`;

  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: apiKey,
    ...(process.env.MAILGUN_BASE_URL ? { url: process.env.MAILGUN_BASE_URL } : {}),
  });
  try {
    const data = await mg.messages.create(domain, {
      from,
      to: [`${toName} <${toEmail}>`],
      subject: subject.trim(),
      text: text.trim(),
      ...(html ? { html } : {}),
    });

    return {
      ok: true,
      data,
    };
  } catch (error) {
    console.error(error); // logs any error
    return {
      ok: false,
      error,
    };
  }
}