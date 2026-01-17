
// components/blogs-section.tsx
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useLocale } from "next-intl"
import Link from "next/link"
import { Calendar, ArrowRight, Tag } from "lucide-react"

interface Blog {
  id: string
  slug: string
  image_url: string
  category: string
  published_at: string
  translations: {
    en?: { title: string; excerpt: string }
    ar?: { title: string; excerpt: string }
  }
}

export default function BlogsSection() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const locale = useLocale()

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data, error } = await supabase
          .from("blogs")
          .select("*")
          .eq("is_active", true)
          .order("published_at", { ascending: false })
          .limit(3)

        if (error) throw error
        setBlogs(data || [])
      } catch (error) {
        console.error("Error fetching blogs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [])

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-pulse">Loading blogs...</div>
        </div>
      </section>
    )
  }

  if (blogs.length === 0) return null

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      news: "bg-blue-100 text-blue-800",
      treatment: "bg-green-100 text-green-800",
      story: "bg-purple-100 text-purple-800",
      info: "bg-yellow-100 text-yellow-800"
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Latest from Our Blog
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay updated with medical news, patient stories, and healthcare insights
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {blogs.map((blog) => {
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
                  <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(blog.category)}`}>
                    {blog.category}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4" />
                    {new Date(blog.published_at).toLocaleDateString(locale)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition line-clamp-2">
                    {content?.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {content?.excerpt}
                  </p>
                  <div className="flex items-center text-green-600 font-semibold group-hover:gap-3 transition-all">
                    Read More 
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link 
            href="/blogs"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            View All Articles
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
