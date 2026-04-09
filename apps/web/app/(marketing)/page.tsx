import type { Metadata } from "next";
import { Header } from "./_components/Header";
import { Hero } from "./_components/Hero";
import { ProblemSection } from "./_components/ProblemSection";
import { HowItWorks } from "./_components/HowItWorks";
import { FeatureCards } from "./_components/FeatureCards";
import { InstallBlock } from "./_components/InstallBlock";
import { Footer } from "./_components/Footer";

export const metadata: Metadata = {
  title: "Jex — Secrets Manager for Developer Teams",
  description:
    "Share secrets, not .env files. Jex is an open-source secrets manager with AES-256-GCM encryption, RBAC, and a Go CLI.",
};

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
