"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n";

const COOKIE_CONSENT_KEY = "cookie-consent";
const CONSENT_EVENT = "cookie-consent-change";

const subscribeConsent = (callback: () => void) => {
  const onStorage = (e: StorageEvent) => {
    if (e.key === COOKIE_CONSENT_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CONSENT_EVENT, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CONSENT_EVENT, callback);
  };
};

const getConsent = () => localStorage.getItem(COOKIE_CONSENT_KEY);
// Match prior SSR/first-render behavior (banner hidden until consent is read).
const getServerConsent = () => "ssr-placeholder";

export function CookieConsent() {
  const { t } = useTranslations();
  const consent = useSyncExternalStore(subscribeConsent, getConsent, getServerConsent);
  const [dismissed, setDismissed] = useState(false);

  const setConsent = (value: "accepted" | "declined") => {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
    window.dispatchEvent(new Event(CONSENT_EVENT));
    setDismissed(true);
  };

  const handleAccept = () => setConsent("accepted");
  const handleDecline = () => setConsent("declined");

  if (dismissed || consent !== null) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              {t("cookieConsent.message")}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecline}
              className="flex-1 sm:flex-none"
            >
              {t("cookieConsent.decline")}
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="flex-1 sm:flex-none"
            >
              {t("cookieConsent.accept")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
