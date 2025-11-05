"use client"

import React, { useState, useEffect } from "react"
import "react-country-state-city/dist/react-country-state-city.css"
import "react-phone-input-2/lib/style.css"
import { CountrySelect, StateSelect, CitySelect } from "react-country-state-city"
import PhoneInput from "react-phone-input-2"
import { createClient } from "@/lib/supabase/client"
import { Upload, Loader2, CheckCircle } from "lucide-react"

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

type FormState = {
  name: string
  country: string
  countryCode: string
  countryId?: string | number
  state: string
  stateId?: string | number
  city: string
  phone: string
  phoneCountryCode: string
  medical_problem: string
  medical_report_url: string | File
  age: string
  gender: string
  specialty: string
}

export default function PatientInquiryForm(): React.ReactElement {
  const [formData, setFormData] = useState<FormState>({
    name: "",
    country: "",
    countryCode: "in",
    countryId: undefined,
    state: "",
    stateId: undefined,
    city: "",
    phone: "",
    phoneCountryCode: "+91",
    medical_problem: "",
    medical_report_url: "",
    age: "",
    gender: "",
    specialty: "",
  })

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [fileName, setFileName] = useState("")
  const supabase = createClient()

  const onCountryChange = (val: any) => {
    if (val && typeof val === "object" && "name" in val) {
      const countryName = String(val.name)
      const isoOrId = (val.isoCode || val.id || val.code || val.IC || undefined) as string | number | undefined
      const isoLower = typeof isoOrId === "string" ? isoOrId.toLowerCase() : undefined
      const dialFallbackMap: Record<string, string> = {
        in: "+91",
        sa: "+966",
        ae: "+971",
        bh: "+973",
        qa: "+974",
        om: "+968",
        sd: "+249",
        pk: "+92",
        us: "+1",
        gb: "+44",
      }
      const dial = isoLower ? dialFallbackMap[isoLower] || formData.phoneCountryCode : formData.phoneCountryCode
      setFormData((prev) => ({
        ...prev,
        country: countryName,
        countryId: isoOrId,
        countryCode: isoLower || prev.countryCode,
        phoneCountryCode: dial,
        state: "",
        stateId: undefined,
        city: "",
      }))
    }
  }

  const onStateChange = (val: any) => {
    if (val && typeof val === "object" && "name" in val) {
      const name = String(val.name)
      const isoOrId = (val.isoCode || val.id || undefined) as string | number | undefined
      setFormData((prev) => ({ ...prev, state: name, stateId: isoOrId, city: "" }))
    }
  }

  const onCityChange = (val: any) => {
    if (val && typeof val === "object" && "name" in val) {
      setFormData((prev) => ({ ...prev, city: String(val.name) }))
    }
  }

  const onPhoneChange = (value: string, countryData: any) => {
    const dial = countryData && countryData.dialCode ? `+${countryData.dialCode}` : formData.phoneCountryCode
    let local = value
    if (countryData && countryData.dialCode) {
      local = value.replace(`+${countryData.dialCode}`, "").replace(countryData.dialCode, "").trim()
    } else {
      local = value.replace(/^\+/, "").replace(/\D/g, "")
    }

    setFormData((prev) => ({
      ...prev,
      phone: local,
      phoneCountryCode: dial,
      countryCode: countryData?.countryCode ? String(countryData.countryCode).toLowerCase() : prev.countryCode,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      let uploadedFileURL = ""

      if (formData.medical_report_url && typeof formData.medical_report_url !== "string") {
        const file = formData.medical_report_url as File
        const fileName = `${Date.now()}_${file.name}`
        const { error: uploadError } = await supabase.storage
          .from("medical_reports")
          .upload(fileName, file)

        if (uploadError) {
          console.error("File upload error:", uploadError)
          alert("failed uploading report")
        } else {
          const { data: publicUrlData } = supabase.storage
          .from("medical_reports")
          .getPublicUrl(fileName)

          uploadedFileURL = publicUrlData.publicUrl
          alert("file uploaded successfully")
        }
      }

      const phoneToSave = `${formData.phoneCountryCode}${formData.phone}`.replace(/\s+/g, "")
      const { error } = await supabase.from("quote_requests").insert([
        {
          patient_name: formData.name,
          country: formData.country,
          state: formData.state,
          city: formData.city,
          phone: phoneToSave,
          medical_problem: formData.medical_problem,
          age: formData.age,
          gender: formData.gender,
          specialty: formData.specialty,
          medical_report_url: uploadedFileURL || "",
          created_at: new Date().toISOString(),
        },
      ])

      if (error) {
        console.error("[Form Submission Error]:", error)
        alert("Error submitting form. Please try again.")
      } else {
        setSubmitted(true)
        setFormData({
          name: "",
          country: "",
          countryCode: "in",
          countryId: undefined,
          state: "",
          stateId: undefined,
          city: "",
          phone: "",
          phoneCountryCode: "+91",
          medical_problem: "",
          medical_report_url: "",
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

  // 🧩 File upload handler with visual feedback
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFormData((prev) => ({ ...prev, medical_report_url: file }))
    setFileName(file.name)
    setUploading(true)
    setUploaded(false)

    // Optional: simulate upload delay for UX
    await new Promise((r) => setTimeout(r, 1500))
    setUploading(false)
    setUploaded(true)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto space-y-4 bg-white rounded-2xl p-8 shadow-lg"
    >
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
        Let Us Help You
      </h2>

      <input
        type="text"
        placeholder="Patient Name"
        value={formData.name}
        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
      />

      {/* Country / State / City Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <CountrySelect
              placeHolder="Select Country"
              onChange={onCountryChange}
              className="w-full [&>div]:border [&>div]:border-gray-300 [&>div]:rounded-lg [&>div]:px-2 [&>div]:py-1 hover:[&>div]:border-green-500 focus:[&>div]:ring-2 focus:[&>div]:ring-green-500"
            />
          </div>
          {formData.countryId && (
            <div className="flex-1">
              <StateSelect
                countryid={Number(formData.countryId)}
                placeHolder="Select State"
                onChange={onStateChange}
                className="w-full [&>div]:border [&>div]:border-gray-300 [&>div]:rounded-lg [&>div]:px-2 [&>div]:py-1 hover:[&>div]:border-green-500 focus:[&>div]:ring-2 focus:[&>div]:ring-green-500"
              />
            </div>
          )}
        </div>

        {formData.stateId && (
          <CitySelect
            countryid={Number(formData.countryId)}
            stateid={Number(formData.stateId)}
            placeHolder="Select City"
            onChange={onCityChange}
            className="w-full [&>div]:border [&>div]:border-gray-300 [&>div]:rounded-lg [&>div]:px-2 [&>div]:py-1 hover:[&>div]:border-green-500 focus:[&>div]:ring-2 focus:[&>div]:ring-green-500"
          />
        )}
      </div>

      {/* 📞 Phone Input */}
      <div className="w-full mt-2">
        <PhoneInput
          country={formData.countryCode}
          enableSearch
          disableDropdown={false}
          placeholder="Enter your phone number"
          value={`${formData.phoneCountryCode}${formData.phone}`.trim()}
          onChange={onPhoneChange}
          inputClass="!w-full !h-[48px] !pl-14 !pr-4 !py-3 !border !border-gray-300 !rounded-lg !focus:ring-2 !focus:ring-green-500 !focus:border-transparent !outline-none !text-gray-800"
          buttonClass="!border !border-gray-300 !rounded-l-lg !bg-gray-50 focus:!ring-2 focus:!ring-green-500"
          containerClass="!w-full"
          preferredCountries={["in", "sa", "ae", "us", "gb", "pk"]}
          autoFormat
        />
      </div>




      <select
        value={formData.specialty}
        onChange={(e) => setFormData((prev) => ({ ...prev, specialty: e.target.value }))}
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

      <textarea
        placeholder="Describe The Current Medical Problem .."
        value={formData.medical_problem}
        onChange={(e) => setFormData((prev) => ({ ...prev, medical_problem: e.target.value }))}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition min-h-24 resize-none"
      />

      {/* ✅ Custom file upload */}
      <div>
        <label
          htmlFor="file-upload"
          className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg cursor-pointer transition
${
uploaded
? "border-green-500 text-green-600"
: "border-gray-300 hover:border-green-500"
}`}
        >
          <div className="flex items-center gap-2">
            {uploading ? (
              <Loader2 className="animate-spin text-green-500" size={18} />
            ) : uploaded ? (
                <CheckCircle className="text-green-600" size={18} />
              ) : (
                  <Upload className="text-gray-500" size={18} />
                )}
            <span className="text-sm">
              {fileName || "Upload your medical report (optional)"}
            </span>
          </div>
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.docx"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <input
        type="text"
        placeholder="Age or Date of Birth"
        value={formData.age}
        onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
      />

      <div className="space-y-2">
        <label className="block font-semibold text-gray-700">Gender</label>
        <div className="flex gap-2 flex-wrap">
          {["male", "female", "other"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, gender: option }))}
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

      <button
        type="submit"
        disabled={loading}
        className="btn-glass w-full text-white text-lg py-4 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Submitting..." : "Get FREE Quote"}
      </button>

      {submitted && (
        <div className="p-4 bg-green-100 border border-green-400 rounded-lg text-green-800 font-semibold">
          Thank you! Your quote request has been submitted. We'll contact you soon!
        </div>
      )}

      <p className="text-xs text-gray-600 text-center">
        By submitting the form I agree to the Terms of Use and Privacy Policy of Riayah Care.
      </p>
    </form>
  )
}

