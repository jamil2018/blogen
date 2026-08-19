import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import Providers from "../providers";
import { ThemeProvider } from "../components/theme/ThemeProvider";
import { getCurrentUser } from "../lib/db/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blogen",
  description: "Blogen - Simple tech blog",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <Providers user={user}>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
