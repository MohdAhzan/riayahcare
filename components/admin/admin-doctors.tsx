"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Trash2, Edit2, Plus } from "lucide-react"

interface Doctor {
  id: string
  name: string
  specialty: string
  experience_years: number
  rating: number
  image_url?: string
}

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    experience_years: 0,
    bio: "",
    rating: 4.5,
    image_url: "",
  })

  const supabase = createClient()

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const { data } = await supabase.from("doctors").select("*")
      setDoctors(data || [])
    } catch (error) {
      console.error("[v0] Error fetching doctors:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)
      formDataUpload.append("bucket", "doctors")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      })

      const data = await response.json()
      if (data.url) {
        setFormData({ ...formData, image_url: data.url })
      }
    } catch (error) {
      console.error("[v0] Upload error:", error)
      alert("Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        const { error } = await supabase.from("doctors").update(formData).eq("id", editingId)

        if (error) throw error
        setEditingId(null)
      } else {
        const { error } = await supabase.from("doctors").insert([formData])

        if (error) throw error
      }

      setFormData({ name: "", specialty: "", experience_years: 0, bio: "", rating: 4.5, image_url: "" })
      setShowForm(false)
      fetchDoctors()
      alert("Doctor saved successfully!")
    } catch (error) {
      console.error("[v0] Form error:", error)
      alert("Error saving doctor. Please try again.")
    }
  }

  const handleEdit = (doctor: Doctor) => {
    setEditingId(doctor.id)
    setFormData({
      name: doctor.name,
      specialty: doctor.specialty,
      experience_years: doctor.experience_years,
      bio: "",
      rating: doctor.rating,
      image_url: doctor.image_url || "",
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return

    try {
      await supabase.from("doctors").delete().eq("id", id)
      fetchDoctors()
      alert("Doctor deleted successfully!")
    } catch (error) {
      console.error("[v0] Delete error:", error)
      alert("Error deleting doctor")
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div>
      <button
        onClick={() => {
          setEditingId(null)
          setFormData({ name: "", specialty: "", experience_years: 0, bio: "", rating: 4.5, image_url: "" })
          setShowForm(!showForm)
        }}
        className="mb-6 flex items-center gap-2 btn-glass text-white"
      >
        <Plus className="w-5 h-5" />
        Add Doctor
      </button>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">{editingId ? "Edit Doctor" : "Add New Doctor"}</h3>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Doctor Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
            <input
              type="text"
              placeholder="Specialty"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
            <input
              type="number"
              placeholder="Years of Experience"
              value={formData.experience_years}
              onChange={(e) => setFormData({ ...formData, experience_years: Number(e.target.value) })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
            <input
              type="number"
              placeholder="Rating (1-5)"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
              step="0.1"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Doctor Image</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
                {uploading && <span className="text-sm text-gray-600">Uploading...</span>}
              </div>
              {formData.image_url && <p className="text-sm text-green-600 mt-2">Image uploaded</p>}
            </div>

            <textarea
              placeholder="Bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
            <button
              type="submit"
              disabled={uploading}
              className="md:col-span-2 btn-glass text-white font-semibold py-2 disabled:opacity-50"
            >
              {editingId ? "Update Doctor" : "Add Doctor"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
              }}
              className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Specialty</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Experience</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rating</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {doctors.map((doctor) => (
              <tr key={doctor.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{doctor.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{doctor.specialty}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{doctor.experience_years} years</td>
                <td className="px-6 py-4 text-sm text-gray-600">⭐ {doctor.rating}</td>
                <td className="px-6 py-4 text-sm flex gap-2">
                  <button
                    onClick={() => handleEdit(doctor)}
                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(doctor.id)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
