import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterFormClient } from "@/components/auth/RegisterFormClient";

export const metadata: Metadata = {
  title: "Daftar Akun — Cognify",
  description: "Buat akun Cognify gratis dan mulai belajar lebih cerdas.",
};

export default function RegisterPage() {
  return (
    <AuthCard>
      <RegisterFormClient />
    </AuthCard>
  );
}