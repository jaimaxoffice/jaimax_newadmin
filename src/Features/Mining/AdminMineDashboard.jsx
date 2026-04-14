// pages/admin/AdminMineDashboard.jsx
import React, { useState } from "react";
import WalletTransactions from "./MiningWallets";
import ReferralBonus from "./MiningReferal";
import MineLogs from "./MiningLogs";

const AdminMineDashboard = () => {
  const [activeTab, setActiveTab] = useState("wallet");

  const tabs = [
    { id: "wallet", label: "Wallet Transactions", icon: "💰" },
    { id: "referral", label: "Referral Bonus", icon: "🎁" },
    { id: "logs", label: "Mine Logs", icon: "📊" },
  ];

  return (
    <div className="min-h-screen bg-[#1a1f24] p-0">
      <div className=" mx-auto">
        {/* Header */}


        {/* Tabs */}
        <div className="bg-[#282f35] rounded-lg shadow-lg mb-6 border border-gray-700">
          <div className="border-b border-gray-700">
            <nav className="flex -mb-px overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200
                    whitespace-nowrap min-w-fit
                    ${
                      activeTab === tab.id
                        ? "border-[#b9fd5c] text-[#b9fd5c] bg-[#2a3138]"
                        : "border-transparent text-gray-400 hover:text-white hover:border-gray-600 hover:bg-[#2a3138]"
                    }
                  `}
                >
                  {/* <span className="text-xl">{tab.icon}</span> */}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-[#282f35] rounded-lg shadow-lg border border-gray-700">
          {activeTab === "wallet" && <WalletTransactions />}
          {activeTab === "referral" && <ReferralBonus />}
          {activeTab === "logs" && <MineLogs />}
        </div>
      </div>
    </div>
  );
};

export default AdminMineDashboard;