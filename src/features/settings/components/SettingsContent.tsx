"use client";

import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, User, History, KeyRound } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

export function SettingsContent() {
  const { t } = useTranslations();

  return (
    <div className="container max-w-2xl py-6 space-y-6">
      <h1 className="text-2xl font-bold">{t("settings.title")}</h1>

      <div className="space-y-4">
        {/* 外観設定リンク */}
        <Link href="/settings/appearance" className="block">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t("settings.appearance")}
              </CardTitle>
              <CardDescription>{t("settings.appearanceDescription")}</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {/* アカウント情報リンク */}
        <Link href="/settings/account" className="block">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                {t("settings.account")}
              </CardTitle>
              <CardDescription>{t("settings.accountDescription")}</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {/* ログイン履歴リンク */}
        <Link href="/settings/login-history" className="block">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                {t("settings.loginHistory")}
              </CardTitle>
              <CardDescription>{t("settings.loginHistoryDescription")}</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {/* パスワード変更リンク */}
        <Link href="/settings/password" className="block">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                {t("settings.changePassword")}
              </CardTitle>
              <CardDescription>{t("settings.changePasswordDescription")}</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
