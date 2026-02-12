// src/components/Pagination.jsx
import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (currentPage > 3) pages.push("...");

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push("...");

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1.5 py-4">
      {/* Prev Arrow */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 flex items-center justify-center rounded-full
          text-[#ccc] bg-transparent
          hover:bg-[#0ecb6f] hover:text-[#111214]
          disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-[#ccc]
          disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        ‹
      </button>

      {/* Pages */}
      {getPages().map((page, i) =>
        page === "..." ? (
          <span key={`d${i}`} className="w-9 h-9 flex items-center justify-center text-[#555] text-sm">
            ⋯
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 flex items-center justify-center rounded-full text-sm transition-all cursor-pointer
              ${
                page === currentPage
                  ? "bg-[#0ecb6f] text-[#111214] font-bold scale-110"
                  : "text-[#ccc] hover:bg-[#0ecb6f]/10 hover:text-[#0ecb6f]"
              }`}
          >
            {page}
          </button>
        )
      )}

      {/* Next Arrow */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-full
          text-[#ccc] bg-transparent
          hover:bg-[#0ecb6f] hover:text-[#111214]
          disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-[#ccc]
          disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        ›
      </button>
    </div>
  );
};

export default Pagination;