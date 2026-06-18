import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  RiScissorsFill,
  RiCloseLine,
  RiPlayFill,
  RiPauseFill,
  RiInformationLine,
  RiAlertLine,
} from "react-icons/ri";
import {
  Overlay,
  Container,
  Header,
  HeaderTitle,
  CloseBtn,
  Body,
  VideoWrap,
  VideoEl,
  PlayBtn,
  TimeInfo,
  TimeChip,
  TimeLabel,
  TimeValue,
  TrimSection,
  TrimBarWrap,
  TrimBarTrack,
  TrimBarSelected,
  TrimHandle,
  PlayedFill,
  TimelineLabels,
  TimelineLabel,
  InfoBanner,
  WarnBanner,
  Footer,
  ProgressWrap,
  ProgressLabel,
  ProgressBar,
  ProgressFill,
  TrimBtn,
  CancelBtn,
  MAX_DURATION,
} from "./styles";

// Use the UMD build loaded via <script> tag in index.html to bypass webpack bundling
const { createFFmpeg, fetchFile } = (window as any).FFmpeg;

interface Props {
  isOpen: boolean;
  file: File;
  onCancel: () => void;
  onConfirm: (trimmedFile: File) => void;
}

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const ffmpeg = createFFmpeg({
  corePath: `${window.location.origin}${process.env.PUBLIC_URL || ""}/ffmpeg-core.js`,
  mainName: "main", // @ffmpeg/core-st exports "main" not "proxy_main"
  log: true,
});

// Singleton promise — ensures ffmpeg.load() is only called once
// regardless of React Strict Mode double-effect invocations
let ffmpegLoadPromise: Promise<void> | null = null;

function ensureFFmpegLoaded(): Promise<void> {
  if (ffmpeg.isLoaded()) return Promise.resolve();
  if (!ffmpegLoadPromise) {
    ffmpegLoadPromise = ffmpeg.load().catch((err: unknown) => {
      ffmpegLoadPromise = null; // allow retry on failure
      throw err;
    });
  }
  return ffmpegLoadPromise!;
}

function resetFFmpeg(): void {
  try {
    ffmpeg.exit();
  } catch (_) {}
  ffmpegLoadPromise = null;
}

export const VideoTrimmer: React.FC<Props> = ({
  isOpen,
  file,
  onCancel,
  onConfirm,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trimming, setTrimming] = useState(false);
  const [trimmingLabel, setTrimmingLabel] = useState("Trimming…");
  const [progress, setProgress] = useState(0);
  const [trimError, setTrimError] = useState<string | null>(null);

  // Drag state stored in refs so event listeners stay fresh
  const dragging = useRef<"start" | "end" | null>(null);
  const startTimeRef = useRef(0);
  const endTimeRef = useRef(0);
  const durationRef = useRef(0);

  // Keep refs in sync
  useEffect(() => {
    startTimeRef.current = startTime;
  }, [startTime]);
  useEffect(() => {
    endTimeRef.current = endTime;
  }, [endTime]);
  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  // Set up video source when file changes
  useEffect(() => {
    if (!isOpen) return;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    if (videoRef.current) {
      videoRef.current.src = url;
      videoRef.current.load();
    }
    setStartTime(0);
    setEndTime(0);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }, [file, isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleMetadata = () => {
    const vid = videoRef.current;
    if (!vid) return;
    const d = vid.duration;
    setDuration(d);
    const end = Math.min(d, MAX_DURATION);
    setEndTime(end);
    durationRef.current = d;
    endTimeRef.current = end;
  };

  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid) return;
    const t = vid.currentTime;
    setCurrentTime(t);
    if (t >= endTimeRef.current) {
      vid.currentTime = startTimeRef.current;
    }
  };

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (isPlaying) {
      vid.pause();
      setIsPlaying(false);
    } else {
      vid.currentTime = startTimeRef.current;
      vid.play();
      setIsPlaying(true);
    }
  };

  const pxToTime = useCallback(
    (px: number): number => {
      const bar = barRef.current;
      if (!bar || !duration) return 0;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (px - rect.left) / rect.width));
      return ratio * duration;
    },
    [duration],
  );

  const timeToPct = (t: number): number =>
    duration > 0 ? (t / duration) * 100 : 0;

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging.current || !durationRef.current) return;
      const newTime = pxToTime(e.clientX);
      const MIN_GAP = 1;
      const MAX_END = Math.min(
        durationRef.current,
        startTimeRef.current + MAX_DURATION,
      );
      const MIN_START = Math.max(0, endTimeRef.current - MAX_DURATION);

      if (dragging.current === "start") {
        const clamped = Math.max(
          MIN_START,
          Math.min(newTime, endTimeRef.current - MIN_GAP),
        );
        setStartTime(clamped);
        startTimeRef.current = clamped;
        if (videoRef.current) videoRef.current.currentTime = clamped;
      } else {
        const clamped = Math.max(
          startTimeRef.current + MIN_GAP,
          Math.min(newTime, MAX_END),
        );
        setEndTime(clamped);
        endTimeRef.current = clamped;
        if (videoRef.current) videoRef.current.currentTime = clamped;
      }
    },
    [pxToTime],
  );

  const handleMouseUp = useCallback(() => {
    dragging.current = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  const startDrag = (side: "start" | "end") => (e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = side;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleTrim = () => {
    if (trimming) return;
    const vid = videoRef.current;
    if (vid) vid.pause();
    setIsPlaying(false);
    setTrimming(true);
    setTrimmingLabel("Loading FFmpeg…");
    setProgress(2);
    setTrimError(null);

    const ext = file.name.split(".").pop() || "mp4";
    const inputName = `input.${ext}`;
    const outputName = `trimmed_${Date.now()}.mp4`;
    const trimDuration = endTime - startTime;

    // Always start from a clean ffmpeg state to avoid "can only run one command at a time"
    resetFFmpeg();

    ensureFFmpegLoaded()
      .then(() => {
        setTrimmingLabel("Reading file…");
        setProgress(5);
        return fetchFile(file);
      })
      .then((data: Uint8Array) => {
        ffmpeg.FS("writeFile", inputName, data);
        setTrimmingLabel("Trimming…");
        setProgress(15);
        return ffmpeg.run(
          "-ss",
          startTime.toFixed(3),
          "-i",
          inputName,
          "-t",
          trimDuration.toFixed(3),
          "-c",
          "copy",
          "-avoid_negative_ts",
          "make_zero",
          outputName,
        );
      })
      .then(() => {
        setProgress(85);
        const output = ffmpeg.FS("readFile", outputName);
        const blob = new Blob([output.buffer], { type: "video/mp4" });
        const trimmedFile = new File([blob], outputName, { type: "video/mp4" });
        try {
          ffmpeg.FS("unlink", inputName);
          ffmpeg.FS("unlink", outputName);
        } catch (_) {}
        setProgress(100);
        onConfirm(trimmedFile);
      })
      .catch((err: unknown) => {
        console.error("FFmpeg trim error:", err);
        const msg = err instanceof Error ? err.message : String(err);
        setTrimError(msg || "Trim failed. Please try again.");
      })
      .finally(() => {
        setTrimming(false);
        setProgress(0);
      });
  };

  const selectedDuration = endTime - startTime;
  const tooLong = selectedDuration > MAX_DURATION + 0.1;

  const startPct = timeToPct(startTime);
  const endPct = timeToPct(endTime);
  const currentPct = timeToPct(currentTime);

  return (
    <Overlay isOpen={isOpen} onClick={onCancel}>
      <Container onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderTitle>
            {React.createElement(RiScissorsFill as React.ComponentType)}
            Trim Video
          </HeaderTitle>
          <CloseBtn onClick={onCancel} disabled={trimming}>
            {React.createElement(RiCloseLine as React.ComponentType)}
          </CloseBtn>
        </Header>

        <Body>
          <VideoWrap>
            <VideoEl
              ref={videoRef}
              onLoadedMetadata={handleMetadata}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              muted={false}
              playsInline
            />
          </VideoWrap>

          <TimeInfo>
            <PlayBtn onClick={togglePlay} disabled={!duration || trimming}>
              {isPlaying
                ? React.createElement(RiPauseFill as React.ComponentType)
                : React.createElement(RiPlayFill as React.ComponentType)}
            </PlayBtn>
            <TimeChip>
              <TimeLabel>Start</TimeLabel>
              <TimeValue>{fmt(startTime)}</TimeValue>
            </TimeChip>
            <TimeChip>
              <TimeLabel>End</TimeLabel>
              <TimeValue>{fmt(endTime)}</TimeValue>
            </TimeChip>
            <TimeChip>
              <TimeLabel>Duration</TimeLabel>
              <TimeValue warn={tooLong}>{fmt(selectedDuration)}</TimeValue>
            </TimeChip>
            <TimeChip>
              <TimeLabel>Total</TimeLabel>
              <TimeValue>{fmt(duration)}</TimeValue>
            </TimeChip>
          </TimeInfo>

          <InfoBanner>
            {React.createElement(RiInformationLine as React.ComponentType)}
            Drag the handles to select a clip up to {MAX_DURATION}s long. The
            video will be cut losslessly.
          </InfoBanner>

          {tooLong && (
            <WarnBanner>
              {React.createElement(RiAlertLine as React.ComponentType)}
              Selection exceeds {MAX_DURATION}s — please shorten the range.
            </WarnBanner>
          )}

          <TrimSection>
            <TrimBarWrap ref={barRef}>
              {duration > 0 && <TrimBarTrack />}
              {duration > 0 && currentPct > startPct && (
                <PlayedFill
                  style={{
                    left: `calc(${startPct}% + 9px)`,
                    width: `calc(${Math.min(currentPct, endPct) - startPct}% - 9px)`,
                  }}
                />
              )}
              {duration > 0 && (
                <TrimHandle
                  side="left"
                  style={{ left: `${startPct}%` }}
                  onMouseDown={startDrag("start")}
                />
              )}
              {duration > 0 && (
                <TrimHandle
                  side="right"
                  style={{ left: `${endPct}%` }}
                  onMouseDown={startDrag("end")}
                />
              )}
            </TrimBarWrap>
            <TimelineLabels>
              <TimelineLabel>0:00</TimelineLabel>
              <TimelineLabel>{fmt(duration / 2)}</TimelineLabel>
              <TimelineLabel>{fmt(duration)}</TimelineLabel>
            </TimelineLabels>
          </TrimSection>
        </Body>

        {trimError && (
          <WarnBanner style={{ margin: "0 1.5rem 0", borderRadius: "0.75rem" }}>
            {React.createElement(RiAlertLine as React.ComponentType)}
            {trimError}
          </WarnBanner>
        )}

        {trimming && (
          <ProgressWrap>
            <ProgressLabel>
              <span>{trimmingLabel}</span>
              <span>{progress}%</span>
            </ProgressLabel>
            <ProgressBar>
              <ProgressFill pct={progress} />
            </ProgressBar>
          </ProgressWrap>
        )}

        <Footer>
          <CancelBtn onClick={onCancel} disabled={trimming}>
            Cancel
          </CancelBtn>
          <TrimBtn
            onClick={handleTrim}
            disabled={trimming || tooLong || selectedDuration < 1}
          >
            {React.createElement(RiScissorsFill as React.ComponentType)}
            {trimming ? trimmingLabel : "Trim & Apply"}
          </TrimBtn>
        </Footer>
      </Container>
    </Overlay>
  );
};
