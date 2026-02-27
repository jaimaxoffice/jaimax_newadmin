// src/reusableComponents/searchBar/SearchBar.jsx
import { useState, useRef, useCallback } from "react";
import { Search, X } from "lucide-react";

const SearchBar = ({
  onSearch,
  placeholder = "Search...",
  defaultValue = "",
  className = "",
}) => {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef(null);

  // ✅ Universal handler — always passes event object
  const triggerSearch = useCallback(
    (val) => {
      if (!onSearch) return;

      // Create a consistent event-like object
      const syntheticEvent = {
        target: { value: val, name: "search" },
        currentTarget: { value: val, name: "search" },
        preventDefault: () => {},
        stopPropagation: () => {},
      };

      onSearch(syntheticEvent);
    },
    [onSearch]
  );

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    triggerSearch(newValue);
  };

  const handleClear = () => {
    setValue("");
    triggerSearch("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleClear();
    }
  };

  return (
    <div className={`relative w-full sm:w-52 ${className}`}>
      <Search
        size={15}
        className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none ${
          focused || value ? "text-[#b9fd5c]" : "text-[#555]"
        }`}
      />
      <input
        ref={inputRef}
        type="text"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`
          w-full bg-[#111214] text-white text-sm
          placeholder-[#bab4b4] py-2.5 pl-9 pr-9 rounded-lg 
          border outline-none transition-all duration-200
          ${
            focused
              ? "border-[#b9fd5c] ring-1 ring-[#b9fd5c]/30"
              : "border-[#2a2c2f] hover:border-[#3a3c3f]"
          }
        `}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] 
            hover:text-[#b9fd5c] transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;


