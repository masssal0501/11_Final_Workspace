import { useState } from "react";
import "../styles/Header.css";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../employee/api/employeeApi";

function Header() {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const navigate = useNavigate();

    const handleLogout = async () => {

        try {

            await logout();

        } catch (error) {

            console.error(
                "로그아웃 API 실패:",
                error
            );

        } finally {

            // JWT 삭제
            localStorage.removeItem(
                "accessToken"
            );

            // 사용자 정보 삭제
            localStorage.removeItem(
                "user"
            );

            navigate("/login");
        }
    };

  const menus = [
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
      id: "amount",
      label: "비용 관리",
      icon: "₩",
      path: "/amount",
    },
    {
      id: "notice",
      label: "공지사항",
      icon: "♢",
      path: "/notice",
    },
    {
      id: "hub",
      label: "장소/거점",
      icon: "⌖",
      path: "/hub",
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
          <Link to="/">
            <div className="wf-logo-mark">
              <span className="logo-w logo-w-blue">W</span>
            </div>
          </Link>
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
          {/* <button className="wf-notification">
            <span className="notification-icon">♧</span>
            <span className="notification-badge">3</span>
          </button> */}

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