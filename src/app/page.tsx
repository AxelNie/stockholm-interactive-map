import Image from "next/image";
import { Lato } from "next/font/google";
import styles from "./page.module.css";
import Map from "./components/map/map";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Home() {
  return (
    <main className={lato.className}>
      <main className={styles.main}>
        <Map />
      </main>
    </main>
  );
}
