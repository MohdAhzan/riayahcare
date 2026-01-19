
// components/admin/addDoctor/admin-doctor.tsx


"use client"

import { useState, useEffect } from "react"

/* ================= TYPES ================= */

type ExperienceItem = {
  role: string
  hospital: string
  years: string
}

type AdminDoctorsProps = {
  existingDoctor?: any
  onSuccessAction?: () => void
}

/* ================= HELPERS ================= */

function normalizeToString(value: any): string {
  if (!value) return ""

  if (Array.isArray(value)) {
    return value.join(", ")
  }

  if (typeof value === "string") {
    const trimmed = value.trim()

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
          return parsed.join(", ")
        }
      } catch {}
    }

    return trimmed
  }

  return ""
}

function toArray(val: string) {
  return val.split(",").map((s) => s.trim()).filter(Boolean)
}

/* ================= COMPONENT ================= */

export default function AdminDoctors({
  existingDoctor,
  onSuccessAction,
}: AdminDoctorsProps) {
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: "",
    experience_years: "",
    bio: "",
    education: "",
    languages: "",
    expertise: "",
    conditions_treated: "",
    procedures: "",
    rating: "",
  })

  const [experience, setExperience] = useState<ExperienceItem[]>([
    { role: "", hospital: "", years: "" },
  ])

  const [imageFile, setImageFile] = useState<File | null>(null)

  /* ===== PREFILL (THIS WAS CORRECT, KEEP IT) ===== */

  useEffect(() => {
    if (!existingDoctor) return

    setForm({
      name: existingDoctor.name ?? "",
      experience_years: existingDoctor.experience_years?.toString() ?? "",
      bio: existingDoctor.bio ?? "",
      education: normalizeToString(existingDoctor.education),
      languages: normalizeToString(existingDoctor.languages),
      expertise: normalizeToString(existingDoctor.expertise),
      conditions_treated: normalizeToString(existingDoctor.conditions_treated),
      procedures: normalizeToString(existingDoctor.procedures),
      rating: existingDoctor.rating?.toString() ?? "",
    })

    setExperience(
      existingDoctor.experience_details?.length
        ? existingDoctor.experience_details
        : [{ role: "", hospital: "", years: "" }]
    )
  }, [existingDoctor])

  /* ================= HANDLERS ================= */

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  function updateExperience(
    index: number,
    field: keyof ExperienceItem,
    value: string
  ) {
    setExperience((prev) =>
      prev.map((e, i) =>
        i === index ? { ...e, [field]: value } : e
      )
    )
  }

  function addExperience() {
    setExperience((p) => [...p, { role: "", hospital: "", years: "" }])
  }

  function removeExperience(index: number) {
    setExperience((p) => p.filter((_, i) => i !== index))
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)

    try {
      let image_url = existingDoctor?.image_url ?? null

      if (imageFile) {
        const fd = new FormData()
        fd.append("file", imageFile)
        fd.append("bucket", "doctors")

        const res = await fetch("/api/upload", { method: "POST", body: fd })
        const result = await res.json()
        if (!res.ok) throw new Error(result.error)
        image_url = result.url
      }

      const payload = {
        name: form.name.trim(),
        slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        experience_years: Number(form.experience_years),
        bio: form.bio,
        education: toArray(form.education),
        languages: toArray(form.languages),
        expertise: toArray(form.expertise),
        conditions_treated: toArray(form.conditions_treated),
        procedures: toArray(form.procedures),
        experience_details: experience.filter(
          (e) => e.role || e.hospital || e.years
        ),
        rating: form.rating ? Number(form.rating) : null,
        image_url,
      }

      const res = await fetch("/api/admin/doctors", {
        method: existingDoctor ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(existingDoctor && { id: existingDoctor.id }),
          ...payload,
        }),
      })

      if (!res.ok) {
        const r = await res.json()
        throw new Error(r.error || "Failed")
      }

      onSuccessAction?.()
      alert(existingDoctor ? "Doctor updated" : "Doctor added")
    } catch (err: any) {
      alert(err.message || "Failed")
    } finally {
      setLoading(false)
    }
  }


  /* ---------------- UI ---------------- */

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-5">
      <h2 className="text-xl font-bold">
        {existingDoctor ? "Edit Doctor" : "Add Doctor"}
      </h2>

      <Field label="Doctor Name">
        <input name="name" value={form.name} onChange={handleChange}
          className="w-full border px-4 py-2 rounded" />
      </Field>

      <Field label="Total Experience (Years)">
        <input type="number" name="experience_years" value={form.experience_years}
          onChange={handleChange} className="w-full border px-4 py-2 rounded" />
      </Field>

      <Field label="Doctor Image">
        <input type="file" accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
      </Field>

      <Field label="Biography">
        <textarea name="bio" value={form.bio}
          onChange={handleChange} className="w-full border px-4 py-2 rounded" />
      </Field>

      <Field label="Education">
        <input name="education" value={form.education}
          onChange={handleChange} className="w-full border px-4 py-2 rounded" />
      </Field>

      <Field label="Languages">
        <input name="languages" value={form.languages}
          onChange={handleChange} className="w-full border px-4 py-2 rounded" />
      </Field>

      <Field label="Expertise / Specializations">
        <input name="expertise" value={form.expertise}
          onChange={handleChange} className="w-full border px-4 py-2 rounded" />
      </Field>

      <Field label="Conditions Treated">
        <input name="conditions_treated" value={form.conditions_treated}
          onChange={handleChange} className="w-full border px-4 py-2 rounded" />
      </Field>

      <Field label="Procedures">
        <input name="procedures" value={form.procedures}
          onChange={handleChange} className="w-full border px-4 py-2 rounded" />
      </Field>

      {/* EXPERIENCE */}
      <div className="space-y-3">
        <p className="font-semibold">Experience Timeline</p>

        {experience.map((e, i) => (
          <div key={i} className="grid md:grid-cols-4 gap-2">
            <input value={e.role} placeholder="Role"
              onChange={(ev) => updateExperience(i, "role", ev.target.value)}
              className="border px-3 py-2 rounded" />
            <input value={e.hospital} placeholder="Hospital"
              onChange={(ev) => updateExperience(i, "hospital", ev.target.value)}
              className="border px-3 py-2 rounded" />
            <input value={e.years} placeholder="Years"
              onChange={(ev) => updateExperience(i, "years", ev.target.value)}
              className="border px-3 py-2 rounded" />
            <button type="button" onClick={() => removeExperience(i)} className="text-red-500">✕</button>
          </div>
        ))}

        <button type="button" onClick={addExperience} className="text-green-600 font-medium">
          + Add Experience
        </button>
      </div>

      <button type="submit" disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded font-semibold">
        {loading ? "Saving..." : "Save Doctor"}
      </button>
    </form>
  )
}

/* ================= FIELD ================= */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  )
}


//"use client"
//
//import { useState } from "react"
//import { createClient } from "@/lib/supabase/client"
//
//const supabase = createClient()
//
///* ================= TYPES ================= */
//
//type ExperienceItem = {
//  role: string
//  hospital: string
//  years: string
//}
//
//type AdminDoctorsProps = {
//  existingDoctor?: any
//  onSuccessAction?: () => void
//}
//
///* ================= COMPONENT ================= */
//
//export default function AdminDoctors({
//  existingDoctor,
//  onSuccessAction,
//}: AdminDoctorsProps) {
//  const [loading, setLoading] = useState(false)
//
//  /* ---------------- FORM STATE ---------------- */
//
//  const [form, setForm] = useState({
//    name: existingDoctor?.name ?? "",
//    experience_years: existingDoctor?.experience_years?.toString() ?? "",
//    bio: existingDoctor?.bio ?? "",
//    education: existingDoctor?.education?.join(", ") ?? "",
//    languages: existingDoctor?.languages?.join(", ") ?? "",
//    expertise: existingDoctor?.expertise?.join(", ") ?? "",
//    conditions_treated:
//      existingDoctor?.conditions_treated?.join(", ") ?? "",
//    procedures: existingDoctor?.procedures?.join(", ") ?? "",
//    rating: existingDoctor?.rating?.toString() ?? "",
//  })
//
//  const [experience, setExperience] = useState<ExperienceItem[]>(
//    existingDoctor?.experience_details ?? [
//      { role: "", hospital: "", years: "" },
//    ]
//  )
//
//  const [imageFile, setImageFile] = useState<File | null>(null)
//
//  /* ---------------- HANDLERS ---------------- */
//
//  function handleChange(
//    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//  ) {
//    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
//  }
//
//  function updateExperience(
//    index: number,
//    field: keyof ExperienceItem,
//    value: string
//  ) {
//    setExperience((prev) =>
//      prev.map((e, i) =>
//        i === index ? { ...e, [field]: value } : e
//      )
//    )
//  }
//
//  function addExperience() {
//    setExperience((p) => [
//      ...p,
//      { role: "", hospital: "", years: "" },
//    ])
//  }
//
//  function removeExperience(index: number) {
//    setExperience((p) => p.filter((_, i) => i !== index))
//  }
//
//  /* ---------------- SUBMIT ---------------- */
//
//  async function handleSubmit(e: React.FormEvent) {
//    e.preventDefault()
//    if (loading) return
//    setLoading(true)
//
//    try {
//      let image_url = existingDoctor?.image_url ?? null
//
//      if (imageFile) {
//        const fd = new FormData()
//        fd.append("file", imageFile)
//        fd.append("bucket", "doctors")
//
//        const res = await fetch("/api/upload", {
//          method: "POST",
//          body: fd,
//        })
//
//        const result = await res.json()
//        if (!res.ok) throw new Error(result.error)
//        image_url = result.url
//      }
//
//      const payload = {
//        name: form.name.trim(),
//
//        slug: form.name
//          .toLowerCase()
//          .replace(/[^a-z0-9]+/g, "-")
//          .replace(/(^-|-$)/g, ""),
//
//        experience_years: Number(form.experience_years),
//        bio: form.bio,
//
//        education: form.education
//          .split(",")
//          .map((s: string) => s.trim())
//          .filter(Boolean),
//
//        languages: form.languages
//          .split(",")
//          .map((s: string) => s.trim())
//          .filter(Boolean),
//
//        expertise: form.expertise
//          .split(",")
//          .map((s: string) => s.trim())
//          .filter(Boolean),
//
//        conditions_treated: form.conditions_treated
//          .split(",")
//          .map((s: string) => s.trim())
//          .filter(Boolean),
//
//        procedures: form.procedures
//          .split(",")
//          .map((s: string) => s.trim())
//          .filter(Boolean),
//
//        experience_details: experience.filter(
//          (e) => e.role || e.hospital || e.years
//        ),
//
//        rating: form.rating ? Number(form.rating) : null,
//        image_url,
//      }
//
//      const { error } = existingDoctor
//        ? await supabase
//            .from("doctors")
//            .update(payload)
//            .eq("id", existingDoctor.id)
//        : await supabase.from("doctors").insert(payload)
//
//      if (error) throw error
//
//      onSuccessAction?.()
//      alert(existingDoctor ? "Doctor updated" : "Doctor added")
//    } catch (err: any) {
//      alert(err.message || "Failed")
//    } finally {
//      setLoading(false)
//    }
//  }
//
//  /* ---------------- UI ---------------- */
//
//  return (
//    <form
//      onSubmit={handleSubmit}
//      className="bg-white rounded-xl shadow p-6 space-y-5"
//    >
//      <h2 className="text-xl font-bold">
//        {existingDoctor ? "Edit Doctor" : "Add Doctor"}
//      </h2>
//
//      <input
//        name="name"
//        required
//        value={form.name}
//        onChange={handleChange}
//        placeholder="Doctor Name"
//        className="w-full border px-4 py-2 rounded"
//      />
//
//      <input
//        name="experience_years"
//        type="number"
//        required
//        value={form.experience_years}
//        onChange={handleChange}
//        placeholder="Total Experience (years)"
//        className="w-full border px-4 py-2 rounded"
//      />
//
//      {/* IMAGE UPLOAD */}
//      <input
//        type="file"
//        accept="image/*"
//        onChange={(e) =>
//          setImageFile(e.target.files?.[0] ?? null)
//        }
//        className="w-full text-sm"
//      />
//
//      <textarea
//        name="bio"
//        value={form.bio}
//        onChange={handleChange}
//        placeholder="Doctor Bio"
//        className="w-full border px-4 py-2 rounded"
//      />
//
//      <input
//        name="education"
//        value={form.education}
//        onChange={handleChange}
//        placeholder="Education (comma separated)"
//        className="w-full border px-4 py-2 rounded"
//      />
//
//      <input
//        name="languages"
//        value={form.languages}
//        onChange={handleChange}
//        placeholder="Languages (comma separated)"
//        className="w-full border px-4 py-2 rounded"
//      />
//
//      <input
//        name="expertise"
//        value={form.expertise}
//        onChange={handleChange}
//        placeholder="Expertise / Specializations"
//        className="w-full border px-4 py-2 rounded"
//      />
//
//      <input
//        name="conditions_treated"
//        value={form.conditions_treated}
//        onChange={handleChange}
//        placeholder="Conditions Treated"
//        className="w-full border px-4 py-2 rounded"
//      />
//
//      <input
//        name="procedures"
//        value={form.procedures}
//        onChange={handleChange}
//        placeholder="Procedures"
//        className="w-full border px-4 py-2 rounded"
//      />
//
//      {/* EXPERIENCE TIMELINE */}
//      <div className="space-y-3">
//        <p className="font-semibold">Experience Timeline</p>
//
//        {experience.map((e, i) => (
//          <div key={i} className="grid md:grid-cols-4 gap-2">
//            <input
//              placeholder="Role"
//              value={e.role}
//              onChange={(ev) =>
//                updateExperience(i, "role", ev.target.value)
//              }
//              className="border px-3 py-2 rounded"
//            />
//            <input
//              placeholder="Hospital"
//              value={e.hospital}
//              onChange={(ev) =>
//                updateExperience(i, "hospital", ev.target.value)
//              }
//              className="border px-3 py-2 rounded"
//            />
//            <input
//              placeholder="Years"
//              value={e.years}
//              onChange={(ev) =>
//                updateExperience(i, "years", ev.target.value)
//              }
//              className="border px-3 py-2 rounded"
//            />
//            <button
//              type="button"
//              onClick={() => removeExperience(i)}
//              className="text-red-500"
//            >
//              ✕
//            </button>
//          </div>
//        ))}
//
//        <button
//          type="button"
//          onClick={addExperience}
//          className="text-green-600 font-medium"
//        >
//          + Add Experience
//        </button>
//      </div>
//
//      <button
//        type="submit"
//        disabled={loading}
//        className="w-full bg-green-600 text-white py-3 rounded font-semibold"
//      >
//        {loading ? "Saving..." : "Save Doctor"}
//      </button>
//    </form>
//  )
//}
//
//
