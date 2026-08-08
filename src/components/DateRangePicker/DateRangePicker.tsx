import { useState } from "react";
import {
  useFloating,
  offset,
  flip,
  shift,
  limitShift,
} from "@floating-ui/react-dom-interactions";
import ActionButton from "../Buttons/ActionButtons";

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (range: [Date | null, Date | null]) => void;
  mode?: "range" | "single";
}

const formatInputDate = (date: Date | null) =>
  date ? date.toISOString().split("T")[0] : "";

const DateRangePicker = ({
  startDate,
  endDate,
  onChange,
  mode = "range",
}: DateRangePickerProps) => {
  const [open, setOpen] = useState(false);
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);

  const { x, y, reference, floating, strategy, update } = useFloating({
    placement: "bottom-start",
    middleware: [offset(6), flip(), shift({ limiter: limitShift() })],
  });

  const handleConfirm = () => {
    if (mode === "single") {
      onChange([tempStart, tempStart]);
    } else {
      onChange([tempStart, tempEnd]);
    }
    setOpen(false);
  };

  const handleClear = () => {
    setTempStart(null);
    setTempEnd(null);
    onChange([null, null]);
    setOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        ref={reference}
        onClick={() => {
          setOpen((prev) => !prev);
          setTimeout(() => update(), 0);
        }}
        className="flex items-center justify-center w-12 h-12 border border-neutral-800 cursor-pointer bg-neutral-900 text-white rounded-xl hover:border-white transition-colors"
        title="Pick date range"
      >
        📅
      </button>

      {open && (
        <div
          ref={floating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            zIndex: 50,
          }}
          className="w-72 max-w-[90vw] bg-neutral-900 border border-neutral-700 rounded-xl shadow-lg p-4 text-white space-y-4"
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm">
              {mode === "single" ? "Data" : "Nga Data"}
            </label>
            <input
              type="date"
              value={formatInputDate(tempStart)}
              onChange={(e) => {
                const value = e.target.value ? new Date(e.target.value) : null;
                setTempStart(value);
                if (mode === "single") {
                  setTempEnd(value);
                }
              }}
              className="bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-sm text-white"
            />

            {mode === "range" && (
              <>
                <label className="text-sm">Deri më</label>
                <input
                  type="date"
                  value={formatInputDate(tempEnd)}
                  min={formatInputDate(tempStart) || undefined}
                  onChange={(e) =>
                    setTempEnd(e.target.value ? new Date(e.target.value) : null)
                  }
                  className="bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-sm text-white"
                />
              </>
            )}
          </div>

          <div className="flex justify-between gap-2 pt-2">
            <ActionButton
              onClick={handleClear}
              variant="secondary"
              className="text-sm px-4 py-2"
            >
              Largo
            </ActionButton>
            <ActionButton
              onClick={handleConfirm}
              variant="primary"
              className="text-sm px-4 py-2"
              disabled={!tempStart || (mode === "range" && !tempEnd)}
            >
              Zgjidhni
            </ActionButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
