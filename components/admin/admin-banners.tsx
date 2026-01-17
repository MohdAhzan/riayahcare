
//components/admin/admin-banners.tsx

"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// ⭐ MODIFIED INTERFACE: Removed title/subtitle as root properties
interface Banner {
  id: string
  image_url: string
  cta_link: string | null
  is_active: boolean | null
  order_index: number | null
  translations: any | null // JSONB column
}

// ⭐ MODIFIED FORM DATA: Removed title/subtitle
interface FormData {
    image_url: string
    cta_text: string
    cta_link: string
    is_active: boolean
    // We will assume title and subtitle data is handled elsewhere (likely in translations)
    // For now, we omit them to prevent SELECT/INSERT errors.
    translations: any
}


export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    image_url: "",
    cta_text: "Get Quote", // Default value
    cta_link: "/hospitals", // Default value
    is_active: true,
    translations: {
        en: { title: "New Banner", subtitle: "Click to edit" },
        ar: { title: "راية جديدة", subtitle: "اضغط للتحرير" }
    }
  })

  const supabase = createClient()

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      // ⭐ FIX 1: Select ONLY the columns that exist in the schema
      const { data, error } = await supabase
        .from("banners")
        .select(`id, image_url, cta_link, is_active, order_index, translations`)
        .order("order_index", { ascending: true })

      if (error) {
        // Logging the full Supabase error object
        console.error("[v0] Supabase Fetch Error:", error) 
        throw new Error(error.message || `Supabase query failed: ${error.code}`)
      }

      setBanners(data || [])
    } catch (error) {
      // Log the caught error properly
      console.error("[v0] Error fetching banners:", error instanceof Error ? error.message : error)
    } finally {
      setLoading(false)
    }
  }

  // --- Image Upload (Unchanged) ---
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
        // Only update image_url in form data
        setFormData((prev) => ({ ...prev, image_url: data.url }))
      }
    } catch (error) {
      console.error("[v0] Upload error:", error)
      alert("Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  // --- Edit Handlers ---
  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id)
    // ⭐ FIX 2: Load data from translations for editing if needed
    const defaultTranslations = { en: { title: "", subtitle: "" }, ar: { title: "", subtitle: "" } };
    const currentTranslations = banner.translations || defaultTranslations;

    setFormData({
      image_url: banner.image_url,
      cta_text: currentTranslations.en?.cta_text || "Get Quote",
      cta_link: banner.cta_link || "/hospitals",
      is_active: banner.is_active ?? true,
      translations: currentTranslations,
    })
  }
  
  // Helper to update text fields within the 'en' translation object
  const handleTranslationChange = (field: 'title' | 'subtitle' | 'cta_text', value: string) => {
      setFormData(prev => ({
          ...prev,
          translations: {
              ...prev.translations,
              en: {
                  ...prev.translations.en,
                  [field]: value
              }
          }
      }))
      // Note: This only edits the English version. Full i18n editing requires more inputs.
  }


  const handleSave = async () => {
    try {
      if (!editingId) return

      // ⭐ FIX 3: Update the banner using only the existing schema columns
      const updateData = {
          image_url: formData.image_url,
          cta_link: formData.cta_link,
          is_active: formData.is_active,
          translations: formData.translations,
      }
      
      const { error } = await supabase.from("banners").update(updateData).eq("id", editingId)

      if (error) throw error

      setEditingId(null)
      fetchBanners()
      alert("Banner updated successfully!")
    } catch (error) {
      console.error("[v0] Error updating banner:", error)
      alert("Error updating banner")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return

    try {
      const { error } = await supabase.from("banners").delete().eq("id", id)
      
      if (error) throw error

      fetchBanners()
      alert("Banner deleted successfully!")
    } catch (error) {
      console.error("[v0] Error deleting banner:", error)
      alert("Error deleting banner")
    }
  }

  const handleAddNew = async () => {
    try {
      const maxOrderIndex = banners.reduce((max, banner) => Math.max(max, banner.order_index ?? 0), -1)
      const newOrderIndex = maxOrderIndex + 1

      // ⭐ FIX 4: Insert ONLY the columns that exist in the schema
      const { data: insertedData, error } = await supabase
        .from("banners")
        .insert([
          {
            image_url: "https://via.placeholder.com/1920x1080",
            cta_link: "/hospitals",
            is_active: true,
            order_index: newOrderIndex,
            // Provide default translation structure
            translations: { 
                en: { title: "New Banner", subtitle: "Click to edit", cta_text: "Get Quote" },
                ar: {}
            }, 
          },
        ])
        .select(`id, image_url, cta_link, is_active, order_index, translations`) 

      if (error) {
        console.error("Insertion error details:", error.details)
        throw error
      }

      await fetchBanners() // Refresh the list

      // Set the new banner to be immediately editable
      if (insertedData && insertedData.length > 0) {
        const newBanner = insertedData[0]
        setEditingId(newBanner.id)

        const newTranslations = newBanner.translations || { en: {} };
        
        setFormData({
          image_url: newBanner.image_url,
          cta_text: newTranslations.en?.cta_text || "Get Quote",
          cta_link: newBanner.cta_link || "/hospitals",
          is_active: newBanner.is_active ?? true,
          translations: newTranslations,
        })
      }

    } catch (error) {
      console.error("[v0] Error adding banner:", error)
      alert("Error adding banner. Check console for details.")
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading banners...</div>
  }

  // --- Rendering Helpers ---
  const getTranslationText = (banner: Banner, key: 'title' | 'subtitle' | 'cta_text') => {
      return banner.translations?.en?.[key] || `[No ${key} in translations]`
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
                  {/* ⭐ FIX 5: Render title/subtitle from the translations object */}
                  <CardTitle>{getTranslationText(banner, 'title')}</CardTitle>
                  <CardDescription>{getTranslationText(banner, 'subtitle')}</CardDescription>
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
                  {/* ⭐ FIX 6: Inputs now update the translations object (English key) */}
                  <input
                    type="text"
                    placeholder="Title"
                    value={formData.translations.en?.title || ''}
                    onChange={(e) => handleTranslationChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Subtitle"
                    value={formData.translations.en?.subtitle || ''}
                    onChange={(e) => handleTranslationChange('subtitle', e.target.value)}
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
                    placeholder="CTA Text (English)"
                    value={formData.translations.en?.cta_text || ''}
                    onChange={(e) => handleTranslationChange('cta_text', e.target.value)}
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
                      alt={getTranslationText(banner, 'title')}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      {/* ⭐ FIX 7: Display CTA text from translations */}
                      <strong>CTA Text:</strong> {getTranslationText(banner, 'cta_text')}
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



//"use client"
//
//import type React from "react"
//
//import { useEffect, useState } from "react"
//import { createClient } from "@/lib/supabase/client"
//import { Button } from "@/components/ui/button"
//import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
//
//interface Banner {
//  id: string
//  title: string
//  subtitle: string | null
//  image_url: string
//  cta_text: string
//  cta_link: string
//  is_active: boolean
//  order_index: number
//}
//
//export default function AdminBanners() {
//  const [banners, setBanners] = useState<Banner[]>([])
//  const [loading, setLoading] = useState(true)
//  const [editingId, setEditingId] = useState<string | null>(null)
//  const [uploading, setUploading] = useState(false)
//  const [formData, setFormData] = useState({
//    title: "",
//    subtitle: "",
//    image_url: "",
//    cta_text: "",
//    cta_link: "",
//    is_active: true,
//  })
//
//  const supabase = createClient()
//
//  useEffect(() => {
//    fetchBanners()
//  }, [])
//
//  const fetchBanners = async () => {
//    try {
//      setLoading(true)
//      const { data } = await supabase.from("banners").select("*").order("order_index", { ascending: true })
//      setBanners(data || [])
//    } catch (error) {
//      console.error("[v0] Error fetching banners:", error)
//    } finally {
//      setLoading(false)
//    }
//  }
//
//  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//    const file = e.target.files?.[0]
//    if (!file) return
//
//    setUploading(true)
//    try {
//      const formDataUpload = new FormData()
//      formDataUpload.append("file", file)
//      formDataUpload.append("bucket", "banners")
//
//      const response = await fetch("/api/upload", {
//        method: "POST",
//        body: formDataUpload,
//      })
//
//      const data = await response.json()
//      if (data.url) {
//        setFormData({ ...formData, image_url: data.url })
//      }
//    } catch (error) {
//      console.error("[v0] Upload error:", error)
//      alert("Failed to upload image")
//    } finally {
//      setUploading(false)
//    }
//  }
//
//  const handleEdit = (banner: Banner) => {
//    setEditingId(banner.id)
//    setFormData({
//      title: banner.title,
//      subtitle: banner.subtitle || "",
//      image_url: banner.image_url,
//      cta_text: banner.cta_text,
//      cta_link: banner.cta_link,
//      is_active: banner.is_active,
//    })
//  }
//
//  const handleSave = async () => {
//    try {
//      if (!editingId) return
//
//      await supabase.from("banners").update(formData).eq("id", editingId)
//
//      setEditingId(null)
//      fetchBanners()
//      alert("Banner updated successfully!")
//    } catch (error) {
//      console.error("[v0] Error updating banner:", error)
//      alert("Error updating banner")
//    }
//  }
//
//  const handleDelete = async (id: string) => {
//    if (!confirm("Are you sure?")) return
//
//    try {
//      await supabase.from("banners").delete().eq("id", id)
//      fetchBanners()
//      alert("Banner deleted successfully!")
//    } catch (error) {
//      console.error("[v0] Error deleting banner:", error)
//      alert("Error deleting banner")
//    }
//  }
//
//  const handleAddNew = async () => {
//    try {
//      await supabase.from("banners").insert([
//        {
//          title: "New Banner",
//          subtitle: "Click to edit",
//          image_url: "https://via.placeholder.com/1920x1080",
//          cta_text: "Get Quote",
//          cta_link: "/hospitals",
//          is_active: false,
//          order_index: banners.length,
//        },
//      ])
//      fetchBanners()
//    } catch (error) {
//      console.error("[v0] Error adding banner:", error)
//      alert("Error adding banner")
//    }
//  }
//
//  if (loading) {
//    return <div className="text-center py-12">Loading banners...</div>
//  }
//
//  return (
//    <div className="space-y-6">
//      <div className="flex justify-between items-center">
//        <h2 className="text-2xl font-bold">Landing Page Banners</h2>
//        <Button onClick={handleAddNew} className="btn-glass text-white">
//          + Add Banner
//        </Button>
//      </div>
//
//      <div className="space-y-4">
//        {banners.map((banner) => (
//          <Card key={banner.id}>
//            <CardHeader className="pb-3">
//              <div className="flex justify-between items-start">
//                <div>
//                  <CardTitle>{banner.title}</CardTitle>
//                  <CardDescription>{banner.subtitle}</CardDescription>
//                </div>
//                <span
//                  className={`px-3 py-1 rounded-full text-sm font-semibold ${banner.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
//                >
//                  {banner.is_active ? "Active" : "Inactive"}
//                </span>
//              </div>
//            </CardHeader>
//            <CardContent>
//              {editingId === banner.id ? (
//                <div className="space-y-4">
//                  <input
//                    type="text"
//                    placeholder="Title"
//                    value={formData.title}
//                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
//                  />
//                  <input
//                    type="text"
//                    placeholder="Subtitle"
//                    value={formData.subtitle}
//                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
//                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
//                  />
//
//                  <div>
//                    <label className="block text-sm font-semibold mb-2">Banner Image</label>
//                    <input
//                      type="file"
//                      accept="image/*"
//                      onChange={handleImageUpload}
//                      disabled={uploading}
//                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
//                    />
//                    {uploading && <span className="text-sm text-gray-600">Uploading...</span>}
//                    {formData.image_url && <p className="text-sm text-green-600 mt-2">Image uploaded</p>}
//                  </div>
//
//                  <input
//                    type="text"
//                    placeholder="CTA Text"
//                    value={formData.cta_text}
//                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
//                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
//                  />
//                  <input
//                    type="text"
//                    placeholder="CTA Link"
//                    value={formData.cta_link}
//                    onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
//                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
//                  />
//                  <label className="flex items-center gap-2">
//                    <input
//                      type="checkbox"
//                      checked={formData.is_active}
//                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
//                    />
//                    <span>Active</span>
//                  </label>
//                  <div className="flex gap-2">
//                    <Button onClick={handleSave} className="btn-glass text-white flex-1" disabled={uploading}>
//                      Save
//                    </Button>
//                    <Button onClick={() => setEditingId(null)} variant="outline" className="flex-1">
//                      Cancel
//                    </Button>
//                  </div>
//                </div>
//              ) : (
//                <div className="space-y-3">
//                  <div className="h-32 bg-gray-100 rounded overflow-hidden">
//                    <img
//                      src={banner.image_url || "/placeholder.svg"}
//                      alt={banner.title}
//                      className="w-full h-full object-cover"
//                    />
//                  </div>
//                  <div className="text-sm text-gray-600 space-y-1">
//                    <p>
//                      <strong>CTA Text:</strong> {banner.cta_text}
//                    </p>
//                    <p>
//                      <strong>CTA Link:</strong> {banner.cta_link}
//                    </p>
//                  </div>
//                  <div className="flex gap-2">
//                    <Button onClick={() => handleEdit(banner)} className="btn-glass text-white flex-1">
//                      Edit
//                    </Button>
//                    <Button onClick={() => handleDelete(banner.id)} variant="destructive" className="flex-1">
//                      Delete
//                    </Button>
//                  </div>
//                </div>
//              )}
//            </CardContent>
//          </Card>
//        ))}
//      </div>
//    </div>
//  )
//}
