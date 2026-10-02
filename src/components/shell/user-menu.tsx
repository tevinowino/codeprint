"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { cn } from "cn";
import { LogOutIcon, SettingsIcon } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu({ collapsed = false }: { collapsed?: boolean }) {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();

  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const name = user?.firstName ?? user?.username ?? email.split("@")[0] ?? "Account";
  const initial = (name.charAt(0) || "?").toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex min-w-0 items-center gap-2 rounded-md py-1.5 text-left hover:bg-sidebar-accent",
          collapsed ? "justify-center px-1.5" : "flex-1 px-2"
        )}
      >
        <Avatar className="size-6">
          {user?.imageUrl && <AvatarImage src={user.imageUrl} alt="" />}
          <AvatarFallback className="bg-muted text-xs text-muted-foreground">
            {initial}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <span className="min-w-0 flex-1 truncate text-sm text-sidebar-foreground">
            {name}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={collapsed ? "center" : "start"}
        side={collapsed ? "right" : "top"}
        className="w-56"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
            {email}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => openUserProfile()}>
          <SettingsIcon />
          Account settings
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={() => signOut({ redirectUrl: "/" })}>
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
