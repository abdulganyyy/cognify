"use client";

import { LogOut, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserProfile } from "./AppShell";

interface SidebarUserAreaProps {
  user: UserProfile;
  onSignOut?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function SidebarUserArea({ user, onSignOut }: SidebarUserAreaProps) {
  return (
    <div className="p-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "group flex w-full items-center gap-2.5 rounded-lg px-2 py-2",
              "hover:bg-neutral-50 transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
            )}
          >
            <Avatar className="h-7 w-7 shrink-0">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.name} />
              ) : null}
              <AvatarFallback className="bg-blue-100 text-blue-700 text-[10px] font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-xs font-medium text-neutral-800">
                {user.name}
              </p>
              <p className="truncate text-[10px] text-neutral-400">
                {user.email}
              </p>
            </div>

            <ChevronUp className="h-3.5 w-3.5 shrink-0 text-neutral-400 transition-transform group-data-[state=open]:rotate-180" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="top"
          align="start"
          sideOffset={4}
          className="w-52 text-xs"
        >
          <div className="px-2 py-1.5">
            <p className="text-xs font-medium text-neutral-800">{user.name}</p>
            <p className="mt-0.5 text-[11px] text-neutral-400">{user.email}</p>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={onSignOut}
            className="cursor-pointer gap-2 text-xs text-red-600 focus:bg-red-50 focus:text-red-700"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}