import { useMemo, useState } from 'react'

export default function useClientTable(data: any[], recordsPerPage: number = 25) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [totalRecords, setTotalRecords] = useState(0)

  const records = useMemo(() => {
    if (!data)
      return []

    let filteredData = data
    if (search) {
      filteredData = data.filter((item) => {
        return Object.keys(item).some((key) => {
          return String(item[key]).toLowerCase().includes(search.toLowerCase())
        })
      })
    }
    setTotalRecords(filteredData.length)
    return filteredData.slice((page - 1) * recordsPerPage, page * recordsPerPage)
  }, [data, search, page, recordsPerPage])

  return {
    search,
    setSearch,
    tableProps: {
      records,
      page,
      recordsPerPage,
      onPageChange: (p: number) => setPage(p),
      totalRecords,
    },
  }
}
