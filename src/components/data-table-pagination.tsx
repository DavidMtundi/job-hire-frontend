"use client"

import { Table } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { Button } from "~/components/ui/button"

interface DataTablePaginationProps<TData> {
  table?: Table<TData>;
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

export function DataTablePagination<TData>({
  table,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}: DataTablePaginationProps<TData>) {
  const isServerSide = currentPage !== undefined && totalPages !== undefined && totalCount !== undefined;
  
  let page: number;
  let totalPagesCount: number;
  let totalRows: number;
  let endRow: number;
  let handlePrevPage: () => void;
  let handleNextPage: () => void;
  let canGoPrev: boolean;
  let canGoNext: boolean;

  if (isServerSide && onPageChange) {
    page = currentPage || 1;
    totalPagesCount = totalPages || 1;
    totalRows = totalCount || 0;
    const startItem = totalRows === 0 ? 0 : (page - 1) * (pageSize || 10) + 1;
    endRow = totalRows === 0 ? 0 : Math.min(page * (pageSize || 10), totalRows);
    
    handlePrevPage = () => {
      if (page > 1 && onPageChange) {
        onPageChange(page - 1);
      }
    };
    
    handleNextPage = () => {
      if (page < totalPagesCount && onPageChange) {
        onPageChange(page + 1);
      }
    };
    
    canGoPrev = page > 1;
    canGoNext = page < totalPagesCount;
  } else if (table) {
    const { pageIndex, pageSize: tablePageSize } = table.getState().pagination;
    page = pageIndex + 1;
    totalPagesCount = table.getPageCount();
    totalRows = table.getFilteredRowModel().rows.length;
    endRow = Math.min((pageIndex + 1) * tablePageSize, totalRows);
    handlePrevPage = () => table.previousPage();
    handleNextPage = () => table.nextPage();
    canGoPrev = table.getCanPreviousPage();
    canGoNext = table.getCanNextPage();
  } else {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-2 py-4 text-muted-foreground">
      <div className="text-sm">
        {endRow} of {totalRows} {totalRows === 1 ? "result" : "results"}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevPage}
          disabled={!canGoPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm">
          Page {page} of {totalPagesCount || 1}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={!canGoNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
