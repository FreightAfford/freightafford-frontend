import { useState } from "react";

type SortDirection = "asc" | "desc";

interface UseTableQueryOptions {
  initialSortKey?: string;
  initialSortDirection?: SortDirection;
  initialLimit?: number;
}

export const useTableQuery = ({
  initialSortKey,
  initialSortDirection,
  initialLimit,
}: UseTableQueryOptions = {}) => {
  const [page, setPage] = useState<number>(1);
  const [limit] = useState(initialLimit);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: SortDirection;
  }>({ key: initialSortKey!, direction: initialSortDirection! });

  const [filters, setFilters] = useState<Record<string, string>>({});

  const params = Object.fromEntries(
    Object.entries({
      page,
      limit,
      search: searchTerm || undefined,
      sort: sortConfig
        ? `${sortConfig.direction === "desc" ? "-" : ""}${sortConfig.key}`
        : undefined,
      ...filters,
    }).filter(([_, value]) => value !== "" && value !== undefined),
  );

  const handleSort = (key: string) => {
    setPage(1);
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);

    if (value.trim() === "") {
      setPage(1);
      setSearchTerm("");
    }
  };

  const handleSearchSubmit = (value?: string) => {
    const finalValue = value !== undefined ? value : searchInput;

    setPage(1);
    setSearchTerm(finalValue.trim());
  };

  const resetSearch = () => {
    setSearchInput("");
    setPage(1);
    setSearchTerm("");
  };

  return {
    page,
    limit,
    searchInput,
    searchTerm,
    sortConfig,
    filters,
    params,
    setPage,
    setSearchInput,
    setSearchTerm,
    handleSort,
    handleFilterChange,
    handleSearchChange,
    handleSearchSubmit,
    resetSearch,
  };
};
