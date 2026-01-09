// apps/frontend/app/page.tsx
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import TrainingPackages from "@/components/TrainingPackages";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <TrainingPackages />
    </>
  );
}
