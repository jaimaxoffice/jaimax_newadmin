// src/features/notifications/BulkNotificationManagement.jsx
import React, { useState, useEffect } from "react";
import { useToast } from "../../reusableComponents/Toasts/ToastContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  UserX, UserCheck, Users2, UsersRound, Crown, Trophy, Zap,
  RefreshCw, Send, Edit3, MessageCircle, Info, ExternalLink,
  Eye, EyeOff, AlertCircle, CheckCircle, Clock,
} from "lucide-react";

import {
  useGetInactiveUsersQuery,
  useGetUsersWithZeroDirectRefsQuery,
  useGetUsersWithOneToTwoDirectRefsQuery,
  useGetUsersWithThreeToFiveDirectRefsQuery,
  useGetUsersWithSixToNineDirectRefsQuery,
  useGetUsersWithTenToTwentyFiveDirectRefsQuery,
  useGetUsersWithTwentySixToHundredDirectRefsQuery,
  useGetAllUsersQuery,
} from "../reports/reportsApiSlice";
import { useSendBulkNotificationMutation } from "./NotificationsApiSlice";

// ─── Constants ──────────────────────────────────────────────
const USER_CATEGORIES = [
  { id: "all-users", name: "All Users", description: "All registered users in the system", icon: Users2, color: "#6366F1" },
  { id: "inactive", name: "Inactive Members", description: "Users who are marked as inactive", icon: UserX, color: "#EF4444" },
  { id: "zero-refs", name: "Zero Direct Referrals", description: "Active users with 0 direct referrals", icon: UserCheck, color: "#F59E0B" },
  { id: "1-2-refs", name: "1-2 Direct Referrals", description: "Users with 1-2 direct referrals", icon: Users2, color: "#10B981" },
  { id: "3-5-refs", name: "3-5 Direct Referrals", description: "Users with 3-5 direct referrals", icon: UsersRound, color: "#06B6D4" },
  { id: "6-9-refs", name: "6-9 Direct Referrals", description: "Users with 6-9 direct referrals", icon: Crown, color: "#8B5CF6" },
  { id: "10-25-refs", name: "10-25 Direct Referrals", description: "Users with 10-25 direct referrals", icon: Trophy, color: "#3B82F6" },
  { id: "26-100-refs", name: "26-100 Direct Referrals", description: "High performing users with 26-100 direct referrals", icon: Zap, color: "#6B7280" },
];

const NOTIFICATION_TYPES = [
  { value: "zoom session", label: "Zoom Session" },
  { value: "push notifications", label: "Push Notification" },
  { value: "announcement", label: "Announcement" },
  { value: "reminder", label: "Reminder" },
  { value: "promotional", label: "Promotional" },
];

const validationSchema = Yup.object({
  notificationTitle: Yup.string()
    .required("Notification title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be 100 characters or less"),
  notificationMessage: Yup.string()
    .required("Notification message is required")
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message must be 500 characters or less"),
  notificationLink: Yup.string().url("Must be a valid URL").nullable(),
  notificationType: Yup.string().required("Notification type is required"),
});

// ─── Main Component ─────────────────────────────────────────
const BulkNotificationManagement = () => {
  const toast = useToast();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [sendingStatus, setSendingStatus] = useState(null);

  // RTK Query hooks
  const { data: getAllUsers, isLoading: loadingAllUsers, refetch: refetchAllUsers, error: allUsersError } =
    useGetAllUsersQuery(undefined, { skip: selectedCategory !== "all-users" });
  const { data: inactiveUsers, isLoading: loadingInactive, refetch: refetchInactive, error: inactiveError } =
    useGetInactiveUsersQuery(undefined, { skip: selectedCategory !== "inactive" });
  const { data: zeroRefsUsers, isLoading: loadingZeroRefs, refetch: refetchZeroRefs, error: zeroRefsError } =
    useGetUsersWithZeroDirectRefsQuery(undefined, { skip: selectedCategory !== "zero-refs" });
  const { data: oneToTwoRefsUsers, isLoading: loadingOneToTwo, refetch: refetchOneToTwo, error: oneToTwoError } =
    useGetUsersWithOneToTwoDirectRefsQuery(undefined, { skip: selectedCategory !== "1-2-refs" });
  const { data: threeToFiveRefsUsers, isLoading: loadingThreeToFive, refetch: refetchThreeToFive, error: threeToFiveError } =
    useGetUsersWithThreeToFiveDirectRefsQuery(undefined, { skip: selectedCategory !== "3-5-refs" });
  const { data: sixToNineRefsUsers, isLoading: loadingSixToNine, refetch: refetchSixToNine, error: sixToNineError } =
    useGetUsersWithSixToNineDirectRefsQuery(undefined, { skip: selectedCategory !== "6-9-refs" });
  const { data: tenToTwentyFiveRefsUsers, isLoading: loadingTenToTwentyFive, refetch: refetchTenToTwentyFive, error: tenToTwentyFiveError } =
    useGetUsersWithTenToTwentyFiveDirectRefsQuery(undefined, { skip: selectedCategory !== "10-25-refs" });
  const { data: twentySixToHundredRefsUsers, isLoading: loadingTwentySixToHundred, refetch: refetchTwentySixToHundred, error: twentySixToHundredError } =
    useGetUsersWithTwentySixToHundredDirectRefsQuery(undefined, { skip: selectedCategory !== "26-100-refs" });

  const [sendBulkNotification] = useSendBulkNotificationMutation();

  // Get current category data
  const getCurrentCategoryData = () => {
    const map = {
      "all-users": { users: getAllUsers?.data || [], isLoading: loadingAllUsers, refetch: refetchAllUsers, error: allUsersError },
      "inactive": { users: inactiveUsers?.data || [], isLoading: loadingInactive, refetch: refetchInactive, error: inactiveError },
      "zero-refs": { users: zeroRefsUsers?.data || [], isLoading: loadingZeroRefs, refetch: refetchZeroRefs, error: zeroRefsError },
      "1-2-refs": { users: oneToTwoRefsUsers?.data || [], isLoading: loadingOneToTwo, refetch: refetchOneToTwo, error: oneToTwoError },
      "3-5-refs": { users: threeToFiveRefsUsers?.data || [], isLoading: loadingThreeToFive, refetch: refetchThreeToFive, error: threeToFiveError },
      "6-9-refs": { users: sixToNineRefsUsers?.data || [], isLoading: loadingSixToNine, refetch: refetchSixToNine, error: sixToNineError },
      "10-25-refs": { users: tenToTwentyFiveRefsUsers?.data || [], isLoading: loadingTenToTwentyFive, refetch: refetchTenToTwentyFive, error: tenToTwentyFiveError },
      "26-100-refs": { users: twentySixToHundredRefsUsers?.data || [], isLoading: loadingTwentySixToHundred, refetch: refetchTwentySixToHundred, error: twentySixToHundredError },
    };
    return map[selectedCategory] || { users: [], isLoading: false, refetch: () => {}, error: null };
  };

  const { users: currentUsers, isLoading: currentLoading, refetch: currentRefetch, error: currentError } = getCurrentCategoryData();
  const userCount = currentUsers.length;
  const previewUsers = currentUsers.slice(0, 5);

  useEffect(() => {
    if (currentError) {
      toast.error(`Error loading user data: ${currentError?.data?.message || currentError.message}`);
    }
  }, [currentError]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setShowPreview(false);
    setSendingStatus(null);
  };

  const handleRefreshData = () => {
    currentRefetch();
    toast.info("Refreshing user data...");
  };

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    if (!selectedCategory) {
      toast.error("Please select a user category");
      setSubmitting(false);
      return;
    }
    if (userCount === 0) {
      toast.error("No users found in selected category");
      setSubmitting(false);
      return;
    }

    const categoryName = USER_CATEGORIES.find((cat) => cat.id === selectedCategory)?.name;
    if (!window.confirm(`Send "${values.notificationTitle}" to ${userCount} users in "${categoryName}"?`)) {
      setSubmitting(false);
      return;
    }

    try {
      setSendingStatus("sending");
      const result = await sendBulkNotification({
        category: selectedCategory,
        title: values.notificationTitle.trim(),
        message: values.notificationMessage.trim(),
        notificationLink: values.notificationLink.trim() || "",
        notificationType: values.notificationType,
      }).unwrap();

      if (result.success) {
        setSendingStatus("success");
        toast.success(`Notification sent! ${result.data?.success || userCount} sent, ${result.data?.failed || 0} failed`);
        resetForm();
        setSelectedCategory("");
        setShowPreview(false);
        setTimeout(() => setSendingStatus(null), 3000);
      } else {
        setSendingStatus("error");
        toast.error(result.message || "Failed to send notifications");
      }
    } catch (error) {
      setSendingStatus("error");
      toast.error(error?.data?.message || "Failed to send notification");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-2 sm:p-2 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#2a2c2f]">
        

        <div className="flex items-center gap-3 flex-wrap">
          {selectedCategory && (
            <>
              <button
                onClick={handleRefreshData}
                disabled={currentLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                  bg-transparent border border-[#2a2c2f] text-[#8a8d93]
                  hover:bg-[#2a2c2f] hover:text-white transition-colors
                  cursor-pointer disabled:opacity-50"
              >
                {currentLoading ? (
                  <span className="w-4 h-4 border-2 border-[#8a8d93]/30 border-t-[#8a8d93] rounded-full animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                Refresh
              </button>
              <span className="bg-[#b9fd5c] text-white text-sm font-semibold px-3 py-1.5 rounded-full">
                {userCount} users selected
              </span>
            </>
          )}
        </div>
      </div>

      {/* Step 1: Select Category */}
      <div className="space-y-4">
        <StepHeader number={1} title="Select User Category" subtitle="Choose the target audience for your notification" />

        {currentError && <AlertBanner type="error" message={currentError?.data?.message || currentError?.message || "Unknown error"} />}

        {currentLoading && !selectedCategory ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#b9fd5c]/30 border-t-[#b9fd5c] rounded-full animate-spin" />
            <p className="text-[#8a8d93] mt-4 text-sm">Fetching user categories...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {USER_CATEGORIES.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                isSelected={selectedCategory === category.id}
                userCount={selectedCategory === category.id ? userCount : null}
                onClick={() => handleCategorySelect(category.id)}
              />
            ))}
          </div>
        )}

        {/* Selected Category Info */}
        {selectedCategory && userCount > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#0ecb6f]/10 border border-[#0ecb6f]/20">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-[#0ecb6f]" />
                <span className="text-white text-sm font-semibold">
                  {userCount} users found in "{USER_CATEGORIES.find((c) => c.id === selectedCategory)?.name}"
                </span>
              </div>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs
                  font-semibold bg-white/10 text-white hover:bg-white/20
                  transition-colors cursor-pointer"
              >
                {showPreview ? <><EyeOff size={14} /> Hide</> : <><Eye size={14} /> Preview</>}
              </button>
            </div>

            {showPreview && previewUsers.length > 0 && (
              <UserPreviewList users={previewUsers} totalCount={userCount} />
            )}
          </div>
        )}

        {selectedCategory && userCount === 0 && !currentLoading && (
          <AlertBanner
            type="warning"
            message={`No users found in "${USER_CATEGORIES.find((c) => c.id === selectedCategory)?.name}". Try refreshing or select a different category.`}
          />
        )}
      </div>

      {/* Step 2 & 3: Compose & Send */}
      <div className="space-y-4">
        <StepHeader number={2} title="Compose Notification" subtitle="Create your notification content" />

        <Formik
          initialValues={{
            notificationTitle: "",
            notificationMessage: "",
            notificationLink: "",
            notificationType: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, isSubmitting, errors, touched }) => (
            <Form className="space-y-6">
              {/* Form Fields */}
              <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl p-5 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Type */}
                  <FormFieldWrapper label="Notification Type" icon={MessageCircle} required>
                    <Field
                      as="select"
                      name="notificationType"
                      className={`w-full bg-[#111214] border text-white rounded-xl
                        py-2.5 px-4 text-sm focus:outline-none transition-colors cursor-pointer
                        ${errors.notificationType && touched.notificationType
                          ? "border-red-500 focus:border-red-500"
                          : "border-[#2a2c2f] focus:border-[#b9fd5c] focus:ring-1 focus:ring-[#b9fd5c]/30"
                        }`}
                    >
                      <option value="">Select notification type</option>
                      {NOTIFICATION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </Field>
                    <ErrorMessage name="notificationType" component="p" className="text-red-400 text-xs mt-1" />
                  </FormFieldWrapper>

                  {/* Title */}
                  <FormFieldWrapper label="Notification Title" icon={Edit3} required>
                    <Field
                      type="text"
                      name="notificationTitle"
                      placeholder="Enter a compelling notification title"
                      maxLength={100}
                      className={`w-full bg-[#111214] border text-white rounded-xl
                        py-2.5 px-4 text-sm focus:outline-none transition-colors
                        placeholder-[#555]
                        ${errors.notificationTitle && touched.notificationTitle
                          ? "border-red-500 focus:border-red-500"
                          : "border-[#2a2c2f] focus:border-[#b9fd5c] focus:ring-1 focus:ring-[#b9fd5c]/30"
                        }`}
                    />
                    <div className="flex justify-between mt-1">
                      <ErrorMessage name="notificationTitle" component="p" className="text-red-400 text-xs" />
                      <span className="text-[#555] text-xs">{values.notificationTitle.length}/100</span>
                    </div>
                  </FormFieldWrapper>

                  {/* Message */}
                  <FormFieldWrapper label="Notification Message" icon={MessageCircle} required>
                    <Field
                      as="textarea"
                      name="notificationMessage"
                      rows="5"
                      placeholder="Write your notification message here..."
                      maxLength={500}
                      className={`w-full bg-[#111214] border text-white rounded-xl
                        py-2.5 px-4 text-sm focus:outline-none transition-colors
                        placeholder-[#555] resize-y
                        ${errors.notificationMessage && touched.notificationMessage
                          ? "border-red-500 focus:border-red-500"
                          : "border-[#2a2c2f] focus:border-[#b9fd5c] focus:ring-1 focus:ring-[#b9fd5c]/30"
                        }`}
                    />
                    <div className="flex justify-between mt-1">
                      <ErrorMessage name="notificationMessage" component="p" className="text-red-400 text-xs" />
                      <span className="text-[#b1abab] text-xs">{values.notificationMessage.length}/500</span>
                    </div>
                  </FormFieldWrapper>

                  {/* Link */}
                  <FormFieldWrapper label="Action Link" icon={ExternalLink} optional>
                    <Field
                      type="url"
                      name="notificationLink"
                      placeholder="https://example.com/action"
                      className={`w-full bg-[#111214] border text-black rounded-xl
                        py-2.5 px-4 text-sm focus:outline-none transition-colors
                        placeholder-[#555]
                        ${errors.notificationLink && touched.notificationLink
                          ? "border-red-500 focus:border-red-500"
                          : "border-[#2a2c2f] focus:border-[#b9fd5c] focus:ring-1 focus:ring-[#b9fd5c]/30"
                        }`}
                    />
                    <ErrorMessage name="notificationLink" component="p" className="text-red-400 text-xs mt-1" />
                    <p className="text-[#ada7a7] text-xs mt-1">Add a clickable link to your notification</p>
                  </FormFieldWrapper>
                </div>
              </div>

              {/* Live Preview */}
              {(values.notificationTitle || values.notificationMessage) && (
                <NotificationPreview values={values} />
              )}

              {/* Step 3: Send */}
              <div className="space-y-4">
                <StepHeader number={3} title="Send Notification" subtitle="Review and send your notification" />

                {/* Status Messages */}
                {sendingStatus && <SendingStatusBanner status={sendingStatus} userCount={userCount} />}

                {/* Send Card */}
                <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl p-5">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-white font-bold flex items-center gap-2 mb-1">
                        <Send size={18} className="text-[#b9fd5c]" />
                        Ready to Launch?
                      </h3>
                      <p className="text-[#8a8d93] text-sm">
                        {selectedCategory && userCount > 0
                          ? `Your notification will be delivered to ${userCount} users in "${USER_CATEGORIES.find((c) => c.id === selectedCategory)?.name}".`
                          : "Please complete steps 1 and 2 before sending."}
                      </p>
                      {selectedCategory && userCount > 0 && (
                        <p className="text-[#555] text-xs mt-1">
                          Type: {values.notificationType || "Not selected"} •
                          Characters: {values.notificationTitle.length + values.notificationMessage.length}/600
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={
                        isSubmitting || !selectedCategory ||
                        !values.notificationTitle.trim() ||
                        !values.notificationMessage.trim() ||
                        !values.notificationType ||
                        userCount === 0 || sendingStatus === "sending"
                      }
                      className="bg-[#b9fd5c] hover:bg-[#ff7b1c] text-black rounded-xl
                        py-3 px-6 text-sm font-bold transition-colors cursor-pointer
                        disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center gap-2 whitespace-nowrap"
                    >
                      {isSubmitting || sendingStatus === "sending" ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Send to {userCount > 0 ? `${userCount} Users` : "Users"}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Validation Errors */}
                {Object.keys(errors).length > 0 && touched.notificationTitle && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                    <AlertCircle size={18} className="text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white text-sm font-semibold">Please fix the following errors:</p>
                      <ul className="mt-2 space-y-1">
                        {Object.entries(errors).map(([field, error]) => (
                          <li key={field} className="text-yellow-400/80 text-xs">• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </div>

      {/* Info Footer */}
      <InfoFooter />
    </div>
  );
};

export default BulkNotificationManagement;

// ─── Sub Components ─────────────────────────────────────────

const StepHeader = ({ number, title, subtitle }) => (
  <div className="flex items-start gap-3">
    <span className="w-8 h-8 rounded-full bg-[#b9fd5c] text-black text-sm font-bold flex items-center justify-center shrink-0">
      {number}
    </span>
    <div>
      <h3 className="text-white font-bold text-lg">{title}</h3>
      <p className="text-[#8a8d93] text-sm">{subtitle}</p>
    </div>
  </div>
);

const CategoryCard = ({ category, isSelected, userCount, onClick }) => {
  const Icon = category.icon;

  return (
    <button
      onClick={onClick}
      className={`relative text-left w-full p-5 rounded-lg transition-all duration-300
        cursor-pointer group
        ${isSelected
          ? "bg-[#2a2c2f] border-2 border-[#b9fd5c] shadow-lg shadow-[#b9fd5c]/10 -translate-y-1 text-black"
          : "bg-[#282f35] border border-[#2a2c2f] hover:border-[#b9fd5c]/30 hover:-translate-y-0.5"
        }`}
    >
      {isSelected && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#b9fd5c] rounded-t-2xl" />
      )}

      <div className="flex flex-col items-center text-center">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors ${
            isSelected ? "bg-[#b9fd5c]" : "bg-[#111214] group-hover:bg-[#b9fd5c]/10"
          }`}
        >
          <Icon size={24} className={isSelected ? "text-black" : "text-[#b9fd5c]"} />
        </div>

        <h4 className="text-white font-bold text-sm mb-1">{category.name}</h4>
        <p className="text-[#8a8d93] text-xs leading-relaxed">{category.description}</p>

        {isSelected && userCount !== null && (
          <span className="mt-3 bg-[#b9fd5c] text-black text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle size={12} />
            Selected • {userCount} users
          </span>
        )}

        {!isSelected && (
          <span className="mt-3 text-[#555] text-[11px]">Click to select</span>
        )}
      </div>
    </button>
  );
};

const UserPreviewList = ({ users, totalCount }) => (
  <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl p-5 space-y-3">
    <h4 className="text-white font-bold text-sm flex items-center gap-2">
      <Users2 size={16} className="text-[#b9fd5c]" />
      Preview Users ({totalCount} total)
    </h4>

    <div className="space-y-2">
      {users.map((user, index) => (
        <div
          key={user.id || index}
          className="flex items-center gap-3 p-3 bg-[#111214] border border-[#2a2c2f] rounded-xl"
        >
          <div className="w-10 h-10 rounded-full bg-[#b9fd5c] flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user.name?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {user.name || user.username || "Unknown User"}
            </p>
            <p className="text-[#8a8d93] text-xs truncate">
              @{user.username || "unknown"} • {user.email || "No email"}
            </p>
          </div>
          {user.directRefs !== undefined && (
            <div className="text-right shrink-0">
              <span className="bg-[#b9fd5c] text-black text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {user.directRefs} Direct
              </span>
              <p className="text-[#ffffff] text-[10px] mt-1">{user.totalRefs || 0} Total</p>
            </div>
          )}
        </div>
      ))}
    </div>

    {totalCount > 5 && (
      <p className="text-center text-[#555] text-xs">... and {totalCount - 5} more users</p>
    )}
  </div>
);

const FormFieldWrapper = ({ label, icon: Icon, required, optional, children }) => (
  <div>
    <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
      <Icon size={16} className="text-[#b9fd5c]" />
      {label}
      {required && <span className="text-red-400">*</span>}
      {optional && <span className="text-[#555] text-xs font-normal">(Optional)</span>}
    </label>
    {children}
  </div>
);

const NotificationPreview = ({ values }) => (
  <div className="space-y-3">
    <h4 className="text-white font-semibold text-sm flex items-center gap-2">
      <Eye size={16} className="text-[#b9fd5c]" />
      Live Preview
    </h4>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Preview Card */}
      <div className="bg-[#282f35] border-2 border-[#b9fd5c] rounded-2xl overflow-hidden">
        <div className="bg-[#b9fd5c] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs">📢</span>
            <span className="text-white text-sm font-bold">
              {values.notificationType
                ? values.notificationType.charAt(0).toUpperCase() + values.notificationType.slice(1)
                : "Notification"}
            </span>
          </div>
          <span className="text-white/70 text-xs">now</span>
        </div>
        <div className="p-4">
          <h5 className="text-white font-bold text-sm mb-2">
            {values.notificationTitle || "Your notification title will appear here"}
          </h5>
          <p className="text-[#8a8d93] text-xs leading-relaxed">
            {values.notificationMessage || "Your notification message will appear here"}
          </p>
          {values.notificationLink && (
            <button
              type="button"
              className="mt-3 flex items-center gap-1 text-[#b9fd5c] text-xs
                border border-[#b9fd5c]/30 px-3 py-1.5 rounded-lg
                hover:bg-[#b9fd5c]/10 transition-colors cursor-pointer"
            >
              <ExternalLink size={12} />
              Open Link
            </button>
          )}
        </div>
      </div>

      {/* Tips Card */}
      <div className="bg-[#111214] border border-[#2a2c2f] rounded-2xl p-5">
        <h5 className="text-white text-sm font-semibold flex items-center gap-2 mb-3">
          <Info size={14} className="text-[#b9fd5c]" />
          Preview Tips
        </h5>
        <ul className="space-y-2">
          {[
            "Keep titles concise and engaging",
            "Include clear call-to-action in message",
            "Test links before sending",
            "Consider timing for your audience",
          ].map((tip, i) => (
            <li key={i} className="text-[#8a8d93] text-xs">• {tip}</li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

const SendingStatusBanner = ({ status, userCount }) => {
  const config = {
    sending: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      icon: <span className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />,
      title: "Sending notifications...",
      subtitle: `Please wait while we deliver your message to ${userCount} users.`,
      color: "text-blue-400",
    },
    success: {
      bg: "bg-[#0ecb6f]/10",
      border: "border-[#0ecb6f]/20",
      icon: <CheckCircle size={20} className="text-[#0ecb6f]" />,
      title: "Notifications sent successfully!",
      subtitle: "Your message has been delivered to the selected users.",
      color: "text-[#0ecb6f]",
    },
    error: {
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      icon: <AlertCircle size={20} className="text-red-400" />,
      title: "Failed to send notifications",
      subtitle: "There was an error sending your notification. Please try again.",
      color: "text-red-400",
    },
  };

  const c = config[status];
  if (!c) return null;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl ${c.bg} border ${c.border}`}>
      <div className="shrink-0 mt-0.5">{c.icon}</div>
      <div>
        <p className={`text-sm font-semibold ${c.color}`}>{c.title}</p>
        <p className={`text-xs mt-0.5 ${c.color} opacity-70`}>{c.subtitle}</p>
      </div>
    </div>
  );
};

const AlertBanner = ({ type, message }) => {
  const config = {
    error: { bg: "bg-red-500/5", border: "border-red-500/20", icon: <AlertCircle size={16} className="text-red-400" />, text: "text-red-400" },
    warning: { bg: "bg-yellow-500/5", border: "border-yellow-500/20", icon: <Info size={16} className="text-yellow-400" />, text: "text-yellow-400" },
  };
  const c = config[type];

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl ${c.bg} border ${c.border}`}>
      <div className="shrink-0 mt-0.5">{c.icon}</div>
      <p className={`${c.text} text-sm`}>{message}</p>
    </div>
  );
};

const InfoFooter = () => {
  const items = [
    { icon: Clock, title: "Delivery Time", desc: "Notifications are delivered immediately to active users" },
    { icon: Users2, title: "User Status", desc: "Only active users with valid tokens will receive notifications" },
    { icon: RefreshCw, title: "Rate Limits", desc: "Bulk notifications are processed in batches to ensure delivery" },
  ];

  return (
    <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl p-5">
      <h4 className="text-white text-sm font-semibold flex items-center gap-2 mb-4">
        <Info size={16} className="text-[#b9fd5c]" />
        Important Information
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <item.icon size={16} className="text-[#b9fd5c] shrink-0 mt-0.5" />
            <div>
              <p className="text-white text-xs font-semibold">{item.title}</p>
              <p className="text-[#8a8d93] text-xs mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};