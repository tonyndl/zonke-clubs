import React, { useState, useEffect } from "react";
import { CardTitle } from "../../../components/Card";
import { PrimaryButton, OutlineButton } from "../../../components/Buttons";
import { theme } from "../../../styles/theme";
import {
  RiTimeLine,
  RiCheckLine,
  RiCloseLine,
  RiCalendarLine,
} from "react-icons/ri";
import { apiService } from "../../../services/api";
import { useToast } from "../../../components/Toast";
import {
  SettingsContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  FormCard,
  DayRow,
  DayName,
  DayNameText,
  DayDateText,
  TimeInputs,
  TimeSelectWrapper,
  TimeClockIcon,
  TimeSelect,
  TimeSeparator,
  ToggleButton,
  FormActions,
  ClosedLabel,
  WeekIndicator,
  WeekText,
  WeekDate,
  WeekTabs,
  WeekTab,
} from "./styles";

interface DayHours {
  open: string;
  close: string;
  isOpen: boolean;
}

interface WeekSchedule {
  [key: string]: DayHours;
}

type WeekView = "this" | "next";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DEFAULT_DAY: DayHours = { open: "20:00", close: "02:00", isOpen: false };

const TIME_OPTIONS: string[] = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

function formatTimeLabel(time: string): string {
  const [hourStr, minute] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minute} ${period}`;
}

function parseBackendHours(backendHours: Record<string, any>): WeekSchedule {
  const schedule: WeekSchedule = {};
  DAYS.forEach((day) => {
    if (backendHours[day]?.open && backendHours[day]?.close) {
      schedule[day] = {
        open: backendHours[day].open,
        close: backendHours[day].close,
        isOpen: true,
      };
    } else {
      schedule[day] = { ...DEFAULT_DAY };
    }
  });
  return schedule;
}

function emptySchedule(): WeekSchedule {
  const schedule: WeekSchedule = {};
  DAYS.forEach((day) => {
    schedule[day] = { ...DEFAULT_DAY };
  });
  return schedule;
}

function getWeekDateRange(offsetWeeks: number): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(today.getDate() + diff + offsetWeeks * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[monday.getMonth()]} ${monday.getDate()} - ${months[sunday.getMonth()]} ${sunday.getDate()}, ${sunday.getFullYear()}`;
}

function getDayDate(dayName: string, offsetWeeks: number): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(today.getDate() + diff + offsetWeeks * 7);
  const dayOffsets: Record<string, number> = {
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
    Saturday: 5,
    Sunday: 6,
  };
  const target = new Date(monday);
  target.setDate(monday.getDate() + dayOffsets[dayName]);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[target.getMonth()]} ${target.getDate()}`;
}

export const OpeningHours: React.FC = () => {
  const toast = useToast();
  const [activeWeek, setActiveWeek] = useState<WeekView>("this");

  const [thisWeekSchedule, setThisWeekSchedule] =
    useState<WeekSchedule>(emptySchedule());
  const [nextWeekSchedule, setNextWeekSchedule] =
    useState<WeekSchedule>(emptySchedule());

  const [originalThisWeek, setOriginalThisWeek] = useState<WeekSchedule | null>(
    null,
  );
  const [originalNextWeek, setOriginalNextWeek] = useState<WeekSchedule | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiService
      .getMyClub()
      .then((club) => {
        const thisWeek =
          club.opening_hours && Object.keys(club.opening_hours).length > 0
            ? parseBackendHours(club.opening_hours)
            : emptySchedule();

        // Next week: use saved data if present, otherwise copy from this week
        const nextWeek =
          club.next_week_hours && Object.keys(club.next_week_hours).length > 0
            ? parseBackendHours(club.next_week_hours)
            : JSON.parse(JSON.stringify(thisWeek)); // deep copy of this week

        setThisWeekSchedule(thisWeek);
        setNextWeekSchedule(nextWeek);
        setOriginalThisWeek(thisWeek);
        setOriginalNextWeek(nextWeek);
      })
      .catch(() => {
        toast.error("Failed to load opening hours");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const schedule = activeWeek === "this" ? thisWeekSchedule : nextWeekSchedule;
  const setSchedule =
    activeWeek === "this" ? setThisWeekSchedule : setNextWeekSchedule;
  const originalSchedule =
    activeWeek === "this" ? originalThisWeek : originalNextWeek;

  const handleToggleDay = (day: string) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], isOpen: !schedule[day].isOpen },
    });
  };

  const handleTimeChange = (
    day: string,
    field: "open" | "close",
    value: string,
  ) => {
    setSchedule({ ...schedule, [day]: { ...schedule[day], [field]: value } });
  };

  const handleCancel = () => {
    if (originalSchedule) setSchedule(originalSchedule);
  };

  const hasChanges = React.useMemo(() => {
    if (!originalSchedule) return false;
    return DAYS.some((day) => {
      const cur = schedule[day];
      const orig = originalSchedule[day];
      return (
        cur.isOpen !== orig.isOpen ||
        cur.open !== orig.open ||
        cur.close !== orig.close
      );
    });
  }, [schedule, originalSchedule]);

  const toBackendFormat = (s: WeekSchedule) => {
    const result: Record<string, { open: string; close: string } | null> = {};
    DAYS.forEach((day) => {
      result[day] = s[day].isOpen
        ? { open: s[day].open, close: s[day].close }
        : null;
    });
    return result;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload: Record<string, any> = {
      opening_hours: toBackendFormat(thisWeekSchedule),
      next_week_hours: toBackendFormat(nextWeekSchedule),
    };

    apiService
      .setupClub(payload)
      .then(() => {
        toast.success("Opening hours updated successfully!");
        setOriginalThisWeek(thisWeekSchedule);
        setOriginalNextWeek(nextWeekSchedule);
      })
      .catch(() => {
        toast.error("Failed to update opening hours");
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const offsetWeeks = activeWeek === "this" ? 0 : 1;

  return (
    <SettingsContainer>
      <PageHeader>
        <PageTitle>Opening Hours</PageTitle>
        <PageDescription>
          Set your club's weekly opening hours so customers know when to visit.
        </PageDescription>
      </PageHeader>

      <FormCard>
        <CardTitle style={{ marginBottom: theme.spacing.lg }}>
          Weekly Schedule
        </CardTitle>

        <WeekTabs>
          <WeekTab
            active={activeWeek === "this"}
            onClick={() => setActiveWeek("this")}
          >
            This Week
          </WeekTab>
          <WeekTab
            active={activeWeek === "next"}
            onClick={() => setActiveWeek("next")}
          >
            Next Week
          </WeekTab>
        </WeekTabs>

        <WeekIndicator>
          {React.createElement(RiCalendarLine as React.ComponentType)}
          <WeekText>
            {activeWeek === "this" ? "Current Week:" : "Upcoming Week:"}
          </WeekText>
          <WeekDate>{getWeekDateRange(offsetWeeks)}</WeekDate>
        </WeekIndicator>

        <form onSubmit={handleSubmit}>
          {DAYS.map((day) => (
            <DayRow key={day}>
              <DayName>
                <DayNameText>{day}</DayNameText>
                <DayDateText>{getDayDate(day, offsetWeeks)}</DayDateText>
              </DayName>

              <TimeInputs>
                {schedule[day].isOpen ? (
                  <>
                    <TimeSelectWrapper>
                      <TimeClockIcon>
                        {React.createElement(RiTimeLine as React.ComponentType)}
                      </TimeClockIcon>
                      <TimeSelect
                        value={schedule[day].open}
                        onChange={(e) =>
                          handleTimeChange(day, "open", e.target.value)
                        }
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {formatTimeLabel(t)}
                          </option>
                        ))}
                      </TimeSelect>
                    </TimeSelectWrapper>
                    <TimeSeparator>to</TimeSeparator>
                    <TimeSelectWrapper>
                      <TimeClockIcon>
                        {React.createElement(RiTimeLine as React.ComponentType)}
                      </TimeClockIcon>
                      <TimeSelect
                        value={schedule[day].close}
                        onChange={(e) =>
                          handleTimeChange(day, "close", e.target.value)
                        }
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {formatTimeLabel(t)}
                          </option>
                        ))}
                      </TimeSelect>
                    </TimeSelectWrapper>
                  </>
                ) : (
                  <ClosedLabel>Closed</ClosedLabel>
                )}
              </TimeInputs>

              <ToggleButton
                type="button"
                active={schedule[day].isOpen}
                onClick={() => handleToggleDay(day)}
              >
                {schedule[day].isOpen ? (
                  <>
                    {React.createElement(RiCheckLine as React.ComponentType)}
                    Open
                  </>
                ) : (
                  <>
                    {React.createElement(RiCloseLine as React.ComponentType)}
                    Closed
                  </>
                )}
              </ToggleButton>
            </DayRow>
          ))}

          <FormActions>
            {hasChanges && (
              <OutlineButton
                type="button"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </OutlineButton>
            )}
            <PrimaryButton
              type="submit"
              disabled={saving || loading || !hasChanges}
            >
              {React.createElement(RiTimeLine as React.ComponentType)}
              {saving ? "Saving..." : "Save Schedule"}
            </PrimaryButton>
          </FormActions>
        </form>
      </FormCard>
    </SettingsContainer>
  );
};
