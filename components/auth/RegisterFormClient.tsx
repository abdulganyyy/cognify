"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { formatAuthErrorMessage } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/browser";

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
};

export function RegisterFormClient() {
  const router = useRouter();
  const supabase = createClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleRegister({
    name,
    email,
    password,
  }: RegisterFormValues) {
    setSuccessMessage(null);

    const origin =
      typeof window !== "undefined" ? window.location.origin : "";

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: `${origin}/callback`,
      },
    });

    if (error) {
      throw new Error(formatAuthErrorMessage(error.message));
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setSuccessMessage(
      "Pendaftaran berhasil. Silakan cek email kamu untuk verifikasi akun."
    );
  }

  return (
    <RegisterForm onSubmit={handleRegister} successMessage={successMessage} />
  );
}
