import type { Metadata, Viewport } from "next";
import { Archivo_Black, Montserrat, Unbounded } from "next/font/google";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { Header } from "@/components/layout/Header";
import "./globals.css";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
};

export const metadata: Metadata = {
  title: "APSA — Athlete Park Sports Academy | Hunsur, Karnataka",
  description:
    "Book football, cricket, and volleyball slots at APSA Sports Arena in Hunsur. Real-time availability, premium turf, instant booking.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "APSA",
  },
  icons: {
    apple: "/icon-192.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivoBlack.variable} ${montserrat.variable} ${unbounded.variable} scroll-smooth`}>
      <body className="bg-truf-dark font-sans text-white antialiased">
        <SmoothScrollProvider>
          <Header />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
