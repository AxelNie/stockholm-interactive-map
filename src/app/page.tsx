"use client";

import { Inter } from "next/font/google";
import styles from "./page.module.css";
import MapContainer from "./components/map/MapContainer";
import "@/app/globals.scss";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function Home() {
  return (
    <main lang="se" className={inter.className}>
      <main className={styles.main}>
        <MapContainer />
      </main>
    </main>
  );
}
