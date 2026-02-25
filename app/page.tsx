"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { CompaniesTable } from "@/components/companies-table"
import { CompanyProfile } from "@/components/company-profile"
import { ListsView } from "@/components/lists-view"
import { SavedSearchesView } from "@/components/saved-searches-view"
import type { Company } from "@/lib/data"

export default function DashboardPage() {
  const [currentPath, setCurrentPath] = useState("/")
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  const handleNavigate = (path: string) => {
    setCurrentPath(path)
    setSelectedCompany(null)
  }

  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company)
  }

  const handleBackToTable = () => {
    setSelectedCompany(null)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar currentPath={currentPath} onNavigate={handleNavigate} />
      <main className="flex-1 overflow-hidden">
        {currentPath === "/" && !selectedCompany && (
          <CompaniesTable onSelectCompany={handleSelectCompany} />
        )}
        {currentPath === "/" && selectedCompany && (
          <CompanyProfile company={selectedCompany} onBack={handleBackToTable} />
        )}
        {currentPath === "/lists" && <ListsView />}
        {currentPath === "/searches" && <SavedSearchesView />}
      </main>
    </div>
  )
}
