import React from "react";
import {
  RiAddLine,
  RiMusic2Line,
  RiTimeLine,
  RiDeleteBinLine,
} from "react-icons/ri";
import { PrimaryButton } from "../../Buttons";
import {
  CalendarContainer,
  CalendarHeader,
  CalendarTitle,
  CalendarGrid,
  DayColumn,
  DayHeader,
  DayName,
  DaySlots,
  SlotCard,
  SlotDJ,
  SlotTime,
  SlotNotes,
  DeleteButton,
  EmptySlot,
} from "./styles";

interface WeeklyCalendarProps {
  schedules: DaySchedule[];
  onAddSchedule: () => void;
  onDeleteSchedule: (scheduleId: string) => void;
}

interface DaySchedule {
  id: string;
  day: string;
  dayOfWeek: number; // 0-6
  djName: string;
  startTime: string;
  endTime?: string;
  notes?: string;
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  schedules,
  onAddSchedule,
  onDeleteSchedule,
}) => {
  // Group schedules by day of week
  const schedulesByDay = DAYS.map((day, index) => ({
    day,
    dayOfWeek: index,
    slots: schedules.filter((s) => s.dayOfWeek === index),
  }));

  return (
    <CalendarContainer>
      <CalendarHeader>
        <CalendarTitle>Weekly DJ Schedule</CalendarTitle>
        <PrimaryButton onClick={onAddSchedule}>
          {React.createElement(RiAddLine as React.ComponentType)}
          Add Schedule
        </PrimaryButton>
      </CalendarHeader>

      <CalendarGrid>
        {schedulesByDay.map(({ day, slots }) => (
          <DayColumn key={day}>
            <DayHeader>
              <DayName>{day}</DayName>
            </DayHeader>
            <DaySlots>
              {slots.length > 0 ? (
                slots.map((slot) => (
                  <SlotCard key={slot.id}>
                    <DeleteButton
                      className="delete-button"
                      onClick={() => onDeleteSchedule(slot.id)}
                      title="Delete schedule"
                    >
                      {React.createElement(
                        RiDeleteBinLine as React.ComponentType,
                      )}
                    </DeleteButton>
                    <SlotDJ>
                      {React.createElement(RiMusic2Line as React.ComponentType)}
                      {slot.djName}
                    </SlotDJ>
                    <SlotTime>
                      {React.createElement(RiTimeLine as React.ComponentType)}
                      {slot.startTime}
                      {slot.endTime && ` - ${slot.endTime}`}
                    </SlotTime>
                    {slot.notes && <SlotNotes>{slot.notes}</SlotNotes>}
                  </SlotCard>
                ))
              ) : (
                <EmptySlot>No DJs scheduled</EmptySlot>
              )}
            </DaySlots>
          </DayColumn>
        ))}
      </CalendarGrid>
    </CalendarContainer>
  );
};
