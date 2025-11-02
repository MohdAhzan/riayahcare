"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Banner {
  id: string
  title: string
  subtitle: string | null
  image_url: string
  cta_text: string
  cta_link: string
  is_active: boolean
  order_index: number
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    cta_text: "",
    cta_link: "",
    is_active: true,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const { data } = await supabase.from("banners").select("*").order("order_index", { ascending: true })
      setBanners(data || [])
    } catch (error) {
      console.error("[v0] Error fetching banners:", error)
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
      formDataUpload.append("bucket", "banners")

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

  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id)
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      image_url: banner.image_url,
      cta_text: banner.cta_text,
      cta_link: banner.cta_link,
      is_active: banner.is_active,
    })
  }

  const handleSave = async () => {
    try {
      if (!editingId) return

      await supabase.from("banners").update(formData).eq("id", editingId)

      setEditingId(null)
      fetchBanners()
      alert("Banner updated successfully!")
    } catch (error) {
      console.error("[v0] Error updating banner:", error)
      alert("Error updating banner")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return

    try {
      await supabase.from("banners").delete().eq("id", id)
      fetchBanners()
      alert("Banner deleted successfully!")
    } catch (error) {
      console.error("[v0] Error deleting banner:", error)
      alert("Error deleting banner")
    }
  }

  const handleAddNew = async () => {
    try {
      await supabase.from("banners").insert([
        {
          title: "New Banner",
          subtitle: "Click to edit",
          image_url: "https://via.placeholder.com/1920x1080",
          cta_text: "Get Quote",
          cta_link: "/hospitals",
          is_active: false,
          order_index: banners.length,
        },
      ])
      fetchBanners()
    } catch (error) {
      console.error("[v0] Error adding banner:", error)
      alert("Error adding banner")
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading banners...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Landing Page Banners</h2>
        <Button onClick={handleAddNew} className="btn-glass text-white">
          + Add Banner
        </Button>
      </div>

      <div className="space-y-4">
        {banners.map((banner) => (
          <Card key={banner.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{banner.title}</CardTitle>
                  <CardDescription>{banner.subtitle}</CardDescription>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${banner.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                >
                  {banner.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {editingId === banner.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
                  />

                  <div>
                    <label className="block text-sm font-semibold mb-2">Banner Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    {uploading && <span className="text-sm text-gray-600">Uploading...</span>}
                    {formData.image_url && <p className="text-sm text-green-600 mt-2">Image uploaded</p>}
                  </div>

                  <input
                    type="text"
                    placeholder="CTA Text"
                    value={formData.cta_text}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="CTA Link"
                    value={formData.cta_link}
                    onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    <span>Active</span>
                  </label>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="btn-glass text-white flex-1" disabled={uploading}>
                      Save
                    </Button>
                    <Button onClick={() => setEditingId(null)} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="h-32 bg-gray-100 rounded overflow-hidden">
                    <img
                      src={banner.image_url || "/placeholder.svg"}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <strong>CTA Text:</strong> {banner.cta_text}
                    </p>
                    <p>
                      <strong>CTA Link:</strong> {banner.cta_link}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleEdit(banner)} className="btn-glass text-white flex-1">
                      Edit
                    </Button>
                    <Button onClick={() => handleDelete(banner.id)} variant="destructive" className="flex-1">
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
