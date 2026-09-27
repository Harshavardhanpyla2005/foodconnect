import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RouteProgressBar } from "@/components/ui/route-progress";
import { ChatbotLoader } from "@/components/chatbot/ChatbotLoader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://foodconnect.org";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FOODCONNECT — Smart Zero Hunger Support System (SDG 2)",
    template: "%s | FOODCONNECT",
  },
  description:
    "Connecting commercial surplus-food donors directly with verified NGOs to eliminate food wastage and accelerate UN SDG 2 Zero Hunger with transparent photo-backed distribution tracking.",
  keywords: [
    "FoodConnect",
    "Zero Hunger",
    "SDG 2",
    "Food Rescue",
    "Surplus Food Donation",
    "Verified NGOs",
    "Food Waste Elimination",
    "Visakhapatnam Food Network",
    "Cold Chain Food Transit",
  ],
  authors: [{ name: "FoodConnect Operations" }],
  creator: "FOODCONNECT",
  publisher: "FOODCONNECT",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FOODCONNECT — Smart Zero Hunger Support System",
    description:
      "Connecting commercial surplus-food donors directly with verified NGOs to eliminate food wastage and hunger with transparent photo-backed distribution tracking.",
    url: "/",
    siteName: "FOODCONNECT",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FOODCONNECT Zero Hunger Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FOODCONNECT — Smart Zero Hunger Support System",
    description:
      "Connecting commercial surplus-food donors directly with verified NGOs to eliminate food wastage and hunger with transparent photo-backed distribution tracking.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      "url": siteUrl,
      "name": "FOODCONNECT",
      "description":
        "Smart Zero Hunger Support System connecting surplus food with verified NGOs",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${siteUrl}/food-needs?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "NGO",
      "@id": `${siteUrl}/#organization`,
      "name": "FOODCONNECT",
      "url": siteUrl,
      "logo": `${siteUrl}/og-image.png`,
      "description":
        "Smart Zero Hunger Support System connecting commercial surplus food with verified NGOs to eliminate food waste and address SDG 2.",
      "areaServed": {
        "@type": "City",
        "name": "Visakhapatnam",
        "addressRegion": "Andhra Pradesh",
        "addressCountry": "IN",
      },
      "knowsAbout": [
        "Food Rescue",
        "Zero Hunger",
        "SDG 2",
        "Surplus Food Distribution",
        "Cold Chain Logistics",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* WCAG Accessible Keyboard Skip Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none"
        >
          Skip to content
        </a>
        <RouteProgressBar />
        <TooltipProvider>{children}</TooltipProvider>
        <ChatbotLoader />
      </body>
    </html>
  );
}
