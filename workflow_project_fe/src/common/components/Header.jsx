import { useEffect, useState } from "react";
import "../styles/Header.css";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../employee/api/employeeApi";

function Header() {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const navigate = useNavigate();

  // 프로필 드롭다운
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // 로그인 사용자
  const [user, setUser] = useState(null);

  // 로그인 사용자 정보 가져오기
  useEffect(() => {

    const savedUser = localStorage.getItem("user");

    if (savedUser) {

      try {

        const parsedUser = JSON.parse(savedUser);

        setUser(parsedUser);

      } catch (error) {

        console.error(
          "사용자 정보 불러오기 실패:",
          error
        );

      }
    }

  }, []);


  // 로그아웃
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
      localStorage.removeItem("accessToken");

      // 사용자 정보 삭제
      localStorage.removeItem("user");

      // 로그인 페이지 이동
      navigate("/login");
    }
  };


  // 마이페이지 이동
  const handleMyPage = () => {

    setIsProfileOpen(false);

    navigate("/mypage");
  };


  // 메뉴
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


  // 메뉴 클릭
  const handleMenuClick = (menu) => {

    setActiveMenu(menu.id);

    navigate(menu.path);
  };


  /*
   * 권한 코드 → 화면에 표시할 명칭
   */
  const getAuthName = (authCode) => {

    switch (authCode) {

      case "ADMIN":
        return "관리자";

      case "MANAGER":
        return "부서장";

      case "STAFF":
        return "사원";

      default:
        return "";
    }
  };


  /*
   * 부서 코드 → 화면에 표시할 부서명
   *
   * 현재 DB의 department 데이터에 맞춰 수정하면 됨
   */
  const getDepartmentName = (depId) => {

    switch (depId) {

      case "D1":
        return "기획";

      case "D2":
        return "디자인";

      case "D3":
        return "FE 개발";

      case "D4":
        return "BE 개발";

      case "D5":
        return "데이터";

      case "D6":
        return "QA";

      default:
        return "";
    }
  };


  return (

    <header className="wf-header">

      <div className="wf-header-inner">


        {/* =========================
            Logo
        ========================= */}

        <div className="wf-logo">

          <Link to="/">

            <div className="wf-logo-mark">

              <span className="logo-w logo-w-blue">
                W
              </span>

            </div>

          </Link>

          <span className="wf-logo-text">
            WorkFlow
          </span>

        </div>


        {/* =========================
            Navigation
        ========================= */}

        <nav className="wf-nav">

          {menus.map((menu) => (

            <button
              key={menu.id}
              className={`wf-nav-item ${
                activeMenu === menu.id
                  ? "active"
                  : ""
              }`}
              onClick={() => handleMenuClick(menu)}
            >

              <span className="wf-nav-icon">
                {menu.icon}
              </span>

              <span>
                {menu.label}
              </span>

            </button>

          ))}

        </nav>


        {/* =========================
            Header Right
        ========================= */}

        <div className="wf-header-actions">


          {/* =========================
              Profile
          ========================= */}

          <div className="wf-profile-wrapper">


            {/* Profile Button */}

            <button
              className="wf-profile"
              onClick={() =>
                setIsProfileOpen(
                  !isProfileOpen
                )
              }
            >

              {/* 프로필 이미지 */}

              <div className="wf-profile-image">

                {user?.empName
                  ? user.empName.charAt(0)
                  : "?"}

              </div>


              {/* 사용자 정보 */}

              <div className="wf-profile-info">

                <div className="wf-profile-name">

                  {user?.empName || "사용자"}

                  <span>
                    {getAuthName(
                      user?.authCode
                    )}
                  </span>

                </div>

                <div className="wf-profile-department">

                  {getDepartmentName(
                    user?.depId
                  )}

                </div>

              </div>


              {/* 화살표 */}

              <span className="wf-profile-arrow">
                {isProfileOpen ? "⌃" : "⌄"}
              </span>

            </button>


            {/* =========================
                Profile Dropdown
            ========================= */}

            {isProfileOpen && (

              <div className="wf-profile-dropdown">

                <button
                  type="button"
                  onClick={handleMyPage}
                >
                  <span>👤</span>
                  마이페이지
                </button>

                <div className="wf-profile-divider" />

                <button
                  type="button"
                  className="logout-button"
                  onClick={handleLogout}
                >
                  <span>↪</span>
                  로그아웃
                </button>

              </div>

            )}

          </div>

        </div>

      </div>

    </header>

  );
}

export default Header;