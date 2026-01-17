
// app/[locale]/blogs/[slug]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useLocale } from "next-intl"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Calendar, User, ArrowLeft, Share2 } from "lucide-react"
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
    en?: { title: string; excerpt: string; content: string }
    ar?: { title: string; excerpt: string; content: string }
  }
}

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const locale = useLocale()
  const supabase = createClient()

  useEffect(() => {
    if (!slug) return
    fetchBlog()
  }, [slug])

  const fetchBlog = async () => {
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single()

      if (error) throw error
      setBlog(data)
    } catch (error) {
      console.error("Error fetching blog:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Blog post not found</h1>
          <Link href="/blogs" className="text-green-600 hover:underline">
            Back to blogs
          </Link>
        </div>
      </div>
    )
  }

  const content = blog.translations[locale as 'en' | 'ar'] || blog.translations.en

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Image */}
      <div className="relative h-96 w-full">
        <img
          src={blog.image_url || "/placeholder.svg"}
          alt={content?.title || "Blog"}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Back Button */}
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Category Badge */}
          <span className="inline-block px-4 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold mb-4">
            {blog.category}
          </span>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {content?.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-6 pb-6 border-b mb-8">
            <div className="flex items-center gap-3">
              {blog.author_image_url && (
                <img
                  src={blog.author_image_url}
                  alt={blog.author_name}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold text-gray-900">{blog.author_name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {new Date(blog.published_at).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
            <button
              onClick={() => navigator.share?.({ url: window.location.href })}
              className="ml-auto p-2 hover:bg-gray-100 rounded-full transition"
            >
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Excerpt */}
          {content?.excerpt && (
            <div className="text-xl text-gray-700 mb-8 leading-relaxed italic border-l-4 border-green-500 pl-6">
              {content.excerpt}
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content?.content || "" }}
          />
        </div>
      </article>

      <div className="h-20" />
      <Footer />
    </div>
  )
}
