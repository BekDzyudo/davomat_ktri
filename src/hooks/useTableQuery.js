import { useMemo, useState } from 'react'

export function useTableQuery(items, { pageSize = 20, filterFn } = {}) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return items
    return items.filter((item) => filterFn(item, trimmed))
  }, [items, query, filterFn])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const handleSetQuery = (value) => {
    setQuery(value)
    setPage(1)
  }

  return {
    query,
    setQuery: handleSetQuery,
    page: safePage,
    setPage,
    totalPages,
    pageItems,
    totalItems: filtered.length,
    pageSize,
  }
}
