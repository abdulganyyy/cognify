import { cn } from "@/lib/utils/cn";

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * AuthCard
 *
 * Reusable centered card wrapper untuk semua halaman auth:
 * login, register, forgot-password, reset-password.
 *
 * Background menggunakan dot-grid pattern yang sama dengan landing page
 * untuk konsistensi visual Cognify.
 *
 * @example
 * // app/(auth)/login/page.tsx
 * <AuthCard>
 *   <LoginForm onSubmit={...} />
 * </AuthCard>
 *
 * // app/(auth)/register/page.tsx
 * <AuthCard>
 *   <RegisterForm onSubmit={...} />
 * </AuthCard>
 */
export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{
        backgroundImage:
          "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        backgroundColor: "#FAFAFA",
      }}
    >
      {/* Vignette fade from edges */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#FAFAFA] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#FAFAFA] to-transparent" />
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#FAFAFA] to-transparent" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#FAFAFA] to-transparent" />
      </div>

      {/* Card */}
      <div
        className={cn(
          "relative w-full max-w-[400px]",
          "rounded-2xl border border-neutral-200/80 bg-white",
          "px-8 py-10",
          "shadow-xl shadow-neutral-200/50",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}