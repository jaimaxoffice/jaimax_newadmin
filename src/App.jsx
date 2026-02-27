
import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie"
// Auth & Layout
import Login from "./Features/Login/Login";
import AppLayout from "./layout/AppLayout";
import NoAccess from "./Features/NoAccess/NoAccess";
import PrivateRoute from "./router/PrivateRoute";
import PublicRoute from "./router/PublicRoute";

// Dashboard
import Dashboard from "./Features/Dashboard/Dashboard";

// User Management
import Users from "./Features/Users/UsersManagemnet";
import UserInfo from "./Features/UserInfo/UserInfo";
import AdminUser from "./Features/AdminManagement/AdminManagement";
import DeletedUsersTable from "./Features/DeleteAccounts/DeleteAccounts";
import NotVerifiedUser from "./Features/NotVerified/NotVerified";

// Financial
import Wallet from "./Features/Wallet/Wallet";
import Withdrawal from "./Features/Withdrawal/Withdrawal";
import UsdtWithdrawal from "./Features/UsdtBonus/UsdtWithdrawal";
import AvailableBalance from "./Features/AvailableBalance/AvailableBalance";

// KYC
import Kyc from "./Features/Kyc/KycManagement";
import ManualKycAccounts from "./Features/ManualKyc/ManualKyc";

// Transactions
import AllTransactions from "./Features/Alltransactions/Alltransactions";
import PaymentGatewaysTransactions from "./Features/PaymentgatewayTransactions/PaymentGateTnx";
import PaymentGateway from "./Features/PaymentGateway/PaymentGateway";
import BuyHistory from "./Features/BuyHistory/BuyHistory";

// ICO
import Ico from "./Features/ICO/Ico";

// Wealth Plans
import WealthPlan1 from "./Features/WealthPlans/WealthPlan1/WealthPlan1";
import WealthPlanlog from "./Features/WealthPlans/WealthPlan1/WealthPLanlogs";
import WealthPlan2 from "./Features/WealthPlans/WealthPlan2/WealthPlan2";
import WealthPlanlog2 from "./Features/WealthPlans/WealthPlan2/WealthPlanlogs2";
import WealthPlan3 from "./Features/WealthPlans/WealthPlan3/WealthPlan3";
import WealthPlanlog3 from "./Features/WealthPlans/WealthPlan3/WealthPLanlogs3";

// Bonus
import GradualLayerBonusLogs from "./Features/GradualBonus/GradualBonus";
import BonusCoinHistory from "./Features/BonusCoinHistory/BonusCoinHistory";

// Manual
import AddManualAccountsForm from "./Features/ManualAccounts/ManualAccounts";

// Reports
import TeamReports from "./Features/TeamReports/TeamReports";
import TeamInvestments from "./Features/TeamInvestments/TeamInvestments";
import Report from "./Features/Reports/Reports";
import BusinessAnalytics from "./Features/BusinessAnalytics/BusinessAnalytics";

// Notifications & Content
import Announcements from "./Features/Announcements/Announcements";
import Notifications from "./Features/Notifications/Notifications";
import ZoomMeeting from "./Features/Zoom/Zoom";
import Blog from "./Features/Blogs/Blogs";
import SocialMedia from "./Features/SocialMediaChart/SocialChart";
import MainChat from "./Features/Community/MainChat"
// Support & Settings
import Support from "./Features/Support/Support";
import SupportChart from "./Features/Support/SupportChat"
import Security from "./Features/Security/Security";
import Settings from "./Features/Settings/Settings";
import FreezedGroups from "./Features/FreezedGroups/FreezedGroups";
import Logout from "./Features/Logout/Logout";


//accountsDashboard
import AccountsDashboard from "./Accountant/Dashboard/Dashboard";
import Credits from "./Accountant/Credits/Credits";
import Debits from "./Accountant/Debits/Debits";
import TransactionInfo from "./Accountant/TransactionInfo/TransactionInfo";
import AccountantWithdrawal from "./Accountant/Withdrawal/Withdrawal";
import Expenses from "./Accountant/Expensenses/Expenses"
import UserSummary from "./Features/Users/UserSummary";
// Permission-based Route Component
const PermissionRoute = ({ element, permission, permissions }) => {
  if (!permission || permissions?.includes(permission)) return element;
  return <NoAccess />;
};

// ─── ADMIN ROUTES (role === 0) ───
const ADMIN_ROUTES = [
  { path: "/", element: <Dashboard /> },
  { path: "/wallet-management", element: <Wallet /> },
  { path: "/user-management", element: <Users /> },
  { path: "/kyc-management", element: <Kyc /> },
  { path: "/withdrawal-bonus", element: <Withdrawal /> },
  { path: "/usdt-withdrawal", element: <UsdtWithdrawal /> },
  { path: "/user-info", element: <UserInfo /> },
  { path: "/admin-users", element: <AdminUser /> },
  { path: "/all-wallet-transactions", element: <AllTransactions /> },
  { path: "/pg-transactions", element: <PaymentGatewaysTransactions /> },
  { path: "/payment-gateway", element: <PaymentGateway /> },
  { path: "/buy-history", element: <BuyHistory /> },
  { path: "/manual-accounts", element: <AddManualAccountsForm /> },
  { path: "/manual-kyc", element: <ManualKycAccounts /> },
  { path: "/team-reports", element: <TeamReports /> },
  { path: "/reports", element: <Report /> },
  { path: "/team-investments", element: <TeamInvestments /> },
  { path: "/gradual-bonus", element: <GradualLayerBonusLogs /> },
  { path: "/bonus-coin-history", element: <BonusCoinHistory /> },
  { path: "/available-balance", element: <AvailableBalance /> },
  { path: "/wealth-plan-1", element: <WealthPlan1 /> },
  { path: "/wealth-plan-log-1", element: <WealthPlanlog /> },
  { path: "/wealth-plan-2", element: <WealthPlan2 /> },
  { path: "/wealth-plan-log-2", element: <WealthPlanlog2 /> },
  { path: "/wealth-plan-3", element: <WealthPlan3 /> },
  { path: "/wealth-plan-log-3", element: <WealthPlanlog3 /> },
  { path: "/announcements", element: <Announcements /> },
  { path: "/notifications", element: <Notifications /> },
  { path: "/zoom-meetings", element: <ZoomMeeting /> },
  { path: "/blogs", element: <Blog /> },
  { path: "/support", element: <Support /> },
  {path: "/support-chart/:id",element:<SupportChart/>},
  { path: "/legal", element: <Security /> },
  { path: "/freezed-groups", element: <FreezedGroups /> },
  { path: "/not-verified-users", element: <NotVerifiedUser /> },
  { path: "/ico-management", element: <Ico /> },
  { path: "/delete-accounts", element: <DeletedUsersTable /> },
  { path: "/settings", element: <Settings /> },
  { path: "/logout", element: <Logout /> },
  { path: "/businessanalytics", element: <BusinessAnalytics /> },
  { path: "/social-media", element: <SocialMedia /> },
  { path: "/user-summary", element: <UserSummary /> },
  { path: "/jaimax-community", element: <MainChat /> },
];

// ─── SUB-ADMIN ROUTES (role === 2) ───
const ROLE2_ROUTES = [
  { path: "/", element: <Dashboard />, permission: "DASHBOARD" },
  { path: "/wallet-management", element: <Wallet />, permission: "WALLET MANAGEMENT" },
  { path: "/user-management", element: <NoAccess /> },
  { path: "/kyc-management", element: <Kyc />, permission: "KYC MANAGEMENT" },
  { path: "/withdrawal-bonus", element: <Withdrawal />, permission: "WITHDRAW MANAGEMENT" },
  { path: "/usdt-withdrawal", element: <UsdtWithdrawal />, permission: "WITHDRAW MANAGEMENT" },
  { path: "/user-info", element: <UserInfo />, permission: "USER INFO" },
  { path: "/admin-users", element: <NoAccess /> },
  { path: "/user-summary", element: <UserSummary />,permission: "USER INFO" },
  { path: "/all-wallet-transactions", element: <AllTransactions />, permission: "WALLET MANAGEMENT" },
  {path: "/pg-transactions",element: <PaymentGatewaysTransactions />,permission: "WALLET MANAGEMENT",},
  { path: "/payment-gateway", element: <PaymentGateway />, permission: "PAYMENTGATEWAYS" },
  { path: "/buy-history", element: <BuyHistory />, permission: "BUY HISTORY" },
  {path: "/manual-accounts",element: <AddManualAccountsForm />,permission: "MANUAL TRANSACTION",},
  { path: "/manual-kyc", element: <ManualKycAccounts />, permission: "MANUAL KYC" },
  { path: "/team-reports", element: <TeamReports />, permission: "TEAM REPORT" },
  { path: "/team-investments", element: <TeamInvestments />, permission: "TEAM REPORT" },
  { path: "/gradual-bonus", element: <GradualLayerBonusLogs />, permission: "GRADUAL BONUS" },
  { path: "/bonus-coin-history", element: <BonusCoinHistory />, permission: "SUPER BONUS" },
  { path: "/available-balance", element: <AvailableBalance />, permission: "AVAILABLE BALANCE" },
  { path: "/wealth-plan-1", element: <WealthPlan1 />, permission: "WEALTH PLANS" },
  { path: "/wealth-plan-log-1", element: <WealthPlanlog />, permission: "WEALTH PLANS" },
  { path: "/wealth-plan-2", element: <WealthPlan2 />, permission: "WEALTH PLANS" },
  { path: "/wealth-plan-log-2", element: <WealthPlanlog2 />, permission: "WEALTH PLANS" },
  { path: "/wealth-plan-3", element: <WealthPlan3 />, permission: "WEALTH PLANS" },
  { path: "/wealth-plan-log-3", element: <WealthPlanlog3 />, permission: "WEALTH PLANS" },
  { path: "/announcements", element: <Announcements />, permission: "APP ANNOUNCEMENTS" },
  { path: "/notifications", element: <Notifications />, permission: "NOTIFICATIONS" },
  { path: "/zoom-meetings", element: <ZoomMeeting />, permission: "ZOOM MEETING" },
  { path: "/blogs", element: <Blog />, permission: "BLOGS" },
  { path: "/support", element: <Support />, permission: "SUPPORT" },
  { path: "/legal", element: <Security />, permission: "LEGAL UPDATION" },
  { path: "/freezed-groups", element: <FreezedGroups />, permission: "FREEZED GROUPS" },
  { path: "/not-verified-users", element: <NotVerifiedUser />, permission: "NOT VERIFIED USERS" },
  { path: "/ico-management", element: <Ico />, permission: "ICO MANAGEMENT" },
  { path: "/social-media", element: <NoAccess /> },
  { path: "/delete-accounts", element: <DeletedUsersTable />, permission: "DELETE ACCOUNTS" },
  { path: "/settings", element: <Settings />, permission: "SETTING" },
  { path: "/logout", element: <Logout /> },
  { path: "/jaimax-community", element: <MainChat /> },
  { path: "/businessanalytics", element: <BusinessAnalytics />,permission: "BUSINESS ANALYTICS" },
  { path: "/reports", element: <Report />, permission: "REPORTS" },
];


const ACCOUNTANT_ROUTES = [
  { path: "/", element: <AccountsDashboard /> },
  { path: "/credits", element: <Credits /> },
  { path: "/debits", element: <Debits /> },
  { path: "/transactionInfo", element: <TransactionInfo /> },
  { path: "/withdrawal", element: <AccountantWithdrawal /> },
  { path: "/expenses", element: <Expenses /> },
  { path: "/logout", element: <Logout /> },
];

const App = () => {
 // ✅ FIX
const adminToken = Cookies.get("adminToken");
const stored = Cookies.get("adminUserData");
const parsed = stored ? JSON.parse(stored) : {};
const { role, permissions = [] } = parsed?.data || {};
  const renderRoutes = (routes, checkPermissions = false) =>
    routes.map(({ path, element, permission }) => (
      <Route
        key={path}
        path={path}
        element={
          checkPermissions ? (
            <PermissionRoute
              element={element}
              permission={permission}
              permissions={permissions}
            />
          ) : (
            element
          )
        }
      />
    ));

  const getRoutesByRole = () => {
    switch (role) {
      case 0:
        return renderRoutes(ADMIN_ROUTES);
      case 2:
        return renderRoutes(ROLE2_ROUTES, true);
      case 3:
        return renderRoutes(ACCOUNTANT_ROUTES);
      default:
        return null;
    }
  };

  const privateRoutes = getRoutesByRole();

  return (
    <>
      {/* <ToastContainer /> */}
      <Routes>
        {/* Public */}
        <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

        {/* Private - wrapped in AppLayout */}
        {adminToken && privateRoutes && (
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>{privateRoutes}</Route>
        </Route>
      )}

        {/* Fallback */}
       <Route
        path="*"
        element={<Navigate to={adminToken ? "/" : "/login"} replace />}
      />
      </Routes>
    </>
  );
};

export default App;