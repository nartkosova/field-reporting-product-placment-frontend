import { ReactNode, useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";
import workDayService from "../../services/workDayService";
import { DayAttendance } from "../../types/attendanceInterface";
import { Store } from "../../types/storeInterface";
import {
  FLAG_LABELS,
  formatMinutes,
  formatTime,
} from "../../utils/attendance";
import { isOnline } from "../../utils/cacheManager";

type Props = {
  workLogDayId: number;
  selectedStore: Store | null;
  storePicker: ReactNode;
  onOpenVisitChange: (storeId: number | null) => void;
  // Tells the page whether attendance works at all (backend reachable and
  // up to date). When it doesn't, store actions must not stay locked.
  onAvailabilityChange: (available: boolean) => void;
};

const getErrorMessage = (error: unknown) => {
  const axiosError = error as AxiosError<{ error?: string }>;
  return (
    axiosError.response?.data?.error ||
    (error instanceof Error ? error.message : null) ||
    "Ndodhi një gabim. Provo përsëri."
  );
};

const useNow = (intervalMs: number) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
};

export const FieldAttendancePanel = ({
  workLogDayId,
  selectedStore,
  storePicker,
  onOpenVisitChange,
  onAvailabilityChange,
}: Props) => {
  const [attendance, setAttendance] = useState<DayAttendance | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const now = useNow(30000);

  const applyAttendance = useCallback(
    (next: DayAttendance) => {
      setAttendance(next);
      onOpenVisitChange(next.open_visit?.store_id ?? null);
    },
    [onOpenVisitChange]
  );

  useEffect(() => {
    let ignore = false;
    setError(null);

    if (!isOnline()) {
      setError("Je offline. Check-in kërkon internet.");
      onAvailabilityChange(false);
      return;
    }

    workDayService
      .getAttendance(workLogDayId)
      .then((data) => {
        if (ignore) return;
        applyAttendance(data);
        onAvailabilityChange(true);
      })
      .catch((err) => {
        if (ignore) return;
        setError(getErrorMessage(err));
        onAvailabilityChange(false);
      });

    return () => {
      ignore = true;
    };
  }, [workLogDayId, applyAttendance, onAvailabilityChange]);

  const runAction = async (
    action: string,
    request: () => Promise<DayAttendance>,
    successMessage: (data: DayAttendance) => string
  ) => {
    setBusyAction(action);
    setError(null);
    setNotice(null);

    try {
      const data = await request();
      applyAttendance(data);
      setNotice(successMessage(data));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyAction(null);
    }
  };

  const uploadPhoto = async (storeVisitId: number, file: File) => {
    setBusyAction("photo");
    setError(null);
    setNotice(null);

    try {
      applyAttendance(await workDayService.uploadStoreVisitPhoto(workLogDayId, storeVisitId, file));
      setNotice("Fotoja u ruajt.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyAction(null);
    }
  };

  const checkedIn = Boolean(attendance?.check_in_at);
  const checkedOut = Boolean(attendance?.check_out_at);
  const openVisit = attendance?.open_visit ?? null;
  const openVisitMinutes = openVisit
    ? Math.max(0, Math.round((now - new Date(openVisit.check_in_at).getTime()) / 60000))
    : 0;

  const buttonClass =
    "w-full rounded-xl px-4 py-3 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="card w-full space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Prezenca në terren</h2>
          <p className="text-sm text-neutral-400 mt-1">
            Orari: {attendance?.expected_start ?? "08:00"} –{" "}
            {attendance?.expected_end ?? "16:00"}. Oraret ruhen
            automatikisht dhe shihen nga admini.
          </p>
        </div>
      </div>

      {error && (
        <div className="notice-error">
          {error}
        </div>
      )}
      {notice && (
        <div className="notice-success">
          {notice}
        </div>
      )}

      {/* Step 1: start / end of the working day */}
      <div className="card-inset space-y-3">
        <label className="block font-medium text-gray-200">1. Fillimi i ditës</label>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-neutral-300">
          <span>
            Fillimi: <b className="text-white">{formatTime(attendance?.check_in_at)}</b>
          </span>
          <span>
            Mbarimi: <b className="text-white">{formatTime(attendance?.check_out_at)}</b>
          </span>
          {attendance?.worked_minutes !== null && attendance?.worked_minutes !== undefined && (
            <span>
              Orë pune: <b className="text-white">{formatMinutes(attendance.worked_minutes)}</b>
            </span>
          )}
        </div>

        {!checkedIn && (
          <button
            type="button"
            disabled={!attendance || busyAction !== null}
            onClick={() =>
              runAction(
                "check-in",
                () => workDayService.checkIn(workLogDayId),
                (data) => `Dita filloi në ${formatTime(data.check_in_at)}.`
              )
            }
            className={`${buttonClass} bg-green-600 hover:bg-green-500 text-white`}
          >
            {busyAction === "check-in" ? "Duke ruajtur..." : "▶ Fillo ditën (check-in)"}
          </button>
        )}

        {checkedIn && !checkedOut && (
          <button
            type="button"
            disabled={busyAction !== null || Boolean(openVisit)}
            onClick={() =>
              runAction(
                "check-out",
                () => workDayService.checkOut(workLogDayId),
                (data) => `Dita u mbyll në ${formatTime(data.check_out_at)}.`
              )
            }
            className={`${buttonClass} bg-neutral-700 hover:bg-neutral-600 text-white`}
          >
            {busyAction === "check-out" ? "Duke ruajtur..." : "■ Mbyll ditën (check-out)"}
          </button>
        )}
        {checkedIn && !checkedOut && openVisit && (
          <p className="text-xs text-neutral-400">
            Dil nga marketi aktual para se ta mbyllësh ditën.
          </p>
        )}
        {checkedOut && (
          <p className="text-sm text-green-300">✓ Dita është mbyllur.</p>
        )}
      </div>

      {/* Step 2: store visits */}
      {!checkedIn && (
        <p className="text-sm text-neutral-400">
          Pasi të fillosh ditën, zgjidh marketin dhe bëj check-in aty për të
          hapur PPL, fotot dhe foton e prezencës.
        </p>
      )}

      {checkedIn && (
        <div className="card-inset space-y-3">
          <label className="block font-medium text-gray-200">
            2. Vizita në market
          </label>
          {!openVisit && !checkedOut && storePicker}

          {openVisit ? (
            <div className="rounded-xl border border-green-800 bg-green-950/30 p-4 space-y-3">
              <p className="text-green-200">
                Je në <b>{openVisit.store_name}</b> që nga{" "}
                {formatTime(openVisit.check_in_at)} ({formatMinutes(openVisitMinutes)})
              </p>
              {selectedStore && selectedStore.store_id !== openVisit.store_id && (
                <p className="text-sm text-amber-200">
                  ⚠ Marketi i zgjedhur është tjetër. Aktivitetet duhet të bëhen
                  në marketin ku ke bërë check-in.
                </p>
              )}
              <div className="space-y-2">
                <p className="text-sm text-neutral-300">
                  Foto si dëshmi që je në market (p.sh. hyrja ose rafti):
                </p>
                {openVisit.photos.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {openVisit.photos.map((photo) => (
                      <a key={photo.store_visit_photo_id} href={photo.photo_url} target="_blank" rel="noreferrer">
                        <img
                          src={photo.photo_url}
                          alt="Foto e vizitës"
                          className="h-16 w-16 rounded-lg object-cover border border-neutral-700"
                        />
                      </a>
                    ))}
                  </div>
                )}
                <label
                  className={`${buttonClass} block text-center cursor-pointer ${
                    openVisit.photos.length
                      ? "bg-neutral-700 hover:bg-neutral-600"
                      : "bg-sky-600 hover:bg-sky-500"
                  } text-white ${busyAction !== null ? "opacity-50 pointer-events-none" : ""}`}
                >
                  {busyAction === "photo"
                    ? "Duke ngarkuar foton..."
                    : openVisit.photos.length
                    ? "📷 Shto foto tjetër"
                    : "📷 Bëj foto në market"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (file) uploadPhoto(openVisit.store_visit_id, file);
                    }}
                  />
                </label>
              </div>
              <button
                type="button"
                disabled={busyAction !== null}
                onClick={() =>
                  runAction(
                    "visit-out",
                    () => workDayService.endStoreVisit(workLogDayId, openVisit.store_visit_id),
                    () => `Dole nga ${openVisit.store_name}.`
                  )
                }
                className={`${buttonClass} bg-amber-600 hover:bg-amber-500 text-white`}
              >
                {busyAction === "visit-out" ? "Duke ruajtur..." : "Dil nga marketi"}
              </button>
            </div>
          ) : checkedOut ? null : selectedStore ? (
            <button
              type="button"
              disabled={busyAction !== null}
              onClick={() =>
                runAction(
                  "visit-in",
                  () => workDayService.startStoreVisit(workLogDayId, selectedStore.store_id),
                  () => `Hyre në ${selectedStore.store_name}. Bëj një foto si dëshmi.`
                )
              }
              className={`${buttonClass} bg-green-600 hover:bg-green-500 text-white`}
            >
              {busyAction === "visit-in"
                ? "Duke ruajtur..."
                : `Hyr në market: ${selectedStore.store_name}`}
            </button>
          ) : (
            <p className="text-sm text-neutral-400">
              Zgjidh marketin dhe bëj check-in kur të arrish aty.
            </p>
          )}

          {attendance && attendance.visits.length > 0 && (
            <ul className="divide-y divide-neutral-800 text-sm">
              {attendance.visits.map((visit) => (
                <li key={visit.store_visit_id} className="py-2 flex flex-wrap justify-between gap-2">
                  <span className="text-white">{visit.store_name}</span>
                  <span className="text-neutral-400">
                    {formatTime(visit.check_in_at)} – {formatTime(visit.check_out_at)}
                    {visit.duration_minutes !== null && ` · ${formatMinutes(visit.duration_minutes)}`}
                    {visit.photos.length > 0 && ` · 📷 ${visit.photos.length}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {checkedOut && attendance && attendance.flags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attendance.flags
            .filter((flag) => flag !== "no_check_out" && flag !== "open_visit")
            .map((flag) => (
              <span
                key={flag}
                className="rounded-full border border-amber-800 bg-amber-950/40 px-3 py-1 text-xs text-amber-100"
              >
                {FLAG_LABELS[flag]}
              </span>
            ))}
        </div>
      )}
    </div>
  );
};
