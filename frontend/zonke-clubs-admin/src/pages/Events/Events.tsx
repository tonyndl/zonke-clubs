import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardTitle, CardDescription } from "../../components/Card";
import {
  PrimaryButton,
  OutlineButton,
  DangerButton,
} from "../../components/Buttons";
import { theme } from "../../styles/theme";
import { eventService } from "../../services/eventService";
import { apiService } from "../../services/api";
import { Event } from "../../types";
import {
  CreateEventModal,
  EventFormData,
  ConfirmationModal,
} from "../../components/Modal";
import {
  AddDJModal,
  DJFormData,
} from "../../components/DJManagement/AddDJModal";
import { useToast } from "../../components/Toast";
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCalendarEventLine,
  RiTimeLine,
  RiTicket2Line,
  RiHeartLine,
  RiMusic2Line,
  RiArrowLeftLine,
  RiArrowRightLine,
} from "react-icons/ri";
import {
  EventsContainer,
  PageHeader,
  HeaderLeft,
  PageTitle,
  PageDescription,
  HeaderActions,
  FilterTabs,
  FilterTab,
  EventsGrid,
  EventCard,
  EventImage,
  EventCoverImg,
  EventContent,
  EventHeader,
  EventTitle,
  EventMeta,
  MetaItem,
  StatusBadge,
  EventFooter,
  EmptyState,
  EventActions,
  PaginationContainer,
  PageButton,
  PageInfo,
} from "./styles";

interface DJ {
  id: string;
  name: string;
  bio?: string;
  instagram?: string;
  tiktok?: string;
  image?: string;
}

export const Events: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [events, setEvents] = useState<Event[]>([]);
  const [djs, setDJs] = useState<DJ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [isAddDJModalOpen, setIsAddDJModalOpen] = useState(false);
  const [shouldReopenEventModal, setShouldReopenEventModal] = useState(false);
  const [pendingDJId, setPendingDJId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load events and DJs on mount, cleaning up past events first
  useEffect(() => {
    eventService
      .cleanupPastEvents()
      .then((result) => {
        if (result.deleted > 0) {
          console.log(`Cleaned up ${result.deleted} past event(s).`);
        }
      })
      .catch((error) => {
        console.error("Failed to clean up past events:", error);
      })
      .finally(() => {
        loadEvents();
      });
    loadDJs();
  }, []);

  const loadEvents = (page: number = 1) => {
    setIsLoading(true);
    eventService
      .getEvents(page)
      .then((response) => {
        setEvents(response.events);
        setCurrentPage(page);
        setTotalPages(response.paginate.max_page);
      })
      .catch((error) => {
        console.error("Failed to load events:", error);
        toast.error("Failed to load events. Please try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const loadDJs = () => {
    apiService
      .getDJs()
      .then((djsData) => {
        setDJs(djsData);
      })
      .catch((error) => {
        console.error("Failed to load DJs:", error);
        // Don't show error toast since this is not critical for viewing events
      });
  };

  // Watch for DJ list changes and reopen event modal if needed with new DJ selected
  React.useEffect(() => {
    if (
      shouldReopenEventModal &&
      pendingDJId &&
      djs.some((dj) => dj.id === pendingDJId)
    ) {
      setShouldReopenEventModal(false);
      setPendingDJId(null);
      setIsModalOpen(true);
    }
  }, [djs, shouldReopenEventModal, pendingDJId]);

  // Helper function to resolve DJ ID or name to display name
  const resolveDJName = (djIdOrName: string): string => {
    // Try to find DJ by ID first
    const djById = djs.find((dj) => dj.id === djIdOrName);
    if (djById) return djById.name;

    // Try to find by name (case-insensitive)
    const djByName = djs.find(
      (dj) => dj.name.toLowerCase() === djIdOrName.toLowerCase(),
    );
    if (djByName) return djByName.name;

    // If not found, return the original value (might already be a name)
    return djIdOrName;
  };

  const handleCreateEvent = (formData: EventFormData) => {
    const eventData = {
      title: formData.title,
      description: formData.description,
      date: formData.date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      general_entry_price: parseFloat(formData.general_entry_price),
      vip_entry_price: parseFloat(formData.vip_entry_price),
      dj_lineup: formData.dj_lineup.filter((dj) => dj.trim() !== ""),
      cover_image: formData.cover_image || "",
      status: formData.status,
    };

    eventService
      .createEvent(eventData)
      .then((response) => {
        setEvents([response.event, ...events]);
        setIsModalOpen(false);
        toast.success("Event created successfully!");
      })
      .catch((error) => {
        console.error("Failed to create event:", error);
        console.error("Error response:", error.response?.data);
        const errorMsg = error.response?.data?.errors
          ? JSON.stringify(error.response.data.errors)
          : "Failed to create event. Please try again.";
        toast.error(errorMsg);
      });
  };

  const handleEditEvent = (formData: EventFormData) => {
    if (!editingEvent) return;

    const eventData = {
      title: formData.title,
      description: formData.description,
      date: formData.date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      general_entry_price: parseFloat(formData.general_entry_price),
      vip_entry_price: parseFloat(formData.vip_entry_price),
      dj_lineup: formData.dj_lineup.filter((dj) => dj.trim() !== ""),
      cover_image: formData.cover_image || "",
      status: formData.status,
    };

    eventService
      .updateEvent(editingEvent.id, eventData)
      .then((response) => {
        setEvents(
          events.map((event) =>
            event.id === editingEvent.id ? response.event : event,
          ),
        );
        setEditingEvent(null);
        toast.success("Event updated successfully!");
      })
      .catch((error) => {
        console.error("Failed to update event:", error);
        console.error("Error response:", error.response?.data);
        const errorMsg = error.response?.data?.errors
          ? JSON.stringify(error.response.data.errors)
          : "Failed to update event. Please try again.";
        toast.error(errorMsg);
      });
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setShouldReopenEventModal(false);
    setPendingDJId(null);
  };

  const handleAddDJ = (djData: DJFormData) => {
    apiService
      .createDJ(djData)
      .then((newDJ) => {
        setDJs((prevDJs) => [...prevDJs, newDJ]);
        setIsAddDJModalOpen(false);
        toast.success(`${newDJ.name} added successfully!`);

        // Store the new DJ ID to be added to the lineup when modal reopens
        setPendingDJId(newDJ.id);
      })
      .catch((error) => {
        console.error("Failed to add DJ:", error);
        toast.error("Failed to add DJ");
      });
  };

  const handleModalSubmit = (formData: EventFormData) => {
    if (editingEvent) {
      handleEditEvent(formData);
    } else {
      handleCreateEvent(formData);
    }
  };

  const openDeleteModal = (event: Event) => {
    setDeletingEvent(event);
  };

  const handleConfirmDelete = () => {
    if (!deletingEvent) return;

    eventService
      .deleteEvent(deletingEvent.id)
      .then(() => {
        setEvents(events.filter((e) => e.id !== deletingEvent.id));
        setDeletingEvent(null);
        toast.success("Event deleted successfully!");
      })
      .catch((error) => {
        console.error("Failed to delete event:", error);
        toast.error("Failed to delete event. Please try again.");
      });
  };

  const closeDeleteModal = () => {
    setDeletingEvent(null);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) loadEvents(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) loadEvents(currentPage + 1);
  };

  const filteredEvents = events.filter((event) => {
    if (filter === "all") return true;
    return event.status === filter;
  });

  return (
    <EventsContainer>
      <PageHeader>
        <HeaderLeft>
          <PageTitle>Events Management</PageTitle>
          <PageDescription>
            Create, manage, and promote your club events to attract more
            visitors.
          </PageDescription>
        </HeaderLeft>
        <HeaderActions>
          <PrimaryButton onClick={() => setIsModalOpen(true)}>
            {React.createElement(RiAddLine as React.ComponentType)}
            Create Event
          </PrimaryButton>
        </HeaderActions>
      </PageHeader>

      <CreateEventModal
        isOpen={isModalOpen || editingEvent !== null}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        mode={editingEvent ? "edit" : "create"}
        initialData={
          editingEvent
            ? {
                title: editingEvent.title,
                description: editingEvent.description,
                date: editingEvent.date,
                start_time: editingEvent.start_time,
                end_time: editingEvent.end_time || "",
                general_entry_price: String(
                  editingEvent.general_entry_price || "0",
                ),
                vip_entry_price: String(editingEvent.vip_entry_price || "0"),
                dj_lineup: editingEvent.dj_lineup || [],
                cover_image: editingEvent.cover_image || "",
                status: editingEvent.status,
              }
            : pendingDJId
              ? {
                  title: "",
                  description: "",
                  date: "",
                  start_time: "",
                  end_time: "",
                  general_entry_price: "",
                  vip_entry_price: "",
                  dj_lineup: [pendingDJId],
                  cover_image: "",
                  status: "draft",
                }
              : undefined
        }
        availableDJs={djs.map((dj) => ({ id: dj.id, name: dj.name }))}
        onAddDJ={() => {
          setShouldReopenEventModal(true);
          setIsModalOpen(false);
          setIsAddDJModalOpen(true);
        }}
      />

      <AddDJModal
        isOpen={isAddDJModalOpen}
        onClose={() => setIsAddDJModalOpen(false)}
        onSubmit={handleAddDJ}
      />

      <ConfirmationModal
        isOpen={deletingEvent !== null}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Event"
        message={`Are you sure you want to delete "${deletingEvent?.title}"? This action cannot be undone.`}
        confirmText="Delete Event"
        cancelText="Cancel"
        type="danger"
      />

      <FilterTabs>
        <FilterTab active={filter === "all"} onClick={() => setFilter("all")}>
          All Events ({events.length})
        </FilterTab>
        <FilterTab
          active={filter === "published"}
          onClick={() => setFilter("published")}
        >
          Published ({events.filter((e) => e.status === "published").length})
        </FilterTab>
        <FilterTab
          active={filter === "draft"}
          onClick={() => setFilter("draft")}
        >
          Drafts ({events.filter((e) => e.status === "draft").length})
        </FilterTab>
      </FilterTabs>

      {isLoading ? (
        <Card>
          <EmptyState>
            <CardTitle>Loading events...</CardTitle>
          </EmptyState>
        </Card>
      ) : (
        <EventsGrid>
          {filteredEvents.map((event) => (
            <EventCard key={event.id}>
              <EventImage>
                {event.cover_image ? (
                  <EventCoverImg src={event.cover_image} alt={event.title} />
                ) : (
                  React.createElement(
                    RiCalendarEventLine as React.ComponentType,
                  )
                )}
              </EventImage>

              <EventContent>
                <EventHeader>
                  <div>
                    <EventTitle>{event.title}</EventTitle>
                  </div>
                  <StatusBadge status={event.status}>
                    {event.status}
                  </StatusBadge>
                </EventHeader>

                <EventMeta>
                  <MetaItem>
                    {React.createElement(
                      RiCalendarEventLine as React.ComponentType,
                    )}
                    {(() => {
                      // Parse date in local timezone to avoid UTC conversion issues
                      const [year, month, day] = event.date
                        .split("-")
                        .map(Number);
                      const date = new Date(year, month - 1, day);
                      return date.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      });
                    })()}
                  </MetaItem>
                  <MetaItem>
                    {React.createElement(RiTimeLine as React.ComponentType)}
                    {event.start_time}
                    {event.end_time && ` - ${event.end_time}`}
                  </MetaItem>
                  {event.dj_lineup && event.dj_lineup.length > 0 && (
                    <MetaItem>
                      {React.createElement(RiMusic2Line as React.ComponentType)}
                      {event.dj_lineup.map(resolveDJName).join(", ")}
                    </MetaItem>
                  )}
                  <MetaItem>
                    {React.createElement(RiTicket2Line as React.ComponentType)}
                    General: R{event.general_entry_price} | VIP: R
                    {event.vip_entry_price}
                  </MetaItem>
                </EventMeta>

                <EventFooter>
                  <div></div>
                  <EventActions>
                    <OutlineButton onClick={() => openEditModal(event)}>
                      {React.createElement(RiEditLine as React.ComponentType)}
                    </OutlineButton>
                    <DangerButton onClick={() => openDeleteModal(event)}>
                      {React.createElement(
                        RiDeleteBinLine as React.ComponentType,
                      )}
                    </DangerButton>
                  </EventActions>
                </EventFooter>
              </EventContent>
            </EventCard>
          ))}
        </EventsGrid>
      )}

      {!isLoading && totalPages > 1 && (
        <PaginationContainer>
          <PageButton disabled={currentPage === 1} onClick={handlePrevPage}>
            {React.createElement(RiArrowLeftLine as React.ComponentType)}
            Prev
          </PageButton>
          <PageInfo>
            Page {currentPage} of {totalPages}
          </PageInfo>
          <PageButton
            disabled={currentPage === totalPages}
            onClick={handleNextPage}
          >
            Next
            {React.createElement(RiArrowRightLine as React.ComponentType)}
          </PageButton>
        </PaginationContainer>
      )}

      {!isLoading && filteredEvents.length === 0 && (
        <Card>
          <EmptyState>
            {React.createElement(RiCalendarEventLine as React.ComponentType)}
            <CardTitle>No events found</CardTitle>
            <CardDescription>
              {filter === "all"
                ? "Create your first event to start attracting club-goers"
                : `No ${filter} events at the moment`}
            </CardDescription>
            {filter === "all" && (
              <PrimaryButton
                style={{ marginTop: theme.spacing.lg }}
                onClick={() => setIsModalOpen(true)}
              >
                {/* {React.createElement(RiAddLine as React.ComponentType)} */}
                Create Your First Event
              </PrimaryButton>
            )}
          </EmptyState>
        </Card>
      )}
    </EventsContainer>
  );
};
