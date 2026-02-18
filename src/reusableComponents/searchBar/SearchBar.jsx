// // src/components/SearchBar.jsx
// import { useState, useRef } from "react";
// import { Search, X } from "lucide-react";

// const SearchBar = ({ onSearch, placeholder = "Search..." }) => {
//   const [focused, setFocused] = useState(false);
//   const [value, setValue] = useState("");
//   const inputRef = useRef(null);

//   const handleChange = (e) => {
//     setValue(e.target.value);
//     onSearch(e);
//   };

//   const handleClear = () => {
//     setValue("");
//     onSearch({ target: { value: "" } });
//     inputRef.current?.focus();
//   };

//   return (
//     <div className="relative w-full sm:w-52">
//       <Search
//         size={15}
//         className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
//           focused || value ? "text-[#b9fd5c]" : "text-[#555]"
//         }`}
//       />

//       <input
//         ref={inputRef}
//         type="text"
//         autoComplete="off"
//         value={value}
//         placeholder={placeholder}
//         onChange={handleChange}
//         onFocus={() => setFocused(true)}
//         onBlur={() => setFocused(false)}
//         className={`
//           w-full bg-[#111214] text-white text-sm
//           placeholder-[#555] py-2.5 pl-9 pr-9 rounded-lg 
//           border outline-none transition-all duration-200
//           ${
//             focused
//               ? "border-[#b9fd5c] ring-1 ring-[#b9fd5c]/30"
//               : "border-[#2a2c2f] hover:border-[#3a3c3f]"
//           }
//         `}
//       />

//       {value && (
//         <button
//           onClick={handleClear}
//           className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] 
//             hover:text-[#b9fd5c] transition-colors cursor-pointer"
//         >
//           <X size={14} />
//         </button>
//       )}
//     </div>
//   );
// };

// export default SearchBar;



// src/components/SearchBar.jsx
import { useState, useRef } from "react";
import { Search, X } from "lucide-react";

const SearchBar = ({ onSearch, placeholder = "Search..." }) => {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    onSearch(newValue); // ✅ Pass value directly, not the event
  };

  const handleClear = () => {
    setValue("");
    onSearch(""); // ✅ Clean API
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full sm:w-52">
      <Search
        size={15}
        className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
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
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`
          w-full bg-[#111214] text-white text-sm
          placeholder-[#555] py-2.5 pl-9 pr-9 rounded-lg 
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