"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterFormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  root?: string;
}

export interface RegisterFormProps {
  onSubmit: (values: RegisterFormValues) => Promise<void>;
  serverErrors?: RegisterFormErrors;
  isLoading?: boolean;
  showConfirmPassword?: boolean;
  successMessage?: string | null;
}

// ─── Password strength ────────────────────────────────────────────────────────

type StrengthLevel = "empty" | "weak" | "fair" | "strong";

function getPasswordStrength(pw: string): StrengthLevel {
  if (!pw) return "empty";

  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return "weak";
  if (score === 2) return "fair";
  return "strong";
}

const strengthConfig: Record<
  StrengthLevel,
  { label: string; color: string; bars: number }
> = {
  empty: { label: "", color: "bg-neutral-200", bars: 0 },
  weak: { label: "Lemah", color: "bg-red-400", bars: 1 },
  fair: { label: "Cukup", color: "bg-amber-400", bars: 2 },
  strong: { label: "Kuat", color: "bg-emerald-500", bars: 3 },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function RegisterForm({
  onSubmit,
  serverErrors,
  isLoading: externalLoading,
  showConfirmPassword = true,
  successMessage,
}: RegisterFormProps) {
  const [values, setValues] = useState<RegisterFormValues>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<RegisterFormErrors>(serverErrors ?? {});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);

  const isLoading = externalLoading ?? internalLoading;
  const activeErrors = serverErrors ?? errors;
  const strength = getPasswordStrength(values.password);
  const strengthCfg = strengthConfig[strength];

  useEffect(() => {
    if (serverErrors) {
      setErrors(serverErrors);
    }
  }, [serverErrors]);

  function validate(): RegisterFormErrors {
    const errs: RegisterFormErrors = {};

    if (!values.name.trim()) {
      errs.name = "Nama lengkap wajib diisi.";
    } else if (values.name.trim().length < 2) {
      errs.name = "Nama minimal 2 karakter.";
    }

    if (!values.email.trim()) {
      errs.email = "Email wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errs.email = "Masukkan alamat email yang valid.";
    }

    if (!values.password) {
      errs.password = "Kata sandi wajib diisi.";
    } else if (values.password.length < 8) {
      errs.password = "Kata sandi minimal 8 karakter.";
    }

    if (showConfirmPassword) {
      if (!values.confirmPassword) {
        errs.confirmPassword = "Mohon konfirmasi kata sandi.";
      } else if (values.confirmPassword !== values.password) {
        errs.confirmPassword = "Kata sandi tidak cocok.";
      }
    }

    return errs;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan. Silakan coba lagi.";

      setErrors({ root: message });
    } finally {
      setInternalLoading(false);
    }
  }

  function handleChange(field: keyof RegisterFormValues) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = e.target.value;

      setValues((prev) => ({
        ...prev,
        [field]: nextValue,
      }));

      if (errors[field] || errors.root) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
          root: undefined,
        }));
      }
    };
  }

  function inputCn(hasError?: string) {
    return cn(
      "h-10 rounded-xl border-neutral-200 bg-white text-sm",
      "placeholder:text-neutral-400",
      "focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:border-blue-400",
      "transition-colors",
      hasError &&
        "border-red-300 focus-visible:ring-red-100 focus-visible:border-red-400"
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <div className="mb-5 flex justify-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 shadow-md shadow-blue-200">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
        </div>

        <h1 className="mb-1.5 font-serif text-2xl font-normal tracking-tight text-neutral-900">
          Buat akun Cognify
        </h1>

        <p className="text-sm text-neutral-500">
          Mulai belajar lebih cerdas dengan Cognify — gratis
        </p>
      </div>

      {activeErrors.root && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
          <p className="text-sm leading-relaxed text-red-700">
            {activeErrors.root}
          </p>
        </div>
      )}

      {successMessage && !activeErrors.root && (
        <div
          role="status"
          className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
          <p className="text-sm leading-relaxed text-emerald-700">
            {successMessage}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-medium text-neutral-700">
            Nama lengkap
          </Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Budi Santoso"
            value={values.name}
            onChange={handleChange("name")}
            disabled={isLoading}
            aria-invalid={!!activeErrors.name}
            aria-describedby={activeErrors.name ? "name-error" : undefined}
            className={inputCn(activeErrors.name)}
          />
          {activeErrors.name && (
            <FieldError id="name-error" message={activeErrors.name} />
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium text-neutral-700">
            Alamat email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="kamu@kampus.ac.id"
            value={values.email}
            onChange={handleChange("email")}
            disabled={isLoading}
            aria-invalid={!!activeErrors.email}
            aria-describedby={activeErrors.email ? "email-error" : undefined}
            className={inputCn(activeErrors.email)}
          />
          {activeErrors.email && (
            <FieldError id="email-error" message={activeErrors.email} />
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="text-xs font-medium text-neutral-700"
          >
            Kata sandi
          </Label>

          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 karakter"
              value={values.password}
              onChange={handleChange("password")}
              disabled={isLoading}
              aria-invalid={!!activeErrors.password}
              aria-describedby={
                activeErrors.password ? "password-error" : "password-strength"
              }
              className={cn(inputCn(activeErrors.password), "pr-10")}
            />

            <TogglePasswordButton
              show={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
              disabled={isLoading}
            />
          </div>

          {values.password && strength !== "empty" && (
            <div id="password-strength" className="space-y-1.5 pt-0.5">
              <div className="flex gap-1">
                {[1, 2, 3].map((bar) => (
                  <div
                    key={bar}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-all duration-300",
                      bar <= strengthCfg.bars
                        ? strengthCfg.color
                        : "bg-neutral-100"
                    )}
                  />
                ))}
              </div>

              <p
                className={cn(
                  "text-[11px] font-medium",
                  strength === "weak" && "text-red-500",
                  strength === "fair" && "text-amber-600",
                  strength === "strong" && "text-emerald-600"
                )}
              >
                Kekuatan kata sandi: {strengthCfg.label}
                {strength === "strong" && (
                  <CheckCircle2 className="ml-1 inline h-3 w-3" />
                )}
              </p>
            </div>
          )}

          {activeErrors.password && (
            <FieldError id="password-error" message={activeErrors.password} />
          )}
        </div>

        {showConfirmPassword && (
          <div className="space-y-1.5">
            <Label
              htmlFor="confirmPassword"
              className="text-xs font-medium text-neutral-700"
            >
              Konfirmasi kata sandi
            </Label>

            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Ulangi kata sandi"
                value={values.confirmPassword}
                onChange={handleChange("confirmPassword")}
                disabled={isLoading}
                aria-invalid={!!activeErrors.confirmPassword}
                aria-describedby={
                  activeErrors.confirmPassword
                    ? "confirmPassword-error"
                    : undefined
                }
                className={cn(inputCn(activeErrors.confirmPassword), "pr-10")}
              />

              <TogglePasswordButton
                show={showConfirm}
                onToggle={() => setShowConfirm((v) => !v)}
                disabled={isLoading}
              />
            </div>

            {values.confirmPassword &&
              !activeErrors.confirmPassword &&
              values.confirmPassword === values.password && (
                <p className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Kata sandi cocok
                </p>
              )}

            {activeErrors.confirmPassword && (
              <FieldError
                id="confirmPassword-error"
                message={activeErrors.confirmPassword}
              />
            )}
          </div>
        )}

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
              Membuat akun…
            </span>
          ) : (
            "Buat Akun"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-medium text-blue-600 transition-colors hover:text-blue-800"
        >
          Masuk
        </Link>
      </p>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p
      id={id}
      role="alert"
      className="flex items-center gap-1 text-xs text-red-600"
    >
      <AlertCircle className="h-3 w-3 flex-shrink-0" />
      {message}
    </p>
  );
}

function TogglePasswordButton({
  show,
  onToggle,
  disabled,
}: {
  show: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
      tabIndex={-1}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-700 focus:outline-none"
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}