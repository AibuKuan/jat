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

interface VerificationEmailProps {
  userFirstName?: string;
  verificationUrl?: string;
}

export const VerificationEmail = ({
  userFirstName = "there",
  verificationUrl = "https://example.com/verify?token=sample-token",
}: VerificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address to complete your registration</Preview>
      <Tailwind>
        <Body className="bg-slate-50 font-sans text-slate-800 my-auto mx-auto">
          <Container className="border border-solid border-slate-200 rounded-lg my-[40px] mx-auto p-[32px] max-w-[465px] bg-white shadow-sm">
            <Heading className="text-slate-900 text-[22px] font-semibold text-left p-0 my-[16px] mx-0">
              Verify your email address
            </Heading>
            <Text className="text-[14px] leading-[24px] text-slate-600">
              Hi {userFirstName},
            </Text>
            <Text className="text-[14px] leading-[24px] text-slate-600">
              Thanks for signing up! Please verify your email address by clicking the button below.
            </Text>
            <Section className="text-center my-[32px]">
              <Button
                className="bg-indigo-600 rounded-md text-white font-medium text-[14px] px-[20px] py-[12px] text-center inline-block no-underline"
                href={verificationUrl}
              >
                Verify Email Address
              </Button>
            </Section>
            <Text className="text-[14px] leading-[24px] text-slate-600">
              Or copy and paste this link into your browser:
            </Text>
            <Text className="text-[14px] leading-[20px] text-slate-500 break-all">
              <Link href={verificationUrl} className="text-indigo-600 underline">
                {verificationUrl}
              </Link>
            </Text>
            <Hr className="border border-solid border-slate-200 my-[24px] mx-0 w-full" />
            <Text className="text-[12px] leading-[18px] text-slate-400">
              If you didn't create an account, you can safely ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default VerificationEmail;