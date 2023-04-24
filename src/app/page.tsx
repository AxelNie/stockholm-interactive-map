"use client";

import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "./page.module.css";
import dynamic from "next/dynamic";
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
