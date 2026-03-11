import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterFormClient } from "@/components/auth/RegisterFormClient";

export const metadata: Metadata = {
  title: "Create account — Cognify",
  description: "Sign up for a free Cognify account and start learning smarter.",
};

export default function RegisterPage() {
  return (
    <AuthCard>
      <RegisterFormClient />
    </AuthCard>
  );
}