import Link from "next/link"

import { AuthCard } from "@/components/auth/AuthCard"
import { AuthShell } from "@/components/auth/AuthShell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  return (
    <AuthShell>
      <AuthCard
        eyebrow="Create Account"
        title="Buat akun Cognify"
        description="Mulai workspace belajarmu dan simpan materi dengan alur yang lebih terstruktur."
        footerText="Sudah punya akun?"
        footerLinkLabel="Masuk"
        footerLinkHref="/login"
      >
        <form className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nama</Label>
            <Input
              id="name"
              type="text"
              placeholder="Nama lengkap"
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Buat password"
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Konfirmasi Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Ulangi password"
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" className="h-11 w-full rounded-xl">
            Buat Akun
          </Button>
        </form>
      </AuthCard>
    </AuthShell>
  )
}