export type InviteActionState = {
  status: "idle" | "success" | "error";
  message: string;
  token?: string;
};
export const initialInviteActionState: InviteActionState = {
  status: "idle",
  message: "",
};
