import { PageCard, PageShell } from "@/components/layout/PageShell";
import { ConsultationForm } from "@/components/landing/ConsultationForm";
import { LandingHeader } from "@/components/landing/LandingHeader";

export default function Home() {
  return (
    <PageShell>
      <PageCard>
        <LandingHeader />
        <ConsultationForm />
      </PageCard>
    </PageShell>
  );
}
