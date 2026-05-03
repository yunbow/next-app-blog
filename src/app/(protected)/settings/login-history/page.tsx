import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackLink } from "@/components/common/BackLink";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Monitor, Smartphone, Globe } from "lucide-react";

function parseUserAgent(ua: string | null): { device: string; browser: string } {
  if (!ua) return { device: "不明", browser: "不明" };

  let browser = "不明";
  if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Safari/") && !ua.includes("Chrome")) browser = "Safari";

  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  const device = isMobile ? "モバイル" : "デスクトップ";

  return { device, browser };
}

function providerLabel(provider: string): string {
  switch (provider) {
    case "credentials": return "メール/パスワード";
    case "google": return "Google";
    case "github": return "GitHub";
    default: return provider;
  }
}

export default async function LoginHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const histories = await prisma.loginHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="container max-w-2xl pb-6">
      <BackLink href="/settings" label="設定に戻る" />
      <h1 className="text-2xl font-bold mb-6">ログイン履歴</h1>
      <Card>
        <CardHeader>
          <CardTitle>最近のログイン</CardTitle>
        </CardHeader>
        <CardContent>
          {histories.length === 0 ? (
            <p className="text-muted-foreground">ログイン履歴はありません</p>
          ) : (
            <div className="space-y-4">
              {histories.map((history) => {
                const { device, browser } = parseUserAgent(history.userAgent);
                const isMobile = device === "モバイル";

                return (
                  <div key={history.id} className="flex items-start gap-3 py-3 border-b last:border-b-0">
                    <div className="mt-0.5 text-muted-foreground">
                      {isMobile ? (
                        <Smartphone className="h-5 w-5" />
                      ) : (
                        <Monitor className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{browser} / {device}</span>
                        <Badge variant="secondary" className="text-xs">
                          {providerLabel(history.provider)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{format(history.createdAt, "yyyy/MM/dd HH:mm")}</span>
                        {history.ipAddress && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {history.ipAddress}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
