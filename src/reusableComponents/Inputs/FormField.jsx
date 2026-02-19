
// Reusable Form Field
const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  onKeyPress,
  placeholder,
  error,
  maxLength,
}) => (
  <div>
    <label className="block text-sm font-medium text-[#b9fd5c] mb-2">
      {label} *
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      placeholder={placeholder}
      maxLength={maxLength}
      autoComplete="off"
      className={`w-full bg-[#111214] border text-white rounded-lg
        py-2.5 px-3 text-sm focus:outline-none transition-colors
        placeholder-[#555]
        ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
            : "border-[#2a2c2f] focus:border-[#b9fd5c] focus:ring-1 focus:ring-[#b9fd5c]/30"
        }`}
    />
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);
export default FormField;