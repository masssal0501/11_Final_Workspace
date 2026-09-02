import { useEffect, useRef, useState } from "react";
import "../styles/LocationCheckModal.css";

/*
 * LocationCheckModal
 *
 * Props
 * ----------------------------------------
 * isOpen          : 모달 표시 여부
 * onClose         : 모달 닫기
 * hub             : 거점 정보
 * onCheckIn       : 출근 처리 성공 시 실행
 *
 * hub 예시
    const hub = {

        hubNo: 1,
        hubName: "강릉 워케이션 거점",
        latitude: 37.4980,
        longitude: 127.02750,
        allowedRadius: 100
    };
 */

function LocationCheckModal({
    isOpen,
    onClose,
    hub,
    onCheckIn,
    isCheckedIn = false
}) {

    const mapRef = useRef(null);
    const mapInstance = useRef(null);

    const [currentLocation, setCurrentLocation] =
        useState(null);

    const [distance, setDistance] =
        useState(null);

    const [locationLoading, setLocationLoading] =
        useState(false);

    const [locationError, setLocationError] =
        useState("");

    const [isAvailable, setIsAvailable] =
        useState(false);


    /*
     * ========================================
     * 거리 계산
     * Haversine 공식
     * ========================================
     */
    const calculateDistance = (
        lat1,
        lon1,
        lat2,
        lon2
    ) => {

        const R = 6371000;

        const toRadians = (degree) =>
            degree * Math.PI / 180;

        const dLat =
            toRadians(lat2 - lat1);

        const dLon =
            toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) ** 2;

        const c =
            2 * Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );

        return R * c;
    };


    /*
     * ========================================
     * 현재 위치 조회
     * ========================================
     */
    const getCurrentLocation = () => {

        if (!navigator.geolocation) {

            setLocationError(
                "이 브라우저에서는 위치 정보를 사용할 수 없습니다."
            );

            return;
        }

        setLocationLoading(true);
        setLocationError("");

        navigator.geolocation.getCurrentPosition(

            (position) => {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;

                const location = {
                    latitude,
                    longitude
                };

                setCurrentLocation(location);

                /*
                 * 거점과 현재 위치 거리 계산
                 */
                const calculatedDistance =
                    calculateDistance(
                        latitude,
                        longitude,
                        Number(hub.latitude),
                        Number(hub.longitude)
                    );

                setDistance(
                    Math.round(calculatedDistance)
                );

                /*
                 * 허용 반경 이내인지 확인
                 */
                setIsAvailable(
                    calculatedDistance <=
                    Number(hub.allowedRadius)
                );

                setLocationLoading(false);
            },

            (error) => {

                console.error(
                    "현재 위치 조회 실패:",
                    error
                );

                setLocationLoading(false);

                switch (error.code) {

                    case error.PERMISSION_DENIED:
                        setLocationError(
                            "위치 정보 사용 권한이 거부되었습니다."
                        );
                        break;

                    case error.POSITION_UNAVAILABLE:
                        setLocationError(
                            "현재 위치를 확인할 수 없습니다."
                        );
                        break;

                    case error.TIMEOUT:
                        setLocationError(
                            "위치 확인 시간이 초과되었습니다."
                        );
                        break;

                    default:
                        setLocationError(
                            "위치 정보를 가져오지 못했습니다."
                        );
                }
            },

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };


    /*
    * ========================================
    * 지도 초기화
    * ========================================
    */
    useEffect(() => {

        if (!isOpen || !hub) {
            return;
        }

        const latitude = Number(hub.latitude);
        const longitude = Number(hub.longitude);

        /*
        * 위도 / 경도 값 검증
        */
        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {

            console.error(
                "거점 좌표가 올바르지 않습니다.",
                hub.latitude,
                hub.longitude
            );

            return;
        }


        /*
        * Kakao Maps SDK 로드 여부 확인
        */
        if (
            !window.kakao ||
            !window.kakao.maps
        ) {

            console.error(
                "Kakao Maps API가 로드되지 않았습니다."
            );

            return;
        }


        /*
        * SDK가 아직 초기화되지 않은 경우
        *
        * kakao.maps.load() 이후에
        * LatLng / Map 등을 사용해야 함
        */
        const initializeMap = () => {

            /*
            * LatLng 생성자가 실제로 존재하는지 확인
            */
            if (
                !window.kakao.maps.LatLng ||
                !window.kakao.maps.Map
            ) {

                console.error(
                    "Kakao Maps API가 아직 초기화되지 않았습니다."
                );

                return;
            }


            const container =
                mapRef.current;

            if (!container) {
                return;
            }


            /*
            * 거점 위치
            */
            const hubPosition =
                new window.kakao.maps.LatLng(
                    latitude,
                    longitude
                );


            /*
            * 지도 옵션
            */
            const options = {

                center: hubPosition,

                level: 3

            };


            /*
            * 지도 생성
            */
            const map =
                new window.kakao.maps.Map(
                    container,
                    options
                );

            mapInstance.current = map;


            /*
            * 거점 마커
            */
            new window.kakao.maps.Marker({

                map,

                position:
                    hubPosition

            });


            /*
            * 현재 위치가 있다면
            * 현재 위치 마커 추가
            */
            if (currentLocation) {

                const currentPosition =
                    new window.kakao.maps.LatLng(
                        Number(currentLocation.latitude),
                        Number(currentLocation.longitude)
                    );


                /*
                * 현재 위치 마커
                */
                new window.kakao.maps.Marker({

                    map,

                    position:
                        currentPosition

                });


                /*
                * 현재 위치 + 거점
                * 모두 보이도록 지도 범위 설정
                */
                const bounds =
                    new window.kakao.maps.LatLngBounds();


                bounds.extend(
                    hubPosition
                );

                bounds.extend(
                    currentPosition
                );


                map.setBounds(
                    bounds
                );
            }
        };


        /*
        * Kakao Maps SDK가 autoload=false인 경우
        */
        if (
            typeof window.kakao.maps.load === "function"
        ) {

            window.kakao.maps.load(() => {

                initializeMap();

            });

        } else {

            /*
            * 이미 SDK가 초기화된 경우
            */
            initializeMap();

        }


    }, [
        isOpen,
        hub,
        currentLocation
    ]);


    /*
     * ========================================
     * 모달 열릴 때 위치 조회
     * ========================================
     */
    useEffect(() => {

        if (
            isOpen &&
            hub
        ) {

            setCurrentLocation(null);
            setDistance(null);
            setIsAvailable(false);
            setLocationError("");

            getCurrentLocation();
        }

    }, [isOpen, hub]);


    /*
     * ========================================
     * 출퇴근 처리
     * ========================================
     */
    const handleCheckIn = () => {

        if (!isAvailable) {

            alert(
                `거점에서 ${hub.allowedRadius}m 이내에서만 
                ${isCheckedIn ? "퇴근" : "출근"}할 수 있습니다.`
            );

            return;
        }

        if (!currentLocation) {

            alert(
                "현재 위치를 확인할 수 없습니다."
            );

            return;
        }

        /*
         * 현재 시간
         * 실제 DB 기록 시간은 
         * 백엔드 서버 시간을 사용하는 것을 권장
         */
        const now = new Date();
        
        /*
         * YYYY-MM-DD HH:mm:ss
         */
        const recordedAt =
            `${now.getFullYear()}-` +
            `${String(now.getMonth() + 1).padStart(2, "0")}-` +
            `${String(now.getDate()).padStart(2, "0")} ` +
            `${String(now.getHours()).padStart(2, "0")}:` +
            `${String(now.getMinutes()).padStart(2, "0")}:` +
            `${String(now.getSeconds()).padStart(2, "0")}`;

        /*
         * 출근 / 퇴근 구분
         */
        const attendanceType =
            isCheckedIn
                ? "OUT"
                : "IN";


        if (onCheckIn) {
            onCheckIn({
                hubNo: hub.hubNo,
                latitude:
                    currentLocation.latitude,
                longitude:
                    currentLocation.longitude,
                distance,
                attendanceType,
                recordedAt
                
            });
        }

        onClose();
    };


    /*
     * 모달이 닫혀있으면 렌더링하지 않음
     */
    if (!isOpen || !hub) {
        return null;
    }


    return (

        <div className="locationModalOverlay">

            <div className="locationModal">


                {/* =========================
                    Header
                ========================= */}

                <div className="locationModalHeader">

                    <h2>
                        출근 위치 확인
                    </h2>

                    <button
                        type="button"
                        className="modalCloseBtn"
                        onClick={onClose}
                    >
                        ×
                    </button>

                </div>


                {/* =========================
                    거점 정보
                ========================= */}

                <div className="hubInfo">

                    <strong>
                        {hub.hubName}
                    </strong>

                    <span>
                        허용 반경 {hub.allowedRadius}m
                    </span>

                </div>


                {/* =========================
                    지도
                ========================= */}

                <div
                    ref={mapRef}
                    className="locationMap"
                />


                {/* =========================
                    위치 정보
                ========================= */}

                <div className="locationInfo">

                    {locationLoading && (

                        <p>
                            현재 위치를 확인하고 있습니다...
                        </p>

                    )}


                    {locationError && (

                        <p className="locationError">
                            {locationError}
                        </p>

                    )}


                    {!locationLoading &&
                        !locationError &&
                        distance !== null && (

                        <>

                            <div className="distanceInfo">

                                현재 위치와 거점의 거리

                                <strong>
                                    {distance}m
                                </strong>

                            </div>


                            {isAvailable ? (

                                <div className="checkAvailable">

                                    ✓ 출근 가능

                                    <span>
                                        허용 반경 내에 있습니다.
                                    </span>

                                </div>

                            ) : (

                                <div className="checkUnavailable">

                                    ✕ 출근 불가

                                    <span>
                                        허용 반경을 벗어났습니다.
                                    </span>

                                </div>

                            )}

                        </>

                    )}

                </div>


                {/* =========================
                    Footer
                ========================= */}

                <div className="locationModalFooter">

                    <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={locationLoading}
                    >
                        위치 다시 확인
                    </button>

                    <button
                        type="button"
                        className="checkInBtn"
                        disabled={
                            !isAvailable ||
                            locationLoading
                        }
                        onClick={handleCheckIn}
                    >
                        {isCheckedIn ? "퇴근하기" : "출근하기"}
                    </button>

                </div>

            </div>

        </div>
    );
}

export default LocationCheckModal;