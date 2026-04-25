import "server-only";
import { logger } from "@/lib/logger";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { env } from "@/lib/config/env";

export type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (
    env.NODE_ENV === "development" ||
    !env.SMTP_HOST ||
    !env.SMTP_PORT ||
    !env.SMTP_USER ||
    !env.SMTP_PASSWORD
  ) {
    return null;
  }

  if (transporter) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT, 10),
    secure: parseInt(env.SMTP_PORT, 10) === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
  });

  logger.info({ host: env.SMTP_HOST, port: env.SMTP_PORT }, "SMTP transporter initialized");

  return transporter;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const mailer = getTransporter();

  if (!mailer) {
    logger.info({ to: options.to, subject: options.subject }, "Email sending skipped (development mode or SMTP not configured)");
    return true;
  }

  try {
    const fromEmail = env.SMTP_FROM_EMAIL || env.SMTP_USER;
    const fromName = env.SMTP_FROM_NAME || "Blog";

    await mailer.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    logger.info({ to: options.to, subject: options.subject }, "Email sent successfully");

    return true;
  } catch (error) {
    logger.error({ to: options.to, subject: options.subject, error: error instanceof Error ? error.message : String(error) }, "Failed to send email");

    return false;
  }
}

export async function testConnection(): Promise<boolean> {
  const mailer = getTransporter();

  if (!mailer) {
    logger.warn("SMTP not configured, skipping connection test");
    return false;
  }

  try {
    await mailer.verify();
    logger.info("SMTP connection verified successfully");
    return true;
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : String(error) }, "SMTP connection test failed");
    return false;
  }
}
