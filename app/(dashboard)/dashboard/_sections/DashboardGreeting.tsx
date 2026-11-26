import type { DashboardUser } from "@/app/(dashboard)/dashboard/types";

interface DashboardGreetingProps {
  user: DashboardUser;
  documentCount: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

function getFirstName(fullName: string): string {
  return fullName.split(" ")[0];
}

/**
 * DashboardGreeting
 *
 * Baris paling atas dashboard: sapaan personal + konteks singkat.
 */
export function DashboardGreeting({
  user,
  documentCount,
}: DashboardGreetingProps) {
  const greeting = getGreeting();
  const firstName = getFirstName(user.name);

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">
        {greeting}, {firstName} 👋
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        {documentCount === 0
          ? "Unggah PDF pertamamu untuk mulai belajar."
          : `Kamu memiliki ${documentCount} dokumen di ruang belajarmu.`}
      </p>
    </div>
  );
}