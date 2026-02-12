// src/reusableComponents/Cards/MobileCardList.jsx
import React from "react";
import MobileCard from "./MobileCards";

const MobileCardList = ({
  data,
  isLoading,
  renderCard,
  loadingCount = 3,
  emptyMessage = "No records found",
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(loadingCount)].map((_, i) => (
          <MobileCard key={i} isLoading />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center text-[#555] text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {data.map((item, index) => renderCard(item, index))}
    </div>
  );
};

export default MobileCardList;