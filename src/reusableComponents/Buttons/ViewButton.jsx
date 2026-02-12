// src/components/ViewButton.jsx
const ViewButton = ({ onClick, label = "View" }) => {
  return (
    <button
      onClick={onClick}
      className="px-2 py-1.5 text-sm font-medium transition-all duration-300 hover:scale-[1.02]"
      style={{
        color: "#fff",
        border: "1px solid rgba(235, 102, 15, 0.6)",
        backgroundColor: "transparent",
        transition: "all 0.3s ease",
        borderRadius: "2px",
      }}
      onMouseEnter={(e) => (e.target.style.backgroundColor = "#eb660f")}
      onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
    >
      {label}
    </button>
  );
};

export default ViewButton;