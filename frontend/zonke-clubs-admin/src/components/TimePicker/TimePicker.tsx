import React, { useState, useRef, useEffect } from "react";
import { RiArrowRightSLine, RiTimeLine } from "react-icons/ri";
import {
  TimePickerContainer,
  TimeInput,
  TimeDisplay,
  TimeDropdown,
  TimeList,
  TimeOption,
  TimePeriod,
  ArrowIcon,
} from "./styles";

interface TimePickerProps {
  value: string; // Format: HH:MM
  onChange: (time: string) => void;
}

const generateTimeOptions = (): string[] => {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const h = hour.toString().padStart(2, "0");
      const m = minute.toString().padStart(2, "0");
      times.push(`${h}:${m}`);
    }
  }
  return times;
};

const formatTimeDisplay = (time: string): string => {
  if (!time) return "Select time";
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

const getTimePeriod = (time: string): string => {
  const [hours] = time.split(":").map(Number);

  if (hours >= 0 && hours < 6) return "Night";
  if (hours >= 6 && hours < 12) return "Morning";
  if (hours >= 12 && hours < 17) return "Afternoon";
  if (hours >= 17 && hours < 21) return "Evening";
  return "Night";
};

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [positionAbove, setPositionAbove] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeOptions = generateTimeOptions();

  // Calculate dropdown position when opened
  useEffect(() => {
    if (isOpen && containerRef.current && dropdownRef.current) {
      const inputRect = containerRef.current.getBoundingClientRect();
      const dropdownHeight = 320; // max-height of dropdown
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - inputRect.bottom;
      const spaceAbove = inputRect.top;

      // Position above if not enough space below and more space above
      setPositionAbove(spaceBelow < dropdownHeight && spaceAbove > spaceBelow);
    }
  }, [isOpen]);

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
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && value && listRef.current) {
      const selectedIndex = timeOptions.indexOf(value);
      if (selectedIndex !== -1) {
        const selectedElement = listRef.current.children[
          selectedIndex
        ] as HTMLElement;
        if (selectedElement) {
          selectedElement.scrollIntoView({
            block: "center",
            behavior: "smooth",
          });
        }
      }
    }
  }, [isOpen, value, timeOptions]);

  const handleTimeSelect = (time: string) => {
    onChange(time);
    setIsOpen(false);
  };

  return (
    <TimePickerContainer ref={containerRef}>
      <TimeInput
        hasValue={!!value}
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <TimeDisplay>
          {React.createElement(RiTimeLine as React.ComponentType)}
          <span>{formatTimeDisplay(value)}</span>
        </TimeDisplay>
        <ArrowIcon isOpen={isOpen}>
          {React.createElement(RiArrowRightSLine as React.ComponentType)}
        </ArrowIcon>
      </TimeInput>

      <TimeDropdown
        ref={dropdownRef}
        isOpen={isOpen}
        positionAbove={positionAbove}
      >
        <TimeList ref={listRef}>
          {timeOptions.map((time) => (
            <TimeOption
              key={time}
              type="button"
              isSelected={time === value}
              onClick={() => handleTimeSelect(time)}
            >
              <span>{formatTimeDisplay(time)}</span>
              <TimePeriod isSelected={time === value}>
                {getTimePeriod(time)}
              </TimePeriod>
            </TimeOption>
          ))}
        </TimeList>
      </TimeDropdown>
    </TimePickerContainer>
  );
};
