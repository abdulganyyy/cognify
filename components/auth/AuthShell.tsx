import type { ReactNode } from "react"
import { BookOpen } from "lucide-react"

interface AuthShellProps {
  children: ReactNode
  title?: string
  description?: string
}

export function AuthShell({
  children,
  title = "Cognify",
  description = "Workspace belajar yang tenang, modern, dan fokus.",
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-2">
        <div className="hidden border-r border-border/60 bg-background lg:flex lg:flex-col lg:justify-between lg:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>

            <div>
              <p className="text-base font-semibold tracking-tight text-foreground">
                {title}
              </p>
              <p className="text-sm text-muted-foreground">
                Learning workspace
              </p>
            </div>
          </div>

          <div className="max-w-md space-y-5">
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Welcome
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                Belajar lebih terstruktur dengan Cognify.
              </h1>
              <p className="text-base leading-7 text-muted-foreground">
                Simpan dokumen, rangkum materi, identifikasi topik penting, dan
                bangun ritme belajar yang lebih konsisten.
              </p>
            </div>

            <div className="grid gap-3">
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                <p className="text-sm font-medium text-foreground">
                  Ringkasan otomatis
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Ubah dokumen belajar menjadi insight yang lebih mudah dipahami.
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                <p className="text-sm font-medium text-foreground">
                  Topik yang terstruktur
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Fokus pada inti materi tanpa kehilangan konteks utama.
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                <p className="text-sm font-medium text-foreground">
                  Workspace yang tenang
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Antarmuka bersih dengan whitespace yang nyaman untuk belajar.
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  )
}