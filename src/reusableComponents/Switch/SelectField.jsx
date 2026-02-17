// reusableComponents/SelectField/SelectField.jsx
const SelectField = ({
  label,
  name,
  value,
  onChange,
  options = [],
  className = "",
  selectClassName = "",
}) => {
  const baseClasses =
    "bg-[#1a2128] text-white border border-[#313b48] rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm text-gray-400 mb-1" htmlFor={name}>
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`${baseClasses} ${selectClassName}`}
      >
        {options.map((opt) => (
          <option
            key={typeof opt === "object" ? opt.value : opt}
            value={typeof opt === "object" ? opt.value : opt}
          >
            {typeof opt === "object" ? opt.label : opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;