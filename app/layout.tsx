import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yrkesplan",
  description: "Planering av yrkesutbildningar, APL och lektioner.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sv">
      <body>
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
            <Link href="/dashboard" className="text-xl font-semibold text-primary">
              Yrkesplan
            </Link>
            <nav className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
              <Link href="/educations/new" className="hover:text-foreground">
                Skapa utbildning
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
