import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { routing } from "@/i18n/routing";
import { hasLocale } from "next-intl";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

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

//import type React from "react"
//import type { Metadata } from "next"
//import { Geist, Geist_Mono } from "next/font/google"
//import "../globals.css"
//import { NextIntlClientProvider } from "next-intl"
//import { notFound } from "next/navigation"
//
//const geist = Geist({ subsets: ["latin"] })
//const geistMono = Geist_Mono({ subsets: ["latin"] })
//
//export const metadata: Metadata = {
//  title: "Riayah Care - Compassionate Healthcare Solutions",
//  description: "Compassionate Care & World Class Treatment at Top Hospitals in India",
//}
//
//// pre-generate for language locales (does this way cuz to make site SEO-friendly)
//
//export function generateStaticParams(){
//  return [ {locale:"en"},{locale:"ar"}]
//}
//
//type Props = {
//  children :React.ReactNode;
//  params:  Promise<{locale: string}>;
//}
//
//export default async function RootLayout({children:params}:Props) {
//
//  const {locale} = await params;
//
//  let messages
//
//  try{
//    messages = (await import(`../../messages/en.json`)).default
//  }catch{
//    console.log("ITS HEREEEEE")
//    notFound()
//  }
//
//  return (
//    <html lang={locale}>
//      <body className={`${geist.className}${geistMono.className}`}>
//        <NextIntlClientProvider locale={locale} messages={messages}>
//        {locale.children}
//        </NextIntlClientProvider>
//      </body>
//    </html>
//  )
//}
