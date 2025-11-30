// src/components/common/Logo.jsx
import React from "react";

/**
 * MessMate Logo Component
 * Professional, minimal logo representing a mess/dining app
 * Features: Fork & Spoon icon in a clean circular design
 */

function Logo({ size = "md", showText = true, className = "" }) {
  const sizeClasses = {
    xs: { container: "h-6 w-6", text: "text-base" },
    sm: { container: "h-8 w-8", text: "text-lg" },
    md: { container: "h-10 w-10", text: "text-xl" },
    lg: { container: "h-12 w-12", text: "text-2xl" },
    xl: { container: "h-16 w-16", text: "text-3xl" },
  };

  const textSizeClasses = {
    xs: "text-sm",
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const { container, text: iconSize } = sizeClasses[size] || sizeClasses.md;
  const textSize = textSizeClasses[size] || textSizeClasses.md;

  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo Icon - Fork & Spoon in Circle */}
      <div
        className={`${container} ${
          showText ? "mr-3" : ""
        } rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={`${iconSize.replace("text-", "w-")} ${iconSize.replace(
            "text-",
            "h-"
          )} text-white`}
          style={{ width: "60%", height: "60%" }}
        >
          {/* Fork */}
          <path
            d="M7 2v7c0 .55.45 1 1 1h1v11c0 .55.45 1 1 1s1-.45 1-1V10h1c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1v5H9V2c0-.55-.45-1-1-1s-1 .45-1 1z"
            fill="currentColor"
            opacity="0.9"
          />
          {/* Spoon */}
          <path
            d="M15.84 3.15c-.98-.98-2.49-1.17-3.37-.29-.88.88-.69 2.39.29 3.37.76.76 1.83 1.03 2.75.77V21c0 .55.45 1 1 1s1-.45 1-1V7c-.26-.92-.01-1.99-.67-2.85z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Logo Text */}
      {showText && (
        <span
          className={`${textSize} font-bold bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent whitespace-nowrap`}
        >
          MessMate
        </span>
      )}
    </div>
  );
}

export default Logo;
