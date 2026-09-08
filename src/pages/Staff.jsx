import { useEffect, useState } from 'react'
import { getStaffTree } from '../api/staff'
import Alert from '../components/form/Alert'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/table/EmptyState'
import OrgUnitNode from '../features/staff/OrgUnitNode'

export default function Staff() {
  const [tree, setTree] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let cancelled = false
    getStaffTree()
      .then((data) => {
        if (!cancelled) setTree(data)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message ?? "Tuzilmani yuklab bo'lmadi")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <PageHeader
        title="Institut xodimlari"
        description="Ierarxik tuzilma va davomat — ish vaqti monitoringi"
        icon="sitemap"
      />
      <div className="w-full max-w-full overflow-x-auto overflow-y-visible rounded-2xl border border-base-300 bg-base-100 p-3 shadow-sm sm:p-6">
        {loadError ? (
          <Alert variant="error">{loadError}</Alert>
        ) : isLoading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : !tree ? (
          <EmptyState message="Institut tuzilmasi hali kiritilmagan — admin panelida 'Institut tuzilmasi' bo'limidan boshlang." />
        ) : (
          <div className="flex w-fit min-w-full justify-center">
            <OrgUnitNode node={tree} />
          </div>
        )}
      </div>
    </div>
  )
}
