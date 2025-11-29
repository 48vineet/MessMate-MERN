// src/utils/avatar.jsx
// WhatsApp-style avatar utility for generating consistent colorful default avatars

/**
 * WhatsApp-inspired solid color palette for default avatars
 * Clean, minimal, and modern - single solid colors with white text
 */
const AVATAR_COLORS = [
  { bg: "#00A884", text: "#FFFFFF" }, // WhatsApp Green
  { bg: "#0088CC", text: "#FFFFFF" }, // Telegram Blue
  { bg: "#FF6B6B", text: "#FFFFFF" }, // Coral Red
  { bg: "#4ECDC4", text: "#FFFFFF" }, // Turquoise
  { bg: "#A463F2", text: "#FFFFFF" }, // Purple
  { bg: "#FF9F43", text: "#FFFFFF" }, // Orange
  { bg: "#5F27CD", text: "#FFFFFF" }, // Deep Purple
  { bg: "#00D2D3", text: "#FFFFFF" }, // Cyan
  { bg: "#EE5A6F", text: "#FFFFFF" }, // Pink
  { bg: "#FD79A8", text: "#FFFFFF" }, // Light Pink
  { bg: "#FDCB6E", text: "#2D3436" }, // Yellow
  { bg: "#6C5CE7", text: "#FFFFFF" }, // Indigo
  { bg: "#00B894", text: "#FFFFFF" }, // Mint Green
  { bg: "#0984E3", text: "#FFFFFF" }, // Bright Blue
  { bg: "#D63031", text: "#FFFFFF" }, // Red
  { bg: "#E17055", text: "#FFFFFF" }, // Terracotta
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
