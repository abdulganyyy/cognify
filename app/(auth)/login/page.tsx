import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginFormClient } from "@/components/auth/LoginFormClient";

export const metadata: Metadata = {
  title: "Masuk — Cognify",
  description: "Masuk ke akun Cognify kamu.",
};

export default function LoginPage() {
  return (
    <AuthCard>
      <Suspense fallback={null}>
        <LoginFormClient />
      </Suspense>
    </AuthCard>
  );
}
