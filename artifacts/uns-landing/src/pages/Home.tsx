import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Trust } from "@/components/sections/Trust";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Features } from "@/components/sections/Features";
import { EmotionalMoment } from "@/components/sections/EmotionalMoment";
import { Waitlist } from "@/components/sections/Waitlist";
import { Privacy } from "@/components/sections/Privacy";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Trust />
        <HowItWorks />
        <Features />
        <EmotionalMoment />
        <Waitlist />
        <Privacy />
      </main>
      <Footer />
    </div>
  );
}
