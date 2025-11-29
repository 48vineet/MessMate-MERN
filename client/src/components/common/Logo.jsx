// src/components/common/Logo.jsx
import LogoImage from "../../assets/Logo.png";

/**
 * MessMate Logo Component
 * Uses the actual Logo.png from assets
 */
const Logo = ({ size = "md", showText = true, className = "" }) => {
  const sizeClasses = {
    sm: "h-8 w-auto",
    md: "h-10 w-auto",
    lg: "h-12 w-auto",
    xl: "h-16 w-auto",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const iconSize = sizeClasses[size] || sizeClasses.md;
  const textSize = textSizeClasses[size] || textSizeClasses.md;

  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo Image */}
      <div className={showText ? "mr-3" : ""}>
        <img
          src={LogoImage}
          alt="MessMate Logo"
          className={`${iconSize} object-contain`}
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>
      {/* Logo Text */}
      {showText && (
        <span
          className={`${textSize} font-bold text-gray-900 whitespace-nowrap`}
        >
          MessMate
        </span>
      )}
    </div>
  );
};

export default Logo;
