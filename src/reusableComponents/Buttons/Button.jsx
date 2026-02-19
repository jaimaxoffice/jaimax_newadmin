// Button.jsx
import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary", 
  size = "md", 
  icon: Icon,
  iconPosition = "left",
  className = "",
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 font-medium 
    transition-all duration-200 cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-95
  `;

// Button.jsx - Updated variants
const variants = {
  primary: "bg-[#b9fd5c] text-black hover:bg-[#a8ec4b] rounded-3xl",
  primaryOrange: "bg-[#b9fd5c] text-black  rounded-3xl", // New
  secondary: "bg-[#2a2c2f] text-white hover:bg-[#333] border border-transparent rounded-xl",
  outline: "bg-transparent border border-[#b9fd5c] text-[#b9fd5c] hover:bg-[#b9fd5c]/10 rounded-xl",
  outlineGray: "bg-[#b9fd5c] border border-[#2a2c2f] text-black hover:bg-[#2a2c2f] rounded-3xl", // New
  ghost: "bg-black/65 backdrop-blur-sm border border-[#b9fd5c] text-[#b9fd5c] hover:bg-black/80 rounded-full",
  icon: "bg-transparent border-transparent p-0 hover:bg-transparent",
  approve: "w-8 h-8 rounded-lg bg-[#b9fd5c]/10 text-[#b9fd5c] hover:bg-[#b9fd5c]/20 p-0",
  hold: "w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 p-0",
  reject: "w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 p-0",
  edit: "w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 p-0",
};

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-xs",
    lg: "px-6 py-3 text-xs",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && iconPosition === "left" && <Icon size={size === "sm" ? 14 : 16} />}
      {children}
      {Icon && iconPosition === "right" && <Icon size={size === "sm" ? 14 : 16} />}
    </button>
  );
};

export default Button;