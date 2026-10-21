import { Resend } from "resend";
import { render } from "@react-email/components";
import VerificationEmail from "@/components/emails/verification-email";
import ResetPasswordEmail from "@/components/emails/reset-password-email";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Job Tracker <onboarding@resend.dev>";

async function send({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const { error } = await resend.emails.send({ from: FROM, to, subject, html });

  if (error) {
    console.error(`Failed to send "${subject}" email:`, error);
    throw new Error("Could not send email");
  }
}

export async function sendVerificationEmail({
  to,
  url,
  userName = "there",
}: {
  to: string;
  url: string;
  userName?: string;
}) {
  const html = await render(
    VerificationEmail({ userFirstName: userName, verificationUrl: url }),
  );
  await send({ to, subject: "Verify your email address", html });
}

export async function sendResetPasswordEmail({
  to,
  url,
  userName = "there",
}: {
  to: string;
  url: string;
  userName?: string;
}) {
  const html = await render(
    ResetPasswordEmail({ userFirstName: userName, resetUrl: url }),
  );
  await send({ to, subject: "Reset your password", html });
}