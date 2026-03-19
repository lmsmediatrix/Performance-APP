import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowDownUpIcon,
  SearchIcon,
  SlidersHorizontalIcon,
} from "../icons/animate";

export type DataTableSortDirection = "asc" | "desc";

export interface DataTableFilterOption {
  label: string;
  value: string;
}

export interface DataTableColumn<Row> {
  id: string;
  header: string;
  accessor: (row: Row) => string | number | boolean | Date | null | undefined;
  cell?: (row: Row) => ReactNode;
  sortable?: boolean;
  filterType?: "text" | "select" | "none";
  filterOptions?: DataTableFilterOption[];
  filterPlaceholder?: string;
  className?: string;
  headerClassName?: string;
  minWidth?: string;
}

interface DataTableProps<Row> {
  data: Row[];
  columns: DataTableColumn<Row>[];
  rowKey: (row: Row, index: number) => string;
  emptyState?: ReactNode;
  className?: string;
  defaultSort?: { columnId: string; direction: DataTableSortDirection };
  rowClassName?: string | ((row: Row) => string);
  onRowClick?: (row: Row) => void;
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function normalizeValue(value: unknown) {
  if (value instanceof Date) return value.getTime().toString();
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value === null || value === undefined) return "";
  return String(value).toLowerCase();
}

function compareValues(
  left: unknown,
  right: unknown,
  direction: DataTableSortDirection,
) {
  const modifier = direction === "asc" ? 1 : -1;

  if (left === right) return 0;
  if (left === null || left === undefined) return 1;
  if (right === null || right === undefined) return -1;

  if (left instanceof Date || right instanceof Date) {
    const leftDate = left instanceof Date ? left.getTime() : Number(left);
    const rightDate = right instanceof Date ? right.getTime() : Number(right);
    return (leftDate - rightDate) * modifier;
  }

  if (typeof left === "number" && typeof right === "number") {
    return (left - right) * modifier;
  }

  if (typeof left === "boolean" && typeof right === "boolean") {
    return (Number(left) - Number(right)) * modifier;
  }

  const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base",
  });

  return collator.compare(String(left), String(right)) * modifier;
}

export default function DataTable<Row>({
  data,
  columns,
  rowKey,
  emptyState,
  className,
  defaultSort,
  rowClassName,
  onRowClick,
}: DataTableProps<Row>) {
  const [sortState, setSortState] = useState<{
    columnId: string;
    direction: DataTableSortDirection;
  } | null>(
    defaultSort
      ? { columnId: defaultSort.columnId, direction: defaultSort.direction }
      : null,
  );
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(true);

  const hasFilterableColumns = columns.some(
    (column) => column.filterType && column.filterType !== "none",
  );

  const filteredRows = useMemo(() => {
    return data.filter((row) =>
      columns.every((column) => {
        const rawFilter = columnFilters[column.id];
        const filterValue = rawFilter?.trim().toLowerCase();
        if (!filterValue || column.filterType === "none") return true;

        const cellValue = normalizeValue(column.accessor(row));
        if (column.filterType === "select") {
          return cellValue === filterValue;
        }
        return cellValue.includes(filterValue);
      }),
    );
  }, [data, columns, columnFilters]);

  const rows = useMemo(() => {
    if (!sortState) return filteredRows;
    const column = columns.find((item) => item.id === sortState.columnId);
    if (!column || !column.sortable) return filteredRows;

    return [...filteredRows].sort((left, right) =>
      compareValues(
        column.accessor(left),
        column.accessor(right),
        sortState.direction,
      ),
    );
  }, [filteredRows, columns, sortState]);

  const renderFilterControl = (column: DataTableColumn<Row>) => {
    if (!column.filterType || column.filterType === "none") return null;

    if (
      column.filterType === "select" &&
      column.filterOptions &&
      column.filterOptions.length > 0
    ) {
      return (
        <select
          value={columnFilters[column.id] ?? ""}
          onChange={(event) =>
            setColumnFilters((previous) => ({
              ...previous,
              [column.id]: event.target.value,
            }))
          }
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 focus:border-blue-500 focus:outline-none"
        >
          <option value="">All</option>
          {column.filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <div className="relative">
        <SearchIcon
          size={14}
          className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={columnFilters[column.id] ?? ""}
          onChange={(event) =>
            setColumnFilters((previous) => ({
              ...previous,
              [column.id]: event.target.value,
            }))
          }
          placeholder={column.filterPlaceholder ?? "Search..."}
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-7 pr-2 text-xs text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
        />
      </div>
    );
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_35px_-22px_rgba(15,23,42,0.45)]",
        className,
      )}
    >
      {hasFilterableColumns && (
        <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          <button
            type="button"
            onClick={() => setShowFilters((state) => !state)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 sm:w-auto"
          >
            <SlidersHorizontalIcon size={15} />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      )}

      {showFilters && hasFilterableColumns && (
        <div className="space-y-2 border-b border-slate-100 bg-white px-4 py-3 md:hidden">
          {columns
            .filter((column) => column.filterType && column.filterType !== "none")
            .map((column) => (
              <div key={`${column.id}-filter-mobile`}>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {column.header}
                </p>
                {renderFilterControl(column)}
              </div>
            ))}
        </div>
      )}

      <div className="divide-y divide-slate-100 md:hidden">
        {rows.length === 0 ? (
          <div className="px-6 py-14 text-center text-sm text-slate-500">
            {emptyState ?? "No records found."}
          </div>
        ) : (
          rows.map((row, index) => {
            const key = rowKey(row, index);
            return (
              <div
                key={`${key}-mobile`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "space-y-3 px-4 py-4 transition-colors",
                  onRowClick && "cursor-pointer active:bg-slate-50",
                  typeof rowClassName === "function"
                    ? rowClassName(row)
                    : rowClassName,
                )}
              >
                {columns.map((column) => {
                  const isActions = column.id.toLowerCase() === "actions";
                  return (
                    <div
                      key={`${key}-${column.id}-mobile`}
                      className={cn(
                        "grid grid-cols-[95px_minmax(0,1fr)] items-start gap-2",
                        isActions && "grid-cols-1",
                      )}
                    >
                      {!isActions && (
                        <p className="pt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          {column.header}
                        </p>
                      )}
                      <div className={cn("min-w-0 text-sm text-slate-700", isActions && "pt-1")}>
                        {column.cell
                          ? column.cell(row)
                          : String(column.accessor(row) ?? "--")}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-[1000px] w-full border-collapse text-sm">
          <thead className="bg-slate-50/80">
            <tr className="border-b border-slate-100">
              {columns.map((column) => {
                const isSorted = sortState?.columnId === column.id;
                const direction = isSorted ? sortState?.direction : null;

                return (
                  <th
                    key={column.id}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500",
                      column.headerClassName,
                    )}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSortState((previous) => {
                            if (!previous || previous.columnId !== column.id) {
                              return { columnId: column.id, direction: "asc" };
                            }
                            if (previous.direction === "asc") {
                              return { columnId: column.id, direction: "desc" };
                            }
                            return null;
                          });
                        }}
                        className="inline-flex items-center gap-1.5 text-left transition-colors hover:text-slate-900"
                      >
                        {column.header}
                        <ArrowDownUpIcon
                          size={14}
                          className={cn(
                            "text-slate-400 transition-transform",
                            direction === "desc" && "rotate-180",
                            direction && "text-slate-700",
                          )}
                        />
                      </button>
                    ) : (
                      <span>{column.header}</span>
                    )}
                  </th>
                );
              })}
            </tr>

            {showFilters && hasFilterableColumns && (
              <tr className="hidden border-b border-slate-100 bg-white md:table-row">
                {columns.map((column) => {
                  if (!column.filterType || column.filterType === "none") {
                    return <th key={`${column.id}-filter`} className="px-4 py-2.5" />;
                  }

                  return (
                    <th key={`${column.id}-filter`} className="px-4 py-2.5">
                      {renderFilterControl(column)}
                    </th>
                  );
                })}
              </tr>
            )}
          </thead>

          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-14 text-center text-sm text-slate-500"
                >
                  {emptyState ?? "No records found."}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={rowKey(row, index)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "transition-colors hover:bg-slate-50/80",
                    onRowClick && "cursor-pointer",
                    typeof rowClassName === "function"
                      ? rowClassName(row)
                      : rowClassName,
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={`${rowKey(row, index)}-${column.id}`}
                      className={cn("px-4 py-3 align-middle text-slate-700", column.className)}
                    >
                      {column.cell ? column.cell(row) : String(column.accessor(row) ?? "--")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
