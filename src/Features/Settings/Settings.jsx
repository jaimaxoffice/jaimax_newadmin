// src/pages/Setting.jsx
import React, { useEffect, useState } from "react";
import {
  useEditSettingsMutation,
  useSettingstDataQuery,
} from "./settingsApiSlice";
import { toast } from "react-toastify";
import Loader from "../../reusableComponents/Loader/Loader"
const Setting = () => {
  const {
    data: setting,
    isLoading,
    isSuccess,
  } = useSettingstDataQuery();

  const [settings, setSettings] = useState({
    min_withdrawal_inr: "",
    max_withdrawal_inr: "",
    withdrawal_commission_inr: "",
    buy_min_price_jaimax_inr: "",
    buy_max_price_jaimax_inr: "",
    min_withdrawal_usd: "",
    max_withdrawal_usd: "",
    withdrawal_commission_usd: "",
    buy_min_price_jaimax_usd: "",
    buy_max_price_jaimax_usd: "",
    launched_inr_price: "",
    launched_usd_price: "",
    referral_percentage: "",
    usd_to_inr_price: "",
    network_fee_token: "",
    user_community_count: "",
  });

  const [update, { isLoading: isUpdating }] = useEditSettingsMutation();

  const handleOnchange = (e) => {
    let { name, value } = e.target;
    value = value.replace(/[^0-9. ]/g, "");
    setSettings({ ...settings, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await update(settings);
      if (response?.data?.success) {
        toast.success(response?.data?.message || "Update successful!", {
          position: "top-center",
        });
      } else {
        toast.error(response?.error?.data?.message, {
          position: "top-center",
        });
      }
    } catch (error) {
      toast.error(error?.data?.message, {
        position: "top-center",
      });
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setSettings((prev) => ({ ...prev, ...setting?.data }));
    }
  }, [isSuccess, setting]);

  // INR Fields Config
  const inrFields = [
    { label: "Min Buy Amount", name: "buy_min_price_jaimax_inr" },
    { label: "Max Buy Amount", name: "buy_max_price_jaimax_inr" },
    { label: "Min Withdrawal Amount", name: "min_withdrawal_inr" },
    { label: "Max Withdrawal Amount", name: "max_withdrawal_inr" },
    { label: "Withdrawal Fees (%)", name: "withdrawal_commission_inr" },
    { label: "Referral Percentage", name: "referral_percentage" },
    { label: "Network Fee Token", name: "network_fee_token" },
  ];

  // USD Fields Config
  const usdFields = [
    { label: "Min Buy Amount", name: "buy_min_price_jaimax_usd" },
    { label: "Max Buy Amount", name: "buy_max_price_jaimax_usd" },
    { label: "Min Withdrawal Amount", name: "min_withdrawal_usd" },
    { label: "Max Withdrawal Amount", name: "max_withdrawal_usd" },
    { label: "Withdrawal Fees (%)", name: "withdrawal_commission_usd" },
    { label: "USD to INR Price", name: "usd_to_inr_price" },
    { label: "User Community Count", name: "user_community_count" },
  ];

  return (
    <div>
      <div className="p-2 sm:p-2 space-y-6">
        {/* Page Header */}
        <div className="bg-[#1b232d] border border-[#2a2c2f] rounded-2xl px-5 py-4">
          <h1 className="text-xl font-semibold text-white">Software Setting</h1>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <Loader/>
        ) : (
          /* Settings Form */
          <div className="bg-[#1b232d] border border-[#2a2c2f] rounded-2xl overflow-hidden">
            <form onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-5">
                {/* INR Section */}
                <SettingsSection
                  title="All values are in INR"
                  fields={inrFields}
                  settings={settings}
                  onChange={handleOnchange}
                  accentColor="#eb660f"
                />

                {/* USD Section */}
                <SettingsSection
                  title="All values are in USD"
                  fields={usdFields}
                  settings={settings}
                  onChange={handleOnchange}
                  accentColor="#eb660f"
                />
              </div>

              {/* Submit Button */}
              <div className="px-5 pb-6 pt-2 flex justify-center">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className={`
                    min-w-[180px] px-8 py-3 rounded-xl text-sm font-semibold
                    transition-all duration-200 cursor-pointer
                    ${
                      isUpdating
                        ? "bg-[#eb660f]/50 text-white/60 cursor-not-allowed"
                        : "bg-[#eb660f] text-white hover:bg-[#ff8533] hover:shadow-lg hover:shadow-[#eb660f]/20 active:scale-[0.98]"
                    }
                  `}
                >
                  {isUpdating ? (
                    <Loader/>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Setting;

// ─── Sub-Components ──────────────────────────────────────────────

/**
 * Settings Section Component
 */
const SettingsSection = ({ title, fields, settings, onChange, accentColor }) => {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-[#2a2c2f]">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
        <p className="text-sm text-[#8a8d93] font-light m-0">
          {title} <span className="text-red-400">*</span>
        </p>
      </div>

      {/* Fields */}
      <div className="space-y-3">
        {fields.map((item) => (
          <SettingsInput
            key={item.name}
            label={item.label}
            name={item.name}
            value={settings[item.name]}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Settings Input Component
 */
const SettingsInput = ({ label, name, value, onChange }) => {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="block text-xs font-medium text-[#8a8d93] uppercase tracking-wider"
      >
        {label}
      </label>
      <input
        type="text"
        id={name}
        name={name}
        autoComplete="off"
        value={value || ""}
        onChange={onChange}
        className="w-full bg-[#111214] border border-[#2a2c2f] text-white text-sm 
                   rounded-xl py-2.5 px-4 
                   placeholder-[#555] 
                   focus:outline-none focus:border-[#eb660f] focus:ring-1 focus:ring-[#eb660f]/50 
                   transition-all duration-200
                   hover:border-[#3a3c3f]"
      />
    </div>
  );
};