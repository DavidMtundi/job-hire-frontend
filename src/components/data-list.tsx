"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { DataTablePagination } from "./data-table-pagination";

interface DataListProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  mode?: "card" | "list";
  disablePagination?: boolean;
}

export function DataList<TData, TValue>({
  columns,
  data,
  mode = "list",
  disablePagination = false,
}: DataListProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    ...(disablePagination ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    initialState: {
      pagination: {
        pageSize: disablePagination ? data.length : 10,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="space-y-4">
      {/* List Container */}
      <div className="space-y-4">
        {rows?.length ? (
          rows.map((row) => (
            mode === "card" ? (
              <Card
                key={row.id}
                className="rounded-xl border shadow-sm hover:shadow-md transition-all duration-200"
              >
                <CardContent>
                  {row.getVisibleCells().map((cell) => (
                    <div key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>) : (
              <div key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <div key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            )
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">No results.</div>
        )}
      </div>

      {/* Pagination */}
      {/* {!disablePagination && <DataTablePagination table={table} />} */}
    </div>
  );
}
