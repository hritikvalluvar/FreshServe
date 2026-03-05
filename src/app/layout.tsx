import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tanuja's BatterHouse",
  description: "Your favorite spot for authentic South Indian flavors.",
  icons: {
    icon: "https://ngoxppmzvxlzvomjmzch.supabase.co/storage/v1/object/public/product-images/tanujasbatterhouse-logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.className} min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
