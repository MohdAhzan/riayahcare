"use client"

import PatientInquiryForm from "@/components/patient-inquiry-form"

export default function SearchForm() {
  return (
    <section id="inquiry-form" className="bg-gradient-to-br from-green-50 to-emerald-50 py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <PatientInquiryForm />
      </div>
    </section>
  )
}
