export type TimelineActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const initialTimelineActionState: TimelineActionState = {
  status: "idle",
};
