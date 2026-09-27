"use client";

import { LogOutIcon, SettingsIcon } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Static placeholder for the signed-in user; wired to real auth once
// Convex Auth lands in a later phase.
const MOCK_USER = { name: "Tevin", email: "tevinowino65@gmail.com" };

export function UserMenu() {
  const initial = MOCK_USER.name.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-zinc-900">
        <Avatar className="size-6">
          <AvatarFallback className="bg-zinc-800 text-xs text-zinc-300">
            {initial}
          </AvatarFallback>
        </Avatar>
        <span className="min-w-0 flex-1 truncate text-sm text-zinc-300">
          {MOCK_USER.name}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-56">
        <DropdownMenuLabel className="truncate font-normal text-zinc-500">
          {MOCK_USER.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <SettingsIcon />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive">
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
