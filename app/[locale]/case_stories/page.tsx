"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"

interface CaseStories{
  id: string
  patientname: string
  country: string
  procedure: string
  rating: number 
  //reviews_count: number
  title: string
  content: string
  imageurl?: string
}

export default function CaseStoriesPage() {
  const [caseStories, setcasestories] = useState<CaseStories[]>([])
  const [loading, setLoading] = useState(true)
  const [page,setPage]= useState(1)
  const [totalCount,setTotalCount]=useState(0)

  const pageSize = 3

  useEffect(() => {
    const fetchCaseStories= async () => {
      setLoading(true)
      const supabase = createClient()

      const { count } = await supabase
        .from("testimonials")
        .select("*",{count :"exact",head:true})

      setTotalCount(count || 0)

      const { data,error } = await supabase
        .from("testimonials")
        .select("*")
        .range((page-1)*pageSize,page* pageSize-1)

      if (error)console.error(error)
      setcasestories(data || [])
      setLoading(false)
    }
    fetchCaseStories()
  }, [page])

  const totalPages = Math.ceil(totalCount/pageSize)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-green-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Patient Case Stories</h1>
          <p className="text-green-100">
            Real experiences from patients who received world-class treatment from us
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-12">Loading stories...</div>
        ) : caseStories.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              No case stories found.
            </div>
          ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {caseStories.map((story) => (
                  <Link key={story.id} href={`/case_stories/${story.id}`}>
                    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden">
                      <img
                        src={story.imageurl || "./../../public/testimonial_patient_placeholder.png"}
                        alt={story.patientname}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {story.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {story.patientname} from {story.country}
                        </p>
                        <p className="text-green-600 font-semibold text-sm mb-3">
                          Procedure: {story.procedure}
                        </p>
                        <p className="text-gray-700 text-sm line-clamp-3">
                          {story.content}
                        </p>
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            ⭐ {story.rating.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 gap-4">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
