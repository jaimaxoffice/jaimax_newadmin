import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "./loginApiSlice";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    loginEmail: "",
    loginPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [type, setType] = useState("password");
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  const togglePassword = () => {
    setType(type === "password" ? "text" : "password");
  };

  let permissions = [];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const validate = () => {
    let formErrors = {};
    const emailRegex =
      /^[^\W_](?:[\w.-]*[^\W_])?@(?:\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.|(?:[\w-]+\.)+)(?:[a-zA-Z]{2,3}|[0-9]{1,3})\]?$/gm;

    if (!formData.loginEmail) {
      formErrors.loginEmail = "Email is required";
    } else if (!emailRegex.test(formData.loginEmail)) {
      formErrors.loginEmail = "Invalid email format";
    }

    if (!formData.loginPassword) {
      formErrors.loginPassword = "Password is required";
    } else if (formData.loginPassword.length < 6) {
      formErrors.loginPassword = "Password must be at least 6 characters";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const response = await login({
          email: formData.loginEmail,
          password: formData.loginPassword,
          role: 0,
        }).unwrap();

        toast.success(`${response?.message}`, {
          position: "top-center",
        });

        setRefresh(true);
        localStorage.setItem("token", response?.data?.token);
        localStorage.setItem("userData", JSON.stringify(response));
        localStorage.setItem("username", response?.data?.username);

        const userDataString = localStorage.getItem("userData");
        localStorage.setItem("permissions", permissions);

        const userData = JSON.parse(userDataString);
        permissions = userData?.data?.permissions;

        const isKycS = permissions?.includes("KYC MANAGEMENT");
        const isWalletS = permissions?.includes("WALLET MANAGEMENT");
        const isWithdrawalS = permissions?.includes("WITHDRAW MANAGEMENT");

        setRefresh(true);
        localStorage.setItem("User Roles", isKycS);

        if (isKycS && isWalletS && !isWithdrawalS) {
          setTimeout(() => {
            setRefresh(true);
            navigate("/kyc-management");
          }, 1000);
        } else if (!isKycS && isWalletS && isWithdrawalS) {
          setRefresh(true);
          setTimeout(() => {
            navigate("/withdrawal");
          }, 1000);
        } else if (isKycS && !isWalletS && isWithdrawalS) {
          setRefresh(true);
          setTimeout(() => {
            navigate("/kyc-management");
          }, 1000);
        } else if (isKycS && !isWalletS && !isWithdrawalS) {
          setRefresh(true);
          setTimeout(() => {
            navigate("/kyc-management");
          }, 1000);
        } else if (!isKycS && isWalletS && !isWithdrawalS) {
          setRefresh(true);
          setTimeout(() => {
            navigate("/wallet-management");
          }, 1000);
        } else if (!isKycS && !isWalletS && isWithdrawalS) {
          setRefresh(true);
          setTimeout(() => {
            navigate("/withdrawal");
          }, 1000);
        } else if (isKycS && isWalletS && isWithdrawalS) {
          setRefresh(true);
          setTimeout(() => {
            navigate("/kyc-management");
          }, 1000);
        } else {
          setRefresh(true);
          setTimeout(() => {
            navigate("/");
          }, 1000);
        }
      } catch (error) {
        console.log(error);
        toast.error(`${error?.data?.message}`, {
          position: "top-center",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#111214] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-2xl p-6 sm:p-8">

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">
              Welcome to Jaimax Coin
            </h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-[#8a8d93] mb-2">
                Email Id
              </label>
              <input
                type="email"
                name="loginEmail"
                autoComplete="off"
                placeholder="admin@jaimax.com"
                value={formData.loginEmail}
                onChange={handleChange}
                className={`w-full bg-[#111214] border ${
                  errors.loginEmail
                    ? "border-red-500/50"
                    : "border-[#2a2c2f] focus:border-[#b9fd5c]"
                } text-white placeholder-[#555] rounded-xl py-3 px-4 text-sm
                  focus:outline-none focus:ring-1 focus:ring-[#b9fd5c]/50 transition-colors`}
              />
              {errors.loginEmail && (
                <p className="mt-1.5 text-xs text-red-400">
                  {errors.loginEmail}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8a8d93] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={type}
                  name="loginPassword"
                  autoComplete="off"
                  placeholder="••••••••"
                  value={formData.loginPassword}
                  onChange={handleChange}
                  className={`w-full bg-[#111214] border ${
                    errors.loginPassword
                      ? "border-red-500/50"
                      : "border-[#2a2c2f] focus:border-[#b9fd5c]"
                  } text-white placeholder-[#555] rounded-xl py-3 px-4 pr-16 text-sm
                    focus:outline-none focus:ring-1 focus:ring-[#b9fd5c]/50 transition-colors`}
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center 
                    text-[#8a8d93] hover:text-[#b9fd5c] text-xs font-medium 
                    transition-colors cursor-pointer"
                >
                  {type === "password" ? "Show" : "Hide"}
                </button>
              </div>
              {errors.loginPassword && (
                <p className="mt-1.5 text-xs text-red-400">
                  {errors.loginPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#b9fd5c] hover:bg-[#b9fd5c]/90 
                disabled:bg-[#b9fd5c]/50 disabled:cursor-not-allowed
                text-[#111214] font-semibold py-3.5 rounded-full 
                transition-all duration-200 cursor-pointer text-sm"
            >
              {isLoading ? "Loading..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;


