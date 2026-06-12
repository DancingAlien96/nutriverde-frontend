import { Header } from "../components/Header";
import { About } from "../components/About";
import { Footer } from "../components/Footer";

export const metadata = {
  title: "Sobre mí — Plenha Nutrition",
};

export default function SobreMiPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <About />
      </main>
      <Footer />
    </>
  );
}
