
// components/admin/admin-testimonials.tsx
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { translateValuesToArabic } from "@/lib/googleTranslationServer/translate"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"

interface Testimonial {
  id: string
  patient_name: string
  patient_country: string
  patient_image_url: string | null
  video_url: string | null
  treatment_type: string
  rating: number
  is_active: boolean
  translations: {
    en: { content: string; title: string }
    ar: { content: string; title: string }
  }
}

interface FormData {
  patient_name: string
  patient_country: string
  patient_image_url: string
  video_url: string
  treatment_type: string
  rating: number
  is_active: boolean
  title_en: string
  content_en: string
}

export default function AdminTestimonialsV2() {
  const supabase = createClient()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    patient_name: "",
    patient_country: "",
    patient_image_url: "",
    video_url: "",
    treatment_type: "",
    rating: 5,
    is_active: true,
    title_en: "",
    content_en: ""
  })

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setTestimonials(data || [])
    } catch (error) {
      console.error("Error fetching testimonials:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'patient_image_url' | 'video_url') => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)
      formDataUpload.append("bucket", "testimonials")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      })

      const data = await response.json()
      if (data.url) {
        setFormData(prev => ({ ...prev, [field]: data.url }))
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload file")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setSaving(true)

  try {
    const payload = {
      patient_name: formData.patient_name,
      patient_country: formData.patient_country,
      patient_image_url: formData.patient_image_url || null,
      video_url: formData.video_url || null,
      treatment_type: formData.treatment_type,
      rating: formData.rating,
      is_active: formData.is_active,
      title_en: formData.title_en,
      content_en: formData.content_en
    }

    if (editingId) {
      const res = await fetch("/api/admin/testimonials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, id: editingId }),
      })

      if (!res.ok) throw new Error("Update failed")
      alert("Testimonial updated successfully!")
    } else {
      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("Create failed")
      alert("Testimonial created successfully!")
    }

    resetForm()
    fetchTestimonials()
  } catch (error) {
    console.error("Error saving testimonial:", error)
    alert("Error saving testimonial. Check console for details.")
  } finally {
    setSaving(false)
  }
}
  //const handleSubmit = async (e: React.FormEvent) => {
  //  e.preventDefault()
  //  setSaving(true)
  //
  //  try {
  //    // Translate to Arabic
  //    const translated = await translateValuesToArabic({
  //      title: formData.title_en,
  //      content: formData.content_en
  //    })
  //
  //    const testimonialData = {
  //      patient_name: formData.patient_name,
  //      patient_country: formData.patient_country,
  //      patient_image_url: formData.patient_image_url || null,
  //      video_url: formData.video_url || null,
  //      treatment_type: formData.treatment_type,
  //      rating: formData.rating,
  //      is_active: formData.is_active,
  //      translations: {
  //        en: {
  //          title: formData.title_en,
  //          content: formData.content_en
  //        },
  //        ar: {
  //          title: translated.title,
  //          content: translated.content
  //        }
  //      }
  //    }
  //
  //    if (editingId) {
  //      const { error } = await supabase
  //        .from("testimonials")
  //        .update(testimonialData)
  //        .eq("id", editingId)
  //
  //      if (error) throw error
  //      alert("Testimonial updated successfully!")
  //    } else {
  //      const { error } = await supabase
  //        .from("testimonials")
  //        .insert([testimonialData])
  //
  //      if (error) throw error
  //      alert("Testimonial created successfully!")
  //    }
  //
  //    resetForm()
  //    fetchTestimonials()
  //  } catch (error) {
  //    console.error("Error saving testimonial:", error)
  //    alert("Error saving testimonial. Check console for details.")
  //  } finally {
  //    setSaving(false)
  //  }
  //}

  const handleEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id)
    setFormData({
      patient_name: testimonial.patient_name,
      patient_country: testimonial.patient_country,
      patient_image_url: testimonial.patient_image_url || "",
      video_url: testimonial.video_url || "",
      treatment_type: testimonial.treatment_type,
      rating: testimonial.rating,
      is_active: testimonial.is_active,
      title_en: testimonial.translations.en?.title || "",
      content_en: testimonial.translations.en?.content || ""
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return

    try {
      const { error } = await supabase.from("testimonials").delete().eq("id", id)
      if (error) throw error
      alert("Testimonial deleted successfully!")
      fetchTestimonials()
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete testimonial")
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      patient_name: "",
      patient_country: "",
      patient_image_url: "",
      video_url: "",
      treatment_type: "",
      rating: 5,
      is_active: true,
      title_en: "",
      content_en: ""
    })
    setShowForm(false)
  }

  if (loading) return <div>Loading testimonials...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Testimonials</h2>
        <Button onClick={() => setShowForm(!showForm)} className="btn-glass text-white">
          {showForm ? "Cancel" : "+ Add Testimonial"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Testimonial" : "Add New Testimonial"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Patient Name *</label>
                  <input
                    type="text"
                    value={formData.patient_name}
                    onChange={e => setFormData({ ...formData, patient_name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Country *</label>
                  <input
                    type="text"
                    value={formData.patient_country}
                    onChange={e => setFormData({ ...formData, patient_country: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Treatment Type *</label>
                  <input
                    type="text"
                    value={formData.treatment_type}
                    onChange={e => setFormData({ ...formData, treatment_type: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Heart Surgery, IVF Treatment"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Rating (1-5) *</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating })}
                        className="p-2"
                      >
                        <Star
                          className={`w-8 h-8 ${rating <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Title (English)</label>
                <input
                  type="text"
                  value={formData.title_en}
                  onChange={e => setFormData({ ...formData, title_en: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Life-Changing Experience"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Testimonial Content (English) *</label>
                <textarea
                  value={formData.content_en}
                  onChange={e => setFormData({ ...formData, content_en: e.target.value })}
                  className="input-field"
                  rows={6}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Patient Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleFileUpload(e, 'patient_image_url')}
                    disabled={uploading}
                    className="input-field"
                  />
                  {formData.patient_image_url && (
                    <img src={formData.patient_image_url} alt="Patient" className="mt-2 w-20 h-20 object-cover rounded-full" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Video Testimonial</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={e => handleFileUpload(e, 'video_url')}
                    disabled={uploading}
                    className="input-field"
                  />
                  {formData.video_url && (
                    <video src={formData.video_url} className="mt-2 w-full max-w-xs" controls />
                  )}
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  className="checkbox-field"
                />
                <span>Active (visible on website)</span>
              </label>

              <div className="flex gap-3">
                <Button type="submit" disabled={uploading || saving} className="btn-glass text-white flex-1">
                  {saving ? "Saving..." : editingId ? "Update Testimonial" : "Create Testimonial"}
                </Button>
                <Button type="button" onClick={resetForm} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {testimonials.map(testimonial => (
          <Card key={testimonial.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                {testimonial.patient_image_url && (
                  <img
                    src={testimonial.patient_image_url}
                    alt={testimonial.patient_name}
                    className="w-16 h-16 object-cover rounded-full"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold">{testimonial.patient_name}</h3>
                      <p className="text-sm text-gray-600">{testimonial.patient_country} • {testimonial.treatment_type}</p>
                      <div className="flex gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${testimonial.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {testimonial.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700 line-clamp-2">"{testimonial.translations.en?.content}"</p>
                  {testimonial.video_url && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-2 inline-block">
                      📹 Video Available
                    </span>
                  )}
                  <div className="flex gap-3 mt-4">
                    <Button onClick={() => handleEdit(testimonial)} className="btn-glass text-white">
                      Edit
                    </Button>
                    <Button onClick={() => handleDelete(testimonial.id)} variant="destructive">
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}




//"use client"
//
//import type React from "react"
//
//import { useEffect, useState } from "react"
//import { createClient } from "@/lib/supabase/client"
//import { Trash2, Edit2, Plus } from "lucide-react"
//
//interface Testimonial {
//  id: string
//  patient_name: string
//  patient_country: string
//  procedure: string
//  rating: number
//  title: string
//}
//
//export default function AdminTestimonials() {
//  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
//  const [loading, setLoading] = useState(true)
//  const [showForm, setShowForm] = useState(false)
//  const [formData, setFormData] = useState({
//    patient_name: "",
//    patient_country: "",
//    procedure: "",
//    rating: 5,
//    title: "",
//    content: "",
//  })
//
//  useEffect(() => {
//    fetchTestimonials()
//  }, [])
//
//  const fetchTestimonials = async () => {
//    const supabase = createClient()
//    const { data } = await supabase.from("testimonials").select("*")
//    setTestimonials(data || [])
//    setLoading(false)
//  }
//
//  const handleSubmit = async (e: React.FormEvent) => {
//    e.preventDefault()
//    const supabase = createClient()
//
//    const { error } = await supabase.from("testimonials").insert([formData])
//
//    if (!error) {
//      setFormData({
//        patient_name: "",
//        patient_country: "",
//        procedure: "",
//        rating: 5,
//        title: "",
//        content: "",
//      })
//      setShowForm(false)
//      fetchTestimonials()
//    }
//  }
//
//  const handleDelete = async (id: string) => {
//    const supabase = createClient()
//    await supabase.from("testimonials").delete().eq("id", id)
//    fetchTestimonials()
//  }
//
//  if (loading) return <div>Loading...</div>
//
//  return (
//    <div>
//      <button
//        onClick={() => setShowForm(!showForm)}
//        className="mb-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg"
//      >
//        <Plus className="w-5 h-5" />
//        Add Testimonial
//      </button>
//
//      {showForm && (
//        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//          <h3 className="text-lg font-bold mb-4">Add New Testimonial</h3>
//          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
//            <input
//              type="text"
//              placeholder="Patient Name"
//              value={formData.patient_name}
//              onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
//              className="px-4 py-2 border border-gray-300 rounded-lg"
//              required
//            />
//            <input
//              type="text"
//              placeholder="Country"
//              value={formData.patient_country}
//              onChange={(e) => setFormData({ ...formData, patient_country: e.target.value })}
//              className="px-4 py-2 border border-gray-300 rounded-lg"
//              required
//            />
//            <input
//              type="text"
//              placeholder="Procedure"
//              value={formData.procedure}
//              onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
//              className="px-4 py-2 border border-gray-300 rounded-lg"
//              required
//            />
//            <select
//              value={formData.rating}
//              onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
//              className="px-4 py-2 border border-gray-300 rounded-lg"
//            >
//              <option value="5">5 Stars</option>
//              <option value="4">4 Stars</option>
//              <option value="3">3 Stars</option>
//              <option value="2">2 Stars</option>
//              <option value="1">1 Star</option>
//            </select>
//            <input
//              type="text"
//              placeholder="Title"
//              value={formData.title}
//              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//              className="px-4 py-2 border border-gray-300 rounded-lg"
//              required
//            />
//            <textarea
//              placeholder="Content"
//              value={formData.content}
//              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
//              className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg h-24"
//              required
//            />
//            <button
//              type="submit"
//              className="md:col-span-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg"
//            >
//              Add Testimonial
//            </button>
//          </form>
//        </div>
//      )}
//
//      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
//        <table className="w-full">
//          <thead className="bg-gray-100 border-b">
//            <tr>
//              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Patient Name</th>
//              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Procedure</th>
//              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rating</th>
//              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
//              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
//            </tr>
//          </thead>
//          <tbody className="divide-y">
//            {testimonials.map((testimonial) => (
//              <tr key={testimonial.id} className="hover:bg-gray-50">
//                <td className="px-6 py-4 text-sm text-gray-900">{testimonial.patient_name}</td>
//                <td className="px-6 py-4 text-sm text-gray-600">{testimonial.procedure}</td>
//                <td className="px-6 py-4 text-sm text-gray-600">{testimonial.rating}★</td>
//                <td className="px-6 py-4 text-sm text-gray-600">{testimonial.title}</td>
//                <td className="px-6 py-4 text-sm flex gap-2">
//                  <button className="text-blue-600 hover:text-blue-800">
//                    <Edit2 className="w-4 h-4" />
//                  </button>
//                  <button onClick={() => handleDelete(testimonial.id)} className="text-red-600 hover:text-red-800">
//                    <Trash2 className="w-4 h-4" />
//                  </button>
//                </td>
//              </tr>
//            ))}
//          </tbody>
//        </table>
//      </div>
//    </div>
//  )
//}
