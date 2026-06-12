import { Header } from "../components/Header";
import { Services } from "../components/Services";
import { Footer } from "../components/Footer";

export const metadata = {
  title: "Servicios — Plenha Nutrition",
};

export default function ServiciosPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <Services />
      </main>
      <Footer />
    </>
  );
}
