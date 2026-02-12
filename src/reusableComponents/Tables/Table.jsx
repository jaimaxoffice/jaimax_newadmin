// src/components/Table.jsx
import React from "react";

const Table = ({ columns, data, isLoading, currentPage, perPage }) => {
  return (
    <div className="overflow-x-auto sidebar-scroll">
      <table className="w-full">
        <thead>
          <tr className="bg-[#eb660f]">
            {columns.map((col, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-[13px] font-semibold text-[#fff] whitespace-nowrap"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            [...Array(perPage || 10)].map((_, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-[#1b232d]" : "bg-[#1b232d]"}>
                {columns.map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-4 w-3/4 bg-[#1b232d] rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : data?.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-16 text-center text-[#fff] text-sm"
              >
                No records found
              </td>
            </tr>
          ) : (
            data?.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`${
                  rowIndex % 2 === 0 ? "bg-[#1b232d]" : "bg-[#1b232d]"
                } hover:bg-[#1b232d] transition-colors`}
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 py-3 text-[13px] text-[#ccc] whitespace-nowrap"
                  >
                    {col.render
                      ? col.render(row, rowIndex, currentPage, perPage)
                      : row[col.accessor] ?? "—"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;