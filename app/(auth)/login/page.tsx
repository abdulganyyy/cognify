import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginFormClient } from "@/components/auth/LoginFormClient";

export const metadata: Metadata = {
  title: "Sign in — Cognify",
  description: "Sign in to your Cognify account.",
};

export default function LoginPage() {
  return (
    <AuthCard>
      <LoginFormClient />
    </AuthCard>
  );
}