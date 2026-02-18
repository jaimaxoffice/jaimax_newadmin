// // src/components/StatusFilter.jsx
// const StatusFilter = ({ value, onChange, options = [] }) => {
//   const defaultOptions = [
//     { label: "Select Status", value: "Select Status" },
//     { label: "Approved", value: "Approved" },
//     { label: "Pending", value: "Pending" },
//     { label: "Rejected", value: "Rejected" },
//   ];

//   const filterOptions = options.length > 0 ? options : defaultOptions;

//   return (
//     <select
//       className="form-select my-auto mt-0"
//       aria-label="Select status"
//       value={value}
//       onChange={onChange}
//     >
//       {filterOptions.map((opt) => (
//         <option key={opt.value} value={opt.value}>
//           {opt.label}
//         </option>
//       ))}
//     </select>
//   );
// };

// export default StatusFilter;


// src/components/StatusFilter.jsx
const StatusFilter = ({ value, onChange, options = [], placeholder = "All Status" }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-[#282f35] border border-[#303f50] text-white rounded-lg 
        py-2 px-3 text-sm focus:outline-none focus:border-[#b9fd5c] 
        hover:border-[#b9fd5c]/50 transition-colors duration-200 cursor-pointer
        appearance-none pr-8
        bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23b9fd5c%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]
        bg-size-[16px] bg-position-[right_8px_center] bg-no-repeat"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#282f35] text-white">
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default StatusFilter;