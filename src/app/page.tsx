"use client";

import Image from "next/image";
import { Lato } from "next/font/google";
import styles from "./page.module.css";
import Map from "./components/map/map";
import dynamic from "next/dynamic";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Home() {
  const Map = dynamic(
    () => import("./components/map/map"), // replace '@components/map' with your component's location
    { ssr: false } // This line is important. It's what prevents server-side render
  );

  return (
    <main className={lato.className}>
      <main className={styles.main}>
        <Map />
      </main>
    </main>
  );
}
