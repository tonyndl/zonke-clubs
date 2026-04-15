import React, { useState, useRef, useEffect } from "react";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCalendarLine,
} from "react-icons/ri";
import {
  DatePickerContainer,
  DateInput,
  CalendarDropdown,
  CalendarHeader,
  MonthYearDisplay,
  NavButton,
  CalendarGrid,
  DayLabel,
  DayCell,
  TodayButton,
  CalendarIcon,
} from "./styles";

interface DatePickerProps {
  value: string; // Format: YYYY-MM-DD
  onChange: (date: string) => void;
  minDate?: string;
  closedDays?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  minDate,
  closedDays = [],
}) => {
  const [closedTooltip, setClosedTooltip] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      const [year, month] = value.split("-").map(Number);
      return new Date(year, month - 1, 1);
    }
    return new Date();
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Scroll the calendar into view after it renders
      setTimeout(() => {
        calendarRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 50);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const formatDate = (date: Date): string => {
    // Use local timezone to avoid date shifting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return "Select a date";
    // Parse date in local timezone to avoid shifting
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{
      date: Date;
      day: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      isDisabled: boolean;
      isClosed: boolean;
    }> = [];

    const isClosed = (d: Date) => closedDays.includes(d.getDay());
    const isBeforeMin = (d: Date) =>
      minDate ? formatDate(d) < minDate : false;

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, month - 1, day);
      days.push({
        date,
        day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: isBeforeMin(date) || isClosed(date),
        isClosed: isClosed(date),
      });
    }

    // Current month days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDate(date);
      const todayStr = formatDate(today);

      days.push({
        date,
        day,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isSelected: dateStr === value,
        isDisabled: isBeforeMin(date) || isClosed(date),
        isClosed: isClosed(date),
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: isBeforeMin(date) || isClosed(date),
        isClosed: isClosed(date),
      });
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
  };

  const handleDateSelect = (
    date: Date,
    isDisabled: boolean,
    isClosed: boolean,
  ) => {
    if (isClosed) {
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      setClosedTooltip(`Club is closed on ${dayName}s`);
      setTimeout(() => setClosedTooltip(null), 2000);
      return;
    }
    if (isDisabled) return;
    onChange(formatDate(date));
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    onChange(formatDate(today));
    setCurrentMonth(today);
    setIsOpen(false);
  };

  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <DatePickerContainer ref={containerRef}>
      <DateInput
        hasValue={!!value}
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{formatDisplayDate(value)}</span>
        <CalendarIcon>
          {React.createElement(RiCalendarLine as React.ComponentType)}
        </CalendarIcon>
      </DateInput>

      <CalendarDropdown ref={calendarRef} isOpen={isOpen} showAbove={false}>
        <CalendarHeader>
          <NavButton type="button" onClick={handlePrevMonth}>
            {React.createElement(RiArrowLeftSLine as React.ComponentType)}
          </NavButton>
          <MonthYearDisplay>{monthYear}</MonthYearDisplay>
          <NavButton type="button" onClick={handleNextMonth}>
            {React.createElement(RiArrowRightSLine as React.ComponentType)}
          </NavButton>
        </CalendarHeader>

        <CalendarGrid>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <DayLabel key={day}>{day}</DayLabel>
          ))}
          {days.map((day, index) => (
            <DayCell
              key={index}
              type="button"
              isSelected={day.isSelected}
              isToday={day.isToday}
              isDisabled={day.isDisabled}
              isOtherMonth={!day.isCurrentMonth}
              onClick={() =>
                handleDateSelect(day.date, day.isDisabled, day.isClosed)
              }
              disabled={day.isDisabled && !day.isClosed}
              title={day.isClosed ? "Club is closed" : undefined}
              style={
                day.isClosed && day.isCurrentMonth
                  ? { textDecoration: "line-through" }
                  : undefined
              }
            >
              {day.day}
            </DayCell>
          ))}
        </CalendarGrid>

        {closedTooltip && (
          <div
            style={{
              padding: "8px 16px",
              textAlign: "center",
              fontSize: "13px",
              fontWeight: 600,
              color: "#ef4444",
              borderTop: "1px solid rgba(239, 68, 68, 0.2)",
              background: "rgba(239, 68, 68, 0.08)",
            }}
          >
            {closedTooltip}
          </div>
        )}

        <TodayButton type="button" onClick={handleToday}>
          Today
        </TodayButton>
      </CalendarDropdown>
    </DatePickerContainer>
  );
};
