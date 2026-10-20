import { StoreDropdown } from "../../components/StoreDropdown/StoreDropdown";
import { userNavItems, adminNavItems } from "./HomePageFields";
import { useSelectedStore } from "../../hooks/useSelectStore";
import { NavButton } from "../../components/NavButton/NavButton";
import { getInitials } from "../../utils/utils";
import { useEffect, useState } from "react";
import { fetchAndCacheCompetitorCategories } from "../../db/db";
import { useUser } from "../../hooks/useUser";
import { EmployeeWorkDayCard } from "./EmployeeWorkDayCard";
import { useActiveWorkDay } from "../../hooks/useActiveWorkDay";
import { FieldAttendancePanel } from "./FieldAttendancePanel";
import AdminTodayDashboard from "./AdminTodayDashboard";
import { getLocalDateIso } from "../../utils/utils";
import { isOnline } from "../../utils/cacheManager";

const HomePage: React.FC = () => {
  const { user, userRole } = useUser();
  const isAdmin = userRole === "admin";
  // Florina keeps her admin role, but also needs the field-work workspace.
  const canUseEmployeeWorkspace =
    !isAdmin || user?.user.trim().toLocaleLowerCase() === "florina";
  const selectedStore = useSelectedStore();
  const activeWorkDay = useActiveWorkDay();
  const hasActiveWorkingDay =
    activeWorkDay?.work_date && activeWorkDay.status === "planned_work";
  // Check-ins only apply to today's saved day; offline days fall back to
  // the old flow and are flagged in the admin report instead.
  const attendanceDayId =
    hasActiveWorkingDay &&
    activeWorkDay?.work_log_day_id &&
    activeWorkDay.work_date === getLocalDateIso()
      ? activeWorkDay.work_log_day_id
      : null;
  const [openVisitStoreId, setOpenVisitStoreId] = useState<number | null>(null);
  const [attendanceAvailable, setAttendanceAvailable] = useState(false);
  const requiresStoreCheckIn =
    Boolean(attendanceDayId) && isOnline() && attendanceAvailable;
  const isInSelectedStore =
    !requiresStoreCheckIn ||
    (selectedStore !== null && openVisitStoreId === selectedStore.store_id);
  const adminNavigationItems = adminNavItems.filter(
    (item) =>
      !(canUseEmployeeWorkspace && hasActiveWorkingDay && item.to === "/reports")
  );

  useEffect(() => {
    fetchAndCacheCompetitorCategories();
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-transparent">
      <div className="w-full max-w-4xl flex flex-col items-center justify-center py-12 bg-transparent">
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight text-center drop-shadow-lg">
          Zgjidh një aktivitet
        </h1>

        <div className="max-w-2xl h-[1px] w-full bg-neutral-700 rounded-full mb-4"></div>

        <p className="text-gray-400 text-base text-center max-w-md mb-10">
          {isAdmin
            ? "Shikoni raportet dhe menaxhoni përdoruesit, marketet, produktet dhe konkurrencën."
            : "Zgjidhni një market dhe vazhdoni me aktivitetet e tij."}
        </p>

        <div className="w-full flex justify-center mb-10">
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-2xl px-6 py-6 w-full max-w-md shadow-xl backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-800 flex items-center justify-center text-gray-100 font-semibold text-xl border border-neutral-600 shadow-inner">
              {getInitials(user?.user || "")}
            </div>
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-xl font-bold text-white">
                {user?.user || "User"}
              </span>
              <span className="text-sm text-gray-400 mt-1 capitalize">
                {userRole || "user"}
              </span>
            </div>
          </div>
        </div>

        {canUseEmployeeWorkspace && (
          <>
            <div className="w-full max-w-4xl mb-10">
              <EmployeeWorkDayCard />
            </div>

            {hasActiveWorkingDay ? (
              <>
                {attendanceDayId ? (
                  <div className="w-full max-w-4xl mb-10">
                    <FieldAttendancePanel
                      workLogDayId={attendanceDayId}
                      selectedStore={selectedStore}
                      storePicker={<StoreDropdown />}
                      onOpenVisitChange={setOpenVisitStoreId}
                      onAvailabilityChange={setAttendanceAvailable}
                    />
                  </div>
                ) : (
                  <div className="w-full max-w-4xl mb-10">
                    <StoreDropdown />
                  </div>
                )}

                {!isInSelectedStore && (
                  <div className="notice-warning w-full max-w-4xl mb-6">
                    🔒 PPL dhe Krijo Foto hapen pasi të bësh{" "}
                    <b>“Hyr në market”</b>
                    {selectedStore ? ` në ${selectedStore.store_name}` : ""} më
                    sipër.
                  </div>
                )}

                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 pb-12">
                  {userNavItems(selectedStore).map((item) => (
                    <NavButton
                      key={item.to}
                      to={item.to}
                      disabled={
                        item.disabled ||
                        (item.requiresStoreVisit && !isInSelectedStore)
                      }
                      variant="card"
                    >
                      {item.label}
                    </NavButton>
                  ))}
                </div>
              </>
            ) : (
              <div className="card w-full max-w-4xl text-center text-neutral-300">
                Pasi dita të jetë vendosur si ditë pune, këtu do shfaqen marketi
                dhe aktivitetet si PPL, foto dhe raportet e tjera.
              </div>
            )}
          </>
        )}

        {isAdmin && <AdminTodayDashboard />}

        {isAdmin && (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
            {adminNavigationItems.map((item) => (
              <NavButton key={item.to} to={item.to} variant="card">
                {item.label}
              </NavButton>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
