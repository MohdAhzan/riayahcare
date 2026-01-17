
// components/admin/admin-blogs.tsx
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Blog {
  id: string
  slug: string
  image_url: string
  author_name: string
  author_image_url: string
  category: string
  is_active: boolean
  published_at: string
  translations: {
    en: { title: string; excerpt: string; content: string }
    ar: { title: string; excerpt: string; content: string }
  }
}

interface FormData {
  slug: string
  author_name: string
  author_image_url: string
  image_url: string
  category: string
  is_active: boolean
  title_en: string
  excerpt_en: string
  content_en: string
}

export default function AdminBlogs() {
  const supabase = createClient()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    slug: "",
    author_name: "",
    author_image_url: "",
    image_url: "",
    category: "news",
    is_active: true,
    title_en: "",
    excerpt_en: "",
    content_en: ""
  })

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("published_at", { ascending: false })

      if (error) throw error
      setBlogs(data || [])
    } catch (error) {
      console.error("Error fetching blogs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image_url' | 'author_image_url') => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)
      formDataUpload.append("bucket", "blogs")

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
      slug: formData.slug,
      author_name: formData.author_name,
      author_image_url: formData.author_image_url,
      image_url: formData.image_url,
      category: formData.category,
      is_active: formData.is_active,
      title_en: formData.title_en,
      excerpt_en: formData.excerpt_en,
      content_en: formData.content_en
    }

    if (editingId) {
      const res = await fetch("/api/admin/blogs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, id: editingId }),
      })

      if (!res.ok) throw new Error("Update failed")
      alert("Blog updated successfully!")
    } else {
      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("Create failed")
      alert("Blog created successfully!")
    }

    resetForm()
    fetchBlogs()
  } catch (error) {
    console.error("Error saving blog:", error)
    alert("Error saving blog. Check console for details.")
  } finally {
    setSaving(false)
  }
}

  const handleEdit = (blog: Blog) => {
    setEditingId(blog.id)
    setFormData({
      slug: blog.slug,
      author_name: blog.author_name || "",
      author_image_url: blog.author_image_url || "",
      image_url: blog.image_url,
      category: blog.category,
      is_active: blog.is_active,
      title_en: blog.translations.en?.title || "",
      excerpt_en: blog.translations.en?.excerpt || "",
      content_en: blog.translations.en?.content || ""
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return

    try {
      const { error } = await supabase.from("blogs").delete().eq("id", id)
      if (error) throw error
      alert("Blog deleted successfully!")
      fetchBlogs()
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete blog")
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      slug: "",
      author_name: "",
      author_image_url: "",
      image_url: "",
      category: "news",
      is_active: true,
      title_en: "",
      excerpt_en: "",
      content_en: ""
    })
    setShowForm(false)
  }

  if (loading) return <div>Loading blogs...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Blogs</h2>
        <Button onClick={() => setShowForm(!showForm)} className="btn-glass text-white">
          {showForm ? "Cancel" : "+ Add Blog"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Blog" : "Add New Blog"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Title (English)</label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={e => setFormData({ ...formData, title_en: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Slug (auto-generated if empty)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    className="input-field"
                    placeholder="auto-generated-from-title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Author Name</label>
                  <input
                    type="text"
                    value={formData.author_name}
                    onChange={e => setFormData({ ...formData, author_name: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="news">News</option>
                    <option value="treatment">Treatment</option>
                    <option value="story">Patient Story</option>
                    <option value="info">Information</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Excerpt (English)</label>
                <textarea
                  value={formData.excerpt_en}
                  onChange={e => setFormData({ ...formData, excerpt_en: e.target.value })}
                  className="input-field"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Content (English)</label>
                <textarea
                  value={formData.content_en}
                  onChange={e => setFormData({ ...formData, content_en: e.target.value })}
                  className="input-field"
                  rows={10}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Featured Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleImageUpload(e, 'image_url')}
                    disabled={uploading}
                    className="input-field"
                  />
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Author Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleImageUpload(e, 'author_image_url')}
                    disabled={uploading}
                    className="input-field"
                  />
                  {formData.author_image_url && (
                    <img src={formData.author_image_url} alt="Author" className="mt-2 w-16 h-16 object-cover rounded-full" />
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
                  {saving ? "Saving..." : editingId ? "Update Blog" : "Create Blog"}
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
        {blogs.map(blog => (
          <Card key={blog.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <img
                  src={blog.image_url || "/placeholder.svg"}
                  alt={blog.translations.en?.title}
                  className="w-32 h-32 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{blog.translations.en?.title}</h3>
                      <p className="text-sm text-gray-600">{blog.author_name} • {blog.category}</p>
                      <p className="text-sm text-gray-500">{new Date(blog.published_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${blog.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {blog.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700 line-clamp-2">{blog.translations.en?.excerpt}</p>
                  <div className="flex gap-3 mt-4">
                    <Button onClick={() => handleEdit(blog)} className="btn-glass text-white">
                      Edit
                    </Button>
                    <Button onClick={() => handleDelete(blog.id)} variant="destructive">
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
