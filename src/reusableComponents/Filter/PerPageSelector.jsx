// src/components/PerPageSelector.jsx
const PerPageSelector = ({ onChange, options = [10, 30, 50] }) => {
  return (
    <div className="pagination__box mb-4">
      <div className="showing_data">
        <select
          className="form-select shadow-none"
          aria-label="Per page selector"
          onClick={onChange}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default PerPageSelector;