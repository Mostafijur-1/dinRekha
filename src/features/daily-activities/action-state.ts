export type ActivityActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialActivityActionState: ActivityActionState = {
  status: "idle",
  message: "",
};
