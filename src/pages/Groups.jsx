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

      <div className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm sm:p-6">
        <div className="mb-4">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Guruh yoki yo'nalish bo'yicha qidirish"
          />
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
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="text-xs uppercase text-base-content/50">
                  <th className="w-10">#</th>
                  <th>Nomi</th>
                  <th>Yo'nalish</th>
                  <th>Kurs</th>
                  <th>O'quv yili</th>
                  <th>Fakultet</th>
                  <th>Talabalar</th>
                  <th className="text-right">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((group, index) => (
                  <tr
                    key={group.id}
                    className="cursor-pointer hover:bg-base-200/50"
                    onClick={() => navigate(`/groups/${group.id}`)}
                  >
                    <td className="text-base-content/40">{(page - 1) * pageSize + index + 1}</td>
                    <td className="font-medium text-base-content">{group.name}</td>
                    <td className="text-base-content/70">{group.direction}</td>
                    <td className="text-base-content/70">{group.course}-kurs</td>
                    <td className="text-base-content/70">{group.academicYear}</td>
                    <td className="text-base-content/70">{facultyName(group.faculty)}</td>
                    <td className="text-base-content/70">{group.studentsCount ?? 0}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
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
