
// app/[locale]/blogs/page.tsx
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useLocale } from "next-intl"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Calendar, Tag, Search } from "lucide-react"
import Link from "next/link"

interface Blog {
  id: string
  slug: string
  image_url: string
  category: string
  published_at: string
  author_name: string
  author_image_url: string
  translations: {
    en?: { title: string; excerpt: string }
    ar?: { title: string; excerpt: string }
  }
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const locale = useLocale()
  const supabase = createClient()

  useEffect(() => {
    fetchBlogs()
  }, [])

  useEffect(() => {
    filterBlogs()
  }, [searchTerm, selectedCategory, blogs])

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("is_active", true)
        .order("published_at", { ascending: false })

      if (error) throw error
      setBlogs(data || [])
      setFilteredBlogs(data || [])
    } catch (error) {
      console.error("Error fetching blogs:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterBlogs = () => {
    let filtered = blogs

    if (selectedCategory !== "all") {
      filtered = filtered.filter(blog => blog.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(blog => {
        const content = blog.translations[locale as 'en' | 'ar'] || blog.translations.en
        return content?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               content?.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    setFilteredBlogs(filtered)
  }

  const categories = ["all", "news", "treatment", "story", "info"]

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      news: "bg-blue-100 text-blue-800 border-blue-200",
      treatment: "bg-green-100 text-green-800 border-green-200",
      story: "bg-purple-100 text-purple-800 border-purple-200",
      info: "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Blog</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Medical insights, patient stories, and healthcare news from around the world
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap justify-center">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    selectedCategory === cat
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading articles...</p>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">No articles found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map(blog => {
                const content = blog.translations[locale as 'en' | 'ar'] || blog.translations.en
                return (
                  <Link
                    key={blog.id}
                    href={`/blogs/${blog.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={blog.image_url || "/placeholder.svg"}
                        alt={content?.title || "Blog"}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(blog.category)}`}>
                        {blog.category}
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-3">
                        {blog.author_image_url && (
                          <img
                            src={blog.author_image_url}
                            alt={blog.author_name}
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <div className="text-sm">
                          <p className="font-semibold text-gray-900">{blog.author_name}</p>
                          <div className="flex items-center gap-2 text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {new Date(blog.published_at).toLocaleDateString(locale)}
                          </div>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition line-clamp-2">
                        {content?.title}
                      </h3>
                      <p className="text-gray-600 line-clamp-3">
                        {content?.excerpt}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
