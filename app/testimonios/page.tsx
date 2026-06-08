import { Header } from "../components/Header";
import { Testimonials } from "../components/Testimonials";
import { Footer } from "../components/Footer";
import { FinalCTA } from "../components/FinalCTA";

export const metadata = {
  title: "Testimonios — Plenha Nutrition",
};

export default function TestimoniosPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
