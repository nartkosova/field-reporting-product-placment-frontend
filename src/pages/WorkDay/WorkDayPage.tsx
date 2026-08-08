import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import workDayService from "../../services/workDayService";
import {
  WORK_ACTIVITY_TYPE_OPTIONS,
  WORK_LOG_STATUS_OPTIONS,
  WorkActivityType,
  WorkLogActivityInput,
  WorkLogDay,
  WorkLogDayCityInput,
  WorkLogDayInput,
  WorkLogStatus,
} from "../../types/workDayInterface";
import { setActiveWorkDay } from "../../hooks/useActiveWorkDay";
import ActionButton from "../../components/Buttons/ActionButtons";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { useSelectedStore } from "../../hooks/useSelectStore";
import { useNavigate } from "react-router-dom";
import DateRangePicker from "../../components/DateRangePicker/DateRangePicker";
import { isOnline } from "../../utils/cacheManager";
import { getQueuedWorkDayByDate, queueWorkDay } from "../../db/db";
import { getLocalDateIso } from "../../utils/utils";

type WorkDayFormState = {
  status: WorkLogStatus;
  plan: string;
  summary: string;
  absence_reason: string;
  start_kilometers: string;
  end_kilometers: string;
  fuel_cost: string;
  fuel_liters: string;
  other_travel_cost: string;
  cities: {
    city_name: string;
    visit_order: string;
    note: string;
  }[];
  activities: {
    activity_type: WorkActivityType;
    planned: boolean;
    completed: boolean;
    note: string;
  }[];
};

const todayIso = () => getLocalDateIso();

const emptyCity = () => ({ city_name: "", visit_order: "", note: "" });

const emptyActivity = () => ({
  activity_type: "store_visit" as WorkActivityType,
  planned: true,
  completed: false,
  note: "",
});

const parseIsoDate = (value: string) => (value ? new Date(value) : null);

const createDefaultForm = (): WorkDayFormState => ({
  status: "planned_work",
  plan: "",
  summary: "",
  absence_reason: "",
  start_kilometers: "",
  end_kilometers: "",
  fuel_cost: "",
  fuel_liters: "",
  other_travel_cost: "",
  cities: [emptyCity()],
  activities: [emptyActivity()],
});

const mapDayToForm = (day: WorkLogDay): WorkDayFormState => ({
  status: day.status,
  plan: day.plan || "",
  summary: day.summary || "",
  absence_reason: day.absence_reason || "",
  start_kilometers: day.start_kilometers?.toString() || "",
  end_kilometers: day.end_kilometers?.toString() || "",
  fuel_cost: day.fuel_cost?.toString() || "",
  fuel_liters: day.fuel_liters?.toString() || "",
  other_travel_cost: day.other_travel_cost?.toString() || "",
  cities: day.cities.length
    ? day.cities.map((city) => ({
        city_name: city.city_name,
        visit_order: city.visit_order?.toString() || "",
        note: city.note || "",
      }))
    : [emptyCity()],
  activities: day.activities.length
    ? day.activities.map((activity) => ({
        activity_type: activity.activity_type,
        planned: Boolean(activity.planned),
        completed: Boolean(activity.completed),
        note: activity.note || "",
      }))
    : [emptyActivity()],
});

const mapQueuedWorkDayToDay = (queuedDay: WorkLogDayInput): WorkLogDay => ({
  work_log_day_id: 0,
  user_id: 0,
  user: "",
  role: "",
  work_date: queuedDay.work_date,
  status: queuedDay.status ?? "planned_work",
  plan: queuedDay.plan ?? null,
  summary: queuedDay.summary ?? null,
  absence_reason: queuedDay.absence_reason ?? null,
  start_kilometers: queuedDay.start_kilometers ?? null,
  end_kilometers: queuedDay.end_kilometers ?? null,
  kilometers_driven: queuedDay.kilometers_driven ?? null,
  fuel_cost: queuedDay.fuel_cost ?? null,
  fuel_liters: queuedDay.fuel_liters ?? null,
  other_travel_cost: queuedDay.other_travel_cost ?? null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  report_photo_count: 0,
  podravka_facing_count: 0,
  competitor_facing_count: 0,
  activity_count: queuedDay.activities?.length ?? 0,
  city_count: queuedDay.cities?.length ?? 0,
  activities: (queuedDay.activities ?? []).map((activity, index) => ({
    ...activity,
    work_log_activity_id: index + 1,
    work_log_day_id: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })),
  cities: (queuedDay.cities ?? []).map((city, index) => ({
    ...city,
    work_log_day_city_id: index + 1,
    work_log_day_id: 0,
    created_at: new Date().toISOString(),
  })),
});

const parseNumber = (value: string) => {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildPayload = (
  selectedDate: string,
  form: WorkDayFormState
): WorkLogDayInput => {
  const isWorkDay = form.status === "planned_work";
  const startKm = parseNumber(form.start_kilometers);
  const endKm = parseNumber(form.end_kilometers);
  const kilometersDriven =
    startKm !== null && endKm !== null && endKm >= startKm
      ? endKm - startKm
      : null;

  const cities: WorkLogDayCityInput[] = isWorkDay
    ? form.cities
        .filter((city) => city.city_name.trim() || city.note.trim())
        .map((city) => ({
          city_name: city.city_name.trim(),
          visit_order: parseNumber(city.visit_order),
          note: city.note.trim() || null,
        }))
    : [];

  const activities: WorkLogActivityInput[] = isWorkDay
    ? form.activities
        .filter(
          (activity) =>
            activity.activity_type === "store_visit" ||
            activity.activity_type === "ppl" ||
            activity.activity_type === "photo_report"
        )
        .map((activity) => ({
          activity_type: activity.activity_type,
          planned: activity.planned,
          completed: activity.completed,
          note: activity.note.trim() || null,
        }))
    : [];

  return {
    work_date: selectedDate,
    status: form.status,
    plan: form.plan.trim() || null,
    summary: form.summary.trim() || null,
    absence_reason: isWorkDay ? null : form.absence_reason.trim() || null,
    start_kilometers: isWorkDay ? startKm : null,
    end_kilometers: isWorkDay ? endKm : null,
    kilometers_driven: isWorkDay ? kilometersDriven : null,
    fuel_cost: isWorkDay ? parseNumber(form.fuel_cost) : null,
    fuel_liters: isWorkDay ? parseNumber(form.fuel_liters) : null,
    other_travel_cost: isWorkDay ? parseNumber(form.other_travel_cost) : null,
    activities,
    cities,
  };
};

const getErrorMessage = (error: unknown) => {
  const axiosError = error as AxiosError<{ error?: string; message?: string }>;
  return (
    axiosError.response?.data?.error ||
    axiosError.response?.data?.message ||
    "Ndodhi një gabim. Provo përsëri."
  );
};

const inputClass =
  "w-full border border-neutral-700 bg-neutral-900 text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-neutral-600 placeholder-gray-500";

const sectionClass =
  "w-full bg-neutral-900 p-6 border border-neutral-800 rounded-2xl shadow-lg space-y-4";

const getStatusLabel = (status: WorkLogStatus) => {
  switch (status) {
    case "planned_work":
      return "Ditë Pune";
    case "vacation":
      return "Pushim";
    case "sick_day":
      return "Ditë Sëmundjeje";
    default:
      return "Tjetër";
  }
};

const getActivityLabel = (type: WorkActivityType) => {
  switch (type) {
    case "ppl":
      return "PPL";
    case "photo_report":
      return "Raport me Foto";
    case "store_visit":
      return "Vizitë në Market";
  }
};

const WorkDayPage = () => {
  const navigate = useNavigate();
  const selectedStore = useSelectedStore();
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [selectedDay, setSelectedDay] = useState<WorkLogDay | null>(null);
  const [form, setForm] = useState<WorkDayFormState>(createDefaultForm);
  const [isCheckingDay, setIsCheckingDay] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasLoadedDay, setHasLoadedDay] = useState(false);

  const isWorkDay = form.status === "planned_work";
  const isToday = selectedDate === todayIso();

  const kilometersDriven = useMemo(() => {
    const startKm = parseNumber(form.start_kilometers);
    const endKm = parseNumber(form.end_kilometers);
    if (startKm === null || endKm === null || endKm < startKm) return "";
    return String(endKm - startKm);
  }, [form.end_kilometers, form.start_kilometers]);

  // Without this the distance box just goes blank on an invalid reading and the
  // save fails server-side with no explanation of which field is wrong.
  const kilometersError = useMemo(() => {
    const startKm = parseNumber(form.start_kilometers);
    const endKm = parseNumber(form.end_kilometers);
    if (startKm !== null && startKm < 0) {
      return "Kilometrazhi fillestar nuk mund të jetë negativ.";
    }
    if (endKm !== null && endKm < 0) {
      return "Kilometrazhi përfundimtar nuk mund të jetë negativ.";
    }
    if (startKm !== null && endKm !== null && endKm < startKm) {
      return "Kilometrazhi përfundimtar nuk mund të jetë më i vogël se fillestari.";
    }
    return null;
  }, [form.end_kilometers, form.start_kilometers]);

  useEffect(() => {
    setSelectedDay(null);
    setForm(createDefaultForm());
    setHasLoadedDay(false);
    setScreenError(null);
    setSuccessMessage(null);
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedDate) {
      setActiveWorkDay(null);
      return;
    }

    let ignore = false;

    const loadExistingDay = async () => {
      setIsCheckingDay(true);
      setScreenError(null);
      setSuccessMessage(null);

      try {
        const queuedDay = !isOnline()
          ? await getQueuedWorkDayByDate(selectedDate)
          : null;

        if (queuedDay) {
          if (ignore) return;

          const offlineDay = mapQueuedWorkDayToDay(queuedDay);
          setSelectedDay(offlineDay);
          setForm(mapDayToForm(offlineDay));
          setHasLoadedDay(true);
          setActiveWorkDay({
            user_id: 0,
            work_log_day_id: null,
            work_date: offlineDay.work_date,
            status: offlineDay.status,
            selected_at: new Date().toISOString(),
          });
          return;
        }

        const days = await workDayService.listWorkDays({
          start_date: selectedDate,
          end_date: selectedDate,
        });

        if (ignore) return;

        if (!days[0]) {
          setSelectedDay(null);
          setForm(createDefaultForm());
          setHasLoadedDay(false);
          setActiveWorkDay(null);
          return;
        }

        const detail = await workDayService.getWorkDayById(days[0].work_log_day_id);
        if (ignore) return;

        setSelectedDay(detail);
        setForm(mapDayToForm(detail));
        setHasLoadedDay(true);
        setActiveWorkDay({
          user_id: detail.user_id,
          work_log_day_id: detail.work_log_day_id,
          work_date: detail.work_date,
          status: detail.status,
          selected_at: new Date().toISOString(),
        });
      } catch (error) {
        if (!ignore) {
          setScreenError(getErrorMessage(error));
        }
      } finally {
        if (!ignore) {
          setIsCheckingDay(false);
        }
      }
    };

    loadExistingDay();

    return () => {
      ignore = true;
    };
  }, [selectedDate]);

  const updateForm = <K extends keyof WorkDayFormState>(
    key: K,
    value: WorkDayFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const createDay = async () => {
    setIsCheckingDay(true);
    setScreenError(null);
    setSuccessMessage(null);

    try {
      if (!isOnline()) {
        const payload: WorkLogDayInput = { work_date: selectedDate };
        await queueWorkDay(payload);
        const offlineDay = mapQueuedWorkDayToDay(payload);
        setSelectedDay(offlineDay);
        setForm(mapDayToForm(offlineDay));
        setActiveWorkDay({
          user_id: 0,
          work_log_day_id: null,
          work_date: selectedDate,
          status: "planned_work",
          selected_at: new Date().toISOString(),
        });
        setHasLoadedDay(true);
        setSuccessMessage("Dita u krijua offline dhe do sinkronizohet më vonë.");
        return;
      }

      const created = await workDayService.createWorkDay({
        work_date: selectedDate,
      });
      setSelectedDay(created);
      setForm(mapDayToForm(created));
      setActiveWorkDay({
        user_id: created.user_id,
        work_log_day_id: created.work_log_day_id,
        work_date: created.work_date,
        status: created.status,
        selected_at: new Date().toISOString(),
      });
      setHasLoadedDay(true);
      setSuccessMessage("Dita u krijua me sukses.");
    } catch (error) {
      setScreenError(getErrorMessage(error));
    } finally {
      setIsCheckingDay(false);
    }
  };

  const saveDay = async (finishMode: boolean) => {
    if (!selectedDay) return;

    if (kilometersError) {
      setSuccessMessage(null);
      setScreenError(kilometersError);
      return;
    }

    setIsSaving(true);
    setScreenError(null);
    setSuccessMessage(null);

    try {
      const payload = buildPayload(selectedDate, form);
      if (!isOnline()) {
        await queueWorkDay(payload);
        const offlineDay = mapQueuedWorkDayToDay(payload);
        setSelectedDay(offlineDay);
        setForm(mapDayToForm(offlineDay));
        setActiveWorkDay({
          user_id: selectedDay.user_id || 0,
          work_log_day_id: null,
          work_date: payload.work_date,
          status: payload.status ?? "planned_work",
          selected_at: new Date().toISOString(),
        });
        setSuccessMessage(
          finishMode
            ? "Dita u ruajt offline dhe do sinkronizohet më vonë."
            : "Progresi u ruajt offline."
        );
        return;
      }

      const updated = await workDayService.updateWorkDay(
        selectedDay.work_log_day_id,
        payload
      );

      setSelectedDay(updated);
      setForm(mapDayToForm(updated));
      setActiveWorkDay({
        user_id: updated.user_id,
        work_log_day_id: updated.work_log_day_id,
        work_date: updated.work_date,
        status: updated.status,
        selected_at: new Date().toISOString(),
      });
      setSuccessMessage(
        finishMode
          ? "Dita u ruajt me sukses."
          : "Progresi u ruajt me sukses."
      );
    } catch (error) {
      setScreenError(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const evidence = selectedDay
    ? [
        { label: "Foto", value: selectedDay.report_photo_count },
        { label: "Podravka Facings", value: selectedDay.podravka_facing_count },
        {
          label: "Facings Konkurrenca",
          value: selectedDay.competitor_facing_count,
        },
      ]
    : [];

  return (
    <div className="w-full flex flex-col items-center justify-center bg-black py-6">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        <div className={sectionClass}>
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">Dita e Punës</h2>
            <p className="text-neutral-400">
              Zgjidh datën, hape ditën dhe pastaj plotëso detajet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Data e ditës
              </label>
              <div className="flex items-center gap-3">
                <DateRangePicker
                  startDate={parseIsoDate(selectedDate)}
                  endDate={parseIsoDate(selectedDate)}
                  mode="single"
                  onChange={([start]) => {
                    setSelectedDate(
                      start ? start.toISOString().split("T")[0] : todayIso()
                    );
                  }}
                />
                <div
                  className={`${inputClass} min-h-[46px] flex items-center`}
                >
                  {selectedDate}
                </div>
              </div>
            </div>

            <ActionButton
              onClick={createDay}
              disabled={isCheckingDay || hasLoadedDay}
              className="h-[46px] md:min-w-[180px]"
              fullWidth
            >
              {isCheckingDay ? (
                <LoadingSpinner size="sm" text="" />
              ) : hasLoadedDay ? (
                "Dita u ngarkua"
              ) : isToday ? (
                "Nis ditën"
              ) : (
                "Krijo ditën"
              )}
            </ActionButton>
          </div>

          {selectedDay && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-neutral-800 bg-black rounded-xl p-4">
                <p className="text-sm text-neutral-400">Data</p>
                <p className="text-white font-semibold mt-1">
                  {selectedDay.work_date}
                </p>
              </div>
              <div className="border border-neutral-800 bg-black rounded-xl p-4">
                <p className="text-sm text-neutral-400">Statusi aktual</p>
                <p className="text-white font-semibold mt-1">
                  {getStatusLabel(form.status)}
                </p>
              </div>
              <div className="border border-neutral-800 bg-black rounded-xl p-4">
                <p className="text-sm text-neutral-400">Marketi i zgjedhur</p>
                <p className="text-white font-semibold mt-1">
                  {selectedStore?.store_name || "Nuk ka market të zgjedhur"}
                </p>
              </div>
            </div>
          )}
        </div>

        {screenError && (
          <div className="w-full rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-red-200">
            {screenError}
          </div>
        )}

        {successMessage && (
          <div className="w-full rounded-xl border border-green-800 bg-green-950/40 px-4 py-3 text-green-200">
            {successMessage}
          </div>
        )}

        {!selectedDay && (
          <div className={sectionClass}>
            <p className="text-neutral-300">
              Fillimisht krijo ose hap ditën për datën e zgjedhur. Pasi dita të
              ekzistojë, mund të zgjedhësh nëse është ditë pune, pushim, ditë
              sëmundjeje ose tjetër.
            </p>
          </div>
        )}

        {selectedDay && (
          <>
            <div className={sectionClass}>
              <h3 className="text-2xl font-bold text-white">Lloji i ditës</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Zgjidh statusin
                </label>
                <select
                  value={form.status}
                  onChange={(event) =>
                    updateForm("status", event.target.value as WorkLogStatus)
                  }
                  className={inputClass}
                >
                  {WORK_LOG_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {getStatusLabel(option.value)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!isWorkDay && (
              <div className={sectionClass}>
                <h3 className="text-2xl font-bold text-white">Mungesa</h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Arsyeja
                  </label>
                  <textarea
                    value={form.absence_reason}
                    onChange={(event) =>
                      updateForm("absence_reason", event.target.value)
                    }
                    placeholder="Shkruaj arsyen"
                    className={`${inputClass} min-h-28`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Përmbledhje
                  </label>
                  <textarea
                    value={form.summary}
                    onChange={(event) => updateForm("summary", event.target.value)}
                    placeholder="Shënime opsionale"
                    className={`${inputClass} min-h-28`}
                  />
                </div>
              </div>
            )}

            {isWorkDay && (
              <>
                <div className={sectionClass}>
                  <h3 className="text-2xl font-bold text-white">Udhëtimi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Kilometrazhi fillestar
                      </label>
                      <input
                        value={form.start_kilometers}
                        onChange={(event) =>
                          updateForm("start_kilometers", event.target.value)
                        }
                        className={inputClass}
                        placeholder="p.sh. 12000"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Kilometrazhi përfundimtar
                      </label>
                      <input
                        value={form.end_kilometers}
                        onChange={(event) =>
                          updateForm("end_kilometers", event.target.value)
                        }
                        className={inputClass}
                        placeholder="Plotësoje në fund"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Kilometra të përshkuara
                      </label>
                      <input
                        value={kilometersDriven}
                        readOnly
                        className={`${inputClass} text-neutral-400`}
                        placeholder="Llogaritet automatikisht"
                      />
                      {kilometersError && (
                        <p className="text-xs text-red-400">
                          {kilometersError}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Kosto karburanti
                      </label>
                      <input
                        value={form.fuel_cost}
                        onChange={(event) =>
                          updateForm("fuel_cost", event.target.value)
                        }
                        className={inputClass}
                        placeholder="Opsionale"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Litrat e karburantit
                      </label>
                      <input
                        value={form.fuel_liters}
                        onChange={(event) =>
                          updateForm("fuel_liters", event.target.value)
                        }
                        className={inputClass}
                        placeholder="Opsionale"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Kosto tjetër udhëtimi
                      </label>
                      <input
                        value={form.other_travel_cost}
                        onChange={(event) =>
                          updateForm("other_travel_cost", event.target.value)
                        }
                        className={inputClass}
                        placeholder="Opsionale"
                      />
                    </div>
                  </div>
                </div>

                <div className={sectionClass}>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-2xl font-bold text-white">
                      Qytetet e vizituara
                    </h3>
                    <ActionButton
                      onClick={() =>
                        updateForm("cities", [...form.cities, emptyCity()])
                      }
                      variant="secondary"
                    >
                      Shto qytet
                    </ActionButton>
                  </div>

                  <div className="space-y-4">
                    {form.cities.map((city, index) => (
                      <div
                        key={`city-${index}`}
                        className="flex flex-col gap-4 border border-neutral-800 bg-black rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-white font-medium">
                            Qyteti {index + 1}
                          </p>
                          {form.cities.length > 1 && (
                            <ActionButton
                              onClick={() =>
                                updateForm(
                                  "cities",
                                  form.cities.filter((_, itemIndex) => itemIndex !== index)
                                )
                              }
                              variant="danger"
                              className="px-3 py-2"
                            >
                              Largo
                            </ActionButton>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            value={city.city_name}
                            onChange={(event) =>
                              updateForm(
                                "cities",
                                form.cities.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, city_name: event.target.value }
                                    : item
                                )
                              )
                            }
                            className={inputClass}
                            placeholder="Emri i qytetit"
                          />
                          <input
                            value={city.visit_order}
                            onChange={(event) =>
                              updateForm(
                                "cities",
                                form.cities.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, visit_order: event.target.value }
                                    : item
                                )
                              )
                            }
                            className={inputClass}
                            placeholder="Renditja e vizitës"
                          />
                        </div>

                        <textarea
                          value={city.note}
                          onChange={(event) =>
                            updateForm(
                              "cities",
                              form.cities.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, note: event.target.value }
                                  : item
                              )
                            )
                          }
                          className={`${inputClass} min-h-24`}
                          placeholder="Shënim opsional"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className={sectionClass}>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-2xl font-bold text-white">
                      Aktivitetet
                    </h3>
                    <ActionButton
                      onClick={() =>
                        updateForm("activities", [
                          ...form.activities,
                          emptyActivity(),
                        ])
                      }
                      variant="secondary"
                    >
                      Shto aktivitet
                    </ActionButton>
                  </div>

                  <div className="space-y-4">
                    {form.activities.map((activity, index) => (
                      <div
                        key={`activity-${index}`}
                        className="flex flex-col gap-4 border border-neutral-800 bg-black rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-white font-medium">
                            Aktiviteti {index + 1}
                          </p>
                          {form.activities.length > 1 && (
                            <ActionButton
                              onClick={() =>
                                updateForm(
                                  "activities",
                                  form.activities.filter(
                                    (_, itemIndex) => itemIndex !== index
                                  )
                                )
                              }
                              variant="danger"
                              className="px-3 py-2"
                            >
                              Largo
                            </ActionButton>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">
                            Lloji i aktivitetit
                          </label>
                          <select
                            value={activity.activity_type}
                            onChange={(event) =>
                              updateForm(
                                "activities",
                                form.activities.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...item,
                                        activity_type: event.target
                                          .value as WorkActivityType,
                                      }
                                    : item
                                )
                              )
                            }
                            className={inputClass}
                          >
                            {WORK_ACTIVITY_TYPE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {getActivityLabel(option.value)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <label className="flex items-center gap-3 border border-neutral-800 bg-neutral-900 rounded-xl px-4 py-3 text-white">
                            <input
                              type="checkbox"
                              checked={activity.planned}
                              onChange={(event) =>
                                updateForm(
                                  "activities",
                                  form.activities.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? { ...item, planned: event.target.checked }
                                      : item
                                  )
                                )
                              }
                            />
                            I planifikuar
                          </label>

                          <label className="flex items-center gap-3 border border-neutral-800 bg-neutral-900 rounded-xl px-4 py-3 text-white">
                            <input
                              type="checkbox"
                              checked={activity.completed}
                              onChange={(event) =>
                                updateForm(
                                  "activities",
                                  form.activities.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? { ...item, completed: event.target.checked }
                                      : item
                                  )
                                )
                              }
                            />
                            I përfunduar
                          </label>
                        </div>

                        <textarea
                          value={activity.note}
                          onChange={(event) =>
                            updateForm(
                              "activities",
                              form.activities.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, note: event.target.value }
                                  : item
                              )
                            )
                          }
                          className={`${inputClass} min-h-24`}
                          placeholder="Shënim"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className={sectionClass}>
                  <h3 className="text-2xl font-bold text-white">Plani dhe përmbledhja</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Plani
                      </label>
                      <textarea
                        value={form.plan}
                        onChange={(event) => updateForm("plan", event.target.value)}
                        className={`${inputClass} min-h-28`}
                        placeholder="Çfarë ishte planifikuar?"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Përmbledhja
                      </label>
                      <textarea
                        value={form.summary}
                        onChange={(event) => updateForm("summary", event.target.value)}
                        className={`${inputClass} min-h-28`}
                        placeholder="Si shkoi dita?"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className={sectionClass}>
              <h3 className="text-2xl font-bold text-white">Të dhëna të lidhura</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {evidence.map((item) => (
                  <div
                    key={item.label}
                    className="border border-neutral-800 bg-black rounded-xl p-4"
                  >
                    <p className="text-neutral-400 text-sm">{item.label}</p>
                    <p className="text-2xl font-bold text-white mt-2">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ActionButton
                  onClick={() => {
                    navigate(selectedStore ? `/photos/${selectedStore.store_id}` : "/");
                  }}
                  variant="secondary"
                  fullWidth
                  scrollToTop={false}
                >
                  Vazhdo me fotot
                </ActionButton>
                <ActionButton
                  onClick={() => {
                    navigate(
                      selectedStore ? `/ppl-store/${selectedStore.store_id}` : "/"
                    );
                  }}
                  variant="secondary"
                  fullWidth
                  scrollToTop={false}
                >
                  Vazhdo me facings
                </ActionButton>
              </div>
            </div>

            <div className="w-full bg-neutral-900 p-4 border border-neutral-800 rounded-2xl shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ActionButton
                  onClick={() => saveDay(false)}
                  disabled={isSaving}
                  fullWidth
                  className="h-[46px]"
                  variant="primary"
                >
                  {isSaving ? "Duke ruajtur..." : "Ruaj progresin"}
                </ActionButton>
                <ActionButton
                  onClick={() => saveDay(true)}
                  disabled={isSaving}
                  fullWidth
                  className="h-[46px]"
                  variant="gray"
                >
                  Përfundo ditën
                </ActionButton>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WorkDayPage;
