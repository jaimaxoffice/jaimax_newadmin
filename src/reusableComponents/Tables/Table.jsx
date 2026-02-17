// src/components/Table.jsx
import React from "react";

const Table = ({ columns, data, isLoading, currentPage, perPage }) => {
  return (
    <div className="overflow-x-auto sidebar-scroll border border-[#303f50]">
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
            <tr>
              <td colSpan={columns.length} className="px-4 py-0 text-center">
                <div className="flex flex-col items-center justify-center py-16 gap-6">
                  <div className="relative w-16 h-16">
                    <div
                      className="absolute inset-0 rounded-full border-2 border-transparent"
                      style={{
                        borderTopColor: "#eb660f",
                        borderRightColor: "#eb660f",
                        animation: "loaderSpin 1.2s linear infinite",
                      }}
                    />
                    <div
                      className="absolute inset-2 rounded-full border-2 border-transparent"
                      style={{
                        borderBottomColor: "#ff8c42",
                        borderLeftColor: "#ff8c42",
                        animation: "loaderSpin 0.8s linear infinite reverse",
                      }}
                    />
                    <div
                      className="absolute inset-4 rounded-full border-2 border-transparent"
                      style={{
                        borderTopColor: "#eb660f",
                        borderLeftColor: "#eb660f",
                        animation: "loaderSpin 1.5s linear infinite",
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          background:
                            "radial-gradient(circle, #eb660f 0%, #ff8c42 50%, transparent 70%)",
                          boxShadow: "0 0 15px #eb660f, 0 0 30px #eb660f55",
                          animation: "loaderPulse 1.5s ease-in-out infinite",
                        }}
                      />
                    </div>
                    <div
                      className="absolute inset-0"
                      style={{ animation: "loaderSpin 2s linear infinite" }}
                    >
                      <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#eb660f]"
                        style={{ boxShadow: "0 0 6px #eb660f" }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {"Loading".split("").map((char, i) => (
                      <span
                        key={i}
                        className="text-sm font-semibold tracking-widest"
                        style={{
                          color: "#eb660f",
                          animation: `loaderBounce 1.4s ease-in-out ${i * 0.1}s infinite`,
                        }}
                      >
                        {char}
                      </span>
                    ))}
                    {[0, 1, 2].map((i) => (
                      <span
                        key={`d${i}`}
                        className="text-sm font-bold"
                        style={{
                          color: "#eb660f",
                          animation: `loaderBounce 1.4s ease-in-out ${0.7 + i * 0.15}s infinite`,
                        }}
                      >
                        .
                      </span>
                    ))}
                  </div>
                </div>

                <style>{`
                  @keyframes loaderSpin {
                    to { transform: rotate(360deg); }
                  }
                  @keyframes loaderPulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.4); opacity: 0.7; }
                  }
                  @keyframes loaderBounce {
                    0%, 100% { transform: translateY(0); opacity: 0.5; }
                    50% { transform: translateY(-5px); opacity: 1; }
                  }
                `}</style>
              </td>
            </tr>
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
  className={`${
    rowIndex % 2 === 0 ? "bg-[#1b232d]" : "bg-[#1b232d]"
  } hover:bg-[#2a3441] transition-colors border-b border-[#343638]`}
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