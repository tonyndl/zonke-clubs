import React, { useState, useEffect, useRef } from "react";
import { Card, CardTitle, CardDescription } from "../../../components/Card";
import {
  PrimaryButton,
  OutlineButton,
  DangerButton,
} from "../../../components/Buttons";
import { theme } from "../../../styles/theme";
import {
  RiMusic2Line,
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCalendar2Line,
} from "react-icons/ri";
import {
  AddDJModal,
  DJFormData,
} from "../../../components/DJManagement/AddDJModal";
import {
  AddScheduleModal,
  ScheduleFormData,
} from "../../../components/DJManagement/AddScheduleModal";
import { DraggableWeeklyCalendar } from "../../../components/DJManagement/DraggableWeeklyCalendar";
import { ConfirmationModal } from "../../../components/Modal/ConfirmationModal";
import { apiService } from "../../../services/api";
import { eventService } from "../../../services/eventService";
import { useToast } from "../../../components/Toast";
import {
  SettingsContainer,
  PageHeader,
  HeaderLeft,
  PageTitle,
  PageDescription,
  Section,
  SectionHeader,
  SectionTitle,
  SectionDescription,
  DJCard,
  DJHeader,
  DJInfo,
  DJAvatar,
  DJDetails,
  DJName,
  DJMeta,
  DJGenre,
  DJSocial,
  DJBio,
  DJActions,
  EmptyState,
  WeekToggleContainer,
  WeekToggleButton,
  WeekLabel,
  UpcomingBadge,
} from "./styles";

interface DJ {
  id: string;
  name: string;
  genre?: string;
  bio?: string;
  instagram?: string;
  soundcloud?: string;
  image?: string;
}

interface Schedule {
  id: string;
  djId: string;
  djName: string;
  day: string;
  dayOfWeek: number;
  startTime: string;
  endTime?: string;
  notes?: string;
  type: "weekly" | "specific";
  specificDate?: string;
}

const DAYS_LIST = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Week helpers
const getCurrentWeekSunday = (): Date => {
  const today = new Date();
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  d.setDate(d.getDate() - d.getDay());
  return d;
};

const getUpcomingWeekSunday = (): Date => {
  const sun = getCurrentWeekSunday();
  sun.setDate(sun.getDate() + 7);
  return sun;
};

const formatWeekLabel = (sunday: Date): string => {
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
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
  return `${months[sunday.getMonth()]} ${sunday.getDate()} – ${months[saturday.getMonth()]} ${saturday.getDate()}`;
};

const dateToString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const DJSchedule: React.FC = () => {
  const toast = useToast();
  const [djs, setDJs] = useState<DJ[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDJModalOpen, setIsAddDJModalOpen] = useState(false);
  const [editingDJ, setEditingDJ] = useState<DJ | null>(null);
  const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState(false);
  const [shouldReopenScheduleModal, setShouldReopenScheduleModal] =
    useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [prefilledScheduleData, setPrefilledScheduleData] =
    useState<Partial<Schedule> | null>(null);
  const [djToDelete, setDJToDelete] = useState<string | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);
  const [scheduleDeleteContext, setScheduleDeleteContext] = useState<{
    scheduleId: string;
    eventId?: string;
    djId?: string;
  } | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<"current" | "upcoming">(
    "current",
  );
  const previousDJsLengthRef = useRef(djs.length);

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([
      apiService.getDJs(),
      apiService.getDJSchedules(),
      eventService.getEvents().catch(() => ({ events: [] })), // Fetch events, but don't fail if it errors
    ])
      .then(([djsData, schedulesData, eventsData]) => {
        setDJs(djsData);
        // Transform schedule data to match frontend interface
        const transformedSchedules = schedulesData.map((s: any) => ({
          id: s.id,
          djId: s.dj_id,
          djName: s.dj_name,
          day: s.day,
          dayOfWeek: s.day_of_week,
          startTime: s.start_time,
          endTime: s.end_time,
          notes: s.notes,
          type: s.type,
          specificDate: s.specific_date,
        }));
        setSchedules(transformedSchedules);
        setEvents(eventsData.events || []);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch DJ data:", error);
        toast.error("Failed to load DJ schedules");
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchData();

    // Refetch data when window regains focus (e.g., after editing events in another tab/window)
    const handleFocus = () => {
      fetchData();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Watch for DJ list changes and reopen schedule modal if needed
  useEffect(() => {
    // Check if DJs list has grown (new DJ added)
    if (
      shouldReopenScheduleModal &&
      djs.length > previousDJsLengthRef.current
    ) {
      setShouldReopenScheduleModal(false);
      setIsAddScheduleModalOpen(true);
    }
    // Update the ref with current length
    previousDJsLengthRef.current = djs.length;
  }, [djs, shouldReopenScheduleModal]);

  const handleAddDJ = (djData: DJFormData) => {
    apiService
      .createDJ(djData)
      .then((newDJ) => {
        // Update DJs state with the new DJ
        setDJs((prevDJs) => [...prevDJs, newDJ]);
        setIsAddDJModalOpen(false);
        toast.success(`${newDJ.name} added successfully!`);

        // Modal will automatically reopen via useEffect when DJ list updates
      })
      .catch((error) => {
        console.error("Failed to add DJ:", error);
        toast.error("Failed to add DJ");
      });
  };

  const handleDeleteDJ = (djId: string) => {
    apiService
      .deleteDJ(djId)
      .then(() => {
        setDJs(djs.filter((dj) => dj.id !== djId));
        setSchedules(schedules.filter((s) => s.djId !== djId));
        setDJToDelete(null);
        toast.success("DJ deleted successfully");
      })
      .catch((error) => {
        console.error("Failed to delete DJ:", error);
        toast.error("Failed to delete DJ");
        setDJToDelete(null);
      });
  };

  const handleEditDJ = (djId: string) => {
    const dj = djs.find((d) => d.id === djId);
    if (dj) {
      setEditingDJ(dj);
      setIsAddDJModalOpen(true);
    }
  };

  const handleUpdateDJ = (djData: DJFormData) => {
    if (!editingDJ) return;

    apiService
      .updateDJ(editingDJ.id, djData)
      .then((updatedDJ) => {
        setDJs(djs.map((dj) => (dj.id === editingDJ.id ? updatedDJ : dj)));
        setIsAddDJModalOpen(false);
        setEditingDJ(null);
        toast.success(`${updatedDJ.name} updated successfully!`);
      })
      .catch((error) => {
        console.error("Failed to update DJ:", error);
        toast.error("Failed to update DJ");
      });
  };

  const handleDJModalSubmit = (djData: DJFormData) => {
    if (editingDJ) {
      handleUpdateDJ(djData);
    } else {
      handleAddDJ(djData);
    }
  };

  const handleDJModalClose = () => {
    setIsAddDJModalOpen(false);
    setEditingDJ(null);
  };

  const handleAddSchedule = (scheduleData: ScheduleFormData) => {
    const apiData = {
      dj_id: scheduleData.djId,
      day_of_week: scheduleData.dayOfWeek,
      start_time: scheduleData.startTime,
      end_time: scheduleData.endTime,
      notes: scheduleData.notes,
      type: scheduleData.scheduleType,
      specific_date: scheduleData.specificDate,
    };

    apiService
      .createDJSchedule(apiData)
      .then((newSchedule: any) => {
        const transformedSchedule: Schedule = {
          id: newSchedule.id,
          djId: newSchedule.dj_id,
          djName: newSchedule.dj_name,
          day: newSchedule.day,
          dayOfWeek: newSchedule.day_of_week,
          startTime: newSchedule.start_time,
          endTime: newSchedule.end_time,
          notes: newSchedule.notes,
          type: newSchedule.type,
          specificDate: newSchedule.specific_date,
        };
        setSchedules([...schedules, transformedSchedule]);
        setIsAddScheduleModalOpen(false);
        toast.success("Schedule added successfully!");
      })
      .catch((error) => {
        console.error("Failed to add schedule:", error);
        toast.error("Failed to add schedule");
      });
  };

  const handleDeleteScheduleWithContext = (
    scheduleId: string,
    eventId?: string,
    djId?: string,
  ) => {
    console.log("📋 handleDeleteScheduleWithContext called:", {
      scheduleId,
      eventId,
      djId,
    });
    setScheduleToDelete(scheduleId);
    setScheduleDeleteContext({ scheduleId, eventId, djId });
    console.log("📋 State set - modal should open");
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    // Check if we also need to remove from event
    const context = scheduleDeleteContext;
    console.log("🗑️ handleDeleteSchedule called:", { scheduleId, context });

    apiService
      .deleteDJSchedule(scheduleId)
      .then(() => {
        console.log("✅ Schedule deleted successfully");
        setSchedules(schedules.filter((s) => s.id !== scheduleId));
        setScheduleToDelete(null);
        setScheduleDeleteContext(null);

        // If this schedule is on an event day, also remove from event lineup
        if (context?.eventId && context?.djId) {
          console.log("🎯 Also removing from event lineup");
          handleRemoveDJFromEvent(context.eventId, context.djId);
        } else {
          toast.success("Schedule deleted successfully");
        }
      })
      .catch((error) => {
        console.error("❌ Failed to delete schedule:", error);
        toast.error("Failed to delete schedule");
        setScheduleToDelete(null);
        setScheduleDeleteContext(null);
      });
  };

  const handleEditSchedule = (scheduleId: string) => {
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (schedule) {
      setEditingSchedule(schedule);
      setIsAddScheduleModalOpen(true);
    }
  };

  const handleUpdateSchedule = (scheduleData: ScheduleFormData) => {
    if (!editingSchedule) return;

    const apiData = {
      dj_id: scheduleData.djId,
      day_of_week: scheduleData.dayOfWeek,
      start_time: scheduleData.startTime,
      end_time: scheduleData.endTime,
      notes: scheduleData.notes,
      type: scheduleData.scheduleType,
      specific_date: scheduleData.specificDate,
    };

    apiService
      .updateDJSchedule(editingSchedule.id, apiData)
      .then((updatedSchedule: any) => {
        const transformedSchedule: Schedule = {
          id: updatedSchedule.id,
          djId: updatedSchedule.dj_id,
          djName: updatedSchedule.dj_name,
          day: updatedSchedule.day,
          dayOfWeek: updatedSchedule.day_of_week,
          startTime: updatedSchedule.start_time,
          endTime: updatedSchedule.end_time,
          notes: updatedSchedule.notes,
          type: updatedSchedule.type,
          specificDate: updatedSchedule.specific_date,
        };
        setSchedules(
          schedules.map((s) =>
            s.id === editingSchedule.id ? transformedSchedule : s,
          ),
        );
        setIsAddScheduleModalOpen(false);
        setEditingSchedule(null);
        toast.success("Schedule updated successfully!");
      })
      .catch((error) => {
        console.error("Failed to update schedule:", error);
        toast.error("Failed to update schedule");
      });
  };

  const handleDuplicateSchedule = (
    scheduleId: string,
    currentDayOfWeek: number,
  ) => {
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (!schedule) return;

    // Create a new schedule with the same data but for the next day
    const nextDay = (currentDayOfWeek + 1) % 7;

    const apiData = {
      dj_id: schedule.djId,
      day_of_week: nextDay,
      start_time: schedule.startTime,
      end_time: schedule.endTime,
      notes: schedule.notes,
      type: schedule.type,
      specific_date: schedule.specificDate,
    };

    apiService
      .createDJSchedule(apiData)
      .then((newSchedule: any) => {
        const transformedSchedule: Schedule = {
          id: newSchedule.id,
          djId: newSchedule.dj_id,
          djName: newSchedule.dj_name,
          day: newSchedule.day,
          dayOfWeek: newSchedule.day_of_week,
          startTime: newSchedule.start_time,
          endTime: newSchedule.end_time,
          notes: newSchedule.notes,
          type: newSchedule.type,
          specificDate: newSchedule.specific_date,
        };
        setSchedules([...schedules, transformedSchedule]);
        toast.success("Schedule duplicated successfully!");
      })
      .catch((error) => {
        console.error("Failed to duplicate schedule:", error);
        toast.error("Failed to duplicate schedule");
      });
  };

  const handleMoveSchedule = (scheduleId: string, newDayOfWeek: number) => {
    console.log("📅 handleMoveSchedule called:", { scheduleId, newDayOfWeek });

    const schedule = schedules.find((s) => s.id === scheduleId);
    if (!schedule) {
      console.error("❌ Schedule not found:", scheduleId);
      return;
    }

    console.log("📋 Found schedule:", schedule);
    console.log(
      "🔄 Moving from day",
      schedule.dayOfWeek,
      "to day",
      newDayOfWeek,
    );

    const apiData = {
      dj_id: schedule.djId,
      day_of_week: newDayOfWeek,
      start_time: schedule.startTime,
      end_time: schedule.endTime,
      notes: schedule.notes,
      type: schedule.type,
      specific_date: schedule.specificDate,
    };

    console.log("📤 Sending API request with data:", apiData);

    apiService
      .updateDJSchedule(scheduleId, apiData)
      .then((updatedSchedule: any) => {
        console.log("✅ API response received:", updatedSchedule);

        const transformedSchedule: Schedule = {
          id: updatedSchedule.id,
          djId: updatedSchedule.dj_id,
          djName: updatedSchedule.dj_name,
          day: updatedSchedule.day,
          dayOfWeek: updatedSchedule.day_of_week,
          startTime: updatedSchedule.start_time,
          endTime: updatedSchedule.end_time,
          notes: updatedSchedule.notes,
          type: updatedSchedule.type,
          specificDate: updatedSchedule.specific_date,
        };

        console.log("🔄 Transformed schedule:", transformedSchedule);
        console.log("📊 Current schedules before update:", schedules);

        setSchedules(
          schedules.map((s) => (s.id === scheduleId ? transformedSchedule : s)),
        );

        console.log("✅ State updated successfully");
        toast.success("Schedule moved successfully!");
      })
      .catch((error) => {
        console.error("❌ API request failed:", error);
        console.error("❌ Error details:", error.response?.data);
        console.error("❌ Error status:", error.response?.status);
        toast.error("Failed to move schedule");
      });
  };

  const handleScheduleModalSubmit = (scheduleData: ScheduleFormData) => {
    if (editingSchedule) {
      handleUpdateSchedule(scheduleData);
    } else {
      handleAddSchedule(scheduleData);
    }
  };

  const handleScheduleModalClose = () => {
    setIsAddScheduleModalOpen(false);
    setEditingSchedule(null);
    setPrefilledScheduleData(null);
  };

  const handleQuickAddDJ = (djId: string, dayOfWeek: number) => {
    const dj = djs.find((d) => d.id === djId);
    if (!dj) return;

    let apiData: Record<string, unknown>;

    if (selectedWeek === "upcoming") {
      const upcomingSunday = getUpcomingWeekSunday();
      const targetDate = new Date(upcomingSunday);
      targetDate.setDate(upcomingSunday.getDate() + dayOfWeek);
      apiData = {
        dj_id: djId,
        day_of_week: dayOfWeek,
        type: "specific",
        specific_date: dateToString(targetDate),
      };
    } else {
      apiData = {
        dj_id: djId,
        day_of_week: dayOfWeek,
        type: "weekly",
      };
    }

    apiService
      .createDJSchedule(apiData)
      .then((newSchedule: any) => {
        const transformedSchedule: Schedule = {
          id: newSchedule.id,
          djId: newSchedule.dj_id,
          djName: newSchedule.dj_name,
          day: newSchedule.day,
          dayOfWeek: newSchedule.day_of_week,
          startTime: newSchedule.start_time,
          endTime: newSchedule.end_time,
          notes: newSchedule.notes,
          type: newSchedule.type,
          specificDate: newSchedule.specific_date,
        };
        setSchedules([...schedules, transformedSchedule]);
        const weekLabel = selectedWeek === "upcoming" ? " (upcoming week)" : "";
        toast.success(
          `${dj.name} added to ${DAYS_LIST[dayOfWeek]}${weekLabel}!`,
        );
      })
      .catch((error) => {
        console.error("Failed to add DJ to schedule:", error);
        toast.error("Failed to add DJ to schedule");
      });
  };

  const handleAddDJToEvent = (eventId: string, djId: string) => {
    const event = events.find((e) => e.id === eventId);
    const dj = djs.find((d) => d.id === djId);

    if (!event || !dj) return;

    // Check if DJ is already in the lineup
    const currentLineup = event.dj_lineup || [];
    if (currentLineup.includes(djId)) {
      toast.warning(`${dj.name} is already in the event lineup`);
      return;
    }

    // Add DJ ID to the lineup (backend stores IDs, frontend resolves to names for display)
    const updatedLineup = [...currentLineup, djId];

    eventService
      .updateEvent(eventId, { dj_lineup: updatedLineup })
      .then((response) => {
        // Update local events state
        setEvents(events.map((e) => (e.id === eventId ? response.event : e)));
        toast.success(`${dj.name} added to ${event.title}!`);
      })
      .catch((error) => {
        console.error("Failed to add DJ to event:", error);
        toast.error("Failed to add DJ to event");
      });
  };

  const handleRemoveDJFromEvent = (eventId: string, djIdOrName: string) => {
    console.log("🎪 handleRemoveDJFromEvent called:", { eventId, djIdOrName });
    const event = events.find((e) => e.id === eventId);

    // Try to find DJ by ID first, then by name (for legacy data)
    let dj = djs.find((d) => d.id === djIdOrName);
    if (!dj) {
      dj = djs.find((d) => d.name === djIdOrName);
    }

    console.log("🎪 Found:", { event: event?.title, dj: dj?.name });

    if (!event) {
      console.error("❌ Event not found!");
      return;
    }

    // Remove DJ from the lineup (handle both ID and name for legacy data)
    const currentLineup = event.dj_lineup || [];
    const updatedLineup = currentLineup.filter((item: string) => {
      // Remove if it matches the ID/name directly, or if it matches the DJ's ID or name
      return item !== djIdOrName && item !== dj?.id && item !== dj?.name;
    });

    console.log("🎪 Updating lineup:", { currentLineup, updatedLineup });

    eventService
      .updateEvent(eventId, { dj_lineup: updatedLineup })
      .then((response) => {
        console.log("✅ DJ removed from event successfully");
        // Update local events state
        setEvents(events.map((e) => (e.id === eventId ? response.event : e)));
        const djName = dj?.name || djIdOrName;
        toast.success(`${djName} removed from ${event.title}!`);
      })
      .catch((error) => {
        console.error("❌ Failed to remove DJ from event:", error);
        toast.error("Failed to remove DJ from event");
      });
  };

  // Compute upcoming week date strings for filtering
  const upcomingWeekSunday = getUpcomingWeekSunday();
  const upcomingWeekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(upcomingWeekSunday);
    d.setDate(upcomingWeekSunday.getDate() + i);
    return dateToString(d);
  });

  // For current week: show only weekly recurring schedules
  // For upcoming week: show weekly schedules + any specific schedules for that week
  const calendarSchedules =
    selectedWeek === "current"
      ? schedules.filter((s) => s.type === "weekly")
      : [
          ...schedules.filter((s) => s.type === "weekly"),
          ...schedules.filter(
            (s) =>
              s.type === "specific" &&
              s.specificDate &&
              upcomingWeekDates.includes(s.specificDate),
          ),
        ];

  if (isLoading) {
    return (
      <SettingsContainer>
        <PageHeader>
          <HeaderLeft>
            <PageTitle>DJ Schedule Management</PageTitle>
          </HeaderLeft>
        </PageHeader>
        <Card style={{ padding: theme.spacing["2xl"], textAlign: "center" }}>
          <p style={{ color: theme.colors.textSecondary }}>
            Loading DJ schedules...
          </p>
        </Card>
      </SettingsContainer>
    );
  }

  return (
    <SettingsContainer>
      <PageHeader>
        <HeaderLeft>
          <PageTitle>DJ Schedule Management</PageTitle>
          <PageDescription>
            Manage your resident DJs and their weekly performance schedules.
          </PageDescription>
        </HeaderLeft>
        <PrimaryButton onClick={() => setIsAddDJModalOpen(true)}>
          {React.createElement(RiAddLine as React.ComponentType)}
          Add DJ
        </PrimaryButton>
      </PageHeader>

      {/* DJs Section */}
      <Section>
        <SectionHeader>
          <SectionTitle>
            {React.createElement(RiMusic2Line as React.ComponentType)}
            Your DJs
          </SectionTitle>
          <SectionDescription>
            Manage your club's resident DJ roster
          </SectionDescription>
        </SectionHeader>

        {djs.length > 0 ? (
          djs.map((dj) => (
            <DJCard key={dj.id}>
              <DJHeader>
                <DJInfo>
                  <DJAvatar image={dj.image}>
                    {!dj.image && dj.name.charAt(0)}
                  </DJAvatar>
                  <DJDetails>
                    <DJName>{dj.name}</DJName>
                    <DJMeta>
                      {dj.genre && (
                        <DJGenre>
                          {React.createElement(
                            RiMusic2Line as React.ComponentType,
                          )}
                          {dj.genre}
                        </DJGenre>
                      )}
                      {dj.instagram && (
                        <DJSocial
                          href={`https://instagram.com/${dj.instagram}`}
                          target="_blank"
                        >
                          @{dj.instagram}
                        </DJSocial>
                      )}
                      {dj.soundcloud && (
                        <DJSocial href={dj.soundcloud} target="_blank">
                          SoundCloud
                        </DJSocial>
                      )}
                    </DJMeta>
                    {dj.bio && <DJBio>{dj.bio}</DJBio>}
                  </DJDetails>
                </DJInfo>
                <DJActions>
                  <OutlineButton onClick={() => handleEditDJ(dj.id)}>
                    {React.createElement(RiEditLine as React.ComponentType)}
                    Edit
                  </OutlineButton>
                  <DangerButton onClick={() => setDJToDelete(dj.id)}>
                    {React.createElement(
                      RiDeleteBinLine as React.ComponentType,
                    )}
                  </DangerButton>
                </DJActions>
              </DJHeader>
            </DJCard>
          ))
        ) : (
          <Card>
            <EmptyState>
              {React.createElement(RiMusic2Line as React.ComponentType)}
              <CardTitle>No DJs Added</CardTitle>
              <CardDescription>
                Add your first DJ to start managing schedules
              </CardDescription>
              <PrimaryButton
                style={{ marginTop: theme.spacing.lg }}
                onClick={() => setIsAddDJModalOpen(true)}
              >
                {React.createElement(RiAddLine as React.ComponentType)}
                Add Your First DJ
              </PrimaryButton>
            </EmptyState>
          </Card>
        )}
      </Section>

      {/* Weekly Schedule Section */}
      <Section>
        <SectionHeader>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: theme.spacing.md,
            }}
          >
            <div>
              <SectionTitle>
                {React.createElement(RiCalendar2Line as React.ComponentType)}
                DJ Lineup
                {selectedWeek === "upcoming" && (
                  <UpcomingBadge>Upcoming</UpcomingBadge>
                )}
              </SectionTitle>
              <SectionDescription>
                {selectedWeek === "current"
                  ? `Current week lineup (${formatWeekLabel(getCurrentWeekSunday())})`
                  : `Set the DJ lineup for the upcoming week (${formatWeekLabel(getUpcomingWeekSunday())}). Specific schedules override the weekly default.`}
              </SectionDescription>
            </div>
            <WeekToggleContainer>
              <WeekToggleButton
                $active={selectedWeek === "current"}
                onClick={() => setSelectedWeek("current")}
              >
                This Week
                <WeekLabel>{formatWeekLabel(getCurrentWeekSunday())}</WeekLabel>
              </WeekToggleButton>
              <WeekToggleButton
                $active={selectedWeek === "upcoming"}
                onClick={() => setSelectedWeek("upcoming")}
              >
                Upcoming Week
                <WeekLabel>
                  {formatWeekLabel(getUpcomingWeekSunday())}
                </WeekLabel>
              </WeekToggleButton>
            </WeekToggleContainer>
          </div>
        </SectionHeader>

        <DraggableWeeklyCalendar
          schedules={calendarSchedules}
          djs={djs.map((dj) => ({
            id: dj.id,
            name: dj.name,
            genre: dj.genre,
            image: dj.image,
          }))}
          events={events}
          weekStart={
            selectedWeek === "upcoming"
              ? getUpcomingWeekSunday()
              : getCurrentWeekSunday()
          }
          onAddSchedule={() => {
            if (selectedWeek === "upcoming") {
              setPrefilledScheduleData({ type: "specific" });
            }
            setIsAddScheduleModalOpen(true);
          }}
          onEditSchedule={handleEditSchedule}
          onDeleteSchedule={(id) => setScheduleToDelete(id)}
          onDeleteScheduleWithContext={handleDeleteScheduleWithContext}
          onDuplicateSchedule={handleDuplicateSchedule}
          onMoveSchedule={handleMoveSchedule}
          onQuickAddDJ={handleQuickAddDJ}
          onAddDJToEvent={handleAddDJToEvent}
          onRemoveDJFromEvent={handleRemoveDJFromEvent}
        />
      </Section>

      {/* Modals */}
      <AddDJModal
        isOpen={isAddDJModalOpen}
        onClose={handleDJModalClose}
        onSubmit={handleDJModalSubmit}
        initialData={
          editingDJ
            ? {
                name: editingDJ.name,
                bio: editingDJ.bio ?? "",
                genre: editingDJ.genre ?? "",
                instagram: editingDJ.instagram ?? "",
                soundcloud: editingDJ.soundcloud ?? "",
                image: editingDJ.image ?? "",
              }
            : undefined
        }
        isEditMode={!!editingDJ}
      />

      <AddScheduleModal
        isOpen={isAddScheduleModalOpen}
        onClose={handleScheduleModalClose}
        onSubmit={handleScheduleModalSubmit}
        availableDJs={djs.map((dj) => ({ id: dj.id, name: dj.name }))}
        initialData={
          editingSchedule
            ? {
                djId: editingSchedule.djId,
                djName: editingSchedule.djName,
                scheduleType: editingSchedule.type as "weekly" | "specific",
                dayOfWeek: editingSchedule.dayOfWeek,
                specificDate: editingSchedule.specificDate,
                startTime: editingSchedule.startTime,
                endTime: editingSchedule.endTime,
                notes: editingSchedule.notes,
              }
            : prefilledScheduleData
              ? {
                  djId: prefilledScheduleData.djId ?? "",
                  djName: prefilledScheduleData.djName ?? "",
                  scheduleType:
                    (prefilledScheduleData.type as "weekly" | "specific") ??
                    (selectedWeek === "upcoming" ? "specific" : "weekly"),
                  dayOfWeek: prefilledScheduleData.dayOfWeek,
                  specificDate: undefined,
                  startTime: "",
                  endTime: "",
                  notes: "",
                }
              : selectedWeek === "upcoming"
                ? {
                    djId: "",
                    djName: "",
                    scheduleType: "specific" as "weekly" | "specific",
                    dayOfWeek: undefined,
                    specificDate: undefined,
                    startTime: "",
                    endTime: "",
                    notes: "",
                  }
                : undefined
        }
        isEditMode={!!editingSchedule}
        onAddDJ={() => {
          setShouldReopenScheduleModal(true);
          setIsAddScheduleModalOpen(false);
          setIsAddDJModalOpen(true);
        }}
      />

      <ConfirmationModal
        isOpen={!!djToDelete}
        onClose={() => setDJToDelete(null)}
        onConfirm={() => djToDelete && handleDeleteDJ(djToDelete)}
        title="Delete DJ"
        message="Are you sure you want to remove this DJ? All associated schedules will also be deleted."
        confirmText="Delete"
        cancelText="Cancel"
      />

      <ConfirmationModal
        isOpen={!!scheduleToDelete}
        onClose={() => setScheduleToDelete(null)}
        onConfirm={() =>
          scheduleToDelete && handleDeleteSchedule(scheduleToDelete)
        }
        title="Delete Schedule"
        message="Are you sure you want to remove this schedule slot?"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </SettingsContainer>
  );
};
