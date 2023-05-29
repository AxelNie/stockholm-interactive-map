import "./globals.scss";
import Head from "next/head";

export const metadata = {
  title: "Restidkollen",
  description: "Visualisering av restider i Stockholm",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        />
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v2.6.1/mapbox-gl.css"
          rel="stylesheet"
        />
      </Head>
      <body>{children}</body>
    </html>
  );
}
