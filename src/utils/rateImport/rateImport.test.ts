import ExcelJS from "exceljs";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it } from "node:test";
import { amountValue, dateValue, portRef } from "./cells";
import { parseImport, readImportFile, type ParsedImport } from "./index";
import { parseCsv, readXlsx } from "./readFile";
import { ImportFileError, type Cell } from "./types";

// Run with: npm test
// The real Maersk quote (kept out of the repo: it names a customer) is read
// from the project folder when it's there, or from MAERSK_QUOTE_FILE.

const TODAY = "2026-11-14";

const fileLike = (name: string, data: Uint8Array | string) => {
  const bytes =
    typeof data === "string" ? new TextEncoder().encode(data) : data;
  return {
    name,
    size: bytes.byteLength,
    arrayBuffer: async () =>
      bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
      ) as ArrayBuffer,
  };
};

const workbookBytes = async (sheets: Record<string, Cell[][]>) => {
  const wb = new ExcelJS.Workbook();
  for (const [name, rows] of Object.entries(sheets)) {
    const ws = wb.addWorksheet(name);
    rows.forEach((row) => ws.addRow(row));
  }
  return new Uint8Array(await wb.xlsx.writeBuffer());
};

const parseFile = async (
  name: string,
  data: Uint8Array | string,
  today = TODAY,
) => parseImport(await readImportFile(fileLike(name, data)), today);

const errors = (p: ParsedImport) => p.issues.filter((i) => i.level === "error");
const warnings = (p: ParsedImport) =>
  p.issues.filter((i) => i.level === "warning");
const find = (
  p: ParsedImport,
  origin: string,
  destination: string,
  size: string,
) =>
  p.rates.find(
    (r) =>
      r.origin.raw.startsWith(origin) &&
      r.destination.raw.startsWith(destination) &&
      r.containerSize === size,
  );

// ---- Cells -----------------------------------------------------------------

describe("cell values", () => {
  it("reads dates from date cells, Excel serials and written text", () => {
    assert.equal(dateValue(new Date(Date.UTC(2026, 11, 1))), "2026-12-01");
    assert.equal(dateValue(46357), "2026-12-01");
    assert.equal(dateValue("2026-12-01"), "2026-12-01");
    assert.equal(dateValue("1 Dec 2026"), "2026-12-01");
    assert.equal(dateValue("01-Dec-2026"), "2026-12-01");
  });

  it("refuses ambiguous or invalid dates", () => {
    assert.equal(dateValue("01/12/2026"), null);
    assert.equal(dateValue("2026-13-01"), null);
    assert.equal(dateValue("2026-02-30"), null);
    assert.equal(dateValue("soon"), null);
    assert.equal(dateValue(""), null);
    assert.equal(dateValue(12), null);
  });

  it("reads amounts and refuses ambiguous ones", () => {
    assert.equal(amountValue(1200), 1200);
    assert.equal(amountValue("1200"), 1200);
    assert.equal(amountValue("1,200.50"), 1200.5);
    assert.equal(amountValue("0"), 0);
    assert.equal(amountValue("1.200,50"), null);
    assert.equal(amountValue("1 200"), null);
    assert.equal(amountValue("-50"), null);
    assert.equal(amountValue("USD 50"), null);
    assert.equal(amountValue("NA"), null);
  });

  it("reads ports as codes or names", () => {
    assert.deepEqual(portRef("ngapp"), { raw: "ngapp", code: "NGAPP" });
    assert.deepEqual(portRef("Naples, NA, Italy"), {
      raw: "Naples, NA, Italy",
      city: "Naples",
      country: "Italy",
    });
    assert.equal(portRef(""), null);
  });

  it("reads CSV with a BOM, semicolons and quoted fields", () => {
    const rows = parseCsv('\uFEFFa;b;c\r\n1;"x; ""y""\nz";3\n');
    assert.deepEqual(rows, [
      ["a", "b", "c"],
      ["1", 'x; "y"\nz', "3"],
    ]);
  });
});

// ---- Files -----------------------------------------------------------------

describe("file checks", () => {
  it("refuses other file types, old .xls, empty and oversized files", async () => {
    await assert.rejects(
      readImportFile(fileLike("quote.pdf", "x")),
      ImportFileError,
    );
    await assert.rejects(
      readImportFile(fileLike("quote.xls", "x")),
      /save it as \.xlsx/,
    );
    await assert.rejects(readImportFile(fileLike("rates.csv", "")), /empty/);
    const big = { ...fileLike("rates.csv", "x"), size: 6 * 1024 * 1024 };
    await assert.rejects(readImportFile(big), /over 5 MB/);
  });

  it("refuses a damaged workbook", async () => {
    await assert.rejects(
      readImportFile(fileLike("quote.xlsx", "not a zip")),
      /couldn't be opened/,
    );
  });

  it("refuses a spreadsheet that isn't a quote or our template", async () => {
    const bytes = await workbookBytes({
      Sheet1: [
        ["Name", "Email"],
        ["Ada", "a@b.c"],
      ],
    });
    await assert.rejects(
      parseFile("people.xlsx", bytes),
      /doesn't look like a Maersk quote/,
    );
    await assert.rejects(parseFile("blank.csv", "\n\n"), /empty/);
  });
});

// ---- Maersk quote export: synthetic cases -----------------------------------

const HEADER = [
  "From (City, Country/Region)",
  "Load Port",
  "Discharge Port",
  "To (City, Country/Region)",
  "Origin MOT",
  "Destination MOT",
  "Effective Date",
  "Expiry Date",
  "Service Mode",
  "Commodity Name",
  "SOC",
  "NOR",
  "Empty",
  "IMO Class",
  "UN Number",
  "Transit Time",
  "Charge Type",
  "Country PayTerm",
  "Charge Code",
  "Charge Name",
  "Rate Basis",
  "Rate",
  "Currency",
  "Rate structure",
  "Rate",
  "Currency",
  "Rate structure",
  "Rate",
  "Currency",
  "Rate structure",
  "Rfq Ids",
];
const EQUIPMENT: Cell[] = [
  ...Array(21).fill(null),
  "20DRY",
  "20DRY",
  "20DRY",
  "40DRY",
  "40DRY",
  "40DRY",
  "40HDRY",
  "40HDRY",
  "40HDRY",
];

type Line = {
  from?: string;
  load?: string;
  discharge?: string;
  to?: string;
  effective?: Cell;
  expiry?: Cell;
  mode?: string;
  commodity?: string;
  imo?: string;
  transit?: string;
  type?: string;
  pay?: string;
  code: string;
  name?: string;
  basis?: string;
  r20?: Cell;
  c20?: string;
  s20?: string;
  r40?: Cell;
  c40?: string;
  s40?: string;
  rhc?: Cell;
  chc?: string;
  shc?: string;
};

const line = (l: Line): Cell[] => {
  const load = l.load ?? "Apapa, Nigeria";
  const discharge = l.discharge ?? "Antwerp, Belgium";
  return [
    l.from ?? load,
    load,
    discharge,
    l.to ?? discharge,
    null,
    null,
    l.effective ?? "2026-12-01",
    l.expiry ?? "2026-12-31",
    l.mode ?? "CY/CY",
    l.commodity ?? "MINE_IRO_ORE_OTH_MET",
    "N",
    "N",
    null,
    l.imo ?? null,
    null,
    l.transit ?? "24d 18h",
    l.type ?? "FREIGHT",
    l.pay ?? "PREPAID/COLLECT",
    l.code,
    l.name ?? l.code,
    l.basis ?? "PER_CONTAINER",
    l.r20 ?? "NA",
    l.c20 ?? (l.r20 === undefined ? "NA" : "USD"),
    l.s20 ?? null,
    l.r40 ?? "NA",
    l.c40 ?? (l.r40 === undefined ? "NA" : "USD"),
    l.s40 ?? null,
    l.rhc ?? "NA",
    l.chc ?? (l.rhc === undefined ? "NA" : "USD"),
    l.shc ?? null,
    "1",
  ];
};

const quote = (
  lines: Line[],
  extra: Record<string, Cell[][]> = {},
  equipment = EQUIPMENT,
) =>
  workbookBytes({
    QuoteOutput: [
      ["Quote Number", "CP-TEST_1"],
      ["Customer Name", "Test"],
      [],
      equipment,
      HEADER,
      ...lines.map(line),
    ],
    ...extra,
  });

describe("Maersk quote export", () => {
  it("makes one rate per priced size, skipping NA sizes and charges", async () => {
    const p = await parseFile(
      "q.xlsx",
      await quote([
        { code: "BAS", name: "Basic Ocean Freight", r40: "1300", rhc: "1300" },
        {
          code: "EBS",
          r40: "171",
          c40: "EUR",
          s40: "Floating",
          rhc: "171",
          chc: "EUR",
          shc: "Floating",
        },
        { code: "PSS", r40: "NA", rhc: "0" },
        { code: "VP1", r40: "29", s40: "Fixed", rhc: "29", shc: "Fixed" },
        {
          code: "ODF",
          type: "ORIGIN",
          pay: "PREPAID",
          basis: "PER_DOCUMENT",
          r40: "5000",
          c40: "NGN",
          rhc: "5000",
          chc: "NGN",
        },
        {
          code: "DHC",
          type: "DESTINATION",
          pay: "COLLECT",
          r40: "275",
          c40: "EUR",
          rhc: "275",
          chc: "EUR",
        },
      ]),
    );
    assert.equal(p.format, "maersk");
    assert.equal(p.quoteNumber, "CP-TEST_1");
    assert.equal(p.rowCount, 6);
    assert.deepEqual(errors(p), []);
    assert.deepEqual(p.rates.map((r) => r.containerSize).sort(), [
      "40ft HC",
      "40ft Std",
    ]);

    const std = find(p, "Apapa", "Antwerp", "40ft Std")!;
    assert.deepEqual(
      std.charges.map((c) => c.code),
      ["BAS", "EBS", "VP1", "ODF", "DHC"],
    );
    const hc = find(p, "Apapa", "Antwerp", "40ft HC")!;
    assert.ok(hc.charges.some((c) => c.code === "PSS" && c.amount === 0));

    const ebs = std.charges.find((c) => c.code === "EBS")!;
    assert.deepEqual(
      [ebs.amount, ebs.currency, ebs.structure, ebs.stage, ebs.payTerm],
      [171, "EUR", "floating", "freight", "either"],
    );
    const odf = std.charges.find((c) => c.code === "ODF")!;
    assert.deepEqual(
      [odf.basis, odf.stage, odf.payTerm],
      ["document", "origin", "prepaid"],
    );
    assert.equal(std.charges.find((c) => c.code === "DHC")!.payTerm, "collect");
    assert.equal(std.charges.find((c) => c.code === "BAS")!.structure, "fixed");
    assert.equal(std.transitHours, 24 * 24 + 18);
    assert.deepEqual(std.commodity, {
      kind: "maersk",
      code: "MINE_IRO_ORE_OTH_MET",
    });
  });

  it("finds the table wherever it starts and reads date cells", async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Quote copy");
    ws.addRow([]);
    ws.addRow(["Quote Number", "Q-9"]);
    ws.addRow([]);
    ws.addRow([]);
    ws.addRow(EQUIPMENT);
    ws.addRow(HEADER);
    ws.addRow(
      line({
        code: "BAS",
        r20: 900,
        effective: new Date(Date.UTC(2026, 11, 1)),
        expiry: 46387,
      }),
    );
    const p = await parseFile(
      "q.xlsx",
      new Uint8Array(await wb.xlsx.writeBuffer()),
    );
    assert.equal(p.rates.length, 1);
    assert.equal(p.rates[0].validFrom, "2026-12-01");
    assert.equal(p.rates[0].validTo, "2026-12-31");
    assert.equal(p.rates[0].charges[0].amount, 900);
  });

  it("leaves out only the size with a bad amount", async () => {
    const p = await parseFile(
      "q.xlsx",
      await quote([
        { code: "BAS", r20: "1050", r40: "1430" },
        { code: "EBS", r20: "-86", c20: "EUR", r40: "171", c40: "EUR" },
      ]),
    );
    assert.deepEqual(
      p.rates.map((r) => r.containerSize),
      ["40ft Std"],
    );
    assert.equal(errors(p).length, 1);
    assert.match(errors(p)[0].message, /20ft Std.*negative/);
  });

  it("refuses a lane with no basic freight, mixed-up charge codes and bad dates", async () => {
    const p = await parseFile(
      "q.xlsx",
      await quote([
        { discharge: "Hamburg, HH, Germany", code: "EBS", r40: "171" },
        { discharge: "Genoa, GE, Italy", code: "BAS", r40: "1200" },
        { discharge: "Genoa, GE, Italy", code: "DHC", r40: "200" },
        { discharge: "Genoa, GE, Italy", code: "DHC", r40: "250" },
        {
          discharge: "Mersin, Turkey",
          code: "BAS",
          r40: "1300",
          effective: "2026-12-31",
          expiry: "2026-12-01",
        },
        {
          discharge: "Izmir, Turkey",
          code: "BAS",
          r40: "1300",
          effective: "01/12/2026",
        },
      ]),
    );
    assert.equal(p.rates.length, 0);
    const text = errors(p)
      .map((e) => e.message)
      .join("\n");
    assert.match(text, /Hamburg.*no Basic Ocean Freight/);
    assert.match(text, /Genoa.*DHC appears twice with different amounts/);
    assert.match(text, /Mersin.*expiry date is before the effective date/);
    assert.match(text, /effective date "01\/12\/2026" isn't a date/);
  });

  it("keeps one copy of a charge listed twice with the same amount", async () => {
    const p = await parseFile(
      "q.xlsx",
      await quote([
        { code: "BAS", r40: "1200" },
        { code: "DHC", r40: "200" },
        { code: "DHC", r40: "200" },
      ]),
    );
    assert.deepEqual(errors(p), []);
    assert.deepEqual(
      p.rates[0].charges.map((c) => c.code),
      ["BAS", "DHC"],
    );
  });

  it("leaves out special cargo, inland, door and expired rates with a note", async () => {
    const p = await parseFile(
      "q.xlsx",
      await quote([
        { code: "BAS", r40: "1200" },
        { discharge: "Haifa, Israel", code: "BAS", r40: "1500", imo: "3" },
        {
          from: "Kano, Nigeria",
          discharge: "Leixoes, Portugal",
          code: "BAS",
          r40: "2100",
        },
        {
          discharge: "Dublin, Ireland",
          mode: "SD/CY",
          code: "BAS",
          r40: "2100",
        },
        {
          discharge: "Bilbao, Spain",
          code: "BAS",
          r40: "900",
          effective: "2026-10-01",
          expiry: "2026-10-31",
        },
      ]),
    );
    assert.equal(p.rates.length, 1);
    const text = warnings(p)
      .map((w) => w.message)
      .join("\n");
    assert.match(text, /Dangerous goods.*row 7/);
    assert.match(text, /Kano, Nigeria to Leixoes.*inland or door/);
    assert.match(text, /Dublin.*SD\/CY/);
    assert.match(text, /Bilbao.*expired on 2026-10-31/);
  });

  it("warns about equipment we don't price and fails clearly with none we do", async () => {
    const reefer = [...EQUIPMENT];
    reefer.splice(21, 3, "20REEF", "20REEF", "20REEF");
    const p = await parseFile(
      "q.xlsx",
      await quote([{ code: "BAS", r20: "3000", r40: "1200" }], {}, reefer),
    );
    assert.deepEqual(
      p.rates.map((r) => r.containerSize),
      ["40ft Std"],
    );
    assert.match(warnings(p)[0].message, /20REEF isn't a size we price/);

    const none = Array(21).fill(null).concat(Array(9).fill("20REEF"));
    const q = await parseFile(
      "q.xlsx",
      await quote([{ code: "BAS", r20: "3000" }], {}, none),
    );
    assert.equal(q.rates.length, 0);
    assert.match(
      errors(q)[0].message,
      /No 20DRY, 40DRY or 40HDRY rate columns/,
    );
  });

  it("attaches destination free time, without duplicates, by city, size and commodity", async () => {
    const ddHeader = [
      "Direction",
      "Country",
      "Location",
      "D&D Location",
      "D&D Type",
      "Equipment",
      "Total Freetime",
      "Commodity Name",
      "Freetime Type",
      "Start Event",
      "End Event",
      "Period 1 after Freetime",
      "Unit Price for Period 1",
      "Period 2 after Freetime",
      "Unit Price for Period 2",
    ];
    const dd = (
      equipment: string,
      extra: Partial<Record<number, string>> = {},
    ): Cell[] => {
      const row: Cell[] = [
        "Import",
        "Italy",
        "Naples",
        "Italy",
        "Combined (Excluding Storage invoiced separately by Maersk)",
        equipment,
        "14",
        "MINE_IRO_ORE_OTH_MET",
        "Calendar Days",
        "DISCHARGE",
        "GATE-IN EMPTY",
        "Day 15 - Day 17",
        "USD 120 PER DAY",
        "Day 18 - Day ∞",
        "USD 165 PER DAY",
      ];
      Object.entries(extra).forEach(([i, v]) => (row[Number(i)] = v ?? null));
      return row;
    };
    const p = await parseFile(
      "q.xlsx",
      await quote(
        [
          {
            discharge: "Naples, NA, Italy",
            code: "BAS",
            r40: "1200",
            rhc: "1250",
          },
        ],
        {
          "D&D Freetime Details": [
            ddHeader,
            dd("40DRY"),
            dd("40DRY"), // the same row again (another RFQ)
            dd("40HIGH", { 6: "7" }),
            dd("40DRY", { 0: "Export" }), // origin free time: not ours
            dd("40DRY", { 7: "OTHER_COMMODITY" }),
            dd("40DRY", { 11: "Day 15 to forever" }), // unreadable
          ],
        },
      ),
    );
    const std = find(p, "Apapa", "Naples", "40ft Std")!;
    assert.equal(std.freeTime.length, 1);
    assert.deepEqual(std.freeTime[0], {
      type: "Combined",
      days: 14,
      dayType: "Calendar days",
      startEvent: "Discharge",
      endEvent: "Gate-in empty",
      tiers: [
        { fromDay: 15, toDay: 17, currency: "USD", amount: 120 },
        { fromDay: 18, toDay: undefined, currency: "USD", amount: 165 },
      ],
      note: "Excluding storage invoiced separately by Maersk",
    });
    assert.equal(find(p, "Apapa", "Naples", "40ft HC")!.freeTime[0].days, 7);
    assert.match(
      warnings(p)
        .map((w) => w.message)
        .join(),
      /1 free time row couldn't be read/,
    );
  });
});

// ---- The real Maersk quote --------------------------------------------------

const REAL_QUOTE =
  process.env.MAERSK_QUOTE_FILE ??
  resolve(process.cwd(), "../MaerskQuote_CP-STS-053344_1_V1.xlsx");

describe(
  "real Maersk quote export",
  { skip: !existsSync(REAL_QUOTE) && "file not found" },
  () => {
    const load = async (today = TODAY) => {
      const bytes = new Uint8Array(readFileSync(REAL_QUOTE));
      return parseImport(
        await readXlsx(
          bytes.buffer.slice(
            bytes.byteOffset,
            bytes.byteOffset + bytes.byteLength,
          ) as ArrayBuffer,
        ),
        today,
      );
    };

    it("reads every lane and priced size, with nothing refused", async () => {
      const p = await load();
      assert.equal(p.format, "maersk");
      assert.equal(p.quoteNumber, "CP-STS-053344_1");
      assert.equal(p.rowCount, 602);
      assert.deepEqual(errors(p), []);
      const lanes = new Set(
        p.rates.map((r) => `${r.origin.raw}>${r.destination.raw}`),
      );
      assert.equal(lanes.size, 42);
      for (const r of p.rates) {
        assert.ok(
          r.charges.some((c) => c.code === "BAS"),
          `${r.key} has BAS`,
        );
        assert.ok(
          r.charges.every((c) => Number.isFinite(c.amount) && c.amount >= 0),
        );
      }
    });

    it("matches the quote's figures for Tin Can Island to Antwerp", async () => {
      const p = await load();
      // 20DRY is priced here, but not from Apapa to Ambarli
      assert.ok(find(p, "Tin Can Island", "Antwerp", "20ft Std"));
      assert.equal(find(p, "Apapa", "Ambarli", "20ft Std"), undefined);
      assert.ok(find(p, "Apapa", "Ambarli", "40ft HC"));

      const r = find(p, "Tin Can Island", "Antwerp", "20ft Std")!;
      const charge = (code: string) => r.charges.find((c) => c.code === code)!;
      assert.deepEqual(
        [charge("BAS").amount, charge("BAS").currency],
        [1050, "USD"],
      );
      assert.deepEqual(
        [charge("EBS").amount, charge("EBS").currency, charge("EBS").structure],
        [86, "EUR", "floating"],
      );
      assert.equal(charge("VP1").structure, "fixed");
      assert.equal(charge("OCG").basis, "document");
      assert.equal(charge("EXP").payTerm, "prepaid");
      assert.deepEqual(
        [charge("DHC").amount, charge("DHC").currency, charge("DHC").stage],
        [275, "EUR", "destination"],
      );
      assert.equal(r.transitHours, 24 * 24 + 18);
      assert.equal(r.validFrom, "2026-12-01");
      assert.equal(r.validTo, "2026-12-31");
    });

    it("attaches the D&D free time once per entry", async () => {
      const p = await load();
      const antwerp = find(p, "Tin Can Island", "Antwerp", "40ft Std")!;
      assert.equal(antwerp.freeTime.length, 1);
      assert.equal(antwerp.freeTime[0].type, "Detention");
      assert.equal(antwerp.freeTime[0].days, 14);
      assert.deepEqual(antwerp.freeTime[0].tiers, [
        { fromDay: 15, toDay: undefined, currency: "EUR", amount: 150 },
      ]);

      // Dublin has two entries: combined, and storage with four periods
      const dublin = find(p, "Abidjan", "Dublin", "20ft Std");
      if (dublin) {
        assert.equal(dublin.freeTime.length, 2);
        assert.ok(dublin.freeTime.some((f) => f.tiers.length === 4));
      }
      assert.ok(
        p.rates.filter((r) => r.freeTime.length).length > p.rates.length / 2,
      );
    });

    it("leaves the whole quote out once it has expired", async () => {
      const p = await load("2027-01-01");
      assert.equal(p.rates.length, 0);
      assert.equal(
        warnings(p).filter((w) => /expired/.test(w.message)).length,
        42,
      );
    });
  },
);

// ---- Our template -----------------------------------------------------------

const COLUMNS = [
  "Origin",
  "Destination",
  "Container size",
  "Commodity",
  "Valid from",
  "Valid to",
  "Charge type",
  "Charge code",
  "Charge name",
  "Basis",
  "Payment",
  "Amount",
  "Currency",
  "Floating",
  "Service mode",
  "Transit time",
  "Remarks",
] as const;
type Row = Partial<Record<(typeof COLUMNS)[number], string>>;

const quoteCsv = (value: string) =>
  /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

// A rate row with sensible defaults; `over` changes or blanks any column.
const trow = (over: Row) => {
  const row: Row = {
    Origin: "NGAPP",
    Destination: "BEANR",
    "Container size": "40ft HC",
    Commodity: "Cocoa beans",
    "Valid from": "2026-12-01",
    "Valid to": "2026-12-31",
    "Charge code": "BAS",
    Amount: "1415",
    Currency: "USD",
    ...over,
  };
  return COLUMNS.map((c) => quoteCsv(row[c] ?? "")).join(",");
};
const csv = (...rows: Row[]) =>
  [COLUMNS.join(","), ...rows.map(trow)].join("\r\n");

describe("our template", () => {
  it("groups rows into rates and fills in Maersk's usual charge details", async () => {
    const p = await parseFile(
      "rates.csv",
      csv(
        { "Transit time": "52d 6h", Remarks: "Subject to space, equipment" },
        {
          "Charge code": "EBS",
          Amount: "180",
          Currency: "EUR",
          Floating: "Yes",
        },
        { "Charge code": "ODF", Amount: "4,500", Currency: "NGN" },
        {
          "Charge type": "Destination",
          "Charge code": "XYZ",
          "Charge name": "Terminal congestion",
          Basis: "Container",
          Payment: "Collect",
          Amount: "50",
          Currency: "EUR",
          Floating: "No",
        },
        { "Container size": "20ft Std", Amount: "990" },
      ),
    );
    assert.equal(p.format, "template");
    assert.deepEqual(errors(p), []);
    assert.equal(p.rates.length, 2);
    const hc = find(p, "NGAPP", "BEANR", "40ft HC")!;
    assert.equal(hc.transitHours, 52 * 24 + 6);
    assert.equal(hc.remarks, "Subject to space, equipment");
    assert.equal(hc.serviceMode, "CY/CY");
    const odf = hc.charges.find((c) => c.code === "ODF")!;
    assert.deepEqual(
      [odf.amount, odf.basis, odf.stage, odf.payTerm, odf.name],
      [4500, "document", "origin", "prepaid", "Documentation Fee Origin"],
    );
    assert.equal(
      hc.charges.find((c) => c.code === "EBS")!.structure,
      "floating",
    );
    const xyz = hc.charges.find((c) => c.code === "XYZ")!;
    assert.deepEqual(
      [xyz.stage, xyz.payTerm, xyz.name],
      ["destination", "collect", "Terminal congestion"],
    );
    assert.deepEqual(hc.commodity, { kind: "text", text: "Cocoa beans" });
    assert.equal(find(p, "NGAPP", "BEANR", "20ft Std")!.charges[0].amount, 990);
  });

  it("accepts headers in any order and case, semicolons and size spellings", async () => {
    const p = await parseFile(
      "rates.csv",
      "\uFEFFamount;CURRENCY;charge code;origin;destination;container size;commodity;valid from;valid to;Notes\r\n1200;usd;bas;Apapa, Nigeria;Antwerp, Belgium;40HDRY;Cocoa beans;1 Dec 2026;31 Dec 2026;ignored",
    );
    assert.deepEqual(errors(p), []);
    const r = p.rates[0];
    assert.equal(r.containerSize, "40ft HC");
    assert.deepEqual([r.origin.city, r.origin.country], ["Apapa", "Nigeria"]);
    assert.deepEqual(
      [r.charges[0].code, r.charges[0].currency],
      ["BAS", "USD"],
    );
    assert.equal(r.validTo, "2026-12-31");
  });

  it("leaves out a rate with a bad row, saying which row and why", async () => {
    const p = await parseFile(
      "rates.csv",
      csv(
        {},
        { "Charge code": "EBS", Amount: "1.200,50", Currency: "EUR" },
        { Destination: "ESVLC", "Container size": "20ft Std" },
        {
          Destination: "ESVLC",
          "Container size": "20ft Std",
          "Charge code": "ABC",
          Amount: "10",
        },
        {
          Destination: "GBLGP",
          "Container size": "20ft Huge",
          "Valid from": "01/12/2026",
          Amount: "-5",
          Currency: "US",
          Floating: "Maybe",
        },
        {
          Destination: "NLRTM",
          "Charge type": "Somewhere",
          "Charge code": "QQQ",
          "Charge name": "Mystery fee",
          Amount: "10",
        },
        { Destination: "DEHAM", "Charge code": "BAS", Amount: "1000" },
        { Destination: "DEHAM", "Charge code": "BAS", Amount: "1100" },
        { Destination: "NGAPP" },
        { Destination: "ITGOA", Amount: "" },
        {
          Destination: "TRMER",
          "Charge code": "ZZZ",
          "Charge name": "No type given",
          Amount: "10",
        },
      ),
    );
    assert.equal(p.rates.length, 0);
    const text = errors(p)
      .map((e) => e.message)
      .join("\n");
    assert.match(text, /row 3: amount "1\.200,50" should be a number/);
    assert.match(
      text,
      /row 5: charge ABC isn't one of Maersk's usual codes, so it needs a charge name/,
    );
    assert.match(
      text,
      /row 6: container size "20ft Huge".*valid from "01\/12\/2026".*amount "-5" is negative; currency "US".*floating "Maybe"/,
    );
    assert.match(
      text,
      /row 7: charge type "Somewhere" should be Freight, Origin or Destination/,
    );
    assert.match(text, /row 9: BAS appears twice with different amounts/);
    assert.match(text, /row 10: origin and destination are the same port/);
    assert.match(text, /row 11: amount is empty/);
    assert.match(text, /row 12: charge ZZZ needs a charge type/);
    // the whole rate goes, including its good rows
    assert.deepEqual(
      errors(p).find((e) => /row 3:/.test(e.message))!.rows,
      [2, 3],
    );
  });

  it("names missing columns, warns about overlaps and leaves out expired rates", async () => {
    const missing = await parseFile(
      "rates.csv",
      "Origin,Destination,Charge code\nNGAPP,BEANR,BAS",
    );
    assert.match(
      errors(missing)[0].message,
      /missing these columns: Container size, Commodity, Valid from, Valid to, Amount, Currency/,
    );

    const p = await parseFile(
      "rates.csv",
      csv(
        {},
        {
          Commodity: "cocoa beans",
          "Valid from": "2026-12-15",
          "Valid to": "2027-01-15",
          Amount: "1500",
        },
        {
          "Container size": "40ft Std",
          "Valid from": "2026-10-01",
          "Valid to": "2026-10-31",
        },
      ),
    );
    assert.equal(p.rates.length, 2);
    const text = warnings(p)
      .map((w) => w.message)
      .join("\n");
    assert.match(text, /two rates in this file overlap/);
    assert.match(text, /expired on 2026-10-31/);
  });

  it("reads the template as a workbook too", async () => {
    const bytes = await workbookBytes({
      Instructions: [["How to fill this in"]],
      Rates: [
        [...COLUMNS],
        [
          "NGAPP",
          "BEANR",
          "40ft HC",
          "Cocoa beans",
          new Date(Date.UTC(2026, 11, 1)),
          new Date(Date.UTC(2026, 11, 31)),
          null,
          "BAS",
          null,
          null,
          null,
          1415,
          "USD",
        ],
      ],
    });
    const p = await parseFile("rates.xlsx", bytes);
    assert.deepEqual(errors(p), []);
    assert.equal(p.rates[0].validTo, "2026-12-31");
    assert.equal(p.rates[0].charges[0].amount, 1415);
  });
});

describe("downloadable template", () => {
  it("reads back as one example rate with no problems", async () => {
    const { buildTemplate } = await import("./buildTemplate");
    const blob = await buildTemplate();
    assert.ok(blob.size < 300_000, `template is ${blob.size} bytes`);
    const p = parseImport(await readXlsx(await blob.arrayBuffer()), TODAY);
    assert.equal(p.format, "template");
    assert.deepEqual(p.issues, []);
    assert.equal(p.rates.length, 1);
    assert.deepEqual(
      p.rates[0].charges.map((c) => c.code),
      ["BAS", "EBS", "ODF", "TCF"],
    );
    assert.equal(p.rates[0].charges[3].stage, "destination");
  });
});

describe("a CSV row with an unquoted comma", () => {
  it("imports nothing and names the row, so no rate loses a charge", async () => {
    const p = await parseFile(
      "rates.csv",
      [
        COLUMNS.join(","),
        trow({}),
        trow({ "Charge code": "EBS", Amount: "171", Currency: "EUR" }),
        "Tin Can Island Port, Nigeria,BEANR,40ft HC,Cocoa beans,2026-12-01,2026-12-31,,EXP,,,,19200,NGN,,,,",
      ].join("\n"),
    );
    assert.equal(p.rates.length, 0);
    assert.equal(errors(p).length, 1);
    assert.match(
      errors(p)[0].message,
      /^Row 4 has more values than there are columns.*needs quotes/,
    );
  });
});

describe("a CSV that ends every row with an extra comma", () => {
  it("reads normally", async () => {
    const p = await parseFile(
      "rates.csv",
      [
        COLUMNS.join(","),
        trow({}) + ",",
        trow({ "Charge code": "EBS", Amount: "171", Currency: "EUR" }) + ",",
      ].join("\n"),
    );
    assert.deepEqual(errors(p), []);
    assert.equal(p.rates.length, 1);
  });
});
