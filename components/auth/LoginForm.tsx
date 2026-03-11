"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  /** Top-level error, e.g. "Invalid credentials" */
  root?: string;
}

export interface LoginFormProps {
  /**
   * Called on submit with form values.
   * Should throw or return an error string to surface inline errors.
   * Resolves normally on success (redirect handled by parent/server).
   */
  onSubmit: (values: LoginFormValues) => Promise<void>;
  /** Pre-fill errors from server (e.g. from server action) */
  serverErrors?: LoginFormErrors;
  /** Override loading state from outside (e.g. router transition) */
  isLoading?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * LoginForm
 *
 * Presentational form component — fully controlled state, zero backend coupling.
 * Connect via `onSubmit` prop.
 *
 * @example — with Supabase
 * <LoginForm
 *   onSubmit={async ({ email, password }) => {
 *     const { error } = await supabase.auth.signInWithPassword({ email, password });
 *     if (error) throw new Error(error.message);
 *     router.push("/dashboard");
 *   }}
 * />
 *
 * @example — with Next.js Server Action
 * <LoginForm onSubmit={loginAction} serverErrors={actionState?.errors} />
 */
export function LoginForm({
  onSubmit,
  serverErrors,
  isLoading: externalLoading,
}: LoginFormProps) {
  const [values, setValues] = useState<LoginFormValues>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginFormErrors>(serverErrors ?? {});
  const [showPassword, setShowPassword] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);

  const isLoading = externalLoading ?? internalLoading;

  // ── Sync server errors if prop changes ──
  // In a real app this is handled by useEffect or useFormState
  const activeErrors = serverErrors ?? errors;

  // ── Validation ────────────────────────────────────────────────────────────

  function validate(): LoginFormErrors {
    const errs: LoginFormErrors = {};
    if (!values.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errs.email = "Enter a valid email address.";
    }
    if (!values.password) {
      errs.password = "Password is required.";
    } else if (values.password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }
    return errs;
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setInternalLoading(true);
    try {
      await onSubmit(values);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Try again.";
      setErrors({ root: message });
    } finally {
      setInternalLoading(false);
    }
  }

  // ── Field change ──────────────────────────────────────────────────────────

  function handleChange(field: keyof LoginFormValues) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
      // Clear field error on change
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="w-full">
      {/* ── Logo + Heading ─────────────────────────────────────────────── */}
      <div className="mb-8 text-center">
        <div className="mb-5 flex justify-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 shadow-md shadow-blue-200">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
        </div>
        <h1
          className="mb-1.5 text-2xl font-normal tracking-tight text-neutral-900"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          Welcome back
        </h1>
        <p className="text-sm text-neutral-500">
          Sign in to continue learning with Cognify
        </p>
      </div>

      {/* ── Root Error ─────────────────────────────────────────────────── */}
      {activeErrors.root && (
        <div
          role="alert"
          className={cn(
            "mb-5 flex items-start gap-2.5 rounded-xl border border-red-100",
            "bg-red-50 px-4 py-3"
          )}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
          <p className="text-sm leading-relaxed text-red-700">
            {activeErrors.root}
          </p>
        </div>
      )}

      {/* ── Form ───────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="text-xs font-medium text-neutral-700"
          >
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@university.ac.id"
            value={values.email}
            onChange={handleChange("email")}
            disabled={isLoading}
            aria-invalid={!!activeErrors.email}
            aria-describedby={activeErrors.email ? "email-error" : undefined}
            className={cn(
              "h-10 rounded-xl border-neutral-200 bg-white text-sm",
              "placeholder:text-neutral-400",
              "focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:border-blue-400",
              "transition-colors",
              activeErrors.email &&
                "border-red-300 focus-visible:ring-red-100 focus-visible:border-red-400"
            )}
          />
          {activeErrors.email && (
            <p
              id="email-error"
              role="alert"
              className="flex items-center gap-1 text-xs text-red-600"
            >
              <AlertCircle className="h-3 w-3" />
              {activeErrors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-xs font-medium text-neutral-700"
            >
              Password
            </Label>
            <Link
              href="/forgot-password"
              tabIndex={isLoading ? -1 : 0}
              className="text-xs text-blue-500 transition-colors hover:text-blue-700"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={values.password}
              onChange={handleChange("password")}
              disabled={isLoading}
              aria-invalid={!!activeErrors.password}
              aria-describedby={
                activeErrors.password ? "password-error" : undefined
              }
              className={cn(
                "h-10 rounded-xl border-neutral-200 bg-white pr-10 text-sm",
                "placeholder:text-neutral-400",
                "focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:border-blue-400",
                "transition-colors",
                activeErrors.password &&
                  "border-red-300 focus-visible:ring-red-100 focus-visible:border-red-400"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={isLoading}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-700 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {activeErrors.password && (
            <p
              id="password-error"
              role="alert"
              className="flex items-center gap-1 text-xs text-red-600"
            >
              <AlertCircle className="h-3 w-3" />
              {activeErrors.password}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "mt-1 h-10 w-full rounded-xl text-sm font-medium",
            "bg-blue-600 text-white hover:bg-blue-700",
            "shadow-sm shadow-blue-100 transition-all",
            "focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-1"
          )}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in…
            </span>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      {/* ── Footer link ────────────────────────────────────────────────── */}
      <p className="mt-6 text-center text-sm text-neutral-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-blue-600 transition-colors hover:text-blue-800"
        >
          Create one free
        </Link>
      </p>
    </div>
  );
}