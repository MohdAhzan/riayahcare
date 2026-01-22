
//components/patient-inquiry-form.tsx 

"use client"

import React, { useState } from "react"
import { CountrySelect, StateSelect, CitySelect } from "react-country-state-city"
import PhoneInput from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"
import { createClient } from "@/lib/supabase/client"
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useTranslations } from "next-intl"

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

const COUNTRY_DIAL_CODES: Record<string, string> = {
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
  ca: "+1",
  au: "+61",
}

type FormState = {
  name: string
  country: string
  countryId?: number
  countryCode: string
  state: string
  stateId?: number
  city: string
  phone: string
  phoneCountryCode: string
  medical_problem: string
  medical_report_url: string | File
  age: string
  gender: string
  specialty: string
}

export default function FixedPatientForm(): React.ReactElement {
  const [formData, setFormData] = useState<FormState>({
    name: "",
    country: "",
    countryId: undefined,
    countryCode: "in",
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

  const t = useTranslations("Form")
  const gender = useTranslations("Form.gender")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [fileName, setFileName] = useState("")
  const [rateLimitError, setRateLimitError] = useState("")
  const supabase = createClient()

  const checkRateLimit = async (phoneNumber: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("quote_requests")
        .select("created_at")
        .eq("phone", phoneNumber)
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      if (error) throw error

      if (data && data.length >= 3) {
        setRateLimitError(
          "You have reached the maximum number of submissions (3) in 24 hours. Please try again later."
        )
        return false
      }

      return true
    } catch (error) {
      console.error("Rate limit check error:", error)
      return true
    }
  }

  const onCountryChange = (val: any) => {
    if (val && typeof val === "object" && "name" in val && "id" in val) {
      const countryName = String(val.name)
      const countryId = Number(val.id)
      
      // Get ISO code from the country object
      const isoCode = (val.isoCode || val.iso2 || "in").toLowerCase()
      
      // Get dial code for this country
      const dialCode = COUNTRY_DIAL_CODES[isoCode] || "+91"

      setFormData((prev) => ({
        ...prev,
        country: countryName,
        countryId: countryId,
        countryCode: isoCode,
        phoneCountryCode: dialCode,
        state: "",
        stateId: undefined,
        city: "",
      }))
    }
  }

  const onStateChange = (val: any) => {
    if (val && typeof val === "object" && "name" in val && "id" in val) {
      setFormData((prev) => ({
        ...prev,
        state: String(val.name),
        stateId: Number(val.id),
        city: "",
      }))
    }
  }

  const onCityChange = (val: any) => {
    if (val && typeof val === "object" && "name" in val) {
      setFormData((prev) => ({ ...prev, city: String(val.name) }))
    }
  }

  const onPhoneChange = (value: string, countryData: any) => {
    const dial = countryData?.dialCode ? `+${countryData.dialCode}` : formData.phoneCountryCode
    let local = value

    if (countryData?.dialCode) {
      local = value.replace(`+${countryData.dialCode}`, "").replace(countryData.dialCode, "").trim()
    } else {
      local = value.replace(/^\+/, "").replace(/\D/g, "")
    }

    setFormData((prev) => ({
      ...prev,
      phone: local,
      phoneCountryCode: dial,
    }))
  }

  const handleSubmit = async () => {
    if (loading) return

    setRateLimitError("")
    const phoneToSave = `${formData.phoneCountryCode}${formData.phone}`.replace(/\s+/g, "")

    const canSubmit = await checkRateLimit(phoneToSave)
    if (!canSubmit) return

    setLoading(true)

    try {
      let uploadedFileURL = ""

      if (formData.medical_report_url && typeof formData.medical_report_url !== "string") {
        const file = formData.medical_report_url as File
        const fileName = `${Date.now()}_${file.name}`

        const { error: uploadError } = await supabase.storage.from("medical_reports").upload(fileName, file)

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from("medical_reports").getPublicUrl(fileName)
          uploadedFileURL = publicUrlData.publicUrl
        }
      }

      const { error: dbError } = await supabase.from("quote_requests").insert([
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

      if (dbError) throw dbError

      setSubmitted(true)
      setFileName("")
      setUploaded(false)
      setFormData({
        name: "",
        country: "",
        countryId: undefined,
        countryCode: "in",
        state: "",
        stateId: undefined,
        city: "",
        phone: "",
        phoneCountryCode: "+91",
        medical_problem: "",
        age: "",
        gender: "",
        specialty: "",
        medical_report_url: "",
      })

      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      console.error("Form submission error:", err)
      alert("Error submitting form. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB")
      return
    }

    setFormData((prev) => ({ ...prev, medical_report_url: file }))
    setFileName(file.name)
    setUploading(true)
    setUploaded(false)

    await new Promise((r) => setTimeout(r, 1000))
    setUploading(false)
    setUploaded(true)
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 bg-white rounded-2xl p-8 shadow-lg">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">{t("title")}</h2>

      {/* Name */}
      <input
        type="text"
        placeholder={t("placeholders.name")}
        value={formData.name}
        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
      />

      {/* Country */}
      <div className="w-full">
        <CountrySelect
          onChange={onCountryChange}
          placeHolder={t("placeholders.country")}
          containerClassName="w-full"
          inputClassName="w-full !px-4 !py-3 !border !border-gray-300 !rounded-lg !focus:ring-2 !focus:ring-green-500 !outline-none !h-12"
        />
      </div>

      {/* State */}
      {formData.countryId && (
        <div className="w-full">
          <StateSelect
            countryid={formData.countryId}
            onChange={onStateChange}
            placeHolder={t("placeholders.state")}
            containerClassName="w-full"
            inputClassName="w-full !px-4 !py-3 !border !border-gray-300 !rounded-lg !focus:ring-2 !focus:ring-green-500 !outline-none !h-12"
          />
        </div>
      )}

      {/* City */}
      {formData.stateId && formData.countryId && (
        <div className="w-full">
          <CitySelect
            countryid={formData.countryId}
            stateid={formData.stateId}
            onChange={onCityChange}
            placeHolder={t("placeholders.city")}
            containerClassName="w-full"
            inputClassName="w-full !px-4 !py-3 !border !border-gray-300 !rounded-lg !focus:ring-2 !focus:ring-green-500 !outline-none !h-12"
          />
        </div>
      )}

      {/* Phone */}
      <div className="w-full">
        <PhoneInput
          country={formData.countryCode}
          value={`${formData.phoneCountryCode}${formData.phone}`}
          onChange={onPhoneChange}
          enableSearch
          placeholder={t("placeholders.phone")}
          inputClass="!w-full !h-12 !pl-14 !pr-4 !py-3 !border !border-gray-300 !rounded-lg !text-base !focus:ring-2 !focus:ring-green-500 !focus:border-transparent !outline-none"
          buttonClass="!border !border-gray-300 !rounded-l-lg !h-12 !bg-gray-50"
          containerClass="!w-full"
          searchClass="!max-w-full !px-3 !py-2"
        />
      </div>

      {/* Specialty */}
      <select
        value={formData.specialty}
        onChange={(e) => setFormData((prev) => ({ ...prev, specialty: e.target.value }))}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white h-12"
      >
        <option value="">{t("placeholders.specialty")}</option>
        {SPECIALTIES.map((spec) => (
          <option key={spec} value={spec}>
            {spec}
          </option>
        ))}
      </select>

      {/* Medical Problem */}
      <textarea
        placeholder={t("placeholders.medical_problem")}
        value={formData.medical_problem}
        onChange={(e) => setFormData((prev) => ({ ...prev, medical_problem: e.target.value }))}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none min-h-24 resize-none"
      />

      {/* File Upload */}
      <div>
        <label
          htmlFor="file-upload"
          className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg cursor-pointer transition h-12 ${
            uploaded ? "border-green-500 text-green-600 bg-green-50" : "border-gray-300 hover:border-green-500"
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
            <span className="text-sm">{fileName || t("placeholders.upload")}</span>
          </div>
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.docx"
          onChange={handleFileChange}
          className="hidden"
        />
        <p className="text-xs text-gray-500 mt-1">Max file size: 10MB</p>
      </div>

      {/* Age */}
      <input
        type="text"
        placeholder={t("placeholders.age")}
        value={formData.age}
        onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none h-12"
      />

      {/* Gender */}
      <div className="space-y-2">
        <label className="block font-semibold text-gray-700">{t("labels.gender")}</label>
        <div className="flex gap-2 flex-wrap">
          {[gender("m"), gender("f"), gender("o")].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, gender: option }))}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                formData.gender === option
                  ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md"
                  : "border-2 border-green-300 text-green-700 hover:border-green-400"
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Rate Limit Error */}
      {rateLimitError && (
        <div className="p-4 bg-red-100 border border-red-400 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm">{rateLimitError}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading || !!rateLimitError}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-lg py-4 font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
      >
        {loading ? t("buttons.submitting") : t("buttons.submit")}
      </button>

      {/* Success Message */}
      {submitted && (
        <div className="p-4 bg-green-100 border border-green-400 rounded-lg text-green-800 font-semibold text-center">
          {t("response")}
        </div>
      )}

      {/* Terms */}
      <p className="text-xs text-gray-600 text-center">{t("terms")}</p>
    </div>
  )
}
//
//"use client"
//
//import React, { useState } from "react"
//import { CountrySelect, StateSelect, CitySelect } from "react-country-state-city"
//import PhoneInput from "react-phone-input-2"
//import { createClient } from "@/lib/supabase/client"
//import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react"
//import { useTranslations } from "next-intl"
//
//const SPECIALTIES = [
//  "Cardiology",
//  "Neurosurgery",
//  "Orthopedics",
//  "Oncology",
//  "Urology",
//  "Gynecology",
//  "Dental",
//  "Cosmetic Surgery",
//]
//
//type FormState = {
//  name: string
//  country: string
//  countryId?: number
//  state: string
//  stateId?: number
//  city: string
//  phone: string
//  phoneCountryCode: string
//  medical_problem: string
//  medical_report_url: string | File
//  age: string
//  gender: string
//  specialty: string
//}
//
//export default function RateLimitedPatientForm(): React.ReactElement {
//  const [formData, setFormData] = useState<FormState>({
//    name: "",
//    country: "",
//    countryId: undefined,
//    state: "",
//    stateId: undefined,
//    city: "",
//    phone: "",
//    phoneCountryCode: "+91",
//    medical_problem: "",
//    medical_report_url: "",
//    age: "",
//    gender: "",
//    specialty: "",
//  })
//
//  const t = useTranslations("Form")
//  const gender = useTranslations("Form.gender")
//  const [loading, setLoading] = useState(false)
//  const [submitted, setSubmitted] = useState(false)
//  const [uploading, setUploading] = useState(false)
//  const [uploaded, setUploaded] = useState(false)
//  const [fileName, setFileName] = useState("")
//  const [rateLimitError, setRateLimitError] = useState("")
//  const supabase = createClient()
//
//  const checkRateLimit = async (phoneNumber: string): Promise<boolean> => {
//    try {
//      const { data, error } = await supabase
//        .from("quote_requests")
//        .select("created_at")
//        .eq("phone", phoneNumber)
//        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
//
//      if (error) throw error
//
//      if (data && data.length >= 3) {
//        setRateLimitError("You have reached the maximum number of submissions (3) in 24 hours. Please try again later.")
//        return false
//      }
//
//      return true
//    } catch (error) {
//      console.error("Rate limit check error:", error)
//      return true
//    }
//  }
//
//  const onCountryChange = (val: any) => {
//    if (val && typeof val === "object" && "name" in val && "id" in val) {
//      setFormData((prev) => ({
//        ...prev,
//        country: String(val.name),
//        countryId: Number(val.id),
//        state: "",
//        stateId: undefined,
//        city: "",
//      }))
//    }
//  }
//
//  const onStateChange = (val: any) => {
//    if (val && typeof val === "object" && "name" in val && "id" in val) {
//      setFormData((prev) => ({
//        ...prev,
//        state: String(val.name),
//        stateId: Number(val.id),
//        city: "",
//      }))
//    }
//  }
//
//  const onCityChange = (val: any) => {
//    if (val && typeof val === "object" && "name" in val) {
//      setFormData((prev) => ({ ...prev, city: String(val.name) }))
//    }
//  }
//
//  const onPhoneChange = (value: string, countryData: any) => {
//    const dial = countryData?.dialCode ? `+${countryData.dialCode}` : formData.phoneCountryCode
//    let local = value
//    if (countryData?.dialCode) {
//      local = value.replace(`+${countryData.dialCode}`, "").replace(countryData.dialCode, "").trim()
//    } else {
//      local = value.replace(/^\+/, "").replace(/\D/g, "")
//    }
//
//    setFormData((prev) => ({
//      ...prev,
//      phone: local,
//      phoneCountryCode: dial,
//    }))
//  }
//
//  const handleSubmit = async () => {
//    if (loading) return
//
//    setRateLimitError("")
//    const phoneToSave = `${formData.phoneCountryCode}${formData.phone}`.replace(/\s+/g, "")
//
//    const canSubmit = await checkRateLimit(phoneToSave)
//    if (!canSubmit) return
//
//    setLoading(true)
//
//    try {
//      let uploadedFileURL = ""
//
//      if (formData.medical_report_url && typeof formData.medical_report_url !== "string") {
//        const file = formData.medical_report_url as File
//        const fileName = `${Date.now()}_${file.name}`
//
//        const { error: uploadError } = await supabase.storage
//          .from("medical_reports")
//          .upload(fileName, file)
//
//        if (!uploadError) {
//          const { data: publicUrlData } = supabase.storage
//            .from("medical_reports")
//            .getPublicUrl(fileName)
//          uploadedFileURL = publicUrlData.publicUrl
//        }
//      }
//
//      const { error: dbError } = await supabase.from("quote_requests").insert([
//        {
//          patient_name: formData.name,
//          country: formData.country,
//          state: formData.state,
//          city: formData.city,
//          phone: phoneToSave,
//          medical_problem: formData.medical_problem,
//          age: formData.age,
//          gender: formData.gender,
//          specialty: formData.specialty,
//          medical_report_url: uploadedFileURL || "",
//          created_at: new Date().toISOString(),
//        },
//      ])
//
//      if (dbError) throw dbError
//
//      setSubmitted(true)
//      setFileName("")
//      setUploaded(false)
//      setFormData({
//        name: "",
//        country: "",
//        countryId: undefined,
//        state: "",
//        stateId: undefined,
//        city: "",
//        phone: "",
//        phoneCountryCode: "+91",
//        medical_problem: "",
//        age: "",
//        gender: "",
//        specialty: "",
//        medical_report_url: "",
//      })
//
//      setTimeout(() => setSubmitted(false), 5000)
//    } catch (err) {
//      console.error("Form submission error:", err)
//      alert("Error submitting form. Please try again.")
//    } finally {
//      setLoading(false)
//    }
//  }
//
//  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//    const file = e.target.files?.[0]
//    if (!file) return
//
//    if (file.size > 10 * 1024 * 1024) {
//      alert("File size must be less than 10MB")
//      return
//    }
//
//    setFormData((prev) => ({ ...prev, medical_report_url: file }))
//    setFileName(file.name)
//    setUploading(true)
//    setUploaded(false)
//
//    await new Promise((r) => setTimeout(r, 1000))
//    setUploading(false)
//    setUploaded(true)
//  }
//
//  return (
//    <div className="w-full max-w-2xl mx-auto space-y-4 bg-white rounded-2xl p-8 shadow-lg">
//      <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">{t("title")}</h2>
//
//      <input
//        type="text"
//        placeholder={t("placeholders.name")}
//        value={formData.name}
//        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
//        required
//        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
//      />
//
//      <div className="space-y-3">
//        <CountrySelect
//          onChange={onCountryChange}
//          placeHolder={t("placeholders.country")}
//          containerClassName="w-full"
//          inputClassName="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
//        />
//
//        {formData.countryId && (
//          <StateSelect
//            countryid={formData.countryId}
//            onChange={onStateChange}
//            placeHolder={t("placeholders.state")}
//            containerClassName="w-full"
//            inputClassName="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
//          />
//        )}
//
//        {formData.stateId && formData.countryId && (
//          <CitySelect
//            countryid={formData.countryId}
//            stateid={formData.stateId}
//            onChange={onCityChange}
//            placeHolder={t("placeholders.city")}
//            containerClassName="w-full"
//            inputClassName="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
//          />
//        )}
//      </div>
//
//      <div className="w-full">
//        <PhoneInput
//          country="in"
//          enableSearch
//          placeholder={t("placeholders.phone")}
//          value={`${formData.phoneCountryCode}${formData.phone}`.trim()}
//          onChange={onPhoneChange}
//          inputClass="!w-full !h-12 !pl-14 !pr-4 !border !border-gray-300 !rounded-lg !focus:ring-2 !focus:ring-green-500"
//          buttonClass="!border !border-gray-300 !rounded-l-lg"
//          containerClass="!w-full"
//        />
//      </div>
//
//      <select
//        value={formData.specialty}
//        onChange={(e) => setFormData((prev) => ({ ...prev, specialty: e.target.value }))}
//        required
//        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
//      >
//        <option value="">{t("placeholders.specialty")}</option>
//        {SPECIALTIES.map((spec) => (
//          <option key={spec} value={spec}>
//            {spec}
//          </option>
//        ))}
//      </select>
//
//      <textarea
//        placeholder={t("placeholders.medical_problem")}
//        value={formData.medical_problem}
//        onChange={(e) => setFormData((prev) => ({ ...prev, medical_problem: e.target.value }))}
//        required
//        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none min-h-24 resize-none"
//      />
//
//      <div>
//        <label
//          htmlFor="file-upload"
//          className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg cursor-pointer transition ${
//            uploaded ? "border-green-500 text-green-600" : "border-gray-300 hover:border-green-500"
//          }`}
//        >
//          <div className="flex items-center gap-2">
//            {uploading ? (
//              <Loader2 className="animate-spin text-green-500" size={18} />
//            ) : uploaded ? (
//              <CheckCircle className="text-green-600" size={18} />
//            ) : (
//              <Upload className="text-gray-500" size={18} />
//            )}
//            <span className="text-sm">{fileName || t("placeholders.upload")}</span>
//          </div>
//        </label>
//        <input
//          id="file-upload"
//          type="file"
//          accept=".pdf,.jpg,.jpeg,.png,.docx"
//          onChange={handleFileChange}
//          className="hidden"
//        />
//        <p className="text-xs text-gray-500 mt-1">Max file size: 10MB</p>
//      </div>
//
//      <input
//        type="text"
//        placeholder={t("placeholders.age")}
//        value={formData.age}
//        onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
//        required
//        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
//      />
//
//      <div className="space-y-2">
//        <label className="block font-semibold text-gray-700">{t("labels.gender")}</label>
//        <div className="flex gap-2 flex-wrap">
//          {[gender("m"), gender("f"), gender("o")].map((option) => (
//            <button
//              key={option}
//              type="button"
//              onClick={() => setFormData((prev) => ({ ...prev, gender: option }))}
//              className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
//                formData.gender === option
//                  ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md"
//                  : "border-2 border-green-300 text-green-700 hover:border-green-400"
//              }`}
//            >
//              {option.charAt(0).toUpperCase() + option.slice(1)}
//            </button>
//          ))}
//        </div>
//      </div>
//
//      {rateLimitError && (
//        <div className="p-4 bg-red-100 border border-red-400 rounded-lg flex items-start gap-2">
//          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//          <p className="text-red-800 text-sm">{rateLimitError}</p>
//        </div>
//      )}
//
//      <button
//        onClick={handleSubmit}
//        disabled={loading || !!rateLimitError}
//        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-lg py-4 font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
//      >
//        {loading ? t("buttons.submitting") : t("buttons.submit")}
//      </button>
//
//      {submitted && (
//        <div className="p-4 bg-green-100 border border-green-400 rounded-lg text-green-800 font-semibold text-center">
//          {t("response")}
//        </div>
//      )}
//
//      <p className="text-xs text-gray-600 text-center">{t("terms")}</p>
//    </div>
//  )
//}
