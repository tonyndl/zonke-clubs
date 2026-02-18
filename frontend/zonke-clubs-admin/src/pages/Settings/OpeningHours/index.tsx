import React, { useState, useEffect } from "react";
import { CardTitle, CardDescription } from "../../../components/Card";
import { PrimaryButton, OutlineButton } from "../../../components/Buttons";
import { theme } from "../../../styles/theme";
import { RiTimeLine, RiCheckLine, RiCloseLine } from "react-icons/ri";
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
  TimeInput,
  TimeSeparator,
  ToggleButton,
  FormActions,
  ClosedLabel,
  WeekIndicator,
  WeekText,
  WeekDate,
} from "./styles";

interface DayHours {
  open: string;
  close: string;
  isOpen: boolean;
}

interface WeekSchedule {
  [key: string]: DayHours;
}

export const OpeningHours: React.FC = () => {
  const toast = useToast();
  const [schedule, setSchedule] = useState<WeekSchedule>({
    Monday: { open: "20:00", close: "02:00", isOpen: false },
    Tuesday: { open: "20:00", close: "02:00", isOpen: false },
    Wednesday: { open: "20:00", close: "02:00", isOpen: true },
    Thursday: { open: "20:00", close: "03:00", isOpen: true },
    Friday: { open: "20:00", close: "04:00", isOpen: true },
    Saturday: { open: "21:00", close: "05:00", isOpen: true },
    Sunday: { open: "18:00", close: "23:00", isOpen: true },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalSchedule, setOriginalSchedule] = useState<WeekSchedule | null>(
    null,
  );

  // Load opening hours from backend
  useEffect(() => {
    loadOpeningHours();
  }, []);

  const loadOpeningHours = () => {
    console.log("📥 Loading opening hours from backend...");
    setLoading(true);
    apiService
      .getMyClub()
      .then((club) => {
        console.log("✅ Club data received:", club);
        console.log("Opening hours from backend:", club.opening_hours);

        const days = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ];
        const uiSchedule: WeekSchedule = {};

        if (club.opening_hours && Object.keys(club.opening_hours).length > 0) {
          // Convert backend format to UI format
          const backendHours = club.opening_hours;

          days.forEach((day) => {
            if (
              backendHours[day] &&
              backendHours[day].open &&
              backendHours[day].close
            ) {
              uiSchedule[day] = {
                open: backendHours[day].open,
                close: backendHours[day].close,
                isOpen: true,
              };
            } else {
              uiSchedule[day] = {
                open: "20:00",
                close: "02:00",
                isOpen: false,
              };
            }
          });

          console.log(
            "📋 Converted existing opening hours to UI format:",
            uiSchedule,
          );
        } else {
          // No opening hours in database - use default schedule
          console.log(
            "⚠️ No opening hours in database, using default schedule",
          );
          days.forEach((day) => {
            uiSchedule[day] = {
              open: "20:00",
              close: "02:00",
              isOpen: false,
            };
          });
        }

        setSchedule(uiSchedule);
        setOriginalSchedule(uiSchedule);
        console.log("✅ Schedule and originalSchedule set:", uiSchedule);
      })
      .catch((error) => {
        console.error("❌ Failed to load opening hours:", error);
        toast.error("Failed to load opening hours");
      })
      .finally(() => {
        console.log("✅ Loading complete, setting loading to false");
        setLoading(false);
      });
  };

  const handleToggleDay = (day: string) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        isOpen: !schedule[day].isOpen,
      },
    });
  };

  const handleTimeChange = (
    day: string,
    field: "open" | "close",
    value: string,
  ) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        [field]: value,
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("⏰ Opening Hours - handleSubmit called");
    console.log("📊 Current schedule state:", schedule);

    // Convert UI format to backend format
    const backendHours: Record<string, { open: string; close: string } | null> =
      {};
    Object.keys(schedule).forEach((day) => {
      if (schedule[day].isOpen) {
        backendHours[day] = {
          open: schedule[day].open,
          close: schedule[day].close,
        };
      } else {
        backendHours[day] = null;
      }
    });

    console.log("📤 Sending to API:", { opening_hours: backendHours });

    setSaving(true);
    apiService
      .setupClub({ opening_hours: backendHours })
      .then((response) => {
        console.log("✅ API response received:", response);
        toast.success("Opening hours updated successfully!");
        setOriginalSchedule(schedule);
      })
      .catch((error) => {
        console.error("❌ API request failed:", error);
        console.error("❌ Error details:", error.response?.data);
        console.error("❌ Error status:", error.response?.status);
        toast.error("Failed to update opening hours");
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleCancel = () => {
    if (originalSchedule) {
      setSchedule(originalSchedule);
    }
  };

  // Check if schedule has been modified
  const hasChanges = React.useMemo(() => {
    console.log("🔍 Checking for changes...");
    console.log("originalSchedule:", originalSchedule);
    console.log("current schedule:", schedule);

    if (!originalSchedule) {
      console.log("⚠️ No originalSchedule - returning false");
      return false;
    }

    const changed = Object.keys(schedule).some((day) => {
      const current = schedule[day];
      const original = originalSchedule[day];

      const dayChanged =
        current.isOpen !== original.isOpen ||
        current.open !== original.open ||
        current.close !== original.close;

      if (dayChanged) {
        console.log(`📅 ${day} has changes:`, {
          current,
          original,
        });
      }

      return dayChanged;
    });

    console.log("hasChanges result:", changed);
    return changed;
  }, [schedule, originalSchedule]);

  // Get current week date range
  const weekDateRange = React.useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();

    // Calculate Monday of current week (0 = Sunday, 1 = Monday, etc.)
    const monday = new Date(today);
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days, else go to Monday
    monday.setDate(today.getDate() + diff);

    // Calculate Sunday of current week
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatDate = (date: Date) => {
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
      return `${months[date.getMonth()]} ${date.getDate()}`;
    };

    return `${formatDate(monday)} - ${formatDate(sunday)}, ${today.getFullYear()}`;
  }, []);

  // Get date for each day of the week
  const getDayDate = React.useCallback((dayName: string) => {
    const today = new Date();
    const dayOfWeek = today.getDay();

    // Calculate Monday of current week
    const monday = new Date(today);
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(today.getDate() + diff);

    // Map day names to offsets from Monday
    const dayOffsets: Record<string, number> = {
      Monday: 0,
      Tuesday: 1,
      Wednesday: 2,
      Thursday: 3,
      Friday: 4,
      Saturday: 5,
      Sunday: 6,
    };

    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + dayOffsets[dayName]);

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
    return `${months[targetDate.getMonth()]} ${targetDate.getDate()}`;
  }, []);

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

        <WeekIndicator>
          {React.createElement(RiTimeLine as React.ComponentType)}
          <WeekText>Current Week:</WeekText>
          <WeekDate>{weekDateRange}</WeekDate>
        </WeekIndicator>

        <form onSubmit={handleSubmit}>
          {Object.keys(schedule).map((day) => (
            <DayRow key={day}>
              <DayName>
                <DayNameText>{day}</DayNameText>
                <DayDateText>{getDayDate(day)}</DayDateText>
              </DayName>

              <TimeInputs>
                {schedule[day].isOpen ? (
                  <>
                    <TimeInput
                      type="time"
                      value={schedule[day].open}
                      onChange={(e) =>
                        handleTimeChange(day, "open", e.target.value)
                      }
                    />
                    <TimeSeparator>to</TimeSeparator>
                    <TimeInput
                      type="time"
                      value={schedule[day].close}
                      onChange={(e) =>
                        handleTimeChange(day, "close", e.target.value)
                      }
                    />
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
              onClick={() => {
                console.log("🔘 Save button clicked");
                console.log(
                  "Button disabled?",
                  saving || loading || !hasChanges,
                );
                console.log("  - saving:", saving);
                console.log("  - loading:", loading);
                console.log("  - hasChanges:", hasChanges);
              }}
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
