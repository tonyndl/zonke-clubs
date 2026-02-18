import React, { useState } from "react";
import {
  RiAddLine,
  RiMusic2Line,
  RiTimeLine,
  RiDeleteBinLine,
  RiEditLine,
  RiFileCopyLine,
  RiDraggable,
  RiAlertLine,
  RiTrophyFill,
} from "react-icons/ri";
import {
  CalendarContainer,
  CalendarHeader,
  CalendarTitle,
  CalendarScrollWrapper,
  CalendarGrid,
  DayColumn,
  DayHeader,
  DayNameRow,
  TrophyIcon,
  DayName,
  DayDate,
  EventBadgeText,
  DaySlots,
  SlotCard,
  DragHandle,
  QuickActions,
  ActionButton,
  SlotHeader,
  DJAvatar,
  SlotInfo,
  SlotDJ,
  GenreTag,
  SlotTime,
  SlotNotes,
  TimeConflictWarning,
  QuickAddContainer,
  QuickAddButton,
  DJDropdown,
  DJOption,
  DJOptionInfo,
  DJOptionName,
  DJOptionGenre,
  EmptySlot,
  getGenreColor,
} from "./styles";

interface DraggableWeeklyCalendarProps {
  schedules: DJScheduleItem[];
  djs: Array<{ id: string; name: string; genre?: string; image?: string }>;
  events?: Array<{
    id: string;
    title: string;
    date: string;
    status: string;
    dj_lineup?: string[];
  }>;
  weekStart?: Date;
  onAddSchedule: () => void;
  onEditSchedule: (scheduleId: string) => void;
  onDeleteSchedule: (scheduleId: string) => void;
  onDeleteScheduleWithContext?: (
    scheduleId: string,
    eventId?: string,
    djId?: string,
  ) => void;
  onDuplicateSchedule: (scheduleId: string, newDayOfWeek: number) => void;
  onMoveSchedule: (scheduleId: string, newDayOfWeek: number) => void;
  onQuickAddDJ?: (djId: string, dayOfWeek: number) => void;
  onAddDJToEvent?: (eventId: string, djId: string) => void;
  onRemoveDJFromEvent?: (eventId: string, djId: string) => void;
}

export interface DJScheduleItem {
  id: string;
  djId: string;
  djName: string;
  day: string;
  dayOfWeek: number;
  startTime?: string;
  endTime?: string;
  notes?: string;
  type: string;
  specificDate?: string;
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
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Get week dates starting from the given Sunday (defaults to current week)
function getWeekDates(weekStart?: Date): Date[] {
  let sunday: Date;
  if (weekStart) {
    sunday = new Date(weekStart);
  } else {
    const today = new Date();
    sunday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    sunday.setDate(sunday.getDate() - sunday.getDay());
  }

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + i);
    return date;
  });
}

// Check for time conflicts
function hasTimeConflict(
  schedule: DJScheduleItem,
  otherSchedules: DJScheduleItem[],
): boolean {
  if (!schedule.startTime) return false;

  return otherSchedules.some((other) => {
    if (other.id === schedule.id || !other.startTime) return false;

    const start1 = timeToMinutes(schedule.startTime!);
    const end1 = schedule.endTime
      ? timeToMinutes(schedule.endTime)
      : start1 + 120;
    const start2 = timeToMinutes(other.startTime);
    const end2 = other.endTime ? timeToMinutes(other.endTime) : start2 + 120;

    return start1 < end2 && end1 > start2;
  });
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export const DraggableWeeklyCalendar: React.FC<
  DraggableWeeklyCalendarProps
> = ({
  schedules,
  djs,
  events = [],
  weekStart,
  onAddSchedule,
  onEditSchedule,
  onDeleteSchedule,
  onDeleteScheduleWithContext,
  onDuplicateSchedule,
  onMoveSchedule,
  onQuickAddDJ,
  onAddDJToEvent,
  onRemoveDJFromEvent,
}) => {
  const [draggedSchedule, setDraggedSchedule] = useState<DJScheduleItem | null>(
    null,
  );
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);
  const [openDropdownDay, setOpenDropdownDay] = useState<number | null>(null);

  const weekDates = getWeekDates(weekStart);

  // Group schedules by day of week
  const schedulesByDay = DAYS.map((day, index) => {
    const date = weekDates[index];
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const dayNum = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${dayNum}`;

    // Check if there's a published event on this date
    const event = events.find(
      (e) => e.date === dateStr && e.status === "published",
    );

    // Get all scheduled DJs for this day
    let slots = schedules.filter(
      (s) => s.dayOfWeek === index && s.type === "weekly",
    );

    // If there's a published event with a DJ lineup, create slots for event DJs
    if (event && event.dj_lineup && event.dj_lineup.length > 0) {
      // Create slots for each DJ in the event lineup
      slots = event.dj_lineup.map((djIdOrName) => {
        // Check if this DJ already has a schedule for this day (by ID)
        const existingSlot = slots.find((s) => s.djId === djIdOrName);
        if (existingSlot) {
          return existingSlot;
        }

        // Try to find DJ by ID first, then by name
        let dj = djs.find((d) => d.id === djIdOrName);
        if (!dj) {
          // Fallback: try to find by name (case-insensitive)
          dj = djs.find(
            (d) => d.name.toLowerCase() === djIdOrName.toLowerCase(),
          );
        }

        // Use the found DJ's ID if we matched by name, otherwise use the provided value
        const djId = dj?.id || djIdOrName;

        return {
          id: `event-${event.id}-${djId}`,
          djId: djId,
          djName: dj?.name || djIdOrName,
          day: day,
          dayOfWeek: index,
          startTime: undefined,
          endTime: undefined,
          type: "weekly" as const,
          notes: `Part of ${event.title}`,
        };
      });
    }

    return {
      day,
      dayOfWeek: index,
      date,
      slots,
    };
  });

  const handleDragStart = (e: React.DragEvent, schedule: DJScheduleItem) => {
    setDraggedSchedule(schedule);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget.innerHTML);
  };

  const handleDragEnd = () => {
    setDraggedSchedule(null);
    setDragOverDay(null);
  };

  const handleDragOver = (e: React.DragEvent, dayOfWeek: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverDay(dayOfWeek);
  };

  const handleDragLeave = () => {
    setDragOverDay(null);
  };

  const handleDrop = (e: React.DragEvent, dayOfWeek: number) => {
    e.preventDefault();
    console.log("🎯 handleDrop called:", { dayOfWeek, draggedSchedule });

    if (!draggedSchedule) {
      console.log("⚠️ No dragged schedule, returning");
      setDragOverDay(null);
      return;
    }

    // Check if the target day has a published event
    const targetDate = weekDates[dayOfWeek];
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const day = String(targetDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    const targetEvent = events.find(
      (e) => e.date === dateStr && e.status === "published",
    );

    console.log("🔍 Checking for event on target day:", {
      dateStr,
      targetEvent,
    });

    // If there's a published event on the target day, add DJ to event
    if (targetEvent && onAddDJToEvent) {
      console.log("🎉 Adding DJ to event:", targetEvent.title);
      onAddDJToEvent(targetEvent.id, draggedSchedule.djId);
    } else if (draggedSchedule.dayOfWeek !== dayOfWeek) {
      // Otherwise, move the schedule normally
      console.log(
        "📅 Moving schedule from day",
        draggedSchedule.dayOfWeek,
        "to day",
        dayOfWeek,
      );
      onMoveSchedule(draggedSchedule.id, dayOfWeek);
    } else {
      console.log("⚠️ Schedule already on this day, no action needed");
    }

    setDraggedSchedule(null);
    setDragOverDay(null);
  };

  const getDJInfo = (djId: string) => {
    return djs.find((dj) => dj.id === djId);
  };

  const handleToggleDropdown = (dayOfWeek: number) => {
    setOpenDropdownDay(openDropdownDay === dayOfWeek ? null : dayOfWeek);
  };

  const handleSelectDJ = (djId: string, dayOfWeek: number) => {
    // Check if the day has a published event
    const date = weekDates[dayOfWeek];
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    const event = events.find(
      (e) => e.date === dateStr && e.status === "published",
    );

    if (event && onAddDJToEvent) {
      // Day has a published event - add DJ to event
      onAddDJToEvent(event.id, djId);
    } else if (onQuickAddDJ) {
      // Regular day - add DJ to schedule
      onQuickAddDJ(djId, dayOfWeek);
    }
    setOpenDropdownDay(null);
  };

  // Helper to check if a slot is from an event (not a regular schedule)
  const isEventSlot = (
    slotId: string,
  ): { isEvent: boolean; eventId?: string; djId?: string } => {
    if (slotId.startsWith("event-")) {
      // Format: event-{UUID}-{djId}
      // UUID is always 36 characters (8-4-4-4-12 with dashes)
      const withoutPrefix = slotId.substring(6); // Remove 'event-'

      if (withoutPrefix.length > 37) {
        // At least UUID (36) + dash (1)
        const eventId = withoutPrefix.substring(0, 36); // Extract UUID (36 chars)
        const djId = withoutPrefix.substring(37); // Skip UUID and dash, get DJ ID

        console.log("🔍 Parsed slot ID:", { slotId, eventId, djId });
        return { isEvent: true, eventId, djId };
      }
    }
    return { isEvent: false };
  };

  // Helper to get event for a specific day
  const getEventForDay = (dayOfWeek: number): any => {
    const date = weekDates[dayOfWeek];
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    return events.find((e) => e.date === dateStr && e.status === "published");
  };

  // Handle delete for both regular schedules and event slots
  const handleDeleteSlot = (slot: DJScheduleItem, dayOfWeek: number) => {
    console.log("🗑️ Delete button clicked:", {
      slotId: slot.id,
      djId: slot.djId,
      djName: slot.djName,
      dayOfWeek,
    });

    const slotInfo = isEventSlot(slot.id);
    const event = getEventForDay(dayOfWeek);

    console.log("🔍 Delete analysis:", {
      isVirtualEventSlot: slotInfo.isEvent,
      eventFound: !!event,
      eventId: event?.id,
      eventTitle: event?.title,
      djInLineup: event?.dj_lineup?.includes(slot.djId),
      eventLineup: event?.dj_lineup,
    });

    if (
      slotInfo.isEvent &&
      slotInfo.eventId &&
      slotInfo.djId &&
      onRemoveDJFromEvent
    ) {
      // This is a virtual event slot (no real schedule) - remove from event lineup only
      console.log("✅ Path 1: Virtual event slot - removing from event lineup");
      onRemoveDJFromEvent(slotInfo.eventId, slotInfo.djId);
    } else if (event && event.dj_lineup?.includes(slot.djId)) {
      // This is a real schedule on an event day - remove both schedule and from event lineup
      console.log("✅ Path 2: Real schedule on event day");
      if (onDeleteScheduleWithContext) {
        console.log("Using context-aware delete");
        // Use the context-aware delete that will handle both schedule and event
        onDeleteScheduleWithContext(slot.id, event.id, slot.djId);
      } else {
        console.log("Fallback to old behavior");
        // Fallback to old behavior
        onDeleteSchedule(slot.id);
        if (onRemoveDJFromEvent) {
          onRemoveDJFromEvent(event.id, slot.djId);
        }
      }
    } else {
      // This is a regular schedule on a non-event day - delete normally
      console.log("✅ Path 3: Regular schedule - opening modal");
      onDeleteSchedule(slot.id);
    }
  };

  // Handle edit for both regular schedules and virtual event slots
  const handleEditSlot = (slot: DJScheduleItem) => {
    const slotInfo = isEventSlot(slot.id);

    if (slotInfo.isEvent) {
      // This is a virtual event slot - redirect to add schedule instead
      // We could open a modal pre-filled with the DJ, but for now just open the add schedule modal
      onAddSchedule();
    } else {
      // Regular schedule - edit normally
      onEditSchedule(slot.id);
    }
  };

  // Determine if a day has a special event
  const isSpecialEventDay = (
    dayOfWeek: number,
    date: Date,
    slots: DJScheduleItem[],
  ): boolean => {
    // Format date as YYYY-MM-DD to match event dates
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    // Only flag days with actual published events
    const hasEvent = events.some(
      (event) => event.date === dateStr && event.status === "published",
    );
    return hasEvent;
  };

  // Get event badge text for special days
  const getEventBadgeText = (date: Date, slots: DJScheduleItem[]): string => {
    // Format date as YYYY-MM-DD to match event dates
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    // Check if there's a published event on this date
    const event = events.find(
      (e) => e.date === dateStr && e.status === "published",
    );
    if (event) return "Big Event";

    return "Special Event";
  };

  return (
    <CalendarContainer>
      <CalendarHeader>
        <CalendarTitle>
          {React.createElement(RiMusic2Line as React.ComponentType)}
          Weekly DJ Schedule
        </CalendarTitle>
        {/* <PrimaryButton onClick={onAddSchedule}>
          {React.createElement(RiAddLine as React.ComponentType)}
          Add Schedule
        </PrimaryButton> */}
      </CalendarHeader>

      <CalendarScrollWrapper>
        <CalendarGrid>
          {schedulesByDay.map(({ day, dayOfWeek, date, slots }) => {
            const isSpecial = isSpecialEventDay(dayOfWeek, date, slots);
            return (
              <DayColumn
                key={day}
                isDragOver={dragOverDay === dayOfWeek}
                isSpecialEvent={isSpecial}
                onDragOver={(e) => handleDragOver(e, dayOfWeek)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, dayOfWeek)}
              >
                <DayHeader isSpecialEvent={isSpecial}>
                  <DayNameRow>
                    {isSpecial && (
                      <TrophyIcon>
                        {React.createElement(
                          RiTrophyFill as React.ComponentType,
                        )}
                      </TrophyIcon>
                    )}
                    <DayName isSpecialEvent={isSpecial}>
                      {window.innerWidth < 768 ? DAYS_SHORT[dayOfWeek] : day}
                    </DayName>
                  </DayNameRow>
                  <DayDate isSpecialEvent={isSpecial}>
                    {date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </DayDate>
                  {isSpecial && (
                    <EventBadgeText>
                      {getEventBadgeText(date, slots)}
                    </EventBadgeText>
                  )}
                </DayHeader>
                <DaySlots>
                  {slots.length > 0 ? (
                    slots
                      .sort((a, b) => {
                        if (!a.startTime) return 1;
                        if (!b.startTime) return -1;
                        return a.startTime.localeCompare(b.startTime);
                      })
                      .map((slot) => {
                        const djInfo = getDJInfo(slot.djId);
                        const hasConflict = hasTimeConflict(slot, slots);
                        const slotInfo = isEventSlot(slot.id);

                        return (
                          <SlotCard
                            key={slot.id}
                            genre={djInfo?.genre}
                            isDragging={draggedSchedule?.id === slot.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, slot)}
                            onDragEnd={handleDragEnd}
                          >
                            <DragHandle>
                              {React.createElement(
                                RiDraggable as React.ComponentType,
                              )}
                            </DragHandle>

                            <QuickActions className="quick-actions">
                              {!slotInfo.isEvent && (
                                <ActionButton
                                  variant="duplicate"
                                  onClick={() =>
                                    onDuplicateSchedule(slot.id, dayOfWeek)
                                  }
                                  title="Duplicate to another day"
                                >
                                  {React.createElement(
                                    RiFileCopyLine as React.ComponentType,
                                  )}
                                </ActionButton>
                              )}
                              <ActionButton
                                variant="edit"
                                onClick={() => handleEditSlot(slot)}
                                title={
                                  slotInfo.isEvent
                                    ? "Add schedule for this DJ"
                                    : "Edit schedule"
                                }
                              >
                                {React.createElement(
                                  RiEditLine as React.ComponentType,
                                )}
                              </ActionButton>
                              <ActionButton
                                variant="delete"
                                onClick={() =>
                                  handleDeleteSlot(slot, dayOfWeek)
                                }
                                title={
                                  slotInfo.isEvent
                                    ? "Remove from event"
                                    : "Delete schedule"
                                }
                              >
                                {React.createElement(
                                  RiDeleteBinLine as React.ComponentType,
                                )}
                              </ActionButton>
                            </QuickActions>

                            <SlotHeader>
                              <DJAvatar image={djInfo?.image}>
                                {!djInfo?.image &&
                                  React.createElement(
                                    RiMusic2Line as React.ComponentType,
                                  )}
                              </DJAvatar>
                              <SlotInfo>
                                <SlotDJ>{slot.djName}</SlotDJ>
                                {djInfo?.genre && (
                                  <GenreTag genre={djInfo.genre}>
                                    {djInfo.genre}
                                  </GenreTag>
                                )}
                              </SlotInfo>
                            </SlotHeader>

                            {slot.startTime && (
                              <SlotTime>
                                {React.createElement(
                                  RiTimeLine as React.ComponentType,
                                )}
                                {slot.startTime}
                                {slot.endTime && ` - ${slot.endTime}`}
                                {!slot.endTime && " (Open-ended)"}
                              </SlotTime>
                            )}

                            {!slot.startTime && (
                              <SlotTime>
                                {React.createElement(
                                  RiTimeLine as React.ComponentType,
                                )}
                                Time TBD
                              </SlotTime>
                            )}

                            {slot.notes && <SlotNotes>{slot.notes}</SlotNotes>}

                            {hasConflict && (
                              <TimeConflictWarning>
                                {React.createElement(
                                  RiAlertLine as React.ComponentType,
                                )}
                                Time conflict detected
                              </TimeConflictWarning>
                            )}
                          </SlotCard>
                        );
                      })
                  ) : (
                    <EmptySlot>
                      {React.createElement(RiMusic2Line as React.ComponentType)}
                      No DJs scheduled
                    </EmptySlot>
                  )}
                </DaySlots>

                {onQuickAddDJ && djs.length > 0 && (
                  <QuickAddContainer>
                    <QuickAddButton
                      isOpen={openDropdownDay === dayOfWeek}
                      onClick={() => handleToggleDropdown(dayOfWeek)}
                    >
                      {React.createElement(RiAddLine as React.ComponentType)}
                      {openDropdownDay === dayOfWeek
                        ? "Select DJ"
                        : "Quick Add DJ"}
                    </QuickAddButton>

                    {openDropdownDay === dayOfWeek && (
                      <DJDropdown>
                        {djs.map((dj) => (
                          <DJOption
                            key={dj.id}
                            onClick={() => handleSelectDJ(dj.id, dayOfWeek)}
                          >
                            {React.createElement(
                              RiMusic2Line as React.ComponentType,
                            )}
                            <DJOptionInfo>
                              <DJOptionName>{dj.name}</DJOptionName>
                              {dj.genre && (
                                <DJOptionGenre>{dj.genre}</DJOptionGenre>
                              )}
                            </DJOptionInfo>
                          </DJOption>
                        ))}
                      </DJDropdown>
                    )}
                  </QuickAddContainer>
                )}
              </DayColumn>
            );
          })}
        </CalendarGrid>
      </CalendarScrollWrapper>
    </CalendarContainer>
  );
};
