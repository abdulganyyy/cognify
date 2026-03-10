import type { ReactNode } from "react";
import { Topbar } from "@/components/dashboard/topbar";
import { Sidebar } from "@/components/dashboard/SideBar";

interface DashboardLayoutProps {
	children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	return (
		<div className="min-h-screen bg-muted/30">
			<div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
				<Sidebar />

				<div className="flex min-w-0 flex-1 flex-col">
					<Topbar />

					<main className="flex-1">
						<div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
					</main>
				</div>
			</div>
		</div>
	);
}
