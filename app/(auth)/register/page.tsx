import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterFormClient } from "@/components/auth/RegisterFormClient";
import { redirectIfAuthenticated } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Daftar Akun — Cognify",
  description: "Buat akun Cognify gratis dan mulai belajar lebih cerdas.",
};

export default async function RegisterPage() {
  await redirectIfAuthenticated();

  return (
    <AuthCard>
      <RegisterFormClient />
    </AuthCard>
  );
}