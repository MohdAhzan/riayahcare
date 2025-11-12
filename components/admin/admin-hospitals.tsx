
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface Hospital {
  id: string
  name: string
  city: string
  country: string
  accreditation: string
  year_established: number
  airport_distance: string
  rating: number
  reviews_count: number
  facilities: string[]
  intl_services: string[]
  why_choose: string
  description: string
  image_url?: string
  gallery_urls?: string[]
  specialties?: string[]
}

export default function AdminHospitals() {
  const supabase = createClient()
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    country: "India",
    accreditation: "",
    year_established: 0,
    airport_distance: "",
    rating: 4.5,
    description: "",
    facilities: [] as string[],
    intl_services: [] as string[],
    why_choose: "",
    image_url: "",
    specialties: [] as string[],
    gallery_urls: [] as string[],
  })

  useEffect(() => {
    initializeBucket()
    fetchHospitals()
  }, [])

  const initializeBucket = async () => {
    try {
      await fetch("/api/create-bucket")
    } catch (error) {
      console.error("Failed to initialize bucket:", error)
    }
  }

  const fetchHospitals = async () => {
    try {
      const { data, error } = await supabase.from("hospitals").select(`
        *,
        hospital_specialties (specialty)
      `)
      if (error) throw error
      const merged = (data || []).map((h: any) => ({
        ...h,
        specialties: h.hospital_specialties?.map((s: any) => s.specialty) || [],
      }))
      setHospitals(merged)
    } catch (error) {
      console.error("Fetch error:", error)
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
      const response = await fetch("/api/upload", { method: "POST", body: formDataUpload })
      const data = await response.json()
      if (data.url) setFormData({ ...formData, image_url: data.url })
    } catch (err) {
      console.error("Upload error:", err)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.city) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const { specialties, ...hospitalData } = formData

      if (editingId) {
        const { error } = await supabase.from("hospitals").update(hospitalData).eq("id", editingId)
        if (error) throw error

        await supabase.from("hospital_specialties").delete().eq("hospital_id", editingId)
        await supabase.from("hospital_specialties").insert(
          specialties.map((s) => ({ hospital_id: editingId, specialty: s }))
        )
        alert("Hospital updated successfully!")
      } else {
        const { data, error } = await supabase.from("hospitals").insert([hospitalData]).select("id")
        if (error) throw error
        if (!data || !data.length) throw new Error("Insert returned no data.")

        const hospitalId = data[0].id
        await supabase.from("hospital_specialties").insert(
          specialties.map((s) => ({ hospital_id: hospitalId, specialty: s }))
        )
        alert("Hospital added successfully!")
      }

      resetForm()
      fetchHospitals()
    } catch (err) {
      console.error("Form error:", err)
      alert("Error saving hospital.")
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      name: "",
      city: "",
      country: "India",
      accreditation: "",
      year_established: 0,
      airport_distance: "",
      rating: 4.5,
      description: "",
      facilities: [],
      intl_services: [],
      why_choose: "",
      image_url: "",
      gallery_urls: [],
      specialties: [],
    })
    setShowForm(false)
  }

  const handleEdit = (hospital: Hospital) => {
    setEditingId(hospital.id)
    setFormData({
      name: hospital.name,
      city: hospital.city,
      country: hospital.country,
      accreditation: hospital.accreditation,
      year_established: hospital.year_established,
      airport_distance: hospital.airport_distance,
      rating: hospital.rating,
      description: hospital.description,
      facilities: hospital.facilities || [],
      intl_services: hospital.intl_services || [],
      why_choose: hospital.why_choose,
      image_url: hospital.image_url || "",
      gallery_urls: hospital.gallery_urls || [],
      specialties: hospital.specialties || [],
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hospital?")) return
    try {
      await supabase.from("hospital_specialties").delete().eq("hospital_id", id)
      const { error } = await supabase.from("hospitals").delete().eq("id", id)
      if (error) throw error
      alert("Hospital deleted successfully!")
      fetchHospitals()
    } catch (err) {
      console.error("Delete error:", err)
      alert("Failed to delete hospital.")
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)

    try {
      const uploadedUrls: string[] = []
      for (const file of Array.from(files)) {
        const formDataUpload = new FormData()
        formDataUpload.append("file", file)
        formDataUpload.append("bucket", "hospitals")

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        })

        const data = await response.json()
        if (data.error) throw new Error(data.error)
        if (data.url) uploadedUrls.push(data.url)
      }

      setFormData({
        ...formData,
        gallery_urls: [...(formData.gallery_urls || []), ...uploadedUrls],
      })
    } catch (error) {
      console.error("Gallery upload error:", error)
      alert("Failed to upload gallery files.")
    } finally {
      setUploading(false)
    }
  }

  const handleMultiChange = (key: string, values: string) => {
    setFormData({ ...formData, [key]: values.split(",").map((v) => v.trim()) })
  }

  if (loading) return <div className="text-center py-12">Loading hospitals...</div>

  return (
    <div>
      <button
        onClick={() => {
          resetForm()
          setShowForm(!showForm)
        }}
        className="mb-6 flex items-center gap-2 btn-glass text-white"
      >
        <span>➕</span> Add Hospital
      </button>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">{editingId ? "Edit Hospital" : "Add New Hospital"}</h3>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <input type="text" placeholder="Hospital Name *" value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" required />
            <input type="text" placeholder="City *" value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="input" required />
            <input type="text" placeholder="Country" value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="input" />
            <input type="text" placeholder="Accreditation" value={formData.accreditation}
              onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })} className="input" />
            <input type="number" placeholder="Year Established" value={formData.year_established}
              onChange={(e) => setFormData({ ...formData, year_established: Number(e.target.value) })} className="input" />
            <input type="text" placeholder="Airport Distance" value={formData.airport_distance}
              onChange={(e) => setFormData({ ...formData, airport_distance: e.target.value })} className="input" />
            <input type="text" placeholder="Specialties (comma separated)" value={formData.specialties.join(", ")}
              onChange={(e) => handleMultiChange("specialties", e.target.value)} className="input" />
            <textarea placeholder="Facilities (comma separated)" value={formData.facilities.join(", ")}
              onChange={(e) => handleMultiChange("facilities", e.target.value)} className="input md:col-span-2" />
            <textarea placeholder="International Services (comma separated)" value={formData.intl_services.join(", ")}
              onChange={(e) => handleMultiChange("intl_services", e.target.value)} className="input md:col-span-2" />
            <textarea placeholder="Why Choose This Hospital" value={formData.why_choose}
              onChange={(e) => setFormData({ ...formData, why_choose: e.target.value })} className="input md:col-span-2" />
            <textarea placeholder="Short Description" value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input md:col-span-2" />

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Hospital Image</label>
              <input type="file" accept="image/*" onChange={handleImageUpload}
                disabled={uploading} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
              {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
              {formData.image_url && (
                <img src={formData.image_url} alt="Hospital" className="mt-2 w-32 h-32 object-cover rounded-lg" />
              )}
            </div>

            {/* Gallery Upload Section */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Gallery (Images / Videos)</label>
              <div className="flex flex-col gap-3">
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleGalleryUpload}
                  disabled={uploading}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                />
                {uploading && <span className="text-sm text-gray-600">Uploading gallery...</span>}
                {formData.gallery_urls && formData.gallery_urls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {formData.gallery_urls.map((url, idx) => (
                      url.endsWith(".mp4") || url.endsWith(".mov") ? (
                        <video key={idx} controls className="rounded-lg w-full">
                          <source src={url} type="video/mp4" />
                        </video>
                      ) : (
                        <img key={idx} src={url} alt="Gallery item" className="rounded-lg w-full h-24 object-cover" />
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button type="submit" disabled={uploading}
              className="md:col-span-2 btn-glass text-white font-semibold py-2 disabled:opacity-50">
              {editingId ? "Update Hospital" : "Add Hospital"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="md:col-span-2 border border-gray-300 rounded-lg py-2 font-semibold hover:bg-gray-50">
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Location</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Specialties</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Rating</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {hospitals.map((h) => (
              <tr key={h.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{h.name}</td>
                <td className="px-6 py-4">{h.city}, {h.country}</td>
                <td className="px-6 py-4">{h.specialties?.join(", ")}</td>
                <td className="px-6 py-4">⭐ {h.rating}</td>
                <td className="px-6 py-4 flex gap-3">
                  <button
                    onClick={() => handleEdit(h)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(h.id)}
                    className="text-red-600 hover:underline font-medium"
                  >
                    Delete
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

