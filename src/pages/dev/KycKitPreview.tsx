import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "../../components/Button";
import Checkbox from "../../components/Checkbox";
import FileDropzone from "../../components/FileDropzone";
import Input from "../../components/Input";
import PasswordInput from "../../components/PasswordInput";
import PhoneInput from "../../components/PhoneInput";
import Select from "../../components/Select";
import Stepper, { type StepState } from "../../components/Stepper";
import VerificationBanner from "../../components/app/VerificationBanner";
import VerificationCard from "../../components/app/VerificationCard";
import KycChecklist from "../../components/auth/KycChecklist";
import { NIGERIAN_STATES } from "../../data/nigeria";
import { useKyc, useSaveKycDraft } from "../../hooks/useKycService";
import AuthSplitLayout from "../../layout/AuthSplitLayout";
import { resetKycMock, setKycMockStatus } from "../../services/api/kyc";
import { resetKycAdminMock } from "../../services/api/kycAdmin";
import {
  ID_TYPE_LABELS,
  KYC_STEPS,
  type KycDocument,
  type KycStatus,
  type KycStepId,
} from "../../types/kyc";
import { normalizeNigerianPhone } from "../../utils/phone";
import {
  cacNumberSchema,
  nigerianPhoneSchema,
  tinSchema,
} from "../../validations/kycValidation";

// DEV ONLY (/dev/kyc-kit): a review page for the Phase 1 building blocks.
// Not linked anywhere and not registered in production builds.

const demoSchema = z.object({
  phone: nigerianPhoneSchema,
  cacNumber: cacNumberSchema,
  tin: tinSchema,
  state: z.string().min(1, "Choose a state"),
  password: z.string().min(8, "Use at least 8 characters"),
});

type DemoValues = z.input<typeof demoSchema>;

const STEPPER_PRESETS: {
  name: string;
  states: Record<KycStepId, StepState>;
}[] = [
  {
    name: "Starting",
    states: {
      business: "current",
      directors: "upcoming",
      authorisation: "upcoming",
      review: "upcoming",
    },
  },
  {
    name: "Halfway",
    states: {
      business: "done",
      directors: "done",
      authorisation: "current",
      review: "upcoming",
    },
  },
  {
    name: "Changes requested",
    states: {
      business: "attention",
      directors: "done",
      authorisation: "done",
      review: "current",
    },
  },
];

const MOCK_STATUSES: KycStatus[] = [
  "not_started",
  "draft",
  "submitted",
  "in_review",
  "changes_requested",
  "approved",
  "rejected",
];

const SAMPLE_DOCUMENT: KycDocument = {
  id: "sample",
  name: "cac-certificate-rc1234567.pdf",
  size: 842_113,
  mimeType: "application/pdf",
  uploadedAt: new Date().toISOString(),
};

const Section = ({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: ReactNode;
}) => (
  <section className="rounded-xl border border-slate-200 bg-white p-6">
    <h2 className="font-display text-xl font-bold text-slate-900">{title}</h2>
    <p className="mt-1 text-slate-500">{note}</p>
    <div className="mt-6">{children}</div>
  </section>
);

const KycKitPreview = () => {
  const [preset, setPreset] = useState(0);
  const [stepStates, setStepStates] = useState(STEPPER_PRESETS[0].states);
  const [sample, setSample] = useState<KycDocument | null>(SAMPLE_DOCUMENT);
  const [result, setResult] = useState<string | null>(null);
  const { application, isPending } = useKyc();
  const { saveDraft, isPending: isSaving } = useSaveKycDraft();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DemoValues>({
    resolver: zodResolver(demoSchema),
    defaultValues: { state: "" },
  });

  const business = application?.business;

  // Uploads persist through the mock, so a reload shows what was saved.
  const saveDocument =
    (field: "cacCertificate" | "tinCertificate") =>
    (document: KycDocument | null) => {
      if (!business) return;
      saveDraft({ business: { ...business, [field]: document } });
    };

  return (
    <>
      <AuthSplitLayout aside={<KycChecklist />}>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
          Split layout preview
        </h1>
        <p className="mt-2 text-slate-500">
          Register and Login will sit here in Phase 2. Scroll down for the rest
          of the kit.
        </p>
        <form
          noValidate
          className="mt-8 space-y-5"
          onSubmit={handleSubmit((values) =>
            setResult(
              `Valid. Phone stored as ${normalizeNigerianPhone(values.phone)}`,
            ),
          )}
        >
          <PhoneInput
            label="Phone number"
            {...register("phone")}
            error={errors.phone?.message}
          />
          <Input
            label="CAC number"
            placeholder="RC 1234567"
            {...register("cacNumber")}
            error={errors.cacNumber?.message}
          />
          <Input
            label="Tax identification number"
            placeholder="12345678-0001"
            {...register("tin")}
            error={errors.tin?.message}
          />
          <Select
            label="State"
            placeholder="Choose a state"
            options={NIGERIAN_STATES}
            {...register("state")}
            error={errors.state?.message}
          />
          <PasswordInput
            label="Password"
            autoComplete="new-password"
            hint="At least 8 characters"
            {...register("password")}
            error={errors.password?.message}
          />
          <Checkbox label="A checkbox, for spacing comparison" />
          <Button type="submit" size="lg" className="w-full">
            Check fields
          </Button>
          {result && (
            <p role="status" className="text-kelp font-medium">
              {result}
            </p>
          )}
        </form>
      </AuthSplitLayout>

      <div className="bg-mist max-small-mobile:px-4 px-8 py-16">
        <div className="mx-auto max-w-3xl space-y-8">
          <Section
            title="Stepper"
            note="Done and needs-changes steps are clickable. Below 800px it becomes a single line with a bar."
          >
            <div className="mb-6 flex flex-wrap gap-2">
              {STEPPER_PRESETS.map((item, i) => (
                <Button
                  key={item.name}
                  size="sm"
                  variant={preset === i ? "primary" : "outline"}
                  onClick={() => {
                    setPreset(i);
                    setStepStates(item.states);
                  }}
                >
                  {item.name}
                </Button>
              ))}
            </div>
            <Stepper
              steps={KYC_STEPS}
              states={stepStates}
              onStepClick={(id) =>
                setStepStates((states) => {
                  const next = { ...states };
                  // The step being left keeps "done" only if it was finished
                  // in order, i.e. it comes before the one clicked.
                  const ids = KYC_STEPS.map((step) => step.id);
                  ids.forEach((key) => {
                    if (next[key] === "current")
                      next[key] =
                        ids.indexOf(key) < ids.indexOf(id)
                          ? "done"
                          : "upcoming";
                  });
                  next[id] = "current";
                  return next;
                })
              }
            />
          </Section>

          <Section
            title="File upload"
            note="Try a PDF, JPG or PNG; then something over 5 MB or a .docx to see the errors. The first two save to the mock, so they survive a reload (previews don't, as in production)."
          >
            <div className="space-y-6">
              {isPending || !business ? (
                <p className="text-slate-500">Loading mock data…</p>
              ) : (
                <>
                  <FileDropzone
                    label="CAC certificate"
                    hint="The full certificate, with the RC or BN number readable"
                    value={business.cacCertificate}
                    onChange={saveDocument("cacCertificate")}
                    disabled={isSaving}
                  />
                  <FileDropzone
                    label="TIN certificate"
                    value={business.tinCertificate}
                    onChange={saveDocument("tinCertificate")}
                    disabled={isSaving}
                  />
                </>
              )}
              <FileDropzone
                label="Uploaded state (not saved)"
                value={sample}
                onChange={setSample}
              />
              <FileDropzone
                label="Director ID"
                hint="All four corners visible, no glare"
                value={null}
                onChange={() => {}}
                error="Upload the director's ID"
              />
            </div>
          </Section>

          <Section
            title="Dashboard banner and Overview card"
            note="What customers see for the status picked below. The banner shows on every customer page except Overview and Verification; Overview shows the card. Both disappear once approved."
          >
            <div className="space-y-6">
              <VerificationBanner />
              <VerificationCard />
              {application?.status === "approved" && (
                <p className="text-slate-500">
                  Approved: no banner or card is shown.
                </p>
              )}
            </div>
          </Section>

          <Section
            title="Mock service"
            note="What the mock has stored in this browser."
          >
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
              <dt className="text-slate-500">Status</dt>
              <dd className="font-medium">{application?.status ?? "…"}</dd>
              <dt className="text-slate-500">Last saved</dt>
              <dd className="font-medium">
                {application?.updatedAt
                  ? new Date(application.updatedAt).toLocaleString()
                  : "…"}
              </dd>
              <dt className="text-slate-500">ID types</dt>
              <dd className="font-medium">
                {Object.values(ID_TYPE_LABELS).join(", ")}
              </dd>
            </dl>
            <div className="mt-6">
              <p className="font-display text-sm font-semibold text-slate-800">
                Jump to a status
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {MOCK_STATUSES.map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={
                      application?.status === status ? "primary" : "outline"
                    }
                    onClick={() => {
                      setKycMockStatus(status);
                      queryClient.invalidateQueries({ queryKey: ["kyc"] });
                    }}
                  >
                    {status.replace("_", " ")}
                  </Button>
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => {
                resetKycMock();
                resetKycAdminMock();
                window.location.reload();
              }}
            >
              Clear mock data
            </Button>
          </Section>
        </div>
      </div>
    </>
  );
};

export default KycKitPreview;
