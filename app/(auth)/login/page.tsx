import Link from "next/link";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
	return (
		<AuthShell>
			<AuthCard
				eyebrow="Sign In"
				title="Masuk ke Cognify"
				description="Lanjutkan ke workspace belajarmu dengan akun yang sudah terdaftar."
				footerText="Belum punya akun?"
				footerLinkLabel="Daftar"
				footerLinkHref="/register"
			>
				<form className="space-y-5">
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
						<div className="flex items-center justify-between gap-3">
							<Label htmlFor="password">Password</Label>
							<Link
								href="#"
								className="text-sm font-medium text-primary transition-opacity hover:opacity-80"
							>
								Lupa password?
							</Link>
						</div>

						<Input
							id="password"
							type="password"
							placeholder="Masukkan password"
							autoComplete="current-password"
						/>
					</div>

					<Button
						type="submit"
						className="h-11 w-full rounded-xl"
					>
						Masuk
					</Button>
				</form>
			</AuthCard>
		</AuthShell>
	);
}
