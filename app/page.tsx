import LandingBanner from "@/components/landing-banner"
import SearchForm from "@/components/search-form"
import HospitalsSection from "@/components/hospitals-section"
import DoctorsSection from "@/components/doctors-section"
import ProceduresSection from "@/components/procedures-section"
import TestimonialsSection from "@/components/testimonials-section"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import HelpWidget from "@/components/help-widget"
import SpecialtyTiles from "@/components/specialty-tiles"

export default function Home() {
  return (
    <div className="bg-background">
      <Navbar />

      <div>
        {/* Landing banner - full screen height */}
        <section className="h-screen w-full">
          <LandingBanner />
        </section>

        {/* Rest of content - normal scroll below */}
        <div className="w-full">
          <SearchForm />
          <SpecialtyTiles />
          <HospitalsSection />
          <DoctorsSection />
          <ProceduresSection />
          <TestimonialsSection />
          <Footer />
        </div>
      </div>

      <HelpWidget />
    </div>
  )
}
