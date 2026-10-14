import moment from "moment";
import type { StepState } from "../../../../components/Stepper";
import {
  KYC_STEPS,
  type Director,
  type KycApplication,
  type KycStepId,
} from "../../../../types/kyc";
import {
  authorisationStepSchema,
  businessStepSchema,
  directorsStepSchema,
} from "../../../../validations/kycValidation";

export const newDirector = (): Director => ({
  id: crypto.randomUUID(),
  fullName: "",
  role: "",
  idType: "nin",
  idNumber: "",
  idExpiry: "",
  idDocument: null,
});

// YYYY-MM-DD bounds for date pickers.
export const today = () => moment().format("YYYY-MM-DD");
export const tomorrow = () => moment().add(1, "day").format("YYYY-MM-DD");

/** Whether each form step's saved data would pass its checks. */
export const completedSteps = (
  application: KycApplication,
): Record<Exclude<KycStepId, "review">, boolean> => ({
  business: businessStepSchema.safeParse(application.business).success,
  directors: directorsStepSchema.safeParse({
    directors: application.directors,
  }).success,
  authorisation: authorisationStepSchema.safeParse(application.authorisation)
    .success,
});

/** Where to send someone arriving without a step in the URL. */
export const firstOpenStep = (application: KycApplication): KycStepId => {
  const done = completedSteps(application);
  return (
    KYC_STEPS.find((step) => step.id !== "review" && !done[step.id])?.id ??
    "review"
  );
};

export const stepStates = (
  application: KycApplication,
  current: KycStepId,
): Record<KycStepId, StepState> => {
  const done = completedSteps(application);
  const noteKeys = Object.keys(application.reviewNotes);
  return Object.fromEntries(
    KYC_STEPS.map(({ id }) => {
      if (id === current) return [id, "current"];
      if (noteKeys.some((key) => key.startsWith(id))) return [id, "attention"];
      if (id === "review") return [id, "upcoming"];
      return [id, done[id] ? "done" : "upcoming"];
    }),
  ) as Record<KycStepId, StepState>;
};

// Once submitted, the form is replaced by a status screen.
export type ReviewedStatus =
  | "submitted"
  | "in_review"
  | "approved"
  | "rejected";

export const isReviewedStatus = (
  status: KycApplication["status"],
): status is ReviewedStatus =>
  ["submitted", "in_review", "approved", "rejected"].includes(status);
