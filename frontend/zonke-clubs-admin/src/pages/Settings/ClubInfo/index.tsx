import React, { useState, useEffect, useRef } from "react";
import QRCode from "react-qr-code";
import { DatePicker } from "../../../components/DatePicker/DatePicker";
import { TimePicker } from "../../../components/TimePicker/TimePicker";
import {
  clubInfoSchema,
  phoneNumberSchema,
  parseZodErrors,
} from "../../../utils/validation";
import { CardTitle } from "../../../components/Card";
import { PrimaryButton, OutlineButton } from "../../../components/Buttons";
import { theme } from "../../../styles/theme";
import {
  RiStore2Line,
  RiMapPinLine,
  RiPhoneLine,
  RiMailLine,
  RiAddLine,
  RiDeleteBinLine,
  RiPencilLine,
  RiCheckLine,
  RiCloseLine,
  RiImageAddLine,
} from "react-icons/ri";
import {
  IoLocationSharp,
  IoNavigate,
  IoHeartOutline,
  IoPeopleOutline,
  IoCompass,
  IoChatbubblesOutline,
  IoPersonOutline,
  IoPersonAddOutline,
  IoSearchOutline,
  IoGridOutline,
  IoPlayOutline,
  IoBatteryFullOutline,
  IoWifiOutline,
} from "react-icons/io5";
import { apiService } from "../../../services/api";
import { LocationAutocomplete } from "../../../components/LocationAutocomplete";
import { useToast } from "../../../components/Toast";
import { ConfirmationModal } from "../../../components/Modal";
import {
  SettingsContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  FormCard,
  Form,
  FormGroup,
  Label,
  Input,
  TextArea,
  FormActions,
  LoadingText,
  GridRow,
} from "./styles";

export const ClubInfo: React.FC = () => {
  const toast = useToast();
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [newReservationNumber, setNewReservationNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(
    null,
  );
  const [qrDeleteId, setQRDeleteId] = useState<string | null>(null);
  const [showBannerPreview, setShowBannerPreview] = useState(false);
  const [bannerDataUri, setBannerDataUri] = useState<string | null>(null);
  const [showBannerFullscreen, setShowBannerFullscreen] = useState(false);
  const [isRepositioning, setIsRepositioning] = useState(false);
  const [isPreviewRepositioning, setIsPreviewRepositioning] = useState(false);
  const [bannerPosition, setBannerPosition] = useState({ x: 50, y: 50 });
  const [previewBannerPosition, setPreviewBannerPosition] = useState({
    x: 50,
    y: 50,
  });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startPosX: number;
    startPosY: number;
  } | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    location: string | { name: string; latitude: number; longitude: number };
    phone: string;
    email: string;
    dress_code: string;
    entry_fee: string;
    table_reservation_numbers: string[];
  }>({
    name: "",
    description: "",
    location: "",
    phone: "",
    email: "",
    dress_code: "",
    entry_fee: "",
    table_reservation_numbers: [],
  });
  const [originalFormData, setOriginalFormData] = useState<
    typeof formData | null
  >(null);
  const [clubId, setClubId] = useState<string | null>(null);

  // QR code state
  type QRCode = {
    id: string;
    token: string;
    label: string | null;
    valid_date: string;
    expires_at: string;
  };
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [selectedQR, setSelectedQR] = useState<QRCode | null>(null);
  const [qrLabel, setQRLabel] = useState("");
  const [qrValidDate, setQRValidDate] = useState("");
  const [qrExpiryDate, setQRExpiryDate] = useState("");
  const [qrExpiryTime, setQRExpiryTime] = useState("06:00");
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const handlePrintQR = () => {
    const style = document.createElement("style");
    style.id = "__qr-print-style";
    style.innerHTML = `
      @media print {
        body > * { display: none !important; }
        #__qr-print-target { display: flex !important; }
        #__qr-print-target * { visibility: visible !important; }
      }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement("div");
    overlay.id = "__qr-print-target";
    overlay.style.cssText =
      "display:none; position:fixed; inset:0; background:#fff; align-items:center; justify-content:center; flex-direction:column; gap:16px; z-index:9999;";

    const src = document.getElementById("__qr-canvas");
    if (src) {
      const clone = src.cloneNode(true) as HTMLElement;
      clone.style.display = "block";
      overlay.appendChild(clone);
    }

    document.body.appendChild(overlay);
    window.print();
    document.body.removeChild(overlay);
    document.head.removeChild(style);
  };

  // Build the full ISO expiry string from separate date + time fields
  const qrExpiresAt =
    qrExpiryDate && qrExpiryTime ? `${qrExpiryDate}T${qrExpiryTime}:00Z` : "";

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) =>
    setErrors((prev) => ({ ...prev, [field]: "" }));

  useEffect(() => {
    if (!bannerImageUrl) {
      setBannerDataUri(null);
      return;
    }
    fetch(bannerImageUrl)
      .then((r) => r.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onload = () => setBannerDataUri(reader.result as string);
        reader.readAsDataURL(blob);
      })
      .catch(() => setBannerDataUri(bannerImageUrl));
  }, [bannerImageUrl]);

  useEffect(() => {
    // Fetch club data on mount
    apiService
      .getMyClub()
      .then((response) => {
        const cachedAdmin = apiService.getAdminInfo();
        const data = {
          name: response.name || "",
          description: response.description || "",
          location: response.location || "",
          phone: response.phone || "",
          email: response.email || cachedAdmin?.email || "",
          dress_code: response.dress_code || "",
          entry_fee: response.entry_fee || "",
          table_reservation_numbers: response.table_reservation_numbers || [],
        };
        setFormData(data);
        setOriginalFormData(data);
        setBannerImageUrl(response.banner_image_url || null);
        setClubId(response.id || null);
        setBannerPosition({
          x: response.banner_position_x ?? 50,
          y: response.banner_position_y ?? 50,
        });
        setIsLoading(false);

        // Load existing QR codes
        if (response.id) {
          apiService
            .getQRCodes(response.id)
            .then((codes) => {
              setQRCodes(codes || []);
              if (codes && codes.length > 0) setSelectedQR(codes[0]);
            })
            .catch(() => {});
        }
      })
      .catch((error) => {
        const status = error.response?.status;
        if (status === 404) {
          // Club not set up yet — pre-fill email from cached admin info,
          // or fall back to fetching the admin profile if cache is cold.
          const applyInitial = (email: string) => {
            const initial = {
              name: "",
              description: "",
              location: "",
              phone: "",
              email,
              dress_code: "",
              entry_fee: "",
              table_reservation_numbers: [],
            };
            setFormData(initial);
            setOriginalFormData(initial);
            setIsLoading(false);
          };

          const cached = apiService.getAdminInfo();
          if (cached?.email) {
            applyInitial(cached.email);
          } else {
            apiService
              .getCurrentUser()
              .then((admin) => applyInitial(admin?.email || ""))
              .catch(() => applyInitial(""));
          }
        } else {
          toast.error("Failed to load club information");
          setIsLoading(false);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBanner(true);
    apiService
      .uploadClubBanner(file)
      .then((response) => {
        setBannerImageUrl(response.banner_image_url || null);
        clearError("banner");
        toast.success("Banner image updated!");
      })
      .catch(() => {
        toast.error("Failed to upload banner image");
      })
      .finally(() => {
        setIsUploadingBanner(false);
        if (bannerInputRef.current) bannerInputRef.current.value = "";
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = clubInfoSchema.safeParse({
      name: formData.name,
      description: formData.description,
      location: formData.location,
      phone: formData.phone,
      email: formData.email,
    });
    if (!result.success) {
      setErrors(parseZodErrors(result.error));
      return;
    }
    if (!bannerImageUrl) {
      setErrors((prev) => ({
        ...prev,
        banner: "A banner image is required before saving.",
      }));
      return;
    }
    setErrors({});
    setIsSaving(true);

    console.log("Submitting club data:", formData);

    apiService
      .setupClub(formData)
      .then((response) => {
        console.log("Club updated successfully:", response);

        // Refetch club data to confirm changes were saved
        return apiService.getMyClub();
      })
      .then((response) => {
        console.log("Refetched club data after update:", response);
        const data = {
          name: response.name || "",
          description: response.description || "",
          location: response.location || "",
          phone: response.phone || "",
          email: response.email || "",
          dress_code: response.dress_code || "",
          entry_fee: response.entry_fee || "",
          table_reservation_numbers: response.table_reservation_numbers || [],
        };
        setFormData(data);
        setOriginalFormData(data);
        setBannerImageUrl(response.banner_image_url || null);

        // Dispatch event to update sidebar club name
        window.dispatchEvent(new Event("clubUpdated"));

        toast.success("Club information updated successfully!");
        setIsSaving(false);
      })
      .catch((error) => {
        console.error("Failed to update club:", error);
        console.error("Error response:", error.response?.data);
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to update club information";
        toast.error(errorMessage);
        setIsSaving(false);
      });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    clearError(e.target.name);
  };

  const addReservationNumber = () => {
    const trimmed = newReservationNumber.trim();
    const result = phoneNumberSchema.safeParse(trimmed);
    if (!result.success) {
      setPhoneError(result.error.issues[0].message);
      return;
    }
    setPhoneError("");
    setFormData({
      ...formData,
      table_reservation_numbers: [
        ...formData.table_reservation_numbers,
        trimmed,
      ],
    });
    setNewReservationNumber("");
  };

  const removeReservationNumber = (index: number) => {
    setFormData({
      ...formData,
      table_reservation_numbers: formData.table_reservation_numbers.filter(
        (_, i) => i !== index,
      ),
    });
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditingValue("");
    }
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingValue(formData.table_reservation_numbers[index]);
  };

  const saveEditing = () => {
    if (editingIndex === null) return;
    const trimmed = editingValue.trim();
    if (!trimmed) return;
    const updated = [...formData.table_reservation_numbers];
    updated[editingIndex] = trimmed;
    setFormData({ ...formData, table_reservation_numbers: updated });
    setEditingIndex(null);
    setEditingValue("");
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  const hasChanges = () => {
    if (!originalFormData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalFormData);
  };

  const handleCancel = () => {
    if (originalFormData) {
      setFormData(originalFormData);
      toast.info("Changes discarded");
    }
  };

  if (isLoading) {
    return (
      <SettingsContainer>
        <PageHeader>
          <PageTitle>Club Information</PageTitle>
          <PageDescription>
            Manage your club's public profile and contact information.
          </PageDescription>
        </PageHeader>
        <FormCard>
          <LoadingText>Loading club information...</LoadingText>
        </FormCard>
      </SettingsContainer>
    );
  }

  return (
    <SettingsContainer>
      <PageHeader>
        <PageTitle>Club Information</PageTitle>
        <PageDescription>
          Manage your club's public profile and contact information.
        </PageDescription>
      </PageHeader>

      <FormCard style={{ marginBottom: theme.spacing.lg }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.xs,
            marginBottom: theme.spacing.md,
          }}
        >
          <CardTitle style={{ margin: 0 }}>Club Banner Image</CardTitle>
          <span
            style={{
              color: theme.colors.error || "#ef4444",
              fontSize: theme.typography.fontSize.sm,
              fontWeight: 600,
            }}
          >
            *
          </span>
        </div>
        <p
          style={{
            color: theme.colors.textSecondary,
            fontSize: theme.typography.fontSize.sm,
            margin: `0 0 ${theme.spacing.md}`,
          }}
        >
          This image is shown to users on the mobile app.
        </p>

        {/* Banner area — full width with overlay actions */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 220,
            borderRadius: theme.borderRadius.xl,
            overflow: "hidden",
            background: theme.colors.background,
            border: `1px dashed ${errors.banner ? theme.colors.error || "#ef4444" : theme.colors.border}`,
            marginBottom: theme.spacing.md,
          }}
        >
          {bannerImageUrl ? (
            <>
              <img
                src={bannerImageUrl}
                alt="Club banner"
                onClick={() => setShowBannerFullscreen(true)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center center",
                  display: "block",
                  cursor: "zoom-in",
                }}
              />
              {/* Dark gradient overlay at bottom */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)",
                  pointerEvents: "none",
                }}
              />
              {/* Action buttons — bottom right */}
              <div
                style={{
                  position: "absolute",
                  bottom: 14,
                  right: 14,
                  display: "flex",
                  gap: 8,
                }}
              >
                {bannerDataUri && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewBannerPosition(bannerPosition);
                      setShowBannerPreview(true);
                    }}
                    style={{
                      padding: "7px 14px",
                      background: "rgba(0,0,0,0.55)",
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.borderRadius.md,
                      color: theme.colors.textPrimary,
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: 600,
                      cursor: "pointer",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    Preview
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={isUploadingBanner}
                  style={{
                    padding: "7px 14px",
                    background: theme.colors.primary,
                    border: "none",
                    borderRadius: theme.borderRadius.md,
                    color: theme.colors.background,
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {isUploadingBanner ? "Uploading..." : "Change"}
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              disabled={isUploadingBanner}
              style={{
                width: "100%",
                height: "100%",
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                color: theme.colors.textSecondary,
              }}
            >
              {React.createElement(
                RiImageAddLine as React.ComponentType<{ size?: number }>,
                { size: 40 },
              )}
              <span
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: 600,
                }}
              >
                {isUploadingBanner
                  ? "Uploading..."
                  : "Click to upload banner image"}
              </span>
              <span
                style={{ fontSize: theme.typography.fontSize.xs, opacity: 0.6 }}
              >
                JPEG, PNG, WebP · Max 50MB
              </span>
            </button>
          )}
        </div>

        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleBannerChange}
        />

        {/* iPhone preview modal */}
        {showBannerFullscreen && (
          <div
            onClick={() => setShowBannerFullscreen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.92)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              cursor: "zoom-out",
            }}
          >
            <img
              src={bannerImageUrl!}
              alt="Club banner"
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                objectFit: "contain",
                borderRadius: 12,
                boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
              }}
            />
          </div>
        )}

        {showBannerPreview && (
          <div
            onClick={() => setShowBannerPreview(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.75)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              {/* Phone frame (mobile.svg) with Discover content via foreignObject */}
              <svg
                viewBox="0 0 320 630"
                width={290}
                style={{ display: "block", overflow: "visible" }}
              >
                <defs>
                  <clipPath id="__screen-clip">
                    <rect
                      rx="33.8058"
                      height="583.463"
                      width="269.091"
                      y="23.2676"
                      x="25.1414"
                    />
                  </clipPath>
                  <filter
                    id="__phone-drop-shadow"
                    colorInterpolationFilters="sRGB"
                    filterUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="320"
                    height="630"
                  >
                    <feFlood result="BackgroundImageFix" floodOpacity="0" />
                    <feColorMatrix
                      result="hardAlpha"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      type="matrix"
                      in="SourceAlpha"
                    />
                    <feOffset />
                    <feGaussianBlur stdDeviation="6" />
                    <feColorMatrix
                      values="0 0 0 0 0.0745098 0 0 0 0 0.160784 0 0 0 0 0.239216 0 0 0 0.16 0"
                      type="matrix"
                    />
                    <feBlend
                      result="effect1_dropShadow"
                      in2="BackgroundImageFix"
                      mode="normal"
                    />
                    <feBlend
                      result="shape"
                      in2="effect1_dropShadow"
                      in="SourceGraphic"
                      mode="normal"
                    />
                  </filter>
                </defs>

                {/* ── Phone casing ── */}
                <g style={{ filter: "url(#__phone-drop-shadow)" }}>
                  {/* Outer silver rim */}
                  <path
                    fill="#c1c7cd"
                    d="M 260.44,12 H 58.9343 C 34.0499,12 13.8772,32.1805 13.8772,57.0744 V 572.926 C 13.8772,597.82 34.0499,618 58.9343,618 H 260.44 c 24.884,0 45.057,-20.18 45.057,-45.074 V 57.0744 C 305.497,32.1805 285.324,12 260.44,12 Z"
                  />
                  {/* Black body */}
                  <path
                    fill="#000"
                    d="M 260.44,15.7578 H 58.9344 c -22.8106,0 -41.3023,18.4988 -41.3023,41.3182 v 515.851 c 0,22.82 18.4917,41.318 41.3023,41.318 H 260.44 c 22.81,0 41.302,-18.498 41.302,-41.318 V 57.076 c 0,-22.8194 -18.492,-41.3182 -41.302,-41.3182 z"
                  />
                  {/* Screen glass */}
                  <rect
                    fill="#fff"
                    rx="33.8058"
                    height="583.463"
                    width="269.091"
                    y="23.2676"
                    x="25.1414"
                  />
                  {/* Right button */}
                  <path
                    fill="#808080"
                    d="m 305.497,187.916 h 1.252 c 0.691,0 1.252,0.561 1.252,1.252 v 64.481 c 0,0.692 -0.561,1.253 -1.252,1.253 h -1.252 z"
                  />
                  {/* Left buttons */}
                  <path
                    fill="#808080"
                    d="m 12,213.584 c 0,-0.691 0.5606,-1.252 1.2521,-1.252 h 0.626 v 42.57 h -0.626 C 12.5606,254.902 12,254.342 12,253.65 Z"
                  />
                  <path
                    fill="#808080"
                    d="m 12,159.744 c 0,-0.691 0.5606,-1.252 1.2521,-1.252 h 0.626 v 42.57 h -0.626 C 12.5606,201.062 12,200.502 12,199.81 Z"
                  />
                  <path
                    fill="#808080"
                    d="m 12,119.678 c 0,-0.692 0.5606,-1.252 1.2521,-1.252 h 0.626 v 21.285 h -0.626 C 12.5606,139.711 12,139.15 12,138.459 Z"
                  />
                  {/* Dynamic island / notch pill */}
                  <rect
                    fill="#000"
                    rx="11.2686"
                    height="22.5372"
                    width="78"
                    y="30.7812"
                    x="120.888"
                  />
                </g>

                {/* ── Discover screen content ── */}
                <foreignObject
                  x="25"
                  y="23"
                  width="270"
                  height="584"
                  clipPath="url(#__screen-clip)"
                >
                  <div
                    // @ts-ignore
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{
                      background: "#0b0f1a",
                      width: "100%",
                      height: "100%",
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      overflow: "hidden",
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Status bar */}
                    <div
                      style={{
                        height: 32,
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        padding: "0 16px 4px",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}
                      >
                        6:21
                      </span>
                      <div
                        style={{
                          display: "flex",
                          gap: 5,
                          alignItems: "center",
                        }}
                      >
                        <IoWifiOutline size={13} color="#fff" />
                        <IoBatteryFullOutline size={15} color="#fff" />
                      </div>
                    </div>

                    {/* Header */}
                    <div
                      style={{
                        padding: "6px 16px 8px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      {/* Left: Discover + inline search icon */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <span
                          style={{
                            color: "#39f3ff",
                            fontSize: 22,
                            fontWeight: 800,
                            letterSpacing: 0.5,
                          }}
                        >
                          Discover
                        </span>
                        <IoSearchOutline size={15} color="#9aa4b2" />
                      </div>
                    </div>

                    {/* Clubs / Leaderboard tabs */}
                    <div
                      style={{
                        margin: "0 16px 12px",
                        display: "flex",
                        background: "rgba(255,255,255,0.06)",
                        borderRadius: 12,
                        padding: 3,
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          textAlign: "center",
                          padding: "6px 0",
                          borderRadius: 10,
                          background: "#39f3ff",
                          color: "#0b0f1a",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        Clubs
                      </div>
                      <div
                        style={{
                          flex: 1,
                          textAlign: "center",
                          padding: "6px 0",
                          color: "#9aa4b2",
                          fontSize: 11,
                        }}
                      >
                        Leaderboard
                      </div>
                    </div>

                    {/* Scrollable cards area */}
                    <div
                      style={{
                        flex: 1,
                        overflowY: "hidden",
                        padding: "0 12px",
                      }}
                    >
                      {/* Club card */}
                      <div
                        style={{
                          borderRadius: 20,
                          overflow: "hidden",
                          backgroundColor: "#0f131a",
                          marginBottom: 14,
                          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                        }}
                      >
                        <div
                          onMouseDown={(e) => {
                            if (!isPreviewRepositioning) return;
                            e.preventDefault();
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            dragRef.current = {
                              startX: e.clientX,
                              startY: e.clientY,
                              startPosX: previewBannerPosition.x,
                              startPosY: previewBannerPosition.y,
                            };
                            const onMove = (me: MouseEvent) => {
                              if (!dragRef.current) return;
                              const dx =
                                ((me.clientX - dragRef.current.startX) /
                                  rect.width) *
                                -100;
                              const dy =
                                ((me.clientY - dragRef.current.startY) /
                                  rect.height) *
                                -100;
                              setPreviewBannerPosition({
                                x: Math.min(
                                  100,
                                  Math.max(0, dragRef.current.startPosX + dx),
                                ),
                                y: Math.min(
                                  100,
                                  Math.max(0, dragRef.current.startPosY + dy),
                                ),
                              });
                            };
                            const onUp = () => {
                              dragRef.current = null;
                              window.removeEventListener("mousemove", onMove);
                              window.removeEventListener("mouseup", onUp);
                            };
                            window.addEventListener("mousemove", onMove);
                            window.addEventListener("mouseup", onUp);
                          }}
                          style={{
                            position: "relative",
                            width: "100%",
                            height: "177px",
                            cursor: isPreviewRepositioning ? "grab" : "default",
                            userSelect: "none",
                          }}
                        >
                          <img
                            src={bannerDataUri!}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              objectPosition: `${previewBannerPosition.x}% ${previewBannerPosition.y}%`,
                              display: "block",
                              pointerEvents: "none",
                            }}
                          />
                          {isPreviewRepositioning && (
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                border: "2px dashed #39f3ff",
                                borderRadius: 20,
                                pointerEvents: "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <span
                                style={{
                                  background: "rgba(0,0,0,0.65)",
                                  color: "#39f3ff",
                                  fontSize: 9,
                                  fontWeight: 700,
                                  padding: "3px 8px",
                                  borderRadius: 10,
                                }}
                              >
                                Drag to reposition
                              </span>
                            </div>
                          )}
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background:
                                "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
                              pointerEvents: "none",
                            }}
                          />
                          {/* Teal accent bar */}
                          <div
                            style={{
                              position: "absolute",
                              left: 0,
                              top: 20,
                              bottom: 20,
                              width: 3,
                              background: "#39f3ff",
                              borderRadius: "0 2px 2px 0",
                            }}
                          />
                          {/* Heart — no background */}
                          <div
                            style={{ position: "absolute", top: 12, right: 12 }}
                          >
                            <IoHeartOutline size={22} color="#e5e4e2" />
                          </div>
                          {/* Bottom content */}
                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              padding: "6px 14px 12px",
                            }}
                          >
                            <div
                              style={{
                                color: "#e5e4e2",
                                fontWeight: 600,
                                fontSize: 18,
                                letterSpacing: 0.3,
                                marginBottom: 4,
                              }}
                            >
                              {formData.name || "Club Name"}
                            </div>
                            {/* Location + distance */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                              }}
                            >
                              <IoLocationSharp
                                size={12}
                                color="#39f3ff"
                                style={{ flexShrink: 0 }}
                              />
                              <span
                                style={{
                                  color: "#fff",
                                  fontSize: 11,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  flex: 1,
                                }}
                              >
                                {typeof formData.location === "string"
                                  ? formData.location
                                  : (formData.location as any)?.name ||
                                    "Johannesburg, South Africa"}
                              </span>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                  padding: "1px 6px",
                                  borderRadius: 20,
                                  background: "rgba(57,243,255,0.12)",
                                  border: "1px solid rgba(57,243,255,0.3)",
                                  flexShrink: 0,
                                }}
                              >
                                <IoNavigate size={9} color="#39f3ff" />
                                <span
                                  style={{
                                    color: "#39f3ff",
                                    fontSize: 10,
                                    fontWeight: 600,
                                  }}
                                >
                                  1.2 km
                                </span>
                              </div>
                            </div>
                            {/* People open to meet */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: "nowrap",
                                marginTop: 7,
                                background: "rgba(255,255,255,0.08)",
                                border: "1px solid rgba(255,255,255,0.12)",
                                borderRadius: 10,
                                padding: "5px 8px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                  minWidth: 0,
                                  overflow: "hidden",
                                }}
                              >
                                <div style={{ display: "flex", flexShrink: 0 }}>
                                  {["47", "12", "32"].map((n, i) => (
                                    <img
                                      key={i}
                                      src={`https://i.pravatar.cc/40?img=${n}`}
                                      alt=""
                                      style={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: 11,
                                        border: "2px solid #39f3ff",
                                        marginLeft: i === 0 ? 0 : -7,
                                        objectFit: "cover",
                                        display: "block",
                                      }}
                                    />
                                  ))}
                                </div>
                                <span
                                  style={{
                                    color: "#fff",
                                    fontSize: 10,
                                    fontWeight: 500,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  People looking to meet
                                </span>
                              </div>
                              <span
                                style={{
                                  fontSize: 12,
                                  flexShrink: 0,
                                  marginLeft: 6,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                💃👋🍺
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Second faded card */}
                      <div
                        style={{
                          borderRadius: 20,
                          height: 160,
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      />
                    </div>

                    {/* Bottom tab bar */}
                    <div
                      style={{
                        flexShrink: 0,
                        height: 58,
                        background: "#0d1120",
                        borderTop: "1px solid rgba(255,255,255,0.07)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-around",
                        padding: "0 4px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <IoCompass size={22} color="#39f3ff" />
                        <span style={{ fontSize: 8, color: "#39f3ff" }}>
                          Discover
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <IoPersonAddOutline size={22} color="#9aa4b2" />
                        <span style={{ fontSize: 8, color: "#9aa4b2" }}>
                          Requests
                        </span>
                      </div>
                      {/* Centre + button — floated up */}
                      <div
                        style={{
                          position: "absolute",
                          left: "50%",
                          top: -22,
                          transform: "translateX(-50%)",
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                          background: "#39f3ff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 0 20px rgba(57,243,255,0.6)",
                        }}
                      >
                        <span
                          style={{
                            color: "#0b0f1a",
                            fontSize: 28,
                            fontWeight: 300,
                            lineHeight: 1,
                            marginTop: -1,
                          }}
                        >
                          +
                        </span>
                      </div>
                      {/* Spacer so the two right tabs stay balanced */}
                      <div style={{ width: 50 }} />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <IoChatbubblesOutline size={22} color="#9aa4b2" />
                        <span style={{ fontSize: 8, color: "#9aa4b2" }}>
                          Chats
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <IoPersonOutline size={22} color="#9aa4b2" />
                        <span style={{ fontSize: 8, color: "#9aa4b2" }}>
                          Profile
                        </span>
                      </div>
                    </div>
                  </div>
                </foreignObject>
              </svg>

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  onClick={() => {
                    if (isPreviewRepositioning) {
                      // Commit preview position → saved position
                      setBannerPosition(previewBannerPosition);
                      setIsPreviewRepositioning(false);
                      if (clubId)
                        apiService
                          .setupClub({
                            ...formData,
                            banner_position_x: previewBannerPosition.x,
                            banner_position_y: previewBannerPosition.y,
                          })
                          .catch(() => {});
                    } else {
                      setPreviewBannerPosition(bannerPosition);
                      setIsPreviewRepositioning(true);
                    }
                  }}
                  style={{
                    padding: "6px 16px",
                    background: isPreviewRepositioning
                      ? "#39f3ff"
                      : "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(57,243,255,0.4)",
                    borderRadius: 8,
                    color: isPreviewRepositioning ? "#0b0f1a" : "#39f3ff",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {isPreviewRepositioning ? "Done" : "Reposition"}
                </button>
                <button
                  onClick={() => {
                    setShowBannerPreview(false);
                    setIsPreviewRepositioning(false);
                  }}
                  style={{
                    padding: "6px 16px",
                    background: "none",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 8,
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {errors.banner && (
          <p
            style={{
              color: theme.colors.error || "#ef4444",
              fontSize: "12px",
              margin: `${theme.spacing.xs} 0 0`,
            }}
          >
            {errors.banner}
          </p>
        )}
      </FormCard>

      {/* Wristband QR Codes */}
      {clubId && (
        <FormCard
          style={{ marginBottom: theme.spacing.lg, overflow: "visible" }}
        >
          <CardTitle style={{ marginBottom: theme.spacing.sm }}>
            Wristband QR Codes
          </CardTitle>
          <p
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.typography.fontSize.sm,
              margin: `0 0 ${theme.spacing.lg}`,
            }}
          >
            Generate a unique QR code for each gig. Print it on wristbands —
            guests scan it with the Zonke app to check in and meet others at
            your club.
          </p>

          {/* Generate form */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: theme.spacing.sm,
              marginBottom: theme.spacing.lg,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: theme.spacing.sm,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    color: theme.colors.textSecondary,
                    fontSize: theme.typography.fontSize.xs,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 4,
                  }}
                >
                  Gig Label (optional)
                </label>
                <input
                  type="text"
                  value={qrLabel}
                  onChange={(e) => setQRLabel(e.target.value)}
                  placeholder="e.g. Friday Night Out"
                  style={{
                    width: "100%",
                    padding: theme.spacing.md,
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius.lg,
                    color: qrLabel
                      ? theme.colors.textPrimary
                      : theme.colors.textSecondary,
                    fontSize: theme.typography.fontSize.base,
                    fontFamily: theme.typography.fontFamily.base,
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    color: theme.colors.textSecondary,
                    fontSize: theme.typography.fontSize.xs,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 4,
                  }}
                >
                  Gig Date <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <DatePicker
                  value={qrValidDate}
                  onChange={(date) => {
                    setQRValidDate(date);
                    if (date) {
                      // Default expiry date = next morning
                      const d = new Date(date + "T00:00:00");
                      d.setDate(d.getDate() + 1);
                      const nextDay = d.toISOString().split("T")[0];
                      setQRExpiryDate(nextDay);
                      setQRExpiryTime("06:00");
                    }
                  }}
                  minDate={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: theme.spacing.sm,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    color: theme.colors.textSecondary,
                    fontSize: theme.typography.fontSize.xs,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 4,
                  }}
                >
                  Expires On <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <DatePicker
                  value={qrExpiryDate}
                  onChange={setQRExpiryDate}
                  minDate={
                    qrValidDate || new Date().toISOString().split("T")[0]
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    color: theme.colors.textSecondary,
                    fontSize: theme.typography.fontSize.xs,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 6,
                  }}
                >
                  Expires At (time) <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <TimePicker value={qrExpiryTime} onChange={setQRExpiryTime} />
                {qrExpiryDate && qrExpiryTime && (
                  <p
                    style={{
                      color: theme.colors.textSecondary,
                      fontSize: "11px",
                      margin: "6px 0 0",
                    }}
                  >
                    Code expires:{" "}
                    <strong style={{ color: theme.colors.textPrimary }}>
                      {new Date(
                        `${qrExpiryDate}T${qrExpiryTime}:00`,
                      ).toLocaleString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </strong>
                  </p>
                )}
              </div>
            </div>
            <PrimaryButton
              type="button"
              disabled={!qrValidDate || !qrExpiresAt || isGeneratingQR}
              style={{ width: "auto", alignSelf: "flex-start" }}
              onClick={() => {
                if (!clubId || !qrValidDate || !qrExpiresAt) return;
                setIsGeneratingQR(true);
                apiService
                  .generateQRCode(clubId, {
                    label: qrLabel || undefined,
                    valid_date: qrValidDate,
                    expires_at: qrExpiresAt,
                  })
                  .then((code) => {
                    const newCode = code as QRCode;
                    setQRCodes((prev) => [newCode, ...prev]);
                    setSelectedQR(newCode);
                    setQRLabel("");
                    setQRValidDate("");
                    setQRExpiryDate("");
                    setQRExpiryTime("06:00");
                    toast.success("QR code generated!");
                  })
                  .catch(() => toast.error("Failed to generate QR code"))
                  .finally(() => setIsGeneratingQR(false));
              }}
            >
              {isGeneratingQR ? "Generating..." : "Generate QR Code"}
            </PrimaryButton>
          </div>

          {/* QR code list + preview */}
          {qrCodes.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: theme.spacing.lg,
                alignItems: "start",
              }}
            >
              {/* List */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: theme.spacing.xs,
                }}
              >
                {qrCodes.map((code) => {
                  const expired = new Date(code.expires_at) < new Date();
                  const isSelected = selectedQR?.id === code.id;
                  return (
                    <div
                      key={code.id}
                      onClick={() => setSelectedQR(code)}
                      style={{
                        cursor: "pointer",
                        padding: "10px 14px",
                        borderRadius: theme.borderRadius.md,
                        background: isSelected
                          ? "rgba(57,243,255,0.08)"
                          : theme.colors.background,
                        border: `1px solid ${isSelected ? "rgba(57,243,255,0.4)" : theme.colors.border}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color: theme.colors.textPrimary,
                            fontSize: theme.typography.fontSize.sm,
                            fontWeight: 600,
                          }}
                        >
                          {code.label || code.valid_date}
                        </div>
                        <div
                          style={{
                            color: theme.colors.textSecondary,
                            fontSize: theme.typography.fontSize.xs,
                            marginTop: 2,
                          }}
                        >
                          {code.valid_date} ·{" "}
                          {expired
                            ? "Expired"
                            : `Expires ${new Date(code.expires_at).toLocaleString()}`}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 99,
                            background: expired
                              ? "rgba(239,68,68,0.12)"
                              : "rgba(34,197,94,0.12)",
                            color: expired ? "#ef4444" : "#22c55e",
                          }}
                        >
                          {expired ? "EXPIRED" : "ACTIVE"}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQRDeleteId(code.id);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: theme.colors.textSecondary,
                            padding: 4,
                          }}
                        >
                          {React.createElement(
                            RiDeleteBinLine as React.ComponentType<{
                              size?: number;
                            }>,
                            { size: 14 },
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* QR preview */}
              {selectedQR && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: theme.spacing.md,
                  }}
                >
                  <div
                    id="__qr-canvas"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 12,
                      background: "#fff",
                      borderRadius: theme.borderRadius.lg,
                      padding: 24,
                    }}
                  >
                    <QRCode
                      value={`zonkeclubs://checkin/${selectedQR.token}`}
                      size={200}
                      bgColor="#fff"
                      fgColor="#000"
                      level="M"
                    />
                    <p
                      style={{
                        color: "#000",
                        fontSize: 13,
                        fontFamily: "monospace",
                        margin: 0,
                        textAlign: "center",
                      }}
                    >
                      {selectedQR.label || selectedQR.valid_date}
                    </p>
                    <p
                      style={{
                        color: "#555",
                        fontSize: 11,
                        margin: 0,
                        textAlign: "center",
                      }}
                    >
                      Scan with Zonke Clubs app
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handlePrintQR}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                      background: theme.gradients.primary,
                      color: theme.colors.background,
                      border: "none",
                      borderRadius: theme.borderRadius.lg,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: theme.typography.fontSize.sm,
                    }}
                  >
                    🖨️ Print QR Code
                  </button>
                </div>
              )}
            </div>
          )}
        </FormCard>
      )}

      <FormCard>
        <CardTitle style={{ marginBottom: theme.spacing.lg }}>
          Basic Information
        </CardTitle>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>
              {React.createElement(RiStore2Line as React.ComponentType)}
              Club Name
            </Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter club name"
            />
            {errors.name && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "12px",
                  margin: "4px 0 0",
                }}
              >
                {errors.name}
              </p>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Description</Label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your club..."
            />
            {errors.description && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "12px",
                  margin: "4px 0 0",
                }}
              >
                {errors.description}
              </p>
            )}
          </FormGroup>

          <GridRow>
            <FormGroup>
              <Label>
                {React.createElement(RiMapPinLine as React.ComponentType)}
                Location
              </Label>
              <LocationAutocomplete
                name="location"
                value={
                  typeof formData.location === "string"
                    ? formData.location
                    : formData.location.name
                }
                onChange={(location) => {
                  setFormData({ ...formData, location });
                  clearError("location");
                }}
                placeholder="Search for your location..."
              />
              {errors.location && (
                <p
                  style={{
                    color: "#ef4444",
                    fontSize: "12px",
                    margin: "4px 0 0",
                  }}
                >
                  {errors.location}
                </p>
              )}
            </FormGroup>

            <FormGroup>
              <Label>
                {React.createElement(RiPhoneLine as React.ComponentType)}
                WhatsApp Number
              </Label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+27 XX XXX XXXX"
              />
              {errors.phone && (
                <p
                  style={{
                    color: "#ef4444",
                    fontSize: "12px",
                    margin: "4px 0 0",
                  }}
                >
                  {errors.phone}
                </p>
              )}
            </FormGroup>
          </GridRow>

          <GridRow>
            <FormGroup>
              <Label>
                {React.createElement(RiMailLine as React.ComponentType)}
                Email
              </Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@club.com"
              />
              {errors.email && (
                <p
                  style={{
                    color: "#ef4444",
                    fontSize: "12px",
                    margin: "4px 0 0",
                  }}
                >
                  {errors.email}
                </p>
              )}
            </FormGroup>

            {/* Table Reservation Numbers */}
            <FormGroup>
              <Label>
                {React.createElement(RiPhoneLine as React.ComponentType)}
                Reserve Table & Enquiries Numbers
              </Label>

              {/* Add new number */}
              <div style={{ display: "flex", gap: theme.spacing.xs }}>
                <Input
                  type="tel"
                  value={newReservationNumber}
                  onChange={(e) => {
                    setNewReservationNumber(e.target.value);
                    setPhoneError("");
                  }}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), addReservationNumber())
                  }
                  placeholder="+27 XX XXX XXXX"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={addReservationNumber}
                  disabled={!newReservationNumber.trim()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                    background: theme.gradients.primary,
                    color: theme.colors.background,
                    border: "1px solid transparent",
                    borderRadius: theme.borderRadius.lg,
                    fontWeight: 600,
                    cursor: newReservationNumber.trim()
                      ? "pointer"
                      : "not-allowed",
                    fontSize: theme.typography.fontSize.sm,
                    whiteSpace: "nowrap",
                    opacity: newReservationNumber.trim() ? 1 : 0.4,
                  }}
                >
                  {React.createElement(
                    RiAddLine as React.ComponentType<{ size?: number }>,
                    { size: 14 },
                  )}
                  Add
                </button>
              </div>
              {phoneError && (
                <span
                  style={{
                    color: theme.colors.error,
                    fontSize: theme.typography.fontSize.sm,
                  }}
                >
                  {phoneError}
                </span>
              )}

              {/* Pills */}
              {formData.table_reservation_numbers.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: theme.spacing.xs,
                  }}
                >
                  {formData.table_reservation_numbers.map((num, idx) =>
                    editingIndex === idx ? (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          padding: `7px 12px`,
                          background: theme.colors.background,
                          border: `1px solid ${theme.colors.primary}`,
                          borderRadius: 999,
                        }}
                      >
                        <input
                          type="tel"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              saveEditing();
                            }
                            if (e.key === "Escape") cancelEditing();
                          }}
                          autoFocus
                          style={{
                            background: "none",
                            border: "none",
                            outline: "none",
                            color: theme.colors.textPrimary,
                            fontSize: theme.typography.fontSize.sm,
                            width: 120,
                          }}
                        />
                        <button
                          type="button"
                          onClick={saveEditing}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: theme.colors.primary,
                            display: "flex",
                            alignItems: "center",
                            padding: 2,
                          }}
                        >
                          {React.createElement(
                            RiCheckLine as React.ComponentType<{
                              size?: number;
                            }>,
                            { size: 14 },
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: theme.colors.textSecondary,
                            display: "flex",
                            alignItems: "center",
                            padding: 2,
                          }}
                        >
                          {React.createElement(
                            RiCloseLine as React.ComponentType<{
                              size?: number;
                            }>,
                            { size: 14 },
                          )}
                        </button>
                      </div>
                    ) : (
                      <div
                        key={idx}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: `7px 12px`,
                          background: theme.colors.background,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: 999,
                          fontSize: theme.typography.fontSize.sm,
                          color: theme.colors.textPrimary,
                        }}
                      >
                        <span>{num}</span>
                        <button
                          type="button"
                          onClick={() => startEditing(idx)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: theme.colors.textSecondary,
                            display: "flex",
                            alignItems: "center",
                            padding: 2,
                          }}
                        >
                          {React.createElement(
                            RiPencilLine as React.ComponentType<{
                              size?: number;
                            }>,
                            { size: 12 },
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmIndex(idx)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: theme.colors.error || "#ef4444",
                            display: "flex",
                            alignItems: "center",
                            padding: 2,
                          }}
                        >
                          {React.createElement(
                            RiDeleteBinLine as React.ComponentType<{
                              size?: number;
                            }>,
                            { size: 12 },
                          )}
                        </button>
                      </div>
                    ),
                  )}
                </div>
              )}
            </FormGroup>
          </GridRow>

          <FormActions>
            {hasChanges() && (
              <OutlineButton
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </OutlineButton>
            )}
            <PrimaryButton type="submit" disabled={isSaving || !hasChanges()}>
              {isSaving ? "Saving..." : "Save Changes"}
            </PrimaryButton>
          </FormActions>
        </Form>
      </FormCard>

      <ConfirmationModal
        isOpen={qrDeleteId !== null}
        onClose={() => setQRDeleteId(null)}
        onConfirm={() => {
          if (!clubId || !qrDeleteId) return;
          apiService
            .deleteQRCode(clubId, qrDeleteId)
            .then(() => {
              setQRCodes((prev) => prev.filter((c) => c.id !== qrDeleteId));
              if (selectedQR?.id === qrDeleteId) setSelectedQR(null);
              toast.success("QR code deleted");
              setQRDeleteId(null);
            })
            .catch(() => toast.error("Failed to delete"));
        }}
        title="Delete QR Code"
        message="Are you sure you want to delete this QR code? This cannot be undone."
        confirmText="Delete"
        type="danger"
      />

      <ConfirmationModal
        isOpen={deleteConfirmIndex !== null}
        onClose={() => setDeleteConfirmIndex(null)}
        onConfirm={() => {
          if (deleteConfirmIndex !== null)
            removeReservationNumber(deleteConfirmIndex);
        }}
        title="Remove Number"
        message={
          deleteConfirmIndex !== null
            ? `Are you sure you want to remove "${formData.table_reservation_numbers[deleteConfirmIndex]}"?`
            : ""
        }
        confirmText="Remove"
        type="danger"
      />
    </SettingsContainer>
  );
};
