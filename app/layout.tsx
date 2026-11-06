import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_ORIGIN || "http://127.0.0.1:5173"),
  title: {default: "Sakuratex Power Meter", template: "%s | Sakuratex Power Meter"},
  alternates: { canonical: "/" },
  openGraph: {title: "Sakuratex Power Meter", description: "Prototipe monitoring energi — data simulasi.", type: "website"},
  description: "Sandbox monitoring energi Sakuratex — Phase 0–7.",
  robots: { index: false, follow: false },
  icons: {
    icon: [{url: "/icon-sakuratex.png", type: "image/png", sizes: "200x200"}],
    shortcut: "/icon-sakuratex.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      {/* Browser extensions may add body attributes before React hydrates. */}
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
