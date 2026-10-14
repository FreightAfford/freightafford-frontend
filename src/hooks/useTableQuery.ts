import { useState } from "react";
import { useSearchParams } from "react-router";

type SortDirection = "asc" | "desc";

interface UseTableQueryOptions {
  initialSortKey?: string;
  initialSortDirection?: SortDirection;
  initialLimit?: number;
  // URL params the page treats as table filters (anything else, e.g. batchId, is ignored)
  filterKeys?: string[];
}

// Table state (page, search, sort, filters) lives in the URL query string so it
// survives navigating to a details page and back. Only the typed search input is local.
export const useTableQuery = ({
  initialSortKey,
  initialSortDirection,
  initialLimit,
  filterKeys = [],
}: UseTableQueryOptions = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const limit = initialLimit;

  const defaultSort = initialSortKey
    ? `${initialSortDirection === "desc" ? "-" : ""}${initialSortKey}`
    : undefined;

  const pageParam = Number(searchParams.get("page"));
  const page = Number.isInteger(pageParam) && pageParam >= 1 ? pageParam : 1;

  const searchTerm = searchParams.get("search") ?? "";

  const sort = searchParams.get("sort") || defaultSort;
  const sortConfig: { key: string; direction: SortDirection } = {
    key: sort?.replace(/^-/, "") ?? "",
    direction: sort?.startsWith("-") ? "desc" : "asc",
  };

  const filters: Record<string, string> = Object.fromEntries(
    filterKeys
      .map((key) => [key, searchParams.get(key) ?? ""])
      .filter(([, value]) => value !== ""),
  );

  // Keep the input in step with the URL when the search changes from outside
  // (Back/Forward, sidebar link), without clobbering what the user is typing.
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [syncedSearchTerm, setSyncedSearchTerm] = useState(searchTerm);
  if (syncedSearchTerm !== searchTerm) {
    setSyncedSearchTerm(searchTerm);
    setSearchInput(searchTerm);
  }

  const params = Object.fromEntries(
    Object.entries({
      page,
      limit,
      search: searchTerm || undefined,
      sort,
      ...filters,
    }).filter(([, value]) => value !== "" && value !== undefined),
  );

  // Writes changes into the URL, dropping defaults so URLs stay short
  const update = (changes: Record<string, string | number | undefined>) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(changes)) {
          const str = value === undefined ? "" : String(value);
          const isDefault =
            str === "" ||
            (key === "page" && str === "1") ||
            (key === "sort" && str === defaultSort);

          if (isDefault) next.delete(key);
          else next.set(key, str);
        }
        return next;
      },
      { replace: true },
    );
  };

  const setPage = (value: number) => update({ page: value });

  const setSearchTerm = (value: string) =>
    update({ search: value.trim(), page: 1 });

  const handleSort = (key: string) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    update({ sort: `${direction === "desc" ? "-" : ""}${key}`, page: 1 });
  };

  const handleFilterChange = (key: string, value: string) => {
    update({ [key]: value, page: 1 });
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);

    if (value.trim() === "" && searchTerm !== "") {
      setSearchTerm("");
    }
  };

  const handleSearchSubmit = (value?: string) => {
    // onSearchSubmit is also wired to a button onClick, which passes an event
    const finalValue = typeof value === "string" ? value : searchInput;
    setSearchTerm(finalValue);
  };

  const resetSearch = () => {
    setSearchInput("");
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
