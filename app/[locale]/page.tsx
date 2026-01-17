

// app/[locale]/page.tsx
import LandingBannerV2 from "@/components/landing-banner"
import SearchForm from "@/components/search-form"
import HospitalsSection from "@/components/hospitals-section"
import DoctorsSection from "@/components/doctors-section"
import ProceduresSection from "@/components/procedures-section"
import NavbarV2 from "@/components/navbar"
import Footer from "@/components/footer"
import HelpWidget from "@/components/help-widget"
import SpecialtyTiles from "@/components/specialty-tiles"
import PrivateConsultationSection from "@/components/private_consultation"
import FAQs from "@/components/faqs"
import BlogsSection from "@/components/blogs-section"
import TestimonialsSection from "@/components/testimonials-section"
import AboutSection from "@/components/about-section"

export default function Home() {
  return (
    <div className="bg-background">
      <NavbarV2 />

      <div>
        {/* Landing banner - full screen height with dark theme */}
        <section className="h-screen w-full">
          <LandingBannerV2 />
        </section>

        {/* Rest of content - normal scroll below */}
        <div className="w-full">
          <SearchForm />
          <SpecialtyTiles />
          <HospitalsSection />
          <DoctorsSection />
          <AboutSection />
          <PrivateConsultationSection/>
          <ProceduresSection />
          <TestimonialsSection />
          <BlogsSection />
          <FAQs section="landing"/>
          <Footer />
        </div>
      </div>

      <HelpWidget />
    </div>
  )
}

//
////app/[locale]/page.tsx
//
//import LandingBanner from "@/components/landing-banner"
//import SearchForm from "@/components/search-form"
//import HospitalsSection from "@/components/hospitals-section"
//import DoctorsSection from "@/components/doctors-section"
//import ProceduresSection from "@/components/procedures-section"
//import TestimonialsSection from "@/components/testimonials-section"
//import Navbar from "@/components/navbar"
//import Footer from "@/components/footer"
//import HelpWidget from "@/components/help-widget"
//import SpecialtyTiles from "@/components/specialty-tiles"
//import PrivateConsultationSection from "@/components/private_consultation"
//import FAQs from "@/components/faqs"
//
//export default function Home() {
//  return (
//    <div className="bg-background">
//      <Navbar />
//
//      <div>
//        {/* Landing banner - full screen height */}
//        <section className="h-screen w-full">
//          <LandingBanner />
//        </section>
//
//        {/* Rest of content - normal scroll below */}
//        <div className="w-full">
//          <SearchForm />
//          <SpecialtyTiles />
//          <HospitalsSection />
//          <DoctorsSection />
//         <PrivateConsultationSection/>
//          <ProceduresSection />
//          <TestimonialsSection />
//          <FAQs section="landing"/>
//          <Footer />
//        </div>
//      </div>
//
//      <HelpWidget />
//    </div>
//  )
//}
