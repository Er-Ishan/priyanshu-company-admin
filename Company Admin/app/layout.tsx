import { LoadingProvider } from "@/contexts/LoadingContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from './providers';
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Complete Parking SaaS Solution",
  description: "The Complete Parking SaaS Solution",
  metadataBase: new URL("https://companytest.bookstanstedparking.co.uk"),
  openGraph: {
    title: "The Complete Parking SaaS Solution",
    description: "The Complete Parking SaaS Solution",
    url: "https://companytest.bookstanstedparking.co.uk",
    siteName: "The Complete Parking SaaS Solution",
    images: [
      {
        url: "https://companytest.bookstanstedparking.co.uk/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "The Complete Parking SaaS Solution",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Complete Parking SaaS Solution",
    description: "The Complete Parking SaaS Solution",
    images: ["https://companytest.bookstanstedparking.co.uk/og-image.jpg"],
  },
};


export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<any>;
}) {
  const params = await props.params;
  const children = props.children;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <LoadingProvider>
            {children}
          </LoadingProvider>
        </Providers>
      </body>
    </html>
  );
}
