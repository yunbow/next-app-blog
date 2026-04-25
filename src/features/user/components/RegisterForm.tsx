"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterSchema, RegisterInput } from "../schema/auth-schema";
import { registerAction } from "../server/auth-actions";
import { toast } from "sonner";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n";

export function RegisterForm() {
  const { t } = useTranslations();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("confirmPassword", data.confirmPassword);

    const result = await registerAction(formData);

    if (result.success) {
      toast.success("登録が完了しました。ログインしてください。");
      router.push("/login");
    } else {
      setError(result.error || t("registration.failed"));
    }

    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t("registration.title")}</CardTitle>
        <CardDescription>
          {t("registration.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="text-sm text-red-500 text-center p-2 bg-red-50 dark:bg-red-950 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">
              ユーザー名
              <span className="text-destructive ml-0.5" aria-label={t("accessibility.required")}>*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="表示名を入力してください"
              aria-describedby={errors.name ? "register-name-error" : undefined}
              aria-required="true"
              {...register("name")}
            />
            {errors.name && <p className="text-sm text-red-500" id="register-name-error">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              {t("login.email")}
              <span className="text-destructive ml-0.5" aria-label={t("accessibility.required")}>*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t("login.emailPlaceholder")}
              aria-describedby={errors.email ? "register-email-error" : undefined}
              aria-required="true"
              {...register("email")}
            />
            {errors.email && <p className="text-sm text-red-500" id="register-email-error">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              パスワード
              <span className="text-destructive ml-0.5" aria-label={t("accessibility.required")}>*</span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="8文字以上、英字と数字を含む"
              aria-describedby={errors.password ? "register-password-error" : undefined}
              aria-required="true"
              {...register("password")}
            />
            {errors.password && <p className="text-sm text-red-500" id="register-password-error">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              パスワード（確認）
              <span className="text-destructive ml-0.5" aria-label={t("accessibility.required")}>*</span>
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="パスワードを再入力"
              aria-describedby={errors.confirmPassword ? "register-confirm-error" : undefined}
              aria-required="true"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && <p className="text-sm text-red-500" id="register-confirm-error">{errors.confirmPassword.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "登録中..." : "登録"}
          </Button>

          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            {t("registration.termsAgreePrefix")}
            <Link href="/terms" className="text-primary hover:underline">{t("registration.termsLink")}</Link>
            {t("registration.termsConnector")}
            <Link href="/privacy" className="text-primary hover:underline">{t("registration.privacyLink")}</Link>
            {t("registration.termsIncludingCookie", { cookie: "" }).split("{cookie}")[0]}
            <Link href="/cookies" className="text-primary hover:underline">{t("registration.cookieLink")}</Link>
            {t("registration.termsIncludingCookie", { cookie: "" }).split("{cookie}")[1]}
            {t("registration.termsAgreeSuffix")}
          </p>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          {t("registration.alreadyHaveAccount")}{" "}
          <Link href="/login" className="text-primary hover:underline">
            {t("common.login")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
