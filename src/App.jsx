import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Dashboard from "./Features/Dashboard/Dashboard";
import Login from "./Features/Login/Login";
import Wallet from "./Features/Wallet/Wallet";
import Withdrawal from "./Features/Withdrawal/Withdrawal";
import Users from "./Features/Users/UsersManagemnet";
import Kyc from "./Features/Kyc/KycManagement";
import Ico from "./Features/ICO/Ico";
import AddManualAccountsForm from "./Features/ManualAccounts/ManualAccounts";
import ManualKycAccounts from "./Features/ManualKyc/ManualKyc";
import TeamReports from "./Features/TeamReports/TeamReports";
import TeamInvestments from "./Features/TeamInvestments/TeamInvestments";
import UserInfo from "./Features/UserInfo/UserInfo";
import WealthPlan1 from "./Features/WealthPlans/WealthPlan1/WealthPlan1";
import WealthPlan2 from "./Features/WealthPlans/WealthPlan2/WealthPlan2";
import WealthPlan3 from "./Features/WealthPlans/WealthPlan3/WealthPlan3";
import AdminUser from "./Features/AdminManagement/AdminManagement"
import Announcements from "./Features/Announcements/Announcements"
import Notifications from "./Features/Notifications/Notifications"
import ZoomMeeting from "./Features/Zoom/Zoom";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/withdrawal" element={<Withdrawal />} />
          <Route path="/users" element={<Users />} />
          <Route path="/ico" element={<Ico />} />
          <Route path="/manual-accounts" element={<AddManualAccountsForm />} />
          <Route path="/kyc" element={<Kyc />} />
          <Route path="/manual-kyc" element={<ManualKycAccounts />} />
          <Route path="/team-reports" element={<TeamReports />} />
          <Route path="/team-investments" element={<TeamInvestments />} />
          <Route path="/user-info" element={<UserInfo />} />
          <Route path="/wealth-plan-1" element={<WealthPlan1 />} />
          <Route path="/wealth-plan-2" element={<WealthPlan2 />} />
          <Route path="/wealth-plan-3" element={<WealthPlan3 />} />
          <Route path="/admin-user" element={<AdminUser />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/zoommeetings" element={<ZoomMeeting />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
