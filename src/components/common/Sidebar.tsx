"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useSyncExternalStore } from "react";
import { useNotificationStream } from "@/lib/hooks/useNotificationStream";
import { getImageUrl } from "@/lib/utils/image-url";
import { BrandLogo } from "@/components/common/BrandLogo";
import {
  SearchIcon,
  BellIcon,
  EditIcon,
  DashboardIcon,
  BookmarkIcon,
  UserIcon,
  SettingsIcon,
} from "./icons";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/lib/i18n";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PLAN_BADGE: Record<"free" | "basic" | "premium", { label: string; className: string }> = {
  free: {
    label: "Free",
    className: "bg-muted text-muted-foreground border-border",
  },
  basic: {
    label: "Basic",
    className: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  },
  premium: {
    label: "Premium",
    className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  },
};

type NavItem = {
  labelKey: "dashboard" | "search" | "newArticle" | "bookmarks" | "notifications" | "profile" | "settings";
  href: string;
  icon: React.ReactNode;
  authRequired?: boolean;
};

const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";
const SIDEBAR_EVENT = "sidebar-collapsed-change";

const subscribeCollapsed = (callback: () => void) => {
  const onStorage = (e: StorageEvent) => {
    if (e.key === SIDEBAR_COLLAPSED_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(SIDEBAR_EVENT, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SIDEBAR_EVENT, callback);
  };
};

const getCollapsed = () => localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
const getServerCollapsed = () => false;

const getNavItems = (userId?: string): NavItem[] => [
  { labelKey: "dashboard", href: "/dashboard", icon: <DashboardIcon />, authRequired: true },
  { labelKey: "search", href: "/search", icon: <SearchIcon /> },
  { labelKey: "newArticle", href: "/articles/new", icon: <EditIcon />, authRequired: true },
  { labelKey: "bookmarks", href: "/bookmarks", icon: <BookmarkIcon />, authRequired: true },
  { labelKey: "notifications", href: "/notifications", icon: <BellIcon />, authRequired: true },
  { labelKey: "profile", href: userId ? `/users/${userId}` : "/profile", icon: <UserIcon />, authRequired: true },
  { labelKey: "settings", href: "/settings", icon: <SettingsIcon />, authRequired: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useTranslations();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isCollapsed = useSyncExternalStore(subscribeCollapsed, getCollapsed, getServerCollapsed);

  const { unreadCount: unreadNotificationCount } = useNotificationStream();

  const filteredNavItems = getNavItems(session?.user?.id).filter((item) => {
    if (item.authRequired && !session) {
      return false;
    }
    return true;
  });

  const handleLogout = () => {
    setIsDialogOpen(false);
    signOut({ callbackUrl: "/" });
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r h-screen sticky top-0 overflow-y-auto transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* ロゴ + 開閉ボタン */}
      <div className="flex items-center justify-between p-4 border-b">
        <BrandLogo
          label={t("accessibility.homeLink")}
          showText={!isCollapsed}
          iconClassName="size-8"
          textClassName="text-xl"
          className={cn(isCollapsed && "mx-auto")}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(!isCollapsed));
            window.dispatchEvent(new Event(SIDEBAR_EVENT));
          }}
          className={cn(isCollapsed && "mx-auto")}
          title={isCollapsed ? t("nav.expand") : t("nav.collapse")}
          aria-label={isCollapsed ? t("nav.expand") : t("nav.collapse")}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex flex-col gap-2 p-4 flex-1">
        {filteredNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground relative",
              pathname === item.href
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground",
              isCollapsed ? "justify-center px-2" : "gap-3"
            )}
            title={isCollapsed ? t(`nav.${item.labelKey}`) : undefined}
            aria-label={t(`nav.${item.labelKey}`)}
            aria-current={pathname === item.href ? "page" : undefined}
          >
            <span aria-hidden="true" className="transition-transform duration-200">{item.icon}</span>
            {!isCollapsed && (
              <span className="transition-opacity duration-200 whitespace-nowrap">
                {t(`nav.${item.labelKey}`)}
              </span>
            )}
            {item.href === "/notifications" && unreadNotificationCount > 0 && (
              <span
                className={cn(
                  "bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold",
                  isCollapsed ? "absolute -top-1 -right-1" : "absolute top-1 left-6"
                )}
                role="status"
                aria-label={t("nav.unreadNotifications", { count: String(unreadNotificationCount) })}
              >
                {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* ユーザー情報（下部固定） */}
      {session && (
        <div className="border-t p-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg hover:bg-accent cursor-pointer transition-colors w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isCollapsed ? "justify-center px-2" : "gap-3"
                )}
                aria-label={t("accessibility.userMenu")}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={getImageUrl(session.user?.image)} />
                  <AvatarFallback>
                    {session.user?.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {session.user?.name || t("common.nameNotSet")}
                      </p>
                      {session.user?.plan && (
                        <Badge
                          className={cn(
                            "shrink-0 px-1.5 py-0 text-xs leading-5 h-5",
                            PLAN_BADGE[session.user.plan].className
                          )}
                        >
                          {PLAN_BADGE[session.user.plan].label}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      @{session.user?.username || t("common.loading")}
                    </p>
                  </div>
                )}
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("logout.title")}</DialogTitle>
                <DialogDescription>
                  {t("logout.confirm")}
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                >
                  {t("common.logout")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </aside>
  );
}
