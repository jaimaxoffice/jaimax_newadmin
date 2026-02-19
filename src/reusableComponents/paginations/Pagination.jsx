// src/components/Pagination.jsx
import React from "react";
import {ArrowLeft,ArrowRight } from "lucide-react";
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
          text-[#ccc] bg-[#282f35]
          hover:bg-[#b9fd5c] hover:text-[#111214]
            disabled:hover:text-[#000000]
          disabled:cursor-not-allowed transition-all cursor-pointer"
      >
      <ArrowLeft size={18} />
      </button>

      {/* Pages */}
    {getPages().map((page, i) =>
  page === "..." ? (
    <span
      key={`d${i}`}
      className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-[#555] text-xs sm:text-sm "
    >
      ⋯
    </span>
  ) : (
    <button
      key={page}
      onClick={() => onPageChange(page)}
      className={`w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-xs sm:text-sm transition-all cursor-pointer
        ${
          page === currentPage
            ? "bg-[#b9fd5c] text-[#111214] font-bold scale-110"
            : "text-[#ccc] hover:bg-[#b9fd5c]/10 hover:text-[#b9fd5c]"
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
          text-[#ccc] bg-[#282f35]
          hover:bg-[#b9fd5c] hover:text-[#111214]
          disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-[#ccc]
          disabled:cursor-not-allowed transition-all cursor-pointer"
      >
         <ArrowRight size={18}/>
      </button>
    </div>
  );
};

export default Pagination;