"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { formatAuthErrorMessage } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/browser";

type LoginFormValues = {
  email: string;
  password: string;
};

export function LoginFormClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  async function handleLogin({ email, password }: LoginFormValues) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(formatAuthErrorMessage(error.message));
    }

    const nextParam = searchParams.get("next");
    const safeNext =
      nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
        ? nextParam
        : "/dashboard";

    router.push(safeNext);
    router.refresh();
  }

  return <LoginForm onSubmit={handleLogin} />;
}
