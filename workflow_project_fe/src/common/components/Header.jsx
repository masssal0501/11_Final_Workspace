import "../styles/Header.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { logout } from "../../employee/api/employeeApi";

// App.jsx에서 내려주는 loginUser와 onLogout을 프롭스로 받습니다.
function Header({ loginUser, onLogout }) {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const navigate = useNavigate();

  // 프로필 드롭다운
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
      if (onLogout) {
        onLogout(); // App.jsx의 상태 초기화 및 네비게이션 실행
      } else {
        // JWT 삭제
        localStorage.removeItem("accessToken");

        // 사용자 정보 삭제
        localStorage.removeItem("user");

        // 로그인 페이지 이동
        navigate("/login");
      }
    }
  };


  // 마이페이지 이동
  const handleMyPage = () => {
    setIsProfileOpen(false);
    navigate("/myPage");
  };

  //내 워케이션 리스트 이동
  const handleMyWorcation = () => {
    setIsProfileOpen(false);
    navigate("/workcation/mylist");
  }

  // 메뉴
  const menus = [
    {
      id: "workcation",
      label: "워케이션 신청",
      icon: "▣",
      path: "/workcation/list",

      roles: ["ADMIN", "MANAGER", "STAFF"],

      children: [ 
        { 
          label: "워케이션 신청", 
          path: "/workcation/enrollform" ,
          roles: ["MANAGER", "STAFF"]
        }, 
        {
          // BUG-N01: /workcation/deptList 라우트가 App.jsx에 존재하지 않아 클릭 시
          // ErrorPage로 빠지던 문제. /workcation/list는 WorkcationController.selectWorkcationList가
          // MANAGER 로그인 시 이미 소속 부서 건만 필터링해 반환하므로(부서 워케이션 목록과 동일한 결과),
          // 새 화면을 만들지 않고 기존 라우트로 연결한다.
          label: "부서 워케이션 목록",
          path: "/workcation/list",
          roles: ["MANAGER"]
        } ,
        { 
          label: "내 신청 내역 목록", 
          path: "/workcation/mylist"
        } ,
        { 
          label: "시설 예약 관리", 
          path: "/reservations/schedules",
          roles: ["ADMIN"]
        }         
      ]
    },
    {
      id: "task",
      label: "업무 관리",
      icon: "☷",
      path: "/task/list",

      // STAFF는 업무관리 메뉴가 보이지 않아야 한다
      roles: ["ADMIN", "MANAGER"],
    },
    {
      id: "amount",
      label: "비용 관리",
      icon: "₩",
      path: "/cost/list",
      // BUG-011: 상위 "비용 관리" 탭 자체를 클릭했을 때 ADMIN은 일반 정산 신청 화면이 아니라
      // 관리자용 비용 관리 화면으로 이동해야 한다. 하위 메뉴("지원금 목록")만 별도 경로가 있고
      // 상위 탭은 role 구분 없이 path 하나만 쓰고 있어 handleMenuClick에서 role별로 분기한다.
      adminPath: "/admin/cost/list",

      roles: ["ADMIN", "MANAGER", "STAFF"],

      children: [
        {
          label: "정산 신청",
          path: "/cost/apply" ,
          roles: ["MANAGER", "STAFF"]
        } ,
        {
          label: "정산 목록",
          path: "/cost/list" ,
          roles: ["MANAGER", "STAFF"]
        },
        {
          // BUG-N01: /subsidy/list 라우트가 App.jsx에 존재하지 않아 클릭 시 ErrorPage로
          // 빠지던 문제. 지원금(SupportList) 전용 목록 화면은 별도로 구현돼 있지 않고,
          // 지원금 처리(AmountController.updateApprovalWithSponsor)는 정산 상세(AmountDetail)에서
          // 이뤄지므로 관리자 정산 목록(AdminAmountPage)으로 연결해 기존 구현을 통해 접근하게 한다.
          // 전용 목록 화면이 필요하면 TODO-N04로 별도 논의.
          label: "비용 관리",
          path: "/admin/cost/list" ,
          roles:["ADMIN"]
        },
      ]
    },
    {
      id: "approval",
      label: "승인 관리",
      icon: "✓",
      path: "/approval/queue/list",

      roles: ["ADMIN", "MANAGER"],

      children: [
        {
          label: "승인 대기 목록",
          path: "/approval/queue/list"
        },
        {
          label: "승인 이력",
          path: "/approval/history"
        }
      ]
    },
    {
      id: "employee",
      label: "직원 관리",
      icon: "☷",
      path: "/employee/list",

      roles: ["ADMIN"],

      children: [ 
        { 
          label: "직원 목록", 
          path: "/employee/list" 
        }, 
        { 
          label: "직원 등록", 
          path: "/employee/enrollForm" 
        } 
      ]
    },
    {
      id: "hub",
      label: "장소/거점",
      icon: "⌖",
      path: "/hub/list",

      roles: ["ADMIN", "MANAGER", "STAFF"],

      children: [ 
        {
          label: "거점 등록",
          path: "/hub/enrollForm",
          roles:["ADMIN"]
        },
        { 
          label: "장소 정보 등록",
          path: "/place/Form",
          roles:["ADMIN"]
        },
        { 
          label: "거점 목록", 
          path: "/hub/list" 
        }, 
        { 
          label: "지역정보 목록", 
          path: "/place/list" 
        }, 
        { 
          label: "AI 여행 일정 추천", 
          path: "/hub/ai" 
        },     
      ]      
    },
    {
      id: "notice",
      label: "공지사항",
      icon: "♢",
      path: "/notice",
    },
  ];


  // 메뉴 클릭
  const handleMenuClick = (menu) => {
    setActiveMenu(menu.id);

    // BUG-011: adminPath가 지정된 메뉴는 ADMIN 로그인 시 해당 경로로 이동한다.
    const targetPath =
      menu.adminPath && loginUser?.authCode === "ADMIN"
        ? menu.adminPath
        : menu.path;

    navigate(targetPath);
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
            Navigation staff는 업무관리가 안뜨게
        ========================= */}
        <nav className="wf-nav">
          {menus
            .filter((menu) =>
              !menu.roles ||
              menu.roles.includes(loginUser?.authCode)
            )
            .map((menu) => {
              const visibleChildren = (menu.children || []).filter((child) =>
                !child.roles ||
                child.roles.includes(loginUser?.authCode)
              );

              return (
                <div key={menu.id} className="wf-nav-dropdown">
                  <button
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

                  {visibleChildren.length > 0 && (
                    <div className="wf-submenu">
                      {visibleChildren.map((child) => (
                        <button
                          // BUG-N01 수정 이후 "부서 워케이션 목록"과 "신청 내역 목록"이 같은
                          // path(/workcation/list)를 공유하게 되어 path만으로는 더 이상
                          // 목록 내에서 유일하지 않다. label까지 합쳐 React key 중복을 피한다.
                          key={`${child.path}-${child.label}`}
                          type="button"
                          onClick={() => {
                            setActiveMenu(menu.id);
                            navigate(child.path);
                          }}
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </nav>


        {/* =========================
            Header Right
        ========================= */}
        <div className="wf-header-actions">


          {/* =========================
              Profile
          ========================= */}
          {loginUser && (
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
                  {loginUser?.empName
                    ? loginUser.empName.charAt(0)
                    : "?"}
                </div>


                {/* 사용자 정보 */}
                <div className="wf-profile-info">
                  <div className="wf-profile-name">
                    {loginUser?.empName || "사용자"}
                    <span>
                      {getAuthName(
                        loginUser?.authCode
                      )}
                    </span>
                  </div>

                  <div className="wf-profile-department">
                    {getDepartmentName(
                      loginUser?.depId
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

                  <button
                    type="button"
                    onClick={handleMyWorcation}
                  >
                    <span>🏖️</span>
                    내 워케이션
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
          )}

        </div>

      </div>
    </header>
  );
}

export default Header;