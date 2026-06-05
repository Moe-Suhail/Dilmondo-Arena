import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dilmondo-arena12.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ساحة Dilmondo",
    template: "%s | ساحة Dilmondo",
  },
  description:
    "دوري العائلة في الفانتسي حيث تكتب البطولات وتفضح القرارات.",
  applicationName: "Dilmondo Arena",
  icons: {
    apple: [{ url: "/images/dilmondo-logo.png", type: "image/png" }],
    icon: [{ url: "/images/dilmondo-logo.png", type: "image/png" }],
    shortcut: [{ url: "/images/dilmondo-logo.png", type: "image/png" }],
  },
  openGraph: {
    description:
      "دوري العائلة في الفانتسي حيث تكتب البطولات وتفضح القرارات.",
    images: [{ url: "/images/dilmondo-logo.png", width: 512, height: 512 }],
    locale: "ar_EG",
    siteName: "Dilmondo Arena",
    title: "ساحة Dilmondo",
    type: "website",
    url: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
