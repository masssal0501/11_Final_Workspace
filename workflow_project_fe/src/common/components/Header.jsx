import "../styles/Header.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Header({ loginUser, onLogout }) {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const navigate = useNavigate();

  // 프로필 드롭다운
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // 마이페이지 이동
  const handleMyPage = () => {

    setIsProfileOpen(false);

    navigate("/mypage");
  };


  // =========================
  // 메뉴
  // =========================
  const menus = [
    {
      id: "workcation",
      label: "워케이션",
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
          label: "부서 워케이션 목록", 
          path: "/workcation/deptList",
          roles: ["MANAGER"]
        } ,
        { 
          label: "신청 내역 목록", 
          path: "/workcation/list"
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

      roles: ["ADMIN", "MANAGER", "STAFF"],
      
      children: [ 
        { 
          label: "내 업무", 
          path: "/task/list",
          roles: ["MANAGER", "STAFF"]
        }, 
        { 
          label: "업무 이력", 
          path: "/task/history" 
        } , 
        { 
          label: "업무 현황", 
          path: "/task/list",
          roles:["ADMIN", "MANAGER"]
        } 
      ]
    },
    {
      id: "cost",
      label: "비용 관리",
      icon: "₩",
      path: "/cost/list",

      roles: ["ADMIN", "MANAGER", "STAFF"],

      children: [ 
        { 
          label: "정산 신청", 
          path: "/cost/apply" ,
          roles: ["MANAGER", "STAFF"]
        } ,
        { 
          label: "정산 목록", 
          path: "/cost/list" 
        }, 
        { 
          label: "지원금 목록", 
          path: "/subsidy/list" ,
          rolse:["ADMIN"]
        }, 
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
          label: "장소 정보", 
          path: "/hub/list" 
        }, 
        { 
          label: "AI 여행 일정 추천", 
          path: "/placeInfo/ai" 
        },     
        { 
          label: "거점 등록", 
          path: "/placeInfo/enrollForm",
          roles:["ADMIN"]
        } 
      ]      
    },
    {
      id: "notice",
      label: "공지사항",
      icon: "♢",
      path: "/notice",
      roles: ["ADMIN", "MANAGER", "STAFF"],
      children: [ 
        { 
          label: "공지사항", 
          path: "/notice"
        }, 
        { 
          label: "공지사항 작성", 
          path: "/notice/insert",
          roles:["ADMIN"]
        } 
      ]
    },

  ];

  // 현재 사용자의 권한
  const authCode = loginUser?.authCode;

  // 현재 사용자가 볼 수 있는 메뉴만 필터링
  const visibleMenus = menus.filter(menu =>
    menu.roles.includes(authCode)
  )


  // 메뉴 클릭
  const handleMenuClick = (menu) => {

    setActiveMenu(menu.id);

    navigate(menu.path);
    // React Router를 사용한다면 navigate(menu.path) 사용
  };

  // 하위 메뉴 이동 
  const handleSubMenuClick = (path) => { 
    navigate(path); 
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

          {visibleMenus.map((menu) => (

            <div
              key={menu.id}
              className="wf-nav-dropdown"
            >

            {/* 상위 메뉴 */}

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

            {/* 하위 메뉴 */}

            {menu.children && menu.children.length > 0 && ( 
              <div className="wf-submenu"> 
              
                {menu.children .filter(child => { 
                  
                // roles가 없으면 모든 권한 허용 
                if (!child.roles) { 
                  return true; 
                } 
                
                return child.roles.includes( 
                  loginUser?.authCode 
                ); 
              
              }) .map((child) => ( 

                <button 
                  key={child.path} 
                  type="button" 
                  onClick={() => handleSubMenuClick( child.path ) } 
                >   
                  {child.label} 
                
                </button> 
              ))} 
            
            </div> 
          )}

            </div>

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

                <div className="wf-profile-divider" />

                <button
                  type="button"
                  className="logout-button"
                  onClick={onLogout}
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
