import React, { useEffect, useState } from "react";
import {
  useEditSettingsMutation,
  useSettingstDataQuery,
} from "./settingsApiSlice";
import { useToast } from "../../reusableComponents/Toasts/ToastContext";
import Loader from "../../reusableComponents/Loader/Loader";
import InputField from "../../reusableComponents/Inputs/InputField"; // Import reusable InputField
import Button from "../../reusableComponents/Buttons/Button"; // Assuming you want to use reusable Button too
import { Settings, CheckCircle2 } from "lucide-react"; // Icons for header/button

const Setting = () => {
  const toast = useToast();
  const {
    data: settingData, // Renamed for clarity
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

  const handleOnChange = (e) => {
    let { name, value } = e.target;
    // Allow numbers and decimals only
    value = value.replace(/[^0-9.]/g, ""); 
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await update(settings).unwrap(); // Using unwrap() for cleaner error handling with RTK Query
      if (response?.success) {
        toast.success(response?.message || "Update successful!", {
          position: "top-center",
        });
      } else {
        toast.error(response?.message || "Update failed", {
          position: "top-center",
        });
      }
    } catch (error) {
      toast.error(error?.data?.message || "An error occurred", {
        position: "top-center",
      });
    }
  };

  useEffect(() => {
    if (isSuccess && settingData?.data) {
      setSettings((prev) => ({ ...prev, ...settingData.data }));
    }
  }, [isSuccess, settingData]);

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

  if (isLoading) return <Loader />;

  return (
    <div className="p-2 sm:p-2 space-y-6">
      {/* Page Header */}
      <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#b9fd5c]/10 flex items-center justify-center">
          <Settings size={20} className="text-[#b9fd5c]" />
        </div>
        <h1 className="text-xl font-semibold text-white">Software Settings</h1>
      </div>

      {/* Settings Form */}
      <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl overflow-hidden">
        <form onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            
            {/* INR Section */}
            <div className="space-y-4">
              <SectionHeader title="INR Settings" subtitle="All values in INR" />
              <div className="grid gap-4">
                {inrFields.map((field) => (
                  <InputField
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    value={settings[field.name]}
                    onChange={handleOnChange}
                    placeholder={`Enter ${field.label}`}
                    type="text"
                  />
                ))}
              </div>
            </div>

            {/* USD Section */}
            <div className="space-y-4">
              <SectionHeader title="USD Settings" subtitle="All values in USD" />
              <div className="grid gap-4">
                {usdFields.map((field) => (
                  <InputField
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    value={settings[field.name]}
                    onChange={handleOnChange}
                    placeholder={`Enter ${field.label}`}
                    type="text"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="px-6 py-6 border-t border-[#2a2c2f] flex justify-center bg-[#282f35]">
            <Button
              type="submit"
              loading={isUpdating}
              disabled={isUpdating}
              icon={!isUpdating ? CheckCircle2 : null}
              className="min-w-[200px]"
              size="lg"
            >
              {isUpdating ? "Updating Settings..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Setting;

// ─── Helper Components ──────────────────────────────────────────────

const SectionHeader = ({ title, subtitle }) => (
  <div className="pb-2 border-b border-[#2a2c2f] mb-2">
    <h3 className="text-white font-medium text-lg flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-[#b9fd5c]"></span>
      {title}
    </h3>
    <p className="text-[#8a8d93] text-xs ml-3.5 mt-0.5">{subtitle}</p>
  </div>
);