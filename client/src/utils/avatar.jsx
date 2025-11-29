// src/utils/avatar.jsx
// WhatsApp-style avatar utility for generating consistent colorful default avatars

/**
 * Predefined color combinations for default avatars
 * Similar to WhatsApp's color palette - vibrant and distinct
 */
const AVATAR_COLORS = [
  { bg: "bg-blue-500", text: "text-white" },
  { bg: "bg-green-500", text: "text-white" },
  { bg: "bg-yellow-500", text: "text-gray-900" },
  { bg: "bg-red-500", text: "text-white" },
  { bg: "bg-purple-500", text: "text-white" },
  { bg: "bg-pink-500", text: "text-white" },
  { bg: "bg-indigo-500", text: "text-white" },
  { bg: "bg-teal-500", text: "text-white" },
  { bg: "bg-orange-500", text: "text-white" },
  { bg: "bg-cyan-500", text: "text-white" },
  { bg: "bg-emerald-500", text: "text-white" },
  { bg: "bg-rose-500", text: "text-white" },
  { bg: "bg-violet-500", text: "text-white" },
  { bg: "bg-fuchsia-500", text: "text-white" },
  { bg: "bg-lime-500", text: "text-gray-900" },
  { bg: "bg-amber-500", text: "text-gray-900" },
];

/**
 * Generate a consistent color index based on a string (name/email)
 * Same input will always produce same color
 */
const getColorIndex = (str) => {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % AVATAR_COLORS.length;
};

/**
 * Get the first letter(s) for the avatar
 */
export const getAvatarInitials = (name) => {
  if (!name) return "?";

  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  // Return first letter of first and last name
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Get WhatsApp-style color scheme for a user
 */
export const getAvatarColor = (name, email) => {
  const identifier = name || email || "default";
  const colorIndex = getColorIndex(identifier);
  return AVATAR_COLORS[colorIndex];
};

/**
 * Get avatar URL or return null if not available
 */
export const getAvatarUrl = (user) => {
  if (!user) return null;
  return user.avatar?.url || user.avatarUrl || null;
};

/**
 * Complete avatar props for rendering
 */
export const getAvatarProps = (user) => {
  const avatarUrl = getAvatarUrl(user);
  const name = user?.name || user?.userName || "User";
  const email = user?.email || "";

  return {
    url: avatarUrl,
    initials: getAvatarInitials(name),
    colors: getAvatarColor(name, email),
    name: name,
  };
};
