import { Header } from "../components/Header";
import { FAQ } from "../components/FAQ";
import { Footer } from "../components/Footer";
import { FinalCTA } from "../components/FinalCTA";

export const metadata = {
  title: "Preguntas frecuentes — Plenha Nutrition",
};

export default function FAQPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
