// src/pages/NoAccess.jsx
import React from "react";
import { ShieldX, Lock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NoAccess = () => {
  const navigate = useNavigate();

  return (
    <div>
      <section className="py-4 px-2 sm:px-4">
        <div className="w-full">
          {/* Header */}
          <div className="bg-[#b9fd5c]  rounded-lg p-4 sm:p-6 mb-6">
            <h1 className="text-lg sm:text-xl font-semibold text-white">
              NO Access
            </h1>
          </div>

        </div>
      </section>
    </div>
  );
};

export default NoAccess;