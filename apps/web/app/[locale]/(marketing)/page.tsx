import { useTranslations } from "next-intl";
import { Header } from "./_components/Header";
import { Hero } from "./_components/Hero";
import { ProblemSection } from "./_components/ProblemSection";
import { HowItWorks } from "./_components/HowItWorks";
import { FeatureCards } from "./_components/FeatureCards";
import { InstallBlock } from "./_components/InstallBlock";
import { Footer } from "./_components/Footer";

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <FeatureCards />
        <InstallBlock />
      </main>
      <Footer />
    </>
  );
}
