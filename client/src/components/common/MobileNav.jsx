// src/components/common/MobileNav.jsx
import {
  BellIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  HomeIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import useNotifications from "../../hooks/useNotifications";

const MobileNav = () => {
  const { unreadCount = 0 } = useNotifications?.() || {};
  const [supportsVibrate, setSupportsVibrate] = useState(false);

  useEffect(() => {
    setSupportsVibrate(
      typeof navigator !== "undefined" && "vibrate" in navigator
    );
  }, []);

  const handleTap = () => {
    if (supportsVibrate) {
      try {
        navigator.vibrate?.(10);
      } catch {}
    }
  };

  // Limit to five items to prevent wrapping on small screens
  const items = [
    { to: "/dashboard", label: "Home", icon: HomeIcon },
    { to: "/menu", label: "Menu", icon: Squares2X2Icon },
    { to: "/bookings", label: "Bookings", icon: CalendarDaysIcon },
    { to: "/wallet", label: "Wallet", icon: CreditCardIcon },
    {
      to: "/notifications",
      label: "Alerts",
      icon: BellIcon,
      badge: unreadCount,
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 lg:hidden safe-pb shadow-sm">
      <div className="grid grid-cols-5">
        {items.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            onClick={handleTap}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 text-xs ${
                isActive ? "text-blue-600" : "text-gray-600"
              }`
            }
          >
            <span className="relative">
              <Icon className="h-6 w-6 mb-1" />
              {typeof badge === "number" && badge > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full">
                  {Math.min(badge, 99)}
                </span>
              )}
            </span>
            <span className="leading-tight">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
