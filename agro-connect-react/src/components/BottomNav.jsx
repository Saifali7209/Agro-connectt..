import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import Icon from "./Icon.jsx";
import { BOTTOM_NAV } from "../config/navigation.js";

/**
 * Mobile bottom navigation. `has-bottom-nav` is added to <body> while mounted
 * and removed on unmount, so the responsive.css padding rule behaves exactly as
 * it did before but no longer leaks between layouts.
 */
export default function BottomNav({ variant = "public" }) {
  const items = BOTTOM_NAV[variant] || BOTTOM_NAV.public;

  useEffect(() => {
    document.body.classList.add("has-bottom-nav");
    return () => document.body.classList.remove("has-bottom-nav");
  }, []);

  return (
    <nav className="bottom-nav" aria-label="Quick navigation">
      {items.map((i) => (
        <NavLink key={i.key} to={i.to} end={i.to === "/"}>
          <Icon name={i.icon} />
          <span>{i.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
