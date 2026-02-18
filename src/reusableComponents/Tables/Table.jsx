
import React from "react";
import Loader from "../Loader/Loader";

const Table = ({ columns, data, isLoading, currentPage, perPage }) => {
  return (
    <div className="relative overflow-x-auto sidebar-scroll border border-[#303f50]">
      {/* Overlay Loader */}
      {isLoading && <Loader />}

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="bg-[#eb660f]">
            {columns.map((col, i) => (
              <th
                key={i}
                className="px-4 py-3 text-[13px] font-semibold text-white whitespace-nowrap text-center"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            // Placeholder rows to maintain table height
            Array.from({ length: perPage || 5 }).map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className="bg-[#1b232d] border-b border-[#343638]"
              >
                {columns.map((_, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 py-3 text-[13px] text-transparent whitespace-nowrap text-center"
                  >
                    —
                  </td>
                ))}
              </tr>
            ))
          ) : data?.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-16 text-center text-white text-sm"
              >
                No records found
              </td>
            </tr>
          ) : (
            data?.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="bg-[#1b232d] hover:bg-[#2a3441] transition-colors border-b border-[#343638]"
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-4 py-3 text-[13px] text-white whitespace-nowrap ${col.cellClass || "text-center"}`}
                  >
                    {col.render
                      ? col.render(row, rowIndex, currentPage, perPage)
                      : (row[col.accessor] ?? "—")}
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