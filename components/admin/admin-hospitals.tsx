"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface Hospital {
  id: string
  name: string
  city: string
  country: string
  specialty: string
  rating: number
  reviews_count: number
  image_url?: string
}

export default function AdminHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    country: "India",
    specialty: "",
    accreditation: "",
    beds: 0,
    rating: 4.5,
    description: "",
    image_url: "",
  })

  const supabase = createClient()

  useEffect(() => {
    initializeBucket()
    fetchHospitals()
  }, [])

  const initializeBucket = async () => {
    try {
      await fetch("/api/create-bucket")
    } catch (error) {
      console.error("[v0] Failed to initialize bucket:", error)
    }
  }

  const fetchHospitals = async () => {
    try {
      const { data, error } = await supabase.from("hospitals").select("*").eq("country", "India")
      if (error) {
        console.error("[v0] Fetch error:", error)
        return
      }
      setHospitals(data || [])
    } catch (error) {
      console.error("[v0] Error fetching hospitals:", error)
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
      formDataUpload.append("bucket", "hospitals")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      })

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }
      if (data.url) {
        setFormData({ ...formData, image_url: data.url })
      }
    } catch (error) {
      console.error("[v0] Upload error:", error)
      alert("Failed to upload image: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.city || !formData.specialty) {
      alert("Please fill in all required fields")
      return
    }

    try {
      if (editingId) {
        const { error } = await supabase.from("hospitals").update(formData).eq("id", editingId)
        if (error) throw error
        setEditingId(null)
        alert("Hospital updated successfully!")
      } else {
        const { error } = await supabase.from("hospitals").insert([formData])
        if (error) throw error
        alert("Hospital added successfully!")
      }

      setFormData({
        name: "",
        city: "",
        country: "India",
        specialty: "",
        accreditation: "",
        beds: 0,
        rating: 4.5,
        description: "",
        image_url: "",
      })
      setShowForm(false)
      fetchHospitals()
    } catch (error) {
      console.error("[v0] Form error:", error)
      alert("Error saving hospital. Please try again. " + (error instanceof Error ? error.message : ""))
    }
  }

  const handleEdit = (hospital: Hospital) => {
    setEditingId(hospital.id)
    setFormData({
      name: hospital.name,
      city: hospital.city,
      country: hospital.country,
      specialty: hospital.specialty,
      accreditation: "",
      beds: 0,
      rating: hospital.rating,
      description: "",
      image_url: hospital.image_url || "",
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hospital?")) return

    try {
      const { error } = await supabase.from("hospitals").delete().eq("id", id)
      if (error) throw error
      fetchHospitals()
      alert("Hospital deleted successfully!")
    } catch (error) {
      console.error("[v0] Delete error:", error)
      alert("Error deleting hospital: " + (error instanceof Error ? error.message : ""))
    }
  }

  if (loading) return <div className="text-center py-12">Loading hospitals...</div>

  return (
    <div>
      <button
        onClick={() => {
          setEditingId(null)
          setFormData({
            name: "",
            city: "",
            country: "India",
            specialty: "",
            accreditation: "",
            beds: 0,
            rating: 4.5,
            description: "",
            image_url: "",
          })
          setShowForm(!showForm)
        }}
        className="mb-6 flex items-center gap-2 btn-glass text-white"
      >
        <span>➕</span>
        Add Hospital
      </button>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">{editingId ? "Edit Hospital" : "Add New Hospital"}</h3>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Hospital Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
            <input
              type="text"
              placeholder="City *"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
            <input
              type="text"
              placeholder="Specialty *"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
            <input
              type="number"
              placeholder="Rating (1-5)"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
              step="0.1"
              min="1"
              max="5"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
            <input
              type="text"
              placeholder="Accreditation (e.g., JCI)"
              value={formData.accreditation}
              onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
            <input
              type="number"
              placeholder="Number of Beds"
              value={formData.beds}
              onChange={(e) => setFormData({ ...formData, beds: Number(e.target.value) })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              rows={3}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Hospital Image</label>
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
              {formData.image_url && <p className="text-sm text-green-600 mt-2">✓ Image uploaded</p>}
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="md:col-span-2 btn-glass text-white font-semibold py-2 disabled:opacity-50"
            >
              {editingId ? "Update Hospital" : "Add Hospital"}
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
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Specialty</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rating</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {hospitals.map((hospital) => (
              <tr key={hospital.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{hospital.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{hospital.city}, India</td>
                <td className="px-6 py-4 text-sm text-gray-600">{hospital.specialty}</td>
                <td className="px-6 py-4 text-sm text-gray-600">⭐ {hospital.rating}</td>
                <td className="px-6 py-4 text-sm flex gap-2">
                  <button
                    onClick={() => handleEdit(hospital)}
                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(hospital.id)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded"
                  >
                    🗑️
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
