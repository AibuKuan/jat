import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface ResetPasswordEmailProps {
  userFirstName?: string;
  resetUrl?: string;
}

export const ResetPasswordEmail = ({
  userFirstName = "there",
  resetUrl = "https://example.com/reset-password?token=sample-token",
}: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Tailwind>
        <Body className="bg-slate-50 font-sans text-slate-800 my-auto mx-auto">
          <Container className="border border-solid border-slate-200 rounded-lg my-[40px] mx-auto p-[32px] max-w-[465px] bg-white shadow-sm">
            <Heading className="text-slate-900 text-[22px] font-semibold text-left p-0 my-[16px] mx-0">
              Reset your password
            </Heading>
            <Text className="text-[14px] leading-[24px] text-slate-600">
              Hi {userFirstName},
            </Text>
            <Text className="text-[14px] leading-[24px] text-slate-600">
              We received a request to reset your password. Click the button
              below to choose a new one. This link expires in 1 hour.
            </Text>
            <Section className="text-center my-[32px]">
              <Button
                className="bg-indigo-600 rounded-md text-white font-medium text-[14px] px-[20px] py-[12px] text-center inline-block no-underline"
                href={resetUrl}
              >
                Reset Password
              </Button>
            </Section>
            <Text className="text-[14px] leading-[24px] text-slate-600">
              Or copy and paste this link into your browser:
            </Text>
            <Text className="text-[14px] leading-[20px] text-slate-500 break-all">
              <Link href={resetUrl} className="text-indigo-600 underline">
                {resetUrl}
              </Link>
            </Text>
            <Hr className="border border-solid border-slate-200 my-[24px] mx-0 w-full" />
            <Text className="text-[12px] leading-[18px] text-slate-400">
              If you didn't request a password reset, you can safely ignore
              this email. Your password won't change.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ResetPasswordEmail;