import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginFormClient } from "@/components/auth/LoginFormClient";
import { redirectIfAuthenticated } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Masuk — Cognify",
  description: "Masuk ke akun Cognify kamu.",
};

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <AuthCard>
      <Suspense fallback={null}>
        <LoginFormClient />
      </Suspense>
    </AuthCard>
  );
}
