"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

const INDIAN_CITIES = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad"]

const SPECIALTIES = [
  "Cardiology",
  "Neurosurgery",
  "Orthopedics",
  "Oncology",
  "Urology",
  "Gynecology",
  "Dental",
  "Cosmetic Surgery",
]

export default function PatientInquiryForm() {
  const [formData, setFormData] = useState({
    name: "",
    country: "India",
    city: "",
    phone: "",
    medical_problem: "",
    age: "",
    gender: "", // male, female, other
    specialty: "",
  })

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from("quote_requests").insert([
        {
          patient_name: formData.name,
          country: formData.country,
          city: formData.city,
          phone: `+91${formData.phone}`,
          medical_problem: formData.medical_problem,
          age: formData.age,
          gender: formData.gender,
          specialty: formData.specialty,
          created_at: new Date().toISOString(),
        },
      ])

      if (error) {
        console.error("[v0] Form submission error:", error)
        alert("Error submitting form. Please try again.")
      } else {
        setSubmitted(true)
        setFormData({
          name: "",
          country: "India",
          city: "",
          phone: "",
          medical_problem: "",
          age: "",
          gender: "",
          specialty: "",
        })
        setTimeout(() => setSubmitted(false), 5000)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-4 bg-white rounded-2xl p-8 shadow-lg">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">Let Us Help You</h2>

      {submitted && (
        <div className="p-4 bg-green-100 border border-green-400 rounded-lg text-green-800 font-semibold">
          Thank you! Your quote request has been submitted. We'll contact you soon!
        </div>
      )}

      {/* Patient Name */}
      <input
        type="text"
        placeholder="Patient Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
      />

      {/* Country - India fixed */}
      <select
        value={formData.country}
        disabled
        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
      >
        <option>India</option>
      </select>

      {/* City */}
      <select
        value={formData.city}
        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition appearance-none bg-white"
      >
        <option value="">Select City</option>
        {INDIAN_CITIES.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>

      {/* Phone */}
      <div className="flex gap-2">
        <div className="flex items-center px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-semibold text-gray-700">
          +91
        </div>
        <input
          type="tel"
          placeholder="Your Phone number"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
          required
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
        />
      </div>

      {/* Specialty */}
      <select
        value={formData.specialty}
        onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition appearance-none bg-white"
      >
        <option value="">Select Medical Specialty</option>
        {SPECIALTIES.map((specialty) => (
          <option key={specialty} value={specialty}>
            {specialty}
          </option>
        ))}
      </select>

      {/* Medical Problem */}
      <textarea
        placeholder="Describe The Current Medical Problem .."
        value={formData.medical_problem}
        onChange={(e) => setFormData({ ...formData, medical_problem: e.target.value })}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition min-h-24 resize-none"
      />

      {/* Age */}
      <input
        type="text"
        placeholder="Example: 30 Yrs or 29-05-1985"
        value={formData.age}
        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
      />

      {/* Gender */}
      <div className="space-y-2">
        <label className="block font-semibold text-gray-700">Gender</label>
        <div className="flex gap-2 flex-wrap">
          {["male", "female", "other"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFormData({ ...formData, gender: option })}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                formData.gender === option
                  ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md"
                  : "border-2 border-green-300 text-green-700 hover:border-green-400 hover:bg-green-50"
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="btn-glass w-full text-white text-lg py-4 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Submitting..." : "Get FREE Quote"}
      </button>

      <p className="text-xs text-gray-600 text-center">
        By submitting the form I agree to the Terms of Use and Privacy Policy of Riayah Care.
      </p>
    </form>
  )
}
