
// components/admin/addDoctor/admin-doctor.tsx

"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

type AdminDoctorsProps = {
  existingDoctor?: any
  onSuccessAction?: () => void
}

export default function AdminDoctors({
  existingDoctor,
  onSuccessAction,
}: AdminDoctorsProps) {
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: existingDoctor?.name ?? "",
    experience_years: existingDoctor?.experience_years?.toString() ?? "",
    bio: existingDoctor?.bio ?? "",
    education: existingDoctor?.education ?? "",
    languages: existingDoctor?.languages?.join(", ") ?? "",
    rating: existingDoctor?.rating?.toString() ?? "",
  })

  const [imageFile, setImageFile] = useState<File | null>(null)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)

    try {
      let image_url = existingDoctor?.image_url ?? null

      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)
        formData.append("bucket", "doctors")

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        const result = await res.json()

        if (!res.ok) {
          throw new Error(result.error || "Image upload failed")
        }

        image_url = result.url
      }

      const payload = {
        name: form.name.trim(),
        slug: form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
        experience_years: Number(form.experience_years),
        bio: form.bio,
        education: form.education,
        languages: form.languages
        .split(",")
        .map((l: string) => l.trim())
        .filter(Boolean),

        rating: form.rating ? Number(form.rating) : null,
        image_url,
      }

      const { error } = existingDoctor
        ? await supabase
        .from("doctors")
        .update(payload)
        .eq("id", existingDoctor.id)
        : await supabase.from("doctors").insert(payload)

      if (error) throw error

      onSuccessAction?.()
      alert(existingDoctor ? "Doctor updated" : "Doctor added")
    } catch (err: any) {
      alert(err.message || "Failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow p-6 space-y-4"
    >
      <h2 className="text-xl font-bold">
        {existingDoctor ? "Edit Doctor" : "Add New Doctor"}
      </h2>

      <input
        name="name"
        required
        value={form.name}
        onChange={handleChange}
        placeholder="Doctor Name"
        className="w-full border rounded px-4 py-2"
      />

      <input
        name="experience_years"
        type="number"
        required
        value={form.experience_years}
        onChange={handleChange}
        placeholder="Experience (years)"
        className="w-full border rounded px-4 py-2"
      />

      <label className="block">
        <span className="text-sm font-medium">Doctor Image</span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="block w-full text-sm file:mr-4 file:py-2 file:px-4
          file:rounded file:border-0 file:bg-green-50 file:text-green-700"
        />
      </label>

      <textarea
        name="bio"
        value={form.bio}
        onChange={handleChange}
        placeholder="Doctor Bio"
        className="w-full border rounded px-4 py-2"
      />

      <textarea
        name="education"
        value={form.education}
        onChange={handleChange}
        placeholder="Education"
        className="w-full border rounded px-4 py-2"
      />

      <input
        name="languages"
        value={form.languages}
        onChange={handleChange}
        placeholder="Languages (comma separated)"
        className="w-full border rounded px-4 py-2"
      />

      <input
        name="rating"
        type="number"
        step="0.1"
        min="0"
        max="5"
        value={form.rating}
        onChange={handleChange}
        placeholder="Rating (optional)"
        className="w-full border rounded px-4 py-2"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded font-semibold"
      >
        {loading ? "Saving..." : "Save Doctor"}
      </button>
    </form>
  )
}

