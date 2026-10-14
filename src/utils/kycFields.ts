import type { KycApplication } from "../types/kyc";

// Plain names for the fields a reviewer can flag, keyed by the same paths as
// KycApplication.reviewNotes ("business.tin", "directors.0.idDocument").

const BUSINESS: Record<string, string> = {
  legalName: "Registered business name",
  cacNumber: "CAC number",
  cacCertificate: "CAC certificate",
  tin: "TIN",
  tinCertificate: "TIN certificate",
  nepcNumber: "NEPC number",
  nepcExpiry: "NEPC expiry date",
  nepcCertificate: "NEPC certificate",
  address: "Business address",
  "address.proofOfAddress": "Proof of address",
};

const DIRECTOR: Record<string, string> = {
  fullName: "name",
  role: "role",
  idNumber: "ID number",
  idExpiry: "ID expiry date",
  idDocument: "ID copy",
};

const AUTHORISATION: Record<string, string> = {
  signedBy: "Letter signer",
  issuedOn: "Date on the letter",
  letter: "Letter of authority",
};

export const fieldLabel = (path: string, application?: KycApplication) => {
  const [section, ...rest] = path.split(".");
  if (section === "business") return BUSINESS[rest.join(".")] ?? path;
  if (section === "authorisation") return AUTHORISATION[rest[0]] ?? path;
  if (section === "directors") {
    const [index, field] = rest;
    const name =
      application?.directors[Number(index)]?.fullName ||
      `Director ${Number(index) + 1}`;
    return `${name}'s ${DIRECTOR[field] ?? field}`;
  }
  return path;
};
