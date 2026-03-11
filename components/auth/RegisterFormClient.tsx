"use client";

import { useState } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { createClient } from "@/lib/supabase/browser";

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
};

export function RegisterFormClient() {
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

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    setSuccessMessage(
      "Pendaftaran berhasil. Silakan cek email kamu untuk verifikasi akun."
    );
  }

  return (
    <RegisterForm onSubmit={handleRegister} successMessage={successMessage} />
  );
}