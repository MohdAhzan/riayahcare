//app/[locale]/(admin)/admin/layout.tsx

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LogoutButton } from "@/components/admin/logout-button"

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 bg-card border-r p-6">
        <h2 className="text-xl font-bold text-primary mb-6">
          RiayahCare CRM
        </h2>

        <nav className="space-y-2 text-sm">
          <a className="block px-3 py-2 rounded hover:bg-accent" href={`/${locale}/admin`}>
            Dashboard
          </a>
          <a className="block px-3 py-2 rounded hover:bg-accent" href={`/${locale}/admin/leads`}>
            Leads
          </a>
        </nav>

        <div className="mt-8">
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 p-8 bg-muted/30">
        {children}
      </main>
    </div>
  )
}

