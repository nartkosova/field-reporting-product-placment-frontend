import { useEffect, useRef, useState } from "react";
import { AxiosError } from "axios";
import workDayService from "../../services/workDayService";
import {
  WORK_ACTIVITY_TYPE_OPTIONS,
  WorkActivityType,
  WorkLogActivityInput,
  WorkLogDayCityInput,
  WorkLogDay,
  WorkLogDayInput,
  WorkLogStatus,
} from "../../types/workDayInterface";
import { setActiveWorkDay, useActiveWorkDay } from "../../hooks/useActiveWorkDay";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import SubmitButton from "../../components/Buttons/SubmitButton";
import Select from "react-select";
import darkSelectStyles from "../../utils/darkSelectStyles";
import { useUser } from "../../hooks/useUser";
import ActionButton from "../../components/Buttons/ActionButtons";
import DateRangePicker from "../../components/DateRangePicker/DateRangePicker";
import { isOnline } from "../../utils/cacheManager";
import { getLocalDateIso } from "../../utils/utils";
import { getQueuedWorkDayByDate, queueWorkDay } from "../../db/db";

type StarterFormState = {
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

const createDefaultForm = (): StarterFormState => ({
  status: "planned_work",
  plan: "",
  summary: "",
  absence_reason: "",
  start_kilometers: "",
  end_kilometers: "",
  fuel_cost: "",
  fuel_liters: "",
  other_travel_cost: "",
  cities: [{ city_name: "", visit_order: "", note: "" }],
  activities: [
    {
      activity_type: "store_visit",
      planned: true,
      completed: false,
      note: "",
    },
  ],
});

const emptyCity = () => ({ city_name: "", visit_order: "", note: "" });

const emptyActivity = () => ({
  activity_type: "store_visit" as WorkActivityType,
  planned: true,
  completed: false,
  note: "",
});

const inputClass =
  "border border-neutral-700 bg-neutral-900 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-neutral-600 placeholder-gray-500";

const statusOptions: { value: WorkLogStatus; label: string }[] = [
  { value: "planned_work", label: "Ditë Pune" },
  { value: "vacation", label: "Pushim" },
  { value: "sick_day", label: "Ditë Sëmundjeje" },
  { value: "other", label: "Tjetër" },
];

const statusSelectOptions = statusOptions.map((option) => ({
  value: option.value,
  label: option.label,
}));

const parseNumber = (value: string) => {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseIsoDate = (value: string) => (value ? new Date(value) : null);

const getErrorMessage = (error: unknown) => {
  const axiosError = error as AxiosError<{ error?: string; message?: string }>;
  return (
    axiosError.response?.data?.error ||
    axiosError.response?.data?.message ||
    "Ndodhi një gabim. Provo përsëri."
  );
};

const mapDayToStarterForm = (day: WorkLogDay): StarterFormState => ({
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

const mapQueuedWorkDayToDay = (
  queuedDay: WorkLogDayInput,
  userId: number,
  workLogDayId: number | null
): WorkLogDay => ({
  work_log_day_id: workLogDayId ?? 0,
  user_id: userId,
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
    work_log_day_id: workLogDayId ?? 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })),
  cities: (queuedDay.cities ?? []).map((city, index) => ({
    ...city,
    work_log_day_city_id: index + 1,
    work_log_day_id: workLogDayId ?? 0,
    created_at: new Date().toISOString(),
  })),
});

const buildPayload = (
  selectedDate: string,
  form: StarterFormState
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
    plan: isWorkDay ? form.plan.trim() || null : null,
    summary: form.summary.trim() || null,
    absence_reason: isWorkDay ? null : form.absence_reason.trim() || null,
    start_kilometers: isWorkDay ? startKm : null,
    end_kilometers: isWorkDay ? endKm : null,
    kilometers_driven: isWorkDay ? kilometersDriven : null,
    fuel_cost: isWorkDay ? parseNumber(form.fuel_cost) : null,
    fuel_liters: isWorkDay ? parseNumber(form.fuel_liters) : null,
    other_travel_cost: isWorkDay ? parseNumber(form.other_travel_cost) : null,
    cities,
    activities,
  };
};

export const EmployeeWorkDayCard = () => {
  const { userId } = useUser();
  const activeWorkDay = useActiveWorkDay();
  const todayDate = getLocalDateIso();
  const [selectedDate, setSelectedDate] = useState(
    () => activeWorkDay?.work_date || ""
  );
  const [selectedDay, setSelectedDay] = useState<WorkLogDay | null>(null);
  const [form, setForm] = useState<StarterFormState>(createDefaultForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingKilometers, setIsLoadingKilometers] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const prefilledKilometersDateRef = useRef<string | null>(null);

  const isWorkDay = form.status === "planned_work";
  const hasWorkDayStarterData = Boolean(
    isWorkDay && form.plan.trim() && form.start_kilometers.trim()
  );
  const shouldExposeTodayActions = selectedDate === todayDate;

  useEffect(() => {
    if (!selectedDate && activeWorkDay?.work_date) {
      setSelectedDate(activeWorkDay.work_date);
    }
  }, [activeWorkDay?.work_date, selectedDate]);

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDay(null);
      setForm(createDefaultForm());
      setScreenError(null);
      setSuccessMessage(null);
      return;
    }

    let ignore = false;

    const loadDay = async () => {
      setIsLoading(true);
      setScreenError(null);
      setSuccessMessage(null);

      try {
        const queuedDay = !isOnline()
          ? await getQueuedWorkDayByDate(selectedDate)
          : null;

        if (queuedDay) {
          if (ignore) return;

          const offlineDay = mapQueuedWorkDayToDay(
            queuedDay,
            userId ?? 0,
            activeWorkDay?.work_log_day_id ?? null
          );
          setSelectedDay(offlineDay);
          setForm(mapDayToStarterForm(offlineDay));
          if (shouldExposeTodayActions) {
            setActiveWorkDay(
              offlineDay.status === "planned_work"
                ? {
                    user_id: userId ?? offlineDay.user_id,
                    work_log_day_id: offlineDay.work_log_day_id || null,
                    work_date: offlineDay.work_date,
                    status: offlineDay.status,
                    selected_at: new Date().toISOString(),
                  }
                : null
            );
          }
          setSuccessMessage("Dita offline u ngarkua nga pajisja.");
          return;
        }

        const days = await workDayService.listWorkDays({
          start_date: selectedDate,
          end_date: selectedDate,
        });

        if (ignore) return;

        if (days[0]) {
          const detail = await workDayService.getWorkDayById(days[0].work_log_day_id);
          if (ignore) return;

          setSelectedDay(detail);
          setForm(mapDayToStarterForm(detail));
          if (shouldExposeTodayActions) {
            setActiveWorkDay(
              detail.status === "planned_work"
                ? {
                    user_id: detail.user_id,
                    work_log_day_id: detail.work_log_day_id,
                    work_date: detail.work_date,
                    status: detail.status,
                    selected_at: new Date().toISOString(),
                  }
                : null
            );
          }
          setSuccessMessage("Dita ekziston. Mund ta vazhdosh.");
        } else {
          setSelectedDay(null);
          setForm(createDefaultForm());
          if (shouldExposeTodayActions) {
            setActiveWorkDay(null);
          }
        }
      } catch (error) {
        if (!ignore) {
          setScreenError(getErrorMessage(error));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadDay();

    return () => {
      ignore = true;
    };
  }, [
    selectedDate,
    activeWorkDay?.work_date,
    activeWorkDay?.work_log_day_id,
    shouldExposeTodayActions,
    userId,
  ]);

  // Carrying the previous odometer reading over is a one-time convenience per
  // date. It must not depend on the kilometer fields themselves: clearing the
  // input to correct it would re-run this effect and immediately write the old
  // value back, making the field impossible to edit.
  useEffect(() => {
    if (!selectedDate || selectedDay) {
      return;
    }

    if (prefilledKilometersDateRef.current === selectedDate) {
      return;
    }

    let ignore = false;

    const loadLatestKilometers = async () => {
      setIsLoadingKilometers(true);

      try {
        const latest = await workDayService.getLatestKilometers({
          up_to_date: selectedDate,
        });

        if (ignore) return;
        prefilledKilometersDateRef.current = selectedDate;
        if (!latest) return;

        const kilometerValue =
          latest.end_kilometers !== null
            ? String(latest.end_kilometers)
            : latest.start_kilometers !== null
            ? String(latest.start_kilometers)
            : "";

        if (!kilometerValue) return;

        setForm((prev) => {
          if (prev.start_kilometers.trim() || prev.end_kilometers.trim()) {
            return prev;
          }

          return {
            ...prev,
            start_kilometers: kilometerValue,
          };
        });
      } catch {
        // Keep the form usable even if kilometer prefill fails.
      } finally {
        if (!ignore) {
          setIsLoadingKilometers(false);
        }
      }
    };

    loadLatestKilometers();

    return () => {
      ignore = true;
    };
  }, [selectedDate, selectedDay]);

  const saveStarterData = async (event?: React.FormEvent) => {
    event?.preventDefault();

    if (!selectedDate || !userId) {
      setScreenError("Përdoruesi nuk u gjet. Provo përsëri.");
      return;
    }

    setIsSaving(true);
    setScreenError(null);
    setSuccessMessage(null);

    try {
      const payload = buildPayload(selectedDate, form);
      if (!isOnline()) {
        await queueWorkDay(payload);
        const offlineDay = mapQueuedWorkDayToDay(
          payload,
          userId,
          activeWorkDay?.work_log_day_id ?? null
        );
        setSelectedDay(offlineDay);
        setForm(mapDayToStarterForm(offlineDay));
        setActiveWorkDay({
          user_id: userId,
          work_log_day_id: activeWorkDay?.work_log_day_id ?? null,
          work_date: payload.work_date,
          status: payload.status ?? "planned_work",
          selected_at: new Date().toISOString(),
        });
        setSuccessMessage("Dita u ruajt offline dhe do sinkronizohet më vonë.");
        return;
      }

      const response =
        selectedDay && selectedDay.work_log_day_id
          ? await workDayService.updateWorkDay(selectedDay.work_log_day_id, payload)
          : await workDayService.createWorkDay(payload);

      setSelectedDay(response);
      setForm(mapDayToStarterForm(response));
      setActiveWorkDay({
        user_id: response.user_id,
        work_log_day_id: response.work_log_day_id,
        work_date: response.work_date,
        status: response.status,
        selected_at: new Date().toISOString(),
      });
      setSuccessMessage(
        selectedDay
          ? "Dita u përditësua me sukses."
          : "Dita u krijua me sukses. Tani vazhdo me PPL ose foto."
      );
    } catch (error) {
      setScreenError(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full bg-neutral-900 p-6 border border-neutral-800 rounded-2xl shadow-lg space-y-4">
      <h2 className="text-2xl font-bold text-white">Dita e Punës</h2>
      <p className="text-gray-300">
        Zgjidhni datën dhe llojin e ditës. Për ditë pune, plotësoni planin dhe
        kilometrazhin fillestar. Për pushim ose mungesë, plotësoni arsyen.
      </p>

      <div className="space-y-2">
        <label className="block mb-2 font-medium text-gray-200">Data</label>
        <div className="flex items-center gap-3">
          <DateRangePicker
            startDate={parseIsoDate(selectedDate)}
            endDate={parseIsoDate(selectedDate)}
            mode="single"
            onChange={([start]) => {
              setSelectedDate(start ? start.toISOString().split("T")[0] : "");
            }}
          />
          <div className="flex-1 border border-neutral-700 bg-neutral-900 text-white p-2 rounded min-h-[42px] flex items-center">
            {selectedDate || "Zgjidh datën"}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-6">
          <LoadingSpinner size="sm" text="Duke ngarkuar ditën..." />
        </div>
      )}

      {screenError && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-red-200">
          {screenError}
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-green-800 bg-green-950/40 px-4 py-3 text-green-200">
          {successMessage}
        </div>
      )}

      {!isLoading && selectedDate && (
        <form onSubmit={saveStarterData} className="space-y-4">
          <div className="relative p-4 border border-neutral-800 rounded-xl bg-black space-y-2">
            <label className="block mb-2 font-medium text-gray-200">Eventi</label>
            <Select
              options={statusSelectOptions}
              value={
                statusSelectOptions.find((option) => option.value === form.status) ||
                null
              }
              onChange={(selected) =>
                setForm((prev) => ({
                  ...prev,
                  status: (selected?.value as WorkLogStatus) || "planned_work",
                }))
              }
              isClearable={false}
              className="react-select-container"
              classNamePrefix="react-select"
              styles={darkSelectStyles}
            />
          </div>

          {isWorkDay ? (
            <>
              <div className="relative p-4 border border-neutral-800 rounded-xl bg-black space-y-2">
                <label className="block mb-2 font-medium text-gray-200">
                  Plani
                </label>
                <textarea
                  value={form.plan}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, plan: event.target.value }))
                  }
                  placeholder="Plani i ditës"
                  className={`w-full ${inputClass} min-h-24`}
                />
              </div>

              <div className="relative p-4 border border-neutral-800 rounded-xl bg-black space-y-2">
                <label className="block mb-2 font-medium text-gray-200">
                  Kilometrazhi fillestar
                </label>
                <input
                  value={form.start_kilometers}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      start_kilometers: event.target.value,
                    }))
                  }
                  placeholder="Kilometrazhi fillestar"
                  className={`w-full ${inputClass}`}
                />
                {isLoadingKilometers && !form.start_kilometers.trim() && (
                  <p className="text-xs text-neutral-400">
                    Duke kërkuar kilometrazhin e fundit...
                  </p>
                )}
              </div>

              {hasWorkDayStarterData && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative p-4 border border-neutral-800 rounded-xl bg-black space-y-2">
                      <label className="block mb-2 font-medium text-gray-200">
                        Kilometrazhi përfundimtar
                      </label>
                      <input
                        value={form.end_kilometers}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            end_kilometers: event.target.value,
                          }))
                        }
                        placeholder="Kilometrazhi përfundimtar"
                        className={`w-full ${inputClass}`}
                      />
                    </div>

                    <div className="relative p-4 border border-neutral-800 rounded-xl bg-black space-y-2">
                      <label className="block mb-2 font-medium text-gray-200">
                        Kosto karburanti
                      </label>
                      <input
                        value={form.fuel_cost}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            fuel_cost: event.target.value,
                          }))
                        }
                        placeholder="Opsionale"
                        className={`w-full ${inputClass}`}
                      />
                    </div>

                    <div className="relative p-4 border border-neutral-800 rounded-xl bg-black space-y-2">
                      <label className="block mb-2 font-medium text-gray-200">
                        Litrat e karburantit
                      </label>
                      <input
                        value={form.fuel_liters}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            fuel_liters: event.target.value,
                          }))
                        }
                        placeholder="Opsionale"
                        className={`w-full ${inputClass}`}
                      />
                    </div>

                    <div className="relative p-4 border border-neutral-800 rounded-xl bg-black space-y-2">
                      <label className="block mb-2 font-medium text-gray-200">
                        Kosto tjetër udhëtimi
                      </label>
                      <input
                        value={form.other_travel_cost}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            other_travel_cost: event.target.value,
                          }))
                        }
                        placeholder="Opsionale"
                        className={`w-full ${inputClass}`}
                      />
                    </div>
                  </div>

                  <div className="relative p-4 border border-neutral-800 rounded-xl bg-black space-y-2">
                    <label className="block mb-2 font-medium text-gray-200">
                      Përmbledhja
                    </label>
                    <textarea
                      value={form.summary}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, summary: event.target.value }))
                      }
                      placeholder="Si shkoi dita?"
                      className={`w-full ${inputClass} min-h-24`}
                    />
                  </div>

                  <div className="relative p-4 border border-neutral-800 rounded-xl bg-black space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <label className="block font-medium text-gray-200">
                        Qytetet
                      </label>
                      <ActionButton
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            cities: [...prev.cities, emptyCity()],
                          }))
                        }
                        variant="secondary"
                        className="px-3 py-2"
                        scrollToTop={false}
                      >
                        Shto qytet
                      </ActionButton>
                    </div>

                    <div className="space-y-3">
                      {form.cities.map((city, index) => (
                        <div
                          key={`city-${index}`}
                          className="border border-neutral-800 rounded-xl p-3 space-y-3"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              value={city.city_name}
                              onChange={(event) =>
                                setForm((prev) => ({
                                  ...prev,
                                  cities: prev.cities.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? { ...item, city_name: event.target.value }
                                      : item
                                  ),
                                }))
                              }
                              placeholder="Qyteti"
                              className={`w-full ${inputClass}`}
                            />
                            <input
                              value={city.visit_order}
                              onChange={(event) =>
                                setForm((prev) => ({
                                  ...prev,
                                  cities: prev.cities.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? { ...item, visit_order: event.target.value }
                                      : item
                                  ),
                                }))
                              }
                              placeholder="Renditja"
                              className={`w-full ${inputClass}`}
                            />
                          </div>
                          <textarea
                            value={city.note}
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                cities: prev.cities.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, note: event.target.value }
                                    : item
                                ),
                              }))
                            }
                            placeholder="Shënim"
                            className={`w-full ${inputClass} min-h-20`}
                          />
                          {form.cities.length > 1 && (
                            <ActionButton
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  cities: prev.cities.filter(
                                    (_, itemIndex) => itemIndex !== index
                                  ),
                                }))
                              }
                              variant="danger"
                              className="px-3 py-2"
                              scrollToTop={false}
                            >
                              Largo
                            </ActionButton>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative p-4 border border-neutral-800 rounded-xl bg-black space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <label className="block font-medium text-gray-200">
                        Aktivitetet
                      </label>
                      <ActionButton
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            activities: [...prev.activities, emptyActivity()],
                          }))
                        }
                        variant="secondary"
                        className="px-3 py-2"
                        scrollToTop={false}
                      >
                        Shto aktivitet
                      </ActionButton>
                    </div>

                    <div className="space-y-3">
                      {form.activities.map((activity, index) => (
                        <div
                          key={`activity-${index}`}
                          className="border border-neutral-800 rounded-xl p-3 space-y-3"
                        >
                          <Select
                            options={WORK_ACTIVITY_TYPE_OPTIONS.map((option) => ({
                              value: option.value,
                              label: option.label,
                            }))}
                            value={{
                              value: activity.activity_type,
                              label:
                                WORK_ACTIVITY_TYPE_OPTIONS.find(
                                  (option) => option.value === activity.activity_type
                                )?.label || activity.activity_type,
                            }}
                            onChange={(selected) =>
                              setForm((prev) => ({
                                ...prev,
                                activities: prev.activities.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...item,
                                        activity_type:
                                          (selected?.value as WorkActivityType) ||
                                          "store_visit",
                                      }
                                    : item
                                ),
                              }))
                            }
                            isClearable={false}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            styles={darkSelectStyles}
                          />
                          <textarea
                            value={activity.note}
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                activities: prev.activities.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, note: event.target.value }
                                    : item
                                ),
                              }))
                            }
                            placeholder="Shënim"
                            className={`w-full ${inputClass} min-h-20`}
                          />
                          <div className="flex flex-wrap gap-4 text-sm text-gray-200">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={activity.planned}
                                onChange={(event) =>
                                  setForm((prev) => ({
                                    ...prev,
                                    activities: prev.activities.map((item, itemIndex) =>
                                      itemIndex === index
                                        ? { ...item, planned: event.target.checked }
                                        : item
                                    ),
                                  }))
                                }
                              />
                              I planifikuar
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={activity.completed}
                                onChange={(event) =>
                                  setForm((prev) => ({
                                    ...prev,
                                    activities: prev.activities.map((item, itemIndex) =>
                                      itemIndex === index
                                        ? { ...item, completed: event.target.checked }
                                        : item
                                    ),
                                  }))
                                }
                              />
                              I përfunduar
                            </label>
                          </div>
                          {form.activities.length > 1 && (
                            <ActionButton
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  activities: prev.activities.filter(
                                    (_, itemIndex) => itemIndex !== index
                                  ),
                                }))
                              }
                              variant="danger"
                              className="px-3 py-2"
                              scrollToTop={false}
                            >
                              Largo
                            </ActionButton>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="relative p-4 border border-neutral-800 rounded-xl bg-black space-y-2">
              <label className="block mb-2 font-medium text-gray-200">
                Arsyeja
              </label>
              <textarea
                value={form.absence_reason}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    absence_reason: event.target.value,
                  }))
                }
                placeholder="Arsyeja"
                className={`w-full ${inputClass} min-h-24`}
              />
            </div>
          )}

          <div className="text-left font-semibold text-gray-200">
            {selectedDay
              ? "Dita ekziston dhe është aktive."
              : "Ruani ditën për të vazhduar me aktivitetet."}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SubmitButton
              loading={isSaving}
              label={selectedDay ? "Përditëso Ditën" : "Dërgo Ditën"}
              loadingLabel="Duke dërguar..."
              className="h-[46px]"
            />

            <div className="border border-neutral-800 bg-black rounded-xl p-4 text-sm text-neutral-300">
              {selectedDay
                ? "Tani PPL, fotot dhe facings do lidhen me këtë ditë."
                : "Pasi ta dërgoni ditën, vazhdoni me aktivitetet e zakonshme."}
            </div>
          </div>

        </form>
      )}
    </div>
  );
};
