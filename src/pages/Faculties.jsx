import { useEffect, useState } from 'react'
import { createFaculty, deleteFaculty, listFaculties, updateFaculty } from '../api/faculties'
import ConfirmDialog from '../components/ConfirmDialog'
import Alert from '../components/form/Alert'
import Button from '../components/form/Button'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/table/EmptyState'
import Pagination from '../components/table/Pagination'
import RowActionButton from '../components/table/RowActionButton'
import SearchInput from '../components/table/SearchInput'
import FacultyFormModal from '../features/faculties/FacultyFormModal'
import { useTableQuery } from '../hooks/useTableQuery'
import { formatDate } from '../utils/date'

const filterFaculty = (faculty, query) => faculty.name.toLowerCase().includes(query)

export default function Faculties() {
  const [faculties, setFaculties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [modalState, setModalState] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    let cancelled = false
    listFaculties()
      .then((data) => {
        if (!cancelled) setFaculties(data)
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

  const { query, setQuery, page, setPage, totalPages, pageItems, totalItems, pageSize } =
    useTableQuery(faculties, { filterFn: filterFaculty })

  const handleSubmit = async (data) => {
    if (modalState.mode === 'edit') {
      const updated = await updateFaculty(data.id, data)
      setFaculties((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
    } else {
      const created = await createFaculty(data)
      setFaculties((prev) => [...prev, created])
    }
    setModalState(null)
  }

  const handleDelete = async () => {
    setActionError('')
    try {
      await deleteFaculty(deleteTarget.id)
      setFaculties((prev) => prev.filter((f) => f.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      setActionError(err.message ?? "O'chirishda xatolik yuz berdi")
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Fakultetlar"
        actions={
          <Button onClick={() => setModalState({ mode: 'create' })}>
            <Icon
              name="plus"
              className="size-4 transition-transform duration-300 group-hover:rotate-90"
            />
            Yangi fakultet
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
          <SearchInput value={query} onChange={setQuery} placeholder="Fakultet nomi bo'yicha qidirish" />
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
                  <th>Yaratilgan sana</th>
                  <th className="text-right">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((faculty, index) => (
                  <tr key={faculty.id}>
                    <td className="text-base-content/40">{(page - 1) * pageSize + index + 1}</td>
                    <td className="font-medium text-base-content">{faculty.name}</td>
                    <td className="text-base-content/70">
                      {faculty.createdAt ? formatDate(faculty.createdAt) : '—'}
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <RowActionButton
                          icon="pencil"
                          label="Tahrirlash"
                          variant="edit"
                          onClick={() => setModalState({ mode: 'edit', faculty })}
                        />
                        <RowActionButton
                          icon="trash"
                          label="O'chirish"
                          variant="danger"
                          onClick={() => setDeleteTarget(faculty)}
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
        <FacultyFormModal
          open
          mode={modalState.mode}
          initialValue={modalState.faculty}
          onClose={() => setModalState(null)}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Fakultetni o'chirish"
        description={deleteTarget ? `"${deleteTarget.name}" fakulteti o'chirilsinmi?` : ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
