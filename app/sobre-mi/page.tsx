import { Header } from "../components/Header";
import { About } from "../components/About";
import { Footer } from "../components/Footer";
import { FinalCTA } from "../components/FinalCTA";

export const metadata = {
  title: "Sobre mí — Plenha Nutrition",
};

export default function SobreMiPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <About />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
