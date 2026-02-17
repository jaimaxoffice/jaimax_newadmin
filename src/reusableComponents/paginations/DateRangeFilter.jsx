// reusableComponents/DateRangeFilter/DateRangeFilter.jsx
const DateRangeFilter = ({
  fromDate,
  toDate,
  onFromChange,
  onToChange,
  fromLabel = "From",
  toLabel = "To",
  className = "",
}) => {
  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <label className="text-white text-sm whitespace-nowrap">
          {fromLabel}
        </label>
        <input
          type="date"
          className="bg-white text-gray-900 rounded-md px-2 py-2 text-sm w-full focus:outline-none"
          value={fromDate}
          onChange={onFromChange}
        />
      </div>
      <div className={`flex items-center gap-2 ${className}`}>
        <label className="text-white text-sm whitespace-nowrap">
          {toLabel}
        </label>
        <input
          type="date"
          className="bg-white text-gray-900 rounded-md px-2 py-2 text-sm w-full focus:outline-none"
          value={toDate}
          onChange={onToChange}
        />
      </div>
    </>
  );
};

export default DateRangeFilter;