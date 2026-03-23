import OnboardingFlow from "@/src/components/home/OnboardingFlow";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Gamified Onboarding Flow - Now the entire experience */}
      <OnboardingFlow />
    </div>
  );
}
