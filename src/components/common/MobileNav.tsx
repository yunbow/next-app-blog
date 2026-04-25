"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useNotificationStream } from "@/features/notification/hooks/useNotificationStream";
import { useTranslations } from "@/lib/i18n";
import {
  DashboardIcon,
  SearchIcon,
  BellIcon,
  EditIcon,
  UserIcon,
} from "./icons";

type MobileNavItem = {
  labelKey: "dashboard" | "search" | "notifications" | "newArticle" | "profile";
  href: string;
  icon: React.ReactNode;
  authRequired?: boolean;
};

const mobileNavItems: MobileNavItem[] = [
  { labelKey: "dashboard", href: "/dashboard", icon: <DashboardIcon className="h-6 w-6" />, authRequired: true },
  { labelKey: "search", href: "/search", icon: <SearchIcon className="h-6 w-6" /> },
  { labelKey: "notifications", href: "/notifications", icon: <BellIcon className="h-6 w-6" />, authRequired: true },
  { labelKey: "newArticle", href: "/articles/new", icon: <EditIcon className="h-6 w-6" />, authRequired: true },
  { labelKey: "profile", href: "/profile", icon: <UserIcon className="h-6 w-6" />, authRequired: true },
];

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useTranslations();
  const { unreadCount: unreadNotificationCount } = useNotificationStream();

  const filteredNavItems = mobileNavItems.filter((item) => {
    if (item.authRequired && !session) {
      return false;
    }
    return true;
  });

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50 safe-area-bottom" aria-label={t("accessibility.mobileNavigation")}>
      <div className="flex justify-around items-center h-16">
        {filteredNavItems.map((item) => {
          const href = item.href === "/profile" && session?.user?.id
            ? `/users/${session.user.id}`
            : item.href;
          const isActive = pathname === item.href || pathname === href;

          const label = t(`nav.${item.labelKey}`);
          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full relative transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="relative" aria-hidden="true">
                {item.icon}
                {item.href === "/notifications" && unreadNotificationCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold px-1"
                    role="status"
                    aria-label={t("nav.unreadNotifications", { count: String(unreadNotificationCount) })}
                  >
                    {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                  </span>
                )}
              </span>
              <span className="text-[10px] mt-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
