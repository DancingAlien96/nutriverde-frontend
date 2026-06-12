import { Header } from "../components/Header";
import { HowItWorks } from "../components/HowItWorks";
import { Footer } from "../components/Footer";

export const metadata = {
  title: "Cómo funciona — Plenha Nutrition",
};

export default function ComoFuncionaPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
