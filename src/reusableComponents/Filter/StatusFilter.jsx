// src/components/StatusFilter.jsx
const StatusFilter = ({ value, onChange, options = [] }) => {
  const defaultOptions = [
    { label: "Select Status", value: "Select Status" },
    { label: "Approved", value: "Approved" },
    { label: "Pending", value: "Pending" },
    { label: "Rejected", value: "Rejected" },
  ];

  const filterOptions = options.length > 0 ? options : defaultOptions;

  return (
    <select
      className="form-select my-auto mt-0"
      aria-label="Select status"
      value={value}
      onChange={onChange}
    >
      {filterOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default StatusFilter;