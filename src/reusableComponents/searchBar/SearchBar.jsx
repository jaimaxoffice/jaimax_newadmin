// src/components/SearchBar.jsx
import { Icon } from "@iconify/react/dist/iconify.js";

const SearchBar = ({ onSearch, placeholder = "Search..." }) => {
  return (
    <div className="select_level_data mb-4">
      <div className="input-group search_group">
        <span
          className="input-group-text border-0 shadow-none bg-transparent rounded-0 pe-0"
          id="basic-addon1"
        >
          <Icon
            icon="tabler:search"
            width="16"
            height="16"
            style={{ color: "var(--black)" }}
          />
        </span>
        <input
          type="text"
          autoComplete="off"
          className="form-control border-0 shadow-none rounded-0 bg-transparent"
          placeholder={placeholder}
          aria-label="Search"
          aria-describedby="basic-addon1"
          onChange={onSearch}
        />
      </div>
    </div>
  );
};

export default SearchBar;