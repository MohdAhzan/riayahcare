
// components/admin/admin-about.tsx
//
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { translateValuesToArabic } from "@/lib/googleTranslationServer/translate"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AboutSection {
  id: string
  section_type: string
  image_url: string | null
  order_index: number
  is_active: boolean
  translations: {
    en: { title: string; content: string; subtitle: string }
    ar: { title: string; content: string; subtitle: string }
  }
}

interface FormData {
  section_type: string
  image_url: string
  order_index: number
  is_active: boolean
  title_en: string
  subtitle_en: string
  content_en: string
}

export default function AdminAbout() {
  const supabase = createClient()
  const [sections, setSections] = useState<AboutSection[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    section_type: "main",
    image_url: "",
    order_index: 0,
    is_active: true,
    title_en: "",
    subtitle_en: "",
    content_en: ""
  })

  useEffect(() => {
    fetchSections()
  }, [])

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from("about_us")
        .select("*")
        .order("order_index", { ascending: true })

      if (error) throw error
      setSections(data || [])
    } catch (error) {
      console.error("Error fetching about sections:", error)
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
      formDataUpload.append("bucket", "about")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      })

      const data = await response.json()
      if (data.url) {
        setFormData(prev => ({ ...prev, image_url: data.url }))
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setSaving(true)

  try {
    const payload = {
      section_type: formData.section_type,
      image_url: formData.image_url || null,
      order_index: formData.order_index,
      is_active: formData.is_active,
      title_en: formData.title_en,
      subtitle_en: formData.subtitle_en,
      content_en: formData.content_en
    }

    if (editingId) {
      // Update existing section
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, id: editingId }),
      })

      if (!res.ok) throw new Error("Update failed")
      alert("Section updated successfully!")
    } else {
      // Create new section
      const res = await fetch("/api/admin/about", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("Create failed")
      alert("Section created successfully!")
    }

    resetForm()
    fetchSections()
  } catch (error) {
    console.error("Error saving section:", error)
    alert("Error saving section. Check console for details.")
  } finally {
    setSaving(false)
  }
}
  //const handleSubmit = async (e: React.FormEvent) => {
  //  e.preventDefault()
  //  setSaving(true)
  //
  //  try {
  //    const translated = await translateValuesToArabic({
  //      title: formData.title_en,
  //      subtitle: formData.subtitle_en,
  //      content: formData.content_en
  //    })
  //
  //    const aboutData = {
  //      section_type: formData.section_type,
  //      image_url: formData.image_url || null,
  //      order_index: formData.order_index,
  //      is_active: formData.is_active,
  //      translations: {
  //        en: {
  //          title: formData.title_en,
  //          subtitle: formData.subtitle_en,
  //          content: formData.content_en
  //        },
  //        ar: {
  //          title: translated.title,
  //          subtitle: translated.subtitle,
  //          content: translated.content
  //        }
  //      }
  //    }
  //
  //    if (editingId) {
  //      const { error } = await supabase
  //        .from("about_us")
  //        .update({ ...aboutData, updated_at: new Date().toISOString() })
  //        .eq("id", editingId)
  //
  //      if (error) throw error
  //      alert("Section updated successfully!")
  //    } else {
  //      const { error } = await supabase
  //        .from("about_us")
  //        .insert([aboutData])
  //
  //      if (error) throw error
  //      alert("Section created successfully!")
  //    }
  //
  //    resetForm()
  //    fetchSections()
  //  } catch (error) {
  //    console.error("Error saving section:", error)
  //    alert("Error saving section. Check console for details.")
  //  } finally {
  //    setSaving(false)
  //  }
  //}

  const handleEdit = (section: AboutSection) => {
    setEditingId(section.id)
    setFormData({
      section_type: section.section_type,
      image_url: section.image_url || "",
      order_index: section.order_index,
      is_active: section.is_active,
      title_en: section.translations.en?.title || "",
      subtitle_en: section.translations.en?.subtitle || "",
      content_en: section.translations.en?.content || ""
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return

    try {
      const { error } = await supabase.from("about_us").delete().eq("id", id)
      if (error) throw error
      alert("Section deleted successfully!")
      fetchSections()
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete section")
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      section_type: "main",
      image_url: "",
      order_index: 0,
      is_active: true,
      title_en: "",
      subtitle_en: "",
      content_en: ""
    })
    setShowForm(false)
  }

  if (loading) return <div>Loading sections...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage About Us</h2>
        <Button onClick={() => setShowForm(!showForm)} className="btn-glass text-white">
          {showForm ? "Cancel" : "+ Add Section"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Section" : "Add New Section"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Section Type *</label>
                  <select
                    value={formData.section_type}
                    onChange={e => setFormData({ ...formData, section_type: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="main">Main About</option>
                    <option value="mission">Our Mission</option>
                    <option value="vision">Our Vision</option>
                    <option value="values">Our Values</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Order Index</label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={e => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Title (English) *</label>
                <input
                  type="text"
                  value={formData.title_en}
                  onChange={e => setFormData({ ...formData, title_en: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Subtitle (English)</label>
                <input
                  type="text"
                  value={formData.subtitle_en}
                  onChange={e => setFormData({ ...formData, subtitle_en: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Content (English) *</label>
                <textarea
                  value={formData.content_en}
                  onChange={e => setFormData({ ...formData, content_en: e.target.value })}
                  className="input-field"
                  rows={8}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Section Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="input-field"
                />
                {formData.image_url && (
                  <img src={formData.image_url} alt="Preview" className="mt-2 w-48 h-48 object-cover rounded" />
                )}
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
                  {saving ? "Saving..." : editingId ? "Update Section" : "Create Section"}
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
        {sections.map(section => (
          <Card key={section.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                {section.image_url && (
                  <img
                    src={section.image_url}
                    alt={section.translations.en?.title}
                    className="w-32 h-32 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mb-2 inline-block">
                        {section.section_type}
                      </span>
                      <h3 className="text-xl font-bold">{section.translations.en?.title}</h3>
                      {section.translations.en?.subtitle && (
                        <p className="text-sm text-gray-600">{section.translations.en.subtitle}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${section.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {section.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700 line-clamp-3">{section.translations.en?.content}</p>
                  <div className="flex gap-3 mt-4">
                    <Button onClick={() => handleEdit(section)} className="btn-glass text-white">
                      Edit
                    </Button>
                    <Button onClick={() => handleDelete(section.id)} variant="destructive">
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
