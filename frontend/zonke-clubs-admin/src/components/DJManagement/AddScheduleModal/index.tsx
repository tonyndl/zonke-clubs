import React, { useState } from "react";
import { Modal } from "../../Modal/Modal";
import { PrimaryButton, OutlineButton } from "../../Buttons";
import {
  RiMusic2Line,
  RiCalendarLine,
  RiTimeLine,
  RiAddLine,
} from "react-icons/ri";
import {
  Form,
  FormGroup,
  Label,
  Input,
  Select,
  TextArea,
  FormRow,
  RadioGroup,
  RadioOption,
  RadioInput,
  RadioLabel,
  FormActions,
  HelperText,
  DJSelectHeader,
  AddDJButton,
  EmptyDJsMessage,
} from "./styles";

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (schedule: ScheduleFormData) => void;
  availableDJs: Array<{ id: string; name: string }>;
  initialData?: ScheduleFormData;
  isEditMode?: boolean;
  onAddDJ?: () => void;
}

export interface ScheduleFormData {
  djId: string;
  djName: string;
  scheduleType: "weekly" | "specific";
  dayOfWeek?: number; // 0-6 (Sun-Sat)
  specificDate?: string; // ISO date string
  startTime?: string;
  endTime?: string;
  notes?: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export const AddScheduleModal: React.FC<AddScheduleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availableDJs,
  initialData,
  isEditMode = false,
  onAddDJ,
}) => {
  const [formData, setFormData] = useState<ScheduleFormData>(
    initialData || {
      djId: "",
      djName: "",
      scheduleType: "weekly",
      dayOfWeek: undefined,
      specificDate: undefined,
      startTime: "",
      endTime: "",
      notes: "",
    },
  );

  // Update form data when initialData changes (for edit mode)
  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        djId: "",
        djName: "",
        scheduleType: "weekly",
        dayOfWeek: undefined,
        specificDate: undefined,
        startTime: "",
        endTime: "",
        notes: "",
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (field: keyof ScheduleFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDJChange = (djId: string) => {
    const dj = availableDJs.find((d) => d.id === djId);
    setFormData((prev) => ({
      ...prev,
      djId,
      djName: dj?.name || "",
    }));
  };

  const handleScheduleTypeChange = (type: "weekly" | "specific") => {
    setFormData((prev) => ({
      ...prev,
      scheduleType: type,
      dayOfWeek: type === "weekly" ? 1 : undefined,
      specificDate: type === "specific" ? "" : undefined,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    // Reset form
    setFormData({
      djId: "",
      djName: "",
      scheduleType: "weekly",
      dayOfWeek: undefined,
      specificDate: undefined,
      startTime: "",
      endTime: "",
      notes: "",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit DJ Schedule" : "Add DJ Schedule"}
      maxWidth="700px"
    >
      <Form onSubmit={handleSubmit}>
        {availableDJs.length === 0 ? (
          <EmptyDJsMessage>
            <p>No DJs available yet. Add your first DJ to create a schedule.</p>
            {onAddDJ && (
              <PrimaryButton type="button" onClick={onAddDJ}>
                {React.createElement(RiAddLine as React.ComponentType)}
                Add Your First DJ
              </PrimaryButton>
            )}
          </EmptyDJsMessage>
        ) : (
          <FormGroup>
            <DJSelectHeader>
              <Label>
                {React.createElement(RiMusic2Line as React.ComponentType)}
                Select DJ *
              </Label>
              {onAddDJ && (
                <AddDJButton type="button" onClick={onAddDJ} title="Add new DJ">
                  {React.createElement(RiAddLine as React.ComponentType)}
                  Add DJ
                </AddDJButton>
              )}
            </DJSelectHeader>
            <Select
              value={formData.djId}
              onChange={(e) => handleDJChange(e.target.value)}
              required
            >
              <option value="">Choose a DJ...</option>
              {availableDJs.map((dj) => (
                <option key={dj.id} value={dj.id}>
                  {dj.name}
                </option>
              ))}
            </Select>
          </FormGroup>
        )}

        <FormGroup>
          <Label>Schedule Type *</Label>
          <RadioGroup>
            <RadioOption>
              <RadioInput
                type="radio"
                name="scheduleType"
                value="weekly"
                checked={formData.scheduleType === "weekly"}
                onChange={() => handleScheduleTypeChange("weekly")}
              />
              <RadioLabel>Weekly Recurring</RadioLabel>
            </RadioOption>
            <RadioOption>
              <RadioInput
                type="radio"
                name="scheduleType"
                value="specific"
                checked={formData.scheduleType === "specific"}
                onChange={() => handleScheduleTypeChange("specific")}
              />
              <RadioLabel>Specific Date</RadioLabel>
            </RadioOption>
          </RadioGroup>
          <HelperText>
            {formData.scheduleType === "weekly"
              ? "This DJ will play every week on the selected day"
              : "This is a one-time performance for a special event"}
          </HelperText>
        </FormGroup>

        {formData.scheduleType === "weekly" ? (
          <FormGroup>
            <Label>
              {React.createElement(RiCalendarLine as React.ComponentType)}
              Day of Week *
            </Label>
            <Select
              value={formData.dayOfWeek}
              onChange={(e) =>
                handleChange("dayOfWeek", parseInt(e.target.value))
              }
              required
            >
              <option value="">Select a day...</option>
              {DAYS_OF_WEEK.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </Select>
          </FormGroup>
        ) : (
          <FormGroup>
            <Label>
              {React.createElement(RiCalendarLine as React.ComponentType)}
              Event Date *
            </Label>
            <Input
              type="date"
              value={formData.specificDate || ""}
              onChange={(e) => handleChange("specificDate", e.target.value)}
              required
            />
          </FormGroup>
        )}

        <FormRow>
          <FormGroup>
            <Label>
              {React.createElement(RiTimeLine as React.ComponentType)}
              Start Time
            </Label>
            <Input
              type="time"
              value={formData.startTime || ""}
              onChange={(e) => handleChange("startTime", e.target.value)}
            />
            <HelperText>Optional - leave blank if time is TBD</HelperText>
          </FormGroup>

          <FormGroup>
            <Label>
              {React.createElement(RiTimeLine as React.ComponentType)}
              End Time
            </Label>
            <Input
              type="time"
              value={formData.endTime || ""}
              onChange={(e) => handleChange("endTime", e.target.value)}
            />
            <HelperText>Optional - leave blank for open-ended sets</HelperText>
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label>Notes / Details</Label>
          <TextArea
            placeholder="e.g., Special Valentine's Day set, Main stage, etc."
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
          />
        </FormGroup>

        <FormActions>
          <OutlineButton type="button" onClick={onClose}>
            Cancel
          </OutlineButton>
          <PrimaryButton type="submit">
            {isEditMode ? "Update Schedule" : "Add Schedule"}
          </PrimaryButton>
        </FormActions>
      </Form>
    </Modal>
  );
};
