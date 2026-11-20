import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import type { Metadata } from "next";
import { Andika, Grandstander, Playwrite_FR_Moderne } from "next/font/google";
import { ToastContainer } from "react-toastify";
import Script from "next/script";

/*
  Typefaces, self-hosted at build time by next/font and exposed as CSS
  variables that globals.css maps to font-display / font-sans / font-hand.
*/
const grandstander = Grandstander({
  subsets: ["latin"],
  variable: "--font-grandstander",
  display: "swap",
});
const andika = Andika({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-andika",
  display: "swap",
});
// Playwrite has no subset split, so next/font does not preload it.
const playwrite = Playwrite_FR_Moderne({
  variable: "--font-playwrite",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://revises-tes-tables.gravitek.io"),
  title: {
    default: "Tables de Multiplication - Révisions Ludiques | Gravitek",
    template: "%s | Tables de Multiplication - Gravitek",
  },
  description:
    "Application ludique gratuite pour réviser les tables de multiplication. Outil éducatif interactif pour enfants et étudiants. Développé par Gravitek.",
  authors: [{ name: "Gravitek" }],
  creator: "Gravitek",
  publisher: "Gravitek",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://revises-tes-tables.gravitek.io",
    siteName: "Tables de Multiplication - Gravitek",
    title: "Tables de Multiplication - Révisions Ludiques",
    description:
      "Application ludique gratuite pour réviser les tables de multiplication. Outil éducatif interactif pour enfants et étudiants.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tables de Multiplication - Application éducative Gravitek",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tables de Multiplication - Révisions Ludiques",
    description:
      "Application ludique gratuite pour réviser les tables de multiplication",
    images: ["/og-image.png"],
    creator: "@gravitek_io",
  },
  alternates: {
    canonical: "https://revises-tes-tables.gravitek.io",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${grandstander.variable} ${andika.variable} ${playwrite.variable}`}
    >
      <body>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-NE650PZHBC"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-NE650PZHBC');
            `,
          }}
        />

        <main className="page">{children}</main>
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  );
}
