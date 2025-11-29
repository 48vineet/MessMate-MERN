// src/components/common/Avatar.jsx
import { getAvatarProps } from "../../utils/avatar";

/**
 * Avatar Component - WhatsApp-style user avatars
 * Shows user's profile picture if available, otherwise shows colorful initials
 *
 * @param {Object} user - User object with name, email, avatar
 * @param {string} size - Size variant: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
 * @param {string} className - Additional CSS classes
 * @param {boolean} border - Whether to show border
 */
const Avatar = ({ user, size = "md", className = "", border = false }) => {
  const avatarData = getAvatarProps(user);

  // Size mappings
  const sizeClasses = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
    xl: "h-16 w-16 text-xl",
    "2xl": "h-20 w-20 text-2xl",
  };

  const borderClass = border ? "ring-2 ring-white ring-offset-2" : "";
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`
        ${sizeClass}
        rounded-full flex items-center justify-center flex-shrink-0
        ${
          avatarData.url
            ? ""
            : `${avatarData.colors.bg} ${avatarData.colors.text}`
        }
        ${borderClass}
        ${className}
        overflow-hidden
      `}
      title={avatarData.name}
    >
      {avatarData.url ? (
        <img
          src={avatarData.url}
          alt={avatarData.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-semibold select-none">{avatarData.initials}</span>
      )}
    </div>
  );
};

export default Avatar;
