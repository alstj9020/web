import HeroSection from "@/components/sections/HeroSection";
import ProblemSection from "@/components/sections/ProblemSection";
import AudienceSection from "@/components/sections/AudienceSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import EmailPreviewSection from "@/components/sections/EmailPreviewSection";
import CTASection from "@/components/sections/CTASection";

export default function Home() {
  return (
    <div className="snap-container">
      <HeroSection />
      <ProblemSection />
      <AudienceSection />
      <HowItWorksSection />
      <EmailPreviewSection />
      <CTASection />
    </div>
  );
}
