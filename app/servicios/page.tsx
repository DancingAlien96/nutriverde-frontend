import { Header } from "../components/Header";
import { Services } from "../components/Services";
import { Footer } from "../components/Footer";
import { FinalCTA } from "../components/FinalCTA";

export const metadata = {
  title: "Servicios — Plenha Nutrition",
};

export default function ServiciosPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <Services />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
