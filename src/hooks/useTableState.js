// src/hooks/useTableState.js
import { useState, useCallback, useRef } from "react";

const useTableState = (initialState = {}) => {
  const {
    initialPage = 1,
    initialPerPage = 10,
    initialSearch = "",
    initialStatus = "",
    searchDelay = 1000,
  } = initialState;

  const [state, setState] = useState({
    currentPage: initialPage,
    perPage: initialPerPage,
    search: initialSearch,
  });

  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const searchTimeoutRef = useRef(null);

  // ✅ Page change
  const handlePageChange = useCallback((page) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  }, []);

  // ✅ Status change — resets to page 1
  const handleStatusChange = useCallback((e) => {
    const value = e?.target?.value ?? e; // supports both event and direct value
    setSelectedStatus(value);
    setState((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  // ✅ Search with debounce — resets to page 1
  const handleSearch = useCallback(
    (e) => {
      const value = e?.target?.value ?? e; // supports both event and direct value
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          search: value,
          currentPage: 1,
        }));
      }, searchDelay);
    },
    [searchDelay]
  );

  // ✅ Per page change — resets to page 1
  const handlePerPageChange = useCallback((value) => {
    setState((prev) => ({
      ...prev,
      perPage: typeof value === "number" ? value : Number(value),
      currentPage: 1,
    }));
  }, []);

  // ✅ Manual reset
  const resetState = useCallback(() => {
    setSelectedStatus(initialStatus);
    setState({
      currentPage: initialPage,
      perPage: initialPerPage,
      search: initialSearch,
    });
  }, [initialPage, initialPerPage, initialSearch, initialStatus]);

  return {
    state,
    setState,
    selectedStatus,
    setSelectedStatus,
    handlePageChange,
    handleStatusChange,
    handleSearch,
    handlePerPageChange,
    resetState,
  };
};

export default useTableState;