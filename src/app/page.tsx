import Image from "next/image";
import { Lato } from "next/font/google";
import styles from "./page.module.css";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Home() {
  return (
    <main className={lato.className}>
      <main className={styles.main}>
        <h1>Rubrik</h1>
        <p>Lite text</p>
      </main>
    </main>
  );
}
