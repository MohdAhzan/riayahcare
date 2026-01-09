//app/[locale]/layout.tsx

import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
//import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { routing } from "@/i18n/routing";
import { hasLocale } from "next-intl";

//const _geist = Geist({ subsets: ["latin"] });
//const _geistMono = Geist_Mono({ subsets: ["latin"] });

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  //  no need to import messages manually — handled by next-intl/plugin
  //
  return (
    <html lang={locale}>
    
      <body className={`font-sans antialiased`}>
        <NextIntlClientProvider locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

