import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardUser } from "@/app/(dashboard)/dashboard/types";

interface DashboardGreetingProps {
  user: DashboardUser;
  documentCount: number;
  onUploadClick?: () => void;
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
 * Baris paling atas dashboard: sapaan personal + konteks singkat + CTA upload.
 *
 * @example
 * <DashboardGreeting
 *   user={user}
 *   documentCount={documents.length}
 *   onUploadClick={() => setUploadOpen(true)}
 * />
 */
export function DashboardGreeting({
  user,
  documentCount,
  onUploadClick,
}: DashboardGreetingProps) {
  const greeting = getGreeting();
  const firstName = getFirstName(user.name);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

      <Button
        onClick={onUploadClick}
        size="sm"
        className="h-9 gap-2 self-start bg-blue-600 px-4 text-xs font-medium text-white hover:bg-blue-700 shadow-sm shadow-blue-100 sm:self-auto shrink-0"
      >
        <Upload className="h-3.5 w-3.5" />
        Unggah PDF
      </Button>
    </div>
  );
}