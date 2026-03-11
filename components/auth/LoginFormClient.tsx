"use client";

import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { createClient } from "@/lib/supabase/browser";

type LoginFormValues = {
  email: string;
  password: string;
};

export function LoginFormClient() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin({ email, password }: LoginFormValues) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    router.push("/dashboard");
    router.refresh();
  }

  return <LoginForm onSubmit={handleLogin} />;
}