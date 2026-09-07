import { useEffect, useMemo, useState } from 'react'
import { createUser, deleteUser, listUsers, updateUser } from '../api/users'
import { ApiError } from '../api/client'
import ConfirmDialog from '../components/ConfirmDialog'
import Alert from '../components/form/Alert'
import Button from '../components/form/Button'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/table/EmptyState'
import FilterSelect from '../components/table/FilterSelect'
import Pagination from '../components/table/Pagination'
import RowActionButton from '../components/table/RowActionButton'
import SearchInput from '../components/table/SearchInput'
import { ROLE_ICONS, ROLE_LABELS, ROLE_TONES, ROLES } from '../data/roles'
import UserFormModal from '../features/users/UserFormModal'
import { useTableQuery } from '../hooks/useTableQuery'

const ROLE_OPTIONS = Object.values(ROLES)

const TONE_STYLES = {
  primary: { icon: 'bg-primary/12 text-primary', active: 'border-primary bg-primary/10' },
  info: { icon: 'bg-info/15 text-info', active: 'border-info bg-info/10' },
  secondary: { icon: 'bg-secondary/15 text-secondary', active: 'border-secondary bg-secondary/10' },
  warning: { icon: 'bg-warning/15 text-[oklch(58%_0.17_80)]', active: 'border-warning bg-warning/10' },
  success: { icon: 'bg-success/15 text-[oklch(48%_0.16_155)]', active: 'border-success bg-success/10' },
}

const filterUser = (user, query) =>
  user.fullName.toLowerCase().includes(query) ||
  user.username.toLowerCase().includes(query) ||
  (user.phone ?? '').toLowerCase().includes(query)

export default function Users() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [modalState, setModalState] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    let cancelled = false
    listUsers()
      .then((data) => {
        if (!cancelled) setUsers(data)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof ApiError ? err.message : "Ma'lumotlarni yuklab bo'lmadi")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const roleCounts = useMemo(() => {
    const counts = {}
    users.forEach((u) => {
      counts[u.role] = (counts[u.role] ?? 0) + 1
    })
    return ROLE_OPTIONS.map((r) => ({ role: r, label: ROLE_LABELS[r], count: counts[r] ?? 0 })).filter(
      (r) => r.count > 0,
    )
  }, [users])

  const roleFilteredUsers = useMemo(
    () => (roleFilter === 'all' ? users : users.filter((u) => u.role === roleFilter)),
    [users, roleFilter],
  )

  const activeUsers = users.filter((user) => user.isActive !== false).length
  const inactiveUsers = users.length - activeUsers

  const { query, setQuery, page, setPage, totalPages, pageItems, totalItems, pageSize } =
    useTableQuery(roleFilteredUsers, { filterFn: filterUser })

  const handleSubmit = async (data) => {
    if (modalState.mode === 'edit') {
      const updated = await updateUser(data.id, data)
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    } else {
      const created = await createUser(data)
      setUsers((prev) => [...prev, created])
    }
    setModalState(null)
  }

  const handleDelete = async () => {
    setActionError('')
    try {
      await deleteUser(deleteTarget.id)
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "O'chirishda xatolik yuz berdi")
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Foydalanuvchilar"
        icon="users"
        actions={
          <Button onClick={() => setModalState({ mode: 'create' })}>
            <Icon
              name="plus"
              className="size-4 transition-transform duration-300 group-hover:rotate-90"
            />
            Yangi foydalanuvchi
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
            <span className="text-[10px] font-bold uppercase tracking-wide text-base-content/45">Jami foydalanuvchilar</span>
            <p className="mt-1.5 text-2xl font-black text-base-content">{users.length}</p>
          </div>
          <div className="border-b border-base-300 p-4 sm:border-b-0 sm:border-r sm:p-5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-base-content/45">Faol foydalanuvchilar</span>
            <p className="mt-1.5 text-2xl font-black text-success">{activeUsers}</p>
          </div>
          <div className="border-r border-base-300 p-4 sm:p-5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-base-content/45">Rollar</span>
            <p className="mt-1.5 text-2xl font-black text-primary">{roleCounts.length}</p>
          </div>
          <div className="p-4 sm:p-5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-base-content/45">Faol emas</span>
            <p className={`mt-1.5 text-2xl font-black ${inactiveUsers ? 'text-warning' : 'text-base-content'}`}>
              {inactiveUsers}
            </p>
          </div>
        </div>

        <div className="border-b border-base-300 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-black text-base-content sm:text-lg">Foydalanuvchilar ro'yxati</h2>
              <p className="mt-1 text-xs text-base-content/50 sm:text-sm">
                Tizimdagi barcha hisoblar va ularning rollari
              </p>
            </div>
            <span className="text-xs font-semibold text-base-content/45">{totalItems} ta natija</span>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="F.I.Sh, login yoki telefon bo'yicha qidirish"
            />
            <FilterSelect
              value={roleFilter}
              onChange={setRoleFilter}
              className="w-full sm:w-48"
              options={[
                { value: 'all', label: 'Barcha rollar' },
                ...ROLE_OPTIONS.map((r) => ({ value: r, label: ROLE_LABELS[r] })),
              ]}
            />
            </div>

            {roleCounts.length > 0 && (
              <div className="flex flex-wrap gap-2 sm:justify-end">
                {roleCounts.map((r) => {
                  const tone = TONE_STYLES[ROLE_TONES[r.role]] ?? TONE_STYLES.primary
                  const isActive = roleFilter === r.role
                  return (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => setRoleFilter((prev) => (prev === r.role ? 'all' : r.role))}
                      title={`${r.label} bo'yicha filtrlash`}
                      className={[
                        'group flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-left transition-all duration-200',
                        isActive
                          ? `${tone.active} shadow-sm`
                          : 'border-base-300 bg-base-100 hover:border-base-content/20 hover:bg-base-200/40',
                      ].join(' ')}
                    >
                      <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${tone.icon}`}>
                        <Icon name={ROLE_ICONS[r.role]} className="size-3.5" />
                      </span>
                      <span className="flex flex-col leading-tight">
                        <span className="text-sm font-bold text-base-content">{r.count}</span>
                        <span className="text-[11px] text-base-content/55">{r.label}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
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
            <table className="table min-w-220">
              <thead>
                <tr className="border-b border-base-300 text-[10px] uppercase tracking-wider text-base-content/45">
                  <th className="w-12 pb-3">#</th>
                  <th className="pb-3">Foydalanuvchi</th>
                  <th className="pb-3">Login</th>
                  <th className="pb-3">Rol</th>
                  <th className="pb-3">Telefon</th>
                  <th className="pb-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((user, index) => (
                  <tr key={user.id} className="group border-b border-base-200 transition-colors hover:bg-primary/[0.035]">
                    <td className="text-xs font-semibold text-base-content/35">{(page - 1) * pageSize + index + 1}</td>
                    <td>
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-black uppercase text-primary">
                          {user.fullName
                            .split(' ')
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join('')}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-base-content">{user.fullName}</p>
                          <span
                            className={`mt-1 block size-1.5 rounded-full ${user.isActive === false ? 'bg-warning' : 'bg-success'}`}
                            title={user.isActive === false ? 'Faol emas' : 'Faol'}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-xs text-base-content/65">{user.username}</td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-base-200 px-2.5 py-1 text-xs font-semibold text-base-content/70">
                        <Icon name={ROLE_ICONS[user.role]} className="size-3.5" />
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td className="text-xs text-base-content/65">{user.phone || '—'}</td>
                    <td>
                      <div className="flex justify-end gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                        <RowActionButton
                          icon="pencil"
                          label="Tahrirlash"
                          variant="edit"
                          onClick={() => setModalState({ mode: 'edit', user })}
                        />
                        <RowActionButton
                          icon="trash"
                          label="O'chirish"
                          variant="danger"
                          onClick={() => setDeleteTarget(user)}
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
        <UserFormModal
          open
          mode={modalState.mode}
          initialValue={modalState.user}
          onClose={() => setModalState(null)}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Foydalanuvchini o'chirish"
        description={
          deleteTarget ? `"${deleteTarget.fullName}" o'chirilsinmi? Bu amalni ortga qaytarib bo'lmaydi.` : ''
        }
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
