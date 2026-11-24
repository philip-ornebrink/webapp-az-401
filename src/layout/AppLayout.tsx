import { NavLink, Outlet } from "react-router";

const navItems = [
  { to: "/", label: "Objectives", end: true },
  { to: "/progress", label: "Progress", end: false },
];

export function AppLayout() {
  return (
    <div className="app">
      <header className="app-header">
        <NavLink to="/" className="app-title">
          AZ-401 study tracker
        </NavLink>
        <nav aria-label="Main">
          <ul className="app-nav">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
