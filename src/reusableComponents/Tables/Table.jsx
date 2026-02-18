
import React from "react";
import Loader from "../Loader/Loader";

const Table = ({ columns, data, isLoading, currentPage, perPage }) => {
  return (
    <div className="relative overflow-x-auto sidebar-scroll  p-4">
      {/* Overlay Loader */}
      {isLoading && <Loader />}

      {/* Table */}
      <table className="w-full ">
        <thead >
          <tr className="bg-[#b9fd5c]">
            {columns.map((col, i) => (
              <th
                key={i}
                className="px-2 py-2.5 text-[13.5px] font-bold text-black whitespace-nowrap text-center tableHead"
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
                className="bg-[#282f35] "
              >
                {columns.map((_, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 py-3 text-[12px] text-base whitespace-nowrap text-center"
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
                className="bg-[#282f35] hover:bg-[#4851418d] transition-colors border-b border-[#343638]"
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-4 py-3 text-[12px] text-white whitespace-nowrap tablebody ${col.cellClass || "text-center"}`}
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