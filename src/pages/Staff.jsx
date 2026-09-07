import PageHeader from '../components/PageHeader'
import { staffStructure } from '../data/mockStaffStructure'
import OrgUnitNode from '../features/staff/OrgUnitNode'

export default function Staff() {
  return (
    <div>
      <PageHeader
        title="Institut xodimlari"
        description="Ierarxik tuzilma va davomat — ish vaqti monitoringi"
        icon="sitemap"
      />
      <div className="w-full max-w-full overflow-x-auto overflow-y-visible rounded-2xl border border-base-300 bg-base-100 p-3 shadow-sm sm:p-6">
        <div className="flex w-fit min-w-full justify-center">
          <OrgUnitNode node={staffStructure} />
        </div>
      </div>
    </div>
  )
}
