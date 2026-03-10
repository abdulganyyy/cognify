import * as React from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface UploadTriggerButtonProps {
	label?: string;
	helperText?: string;
	icon?: React.ReactNode;
	onClick?: () => void;
	disabled?: boolean;
	className?: string;
}

export function UploadTriggerButton({ label = "Unggah File", helperText, icon, onClick, disabled, className }: UploadTriggerButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"group flex w-full items-center justify-between gap-4 rounded-2xl border border-dashed border-border bg-background px-4 py-4 text-left transition-colors hover:border-blue-200 hover:bg-blue-50/40 disabled:pointer-events-none disabled:opacity-50 dark:hover:border-blue-900 dark:hover:bg-blue-950/20",
				className,
			)}
		>
			<div className="flex min-w-0 items-center gap-3">
				<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-muted/40 text-muted-foreground transition-colors group-hover:text-blue-700 dark:group-hover:text-blue-300">
					{icon ?? <UploadCloud className="h-5 w-5" />}
				</div>

				<div className="min-w-0">
					<p className="text-sm font-medium text-foreground">{label}</p>
					{helperText ? <p className="truncate text-sm text-muted-foreground">{helperText}</p> : null}
				</div>
			</div>

			<Button
				type="button"
				variant="outline"
				className="pointer-events-none rounded-xl"
				tabIndex={-1}
			>
				Pilih
			</Button>
		</button>
	);
}
