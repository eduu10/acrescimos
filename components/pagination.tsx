import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null

  const separator = basePath.includes('?') ? '&' : '?'

  return (
    <nav aria-label="Paginação" className="flex items-center justify-center gap-2 mt-8">
      {currentPage > 1 && (
        <Link
          href={currentPage === 2 ? basePath : `${basePath}${separator}page=${currentPage - 1}`}
          className="px-4 py-2 text-sm font-medium text-[#1B2436] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
        >
          Anterior
        </Link>
      )}

      <span className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
        Página {currentPage} de {totalPages}
      </span>

      {currentPage < totalPages && (
        <Link
          href={`${basePath}${separator}page=${currentPage + 1}`}
          className="px-4 py-2 text-sm font-medium text-[#1B2436] bg-[#F2E205] rounded-lg hover:bg-yellow-300 transition-colors"
        >
          Próxima
        </Link>
      )}
    </nav>
  )
}
