"use client";

import { SessionProvider } from "next-auth/react";
import { ReactQueryProvider } from "@/lib/react-query/provider";
import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { LocaleProvider } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { FontSizeProvider } from "@/lib/font-size";
import { ColorVisionProvider } from "@/lib/color-vision";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <FontSizeProvider>
          <ColorVisionProvider>
            <LocaleProvider>
              <ReactQueryProvider>{children}</ReactQueryProvider>
            </LocaleProvider>
          </ColorVisionProvider>
        </FontSizeProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
