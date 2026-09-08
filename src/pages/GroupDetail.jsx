import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { listFaculties } from '../api/faculties'
import { listGroups } from '../api/groups'
import { createStudent, deleteAllStudents, deleteStudent, importStudentsExcel, listStudents } from '../api/students'
import Badge from '../components/Badge'
import ConfirmDialog from '../components/ConfirmDialog'
import Alert from '../components/form/Alert'
import Button from '../components/form/Button'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/table/EmptyState'
import Pagination from '../components/table/Pagination'
import RowActionButton from '../components/table/RowActionButton'
import SearchInput from '../components/table/SearchInput'
import ExcelUploadModal from '../features/groups/ExcelUploadModal'
import StudentFormModal from '../features/groups/StudentFormModal'
import { useTableQuery } from '../hooks/useTableQuery'

const filterStudent = (student, query) =>
  student.fullName.toLowerCase().includes(query) ||
  (student.externalId ?? '').toLowerCase().includes(query) ||
  (student.phone ?? '').toLowerCase().includes(query) ||
  (student.institution ?? '').toLowerCase().includes(query)

function BackLink() {
  return (
    <Link
      to="/groups"
      className="group mb-2 inline-flex items-center gap-1 text-sm font-medium text-white/90 hover:text-white hover:underline"
    >
      <Icon
        name="arrowLeft"
        className="size-4 transition-transform duration-200 group-hover:-translate-x-1"
      />
      Guruhlar
    </Link>
  )
}

export default function GroupDetail() {
  const { id } = useParams()
  const groupId = Number(id)

  const [group, setGroup] = useState(null)
  const [facultyName, setFacultyName] = useState('')
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const [isDeletingAll, setIsDeletingAll] = useState(false)
  const [actionError, setActionError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const successTimerRef = useRef(null)

  useEffect(() => () => clearTimeout(successTimerRef.current), [])

  const showSuccess = (message) => {
    clearTimeout(successTimerRef.current)
    setSuccessMessage(message)
    successTimerRef.current = setTimeout(() => setSuccessMessage(''), 3500)
  }

  const loadStudents = () =>
    listStudents({ group: groupId }).then((all) => setStudents(all.filter((s) => s.groupId === groupId)))

  useEffect(() => {
    let cancelled = false
    Promise.all([listGroups(), listFaculties(), listStudents({ group: groupId })])
      .then(([groups, faculties, groupStudents]) => {
        if (cancelled) return
        const g = groups.find((it) => it.id === groupId) ?? null
        setGroup(g)
        setFacultyName(faculties.find((f) => f.id === g?.faculty)?.name ?? '—')
        setStudents(groupStudents.filter((s) => s.groupId === groupId))
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
  }, [groupId])

  const { query, setQuery, page, setPage, totalPages, pageItems, totalItems, pageSize } =
    useTableQuery(students, { filterFn: filterStudent })

  if (loadError) {
    return (
      <div>
        <PageHeader title="Guruh" icon="group" back={<BackLink />} />
        <Alert variant="error">{loadError}</Alert>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  if (!group) {
    return <PageHeader title="Guruh topilmadi" icon="group" back={<BackLink />} />
  }

  const handleAddStudent = async (data) => {
    await createStudent({ ...data, groupId })
    await loadStudents()
    setIsAddOpen(false)
  }

  const handleUpload = async (file) => {
    const result = await importStudentsExcel(groupId, file)
    await loadStudents()
    showSuccess("Guruh a'zolari muvaffaqiyatli yuklandi")
    return result
  }

  const handleDelete = async () => {
    setActionError('')
    try {
      await deleteStudent(deleteTarget.id)
      setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      setActionError(err.message ?? "O'chirishda xatolik yuz berdi")
      setDeleteTarget(null)
    }
  }

  const handleDeleteAll = async () => {
    setActionError('')
    setDeleteAllOpen(false)
    setIsDeletingAll(true)
    try {
      await deleteAllStudents(groupId)
      setStudents([])
      showSuccess("Guruh a'zolarining barchasi o'chirildi")
    } catch (err) {
      setActionError(err.message ?? "O'chirishda xatolik yuz berdi")
    } finally {
      setIsDeletingAll(false)
    }
  }

  return (
    <div>
      <PageHeader
        title={group.name}
        description={`${group.direction} · ${group.course}-kurs · ${facultyName}`}
        icon="group"
        back={<BackLink />}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setDeleteAllOpen(true)}
              disabled={students.length === 0 || isDeletingAll}
              className="border-error/40 text-error hover:border-error hover:bg-error/10"
            >
              {isDeletingAll ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <Icon name="trash" className="size-4" />
              )}
              Barchasini o'chirish
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsUploadOpen(true)}
              className="border-success/40 text-success hover:border-success hover:bg-success/10"
            >
              <Icon
                name="fileSpreadsheet"
                className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5"
              />
              Excel orqali yuklash
            </Button>
            <Button onClick={() => setIsAddOpen(true)}>
              <Icon
                name="plus"
                className="size-4 transition-transform duration-300 group-hover:rotate-90"
              />
              Tinglovchi qo'shish
            </Button>
          </>
        }
      />

      {actionError && (
        <div className="mb-4">
          <Alert variant="error">{actionError}</Alert>
        </div>
      )}

      {successMessage && (
        <div className="mb-4">
          <Alert variant="success" icon="badgeCheck">
            {successMessage}
          </Alert>
        </div>
      )}

      {isDeletingAll && (
        <div className="mb-4 flex items-center gap-3 rounded-box border border-error/30 bg-error/10 px-3.5 py-2.5 text-sm text-error">
          <span className="loading loading-spinner loading-sm shrink-0" />
          <p>Guruhdagi barcha tinglovchilar o'chirilmoqda, iltimos kuting...</p>
        </div>
      )}

      <div className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm sm:p-6">
        <div className="mb-4">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="F.I.Sh, ID raqam, telefon yoki ta'lim muassasasi bo'yicha qidirish"
          />
        </div>

        {pageItems.length === 0 ? (
          <EmptyState message="Tinglovchilar topilmadi" />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="text-xs uppercase text-base-content/50">
                  <th className="w-10">#</th>
                  <th className="w-24">ID raqam</th>
                  <th>F.I.Sh</th>
                  <th>Tel raqam</th>
                  <th>Ta'lim muassasasi</th>
                  <th>Holat</th>
                  <th className="text-right">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((student, index) => (
                  <tr key={student.id}>
                    <td className="text-base-content/40">{(page - 1) * pageSize + index + 1}</td>
                    <td className="text-base-content/50">{student.externalId || '—'}</td>
                    <td className="font-medium text-base-content">{student.fullName}</td>
                    <td className="text-base-content/70">{student.phone || '—'}</td>
                    <td className="text-base-content/70">{student.institution || '—'}</td>
                    <td>
                      <Badge status={student.isActive ? 'faol' : 'nofaol'}>
                        {student.isActive ? 'Faol' : 'Nofaol'}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <RowActionButton
                          icon="trash"
                          label="O'chirish"
                          variant="danger"
                          onClick={() => setDeleteTarget(student)}
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

      <StudentFormModal open={isAddOpen} onClose={() => setIsAddOpen(false)} onSubmit={handleAddStudent} />
      <ExcelUploadModal open={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUpload={handleUpload} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Tinglovchini o'chirish"
        description={deleteTarget ? `"${deleteTarget.fullName}" guruhdan chiqarilsinmi?` : ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={deleteAllOpen}
        title="Barcha tinglovchilarni o'chirish"
        description={`"${group.name}" guruhidagi barcha ${students.length} ta tinglovchi o'chirilsinmi? Bu amalni ortga qaytarib bo'lmaydi.`}
        confirmLabel="Barchasini o'chirish"
        onConfirm={handleDeleteAll}
        onCancel={() => setDeleteAllOpen(false)}
      />
    </div>
  )
}
