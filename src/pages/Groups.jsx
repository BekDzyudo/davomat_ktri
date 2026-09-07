import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listFaculties } from '../api/faculties'
import { createGroup, deleteGroup, listGroups, updateGroup } from '../api/groups'
import ConfirmDialog from '../components/ConfirmDialog'
import Alert from '../components/form/Alert'
import Button from '../components/form/Button'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/table/EmptyState'
import Pagination from '../components/table/Pagination'
import RowActionButton from '../components/table/RowActionButton'
import SearchInput from '../components/table/SearchInput'
import GroupFormModal from '../features/groups/GroupFormModal'
import { useTableQuery } from '../hooks/useTableQuery'

const filterGroup = (group, query) =>
  group.name.toLowerCase().includes(query) || group.direction.toLowerCase().includes(query)

export default function Groups() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [faculties, setFaculties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [modalState, setModalState] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([listGroups(), listFaculties()])
      .then(([groupsData, facultiesData]) => {
        if (cancelled) return
        setGroups(groupsData)
        setFaculties(facultiesData)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message ?? "Ma'lumotlarni yuklab bo'lmadi")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const facultyName = (id) => faculties.find((f) => f.id === id)?.name ?? '—'

  const { query, setQuery, page, setPage, totalPages, pageItems, totalItems, pageSize } =
    useTableQuery(groups, { filterFn: filterGroup })

  const totalStudents = groups.reduce((sum, group) => sum + (group.studentsCount ?? 0), 0)
  const facultyCount = new Set(groups.map((group) => group.faculty).filter(Boolean)).size
  const directionCount = new Set(groups.map((group) => group.direction).filter(Boolean)).size

  const handleSubmit = async (data) => {
    if (modalState.mode === 'edit') {
      const updated = await updateGroup(data.id, data)
      setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
    } else {
      const created = await createGroup(data)
      setGroups((prev) => [...prev, created])
    }
    setModalState(null)
  }

  const handleDelete = async () => {
    setActionError('')
    try {
      await deleteGroup(deleteTarget.id)
      setGroups((prev) => prev.filter((g) => g.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      setActionError(err.message ?? "O'chirishda xatolik yuz berdi")
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Guruhlar"
        icon="group"
        actions={
          <Button onClick={() => setModalState({ mode: 'create' })}>
            <Icon
              name="plus"
              className="size-4 transition-transform duration-300 group-hover:rotate-90"
            />
            Yangi guruh
          </Button>
        }
      />

      {actionError && (
        <div className="mb-4">
          <Alert variant="error">{actionError}</Alert>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-sm">
        <div className="grid grid-cols-2 border-b border-base-300 bg-base-200/45 sm:grid-cols-4">
          <div className="border-b border-r border-base-300 p-4 sm:border-b-0 sm:p-5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-base-content/45">Jami guruhlar</span>
            <p className="mt-1.5 text-2xl font-black text-base-content">{groups.length}</p>
          </div>
          <div className="border-b border-base-300 p-4 sm:border-b-0 sm:border-r sm:p-5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-base-content/45">Talabalar</span>
            <p className="mt-1.5 text-2xl font-black text-primary">{totalStudents}</p>
          </div>
          <div className="border-r border-base-300 p-4 sm:p-5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-base-content/45">Fakultetlar</span>
            <p className="mt-1.5 text-2xl font-black text-secondary">{facultyCount}</p>
          </div>
          <div className="p-4 sm:p-5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-base-content/45">Yo'nalishlar</span>
            <p className="mt-1.5 text-2xl font-black text-accent">{directionCount}</p>
          </div>
        </div>

        <div className="border-b border-base-300 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-black text-base-content sm:text-lg">Guruhlar ro'yxati</h2>
              <p className="mt-1 text-xs text-base-content/50 sm:text-sm">
                Yo'nalish, fakultet va talabalar tarkibi bo'yicha ma'lumotlar
              </p>
            </div>
            <span className="text-xs font-semibold text-base-content/45">{totalItems} ta natija</span>
          </div>
          <div className="mt-4">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Guruh yoki yo'nalish bo'yicha qidirish"
            />
          </div>
        </div>

        {loadError ? (
          <Alert variant="error">{loadError}</Alert>
        ) : isLoading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : pageItems.length === 0 ? (
          <EmptyState message="Hech narsa topilmadi" />
        ) : (
          <div className="overflow-x-auto px-4 sm:px-5">
            <table className="table min-w-260">
              <thead>
                <tr className="border-b border-base-300 text-[10px] uppercase tracking-wider text-base-content/45">
                  <th className="w-12 pb-3">#</th>
                  <th className="pb-3">Guruh</th>
                  <th className="pb-3">Yo'nalish</th>
                  <th className="pb-3">O'quv yili</th>
                  <th className="pb-3">Fakultet</th>
                  <th className="pb-3">Talabalar</th>
                  <th className="pb-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((group, index) => (
                  <tr
                    key={group.id}
                    className="group cursor-pointer border-b border-base-200 transition-colors hover:bg-primary/[0.035]"
                    onClick={() => navigate(`/groups/${group.id}`)}
                  >
                    <td className="text-xs font-semibold text-base-content/35">{(page - 1) * pageSize + index + 1}</td>
                    <td>
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                          <Icon name="group" className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-base-content">{group.name}</p>
                          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-base-content/40">
                            Guruh profili
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-56 text-xs text-base-content/70">
                      <span className="line-clamp-2">{group.direction}</span>
                    </td>
                    <td>
                      <span className="inline-flex rounded-lg bg-base-200 px-2.5 py-1 text-xs font-bold tabular-nums text-base-content/70">
                        {group.academicYear}
                      </span>
                    </td>
                    <td className="max-w-64 text-xs text-base-content/70">
                      <span className="line-clamp-2">{facultyName(group.faculty)}</span>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold tabular-nums text-primary">
                        <Icon name="user" className="size-3.5" />
                        {group.studentsCount ?? 0}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                        <RowActionButton
                          icon="eye"
                          label="Talabalar"
                          variant="view"
                          onClick={() => navigate(`/groups/${group.id}`)}
                        />
                        <RowActionButton
                          icon="pencil"
                          label="Tahrirlash"
                          variant="edit"
                          onClick={() => setModalState({ mode: 'edit', group })}
                        />
                        <RowActionButton
                          icon="trash"
                          label="O'chirish"
                          variant="danger"
                          onClick={() => setDeleteTarget(group)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          totalItems={totalItems}
          pageSize={pageSize}
        />
      </div>

      {modalState && (
        <GroupFormModal
          open
          mode={modalState.mode}
          initialValue={modalState.group}
          faculties={faculties}
          onClose={() => setModalState(null)}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Guruhni o'chirish"
        description={deleteTarget ? `"${deleteTarget.name}" guruhi o'chirilsinmi?` : ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
