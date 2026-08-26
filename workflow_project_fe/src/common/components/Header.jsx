import { useState } from "react";
import "../styles/Header.css";

function Header() {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const menus = [
    {
      id: "dashboard",
      label: "대시보드",
      icon: "⌂",
      path: "/",
    },
    {
      id: "workcation",
      label: "워케이션 신청",
      icon: "▣",
      path: "/workcation",
    },
    {
      id: "task",
      label: "업무 관리",
      icon: "☷",
      path: "/task",
    },
    {
      id: "expense",
      label: "비용 관리",
      icon: "₩",
      path: "/expense",
    },
    {
      id: "leave",
      label: "근태 관리",
      icon: "▣",
      path: "/attendance",
    },
    {
      id: "notice",
      label: "공지사항",
      icon: "♢",
      path: "/notice",
    },
    {
      id: "place",
      label: "장소/거점",
      icon: "⌖",
      path: "/place",
    },
  ];

  const handleMenuClick = (menu) => {
    setActiveMenu(menu.id);
    // React Router를 사용한다면 navigate(menu.path) 사용
  };

  return (
    <header className="wf-header">
      <div className="wf-header-inner">

        {/* Logo */}
        <div className="wf-logo">
          <div className="wf-logo-mark">
            <span className="logo-w logo-w-blue">W</span>
          </div>

          <span className="wf-logo-text">WorkFlow</span>
        </div>

        {/* Navigation */}
        <nav className="wf-nav">
          {menus.map((menu) => (
            <button
              key={menu.id}
              className={`wf-nav-item ${
                activeMenu === menu.id ? "active" : ""
              }`}
              onClick={() => handleMenuClick(menu)}
            >
              <span className="wf-nav-icon">{menu.icon}</span>
              <span>{menu.label}</span>
            </button>
          ))}
        </nav>

        {/* Header Right */}
        <div className="wf-header-actions">

          {/* Notification */}
          <button className="wf-notification">
            <span className="notification-icon">♧</span>
            <span className="notification-badge">3</span>
          </button>

          {/* Profile */}
          <button className="wf-profile">
            <div className="wf-profile-image">
              김
            </div>

            <div className="wf-profile-info">
              <div className="wf-profile-name">
                김민준 <span>사원</span>
              </div>

              <div className="wf-profile-department">
                마케팅팀
              </div>
            </div>

            <span className="wf-profile-arrow">⌄</span>
          </button>

        </div>
      </div>
    </header>
  );
}

export default Header;
