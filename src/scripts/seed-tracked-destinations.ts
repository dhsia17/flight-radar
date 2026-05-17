import "dotenv/config";
import { createTursoClient, createTursoRepository } from "../db/repositories.js";
import { loadEnvironment, getTursoConnectionConfig } from "../config/env.js";

interface SeedTrackedDestinationRow {
  id: string;
  originAirportCode: string;
  destinationAirportCode: string;
  destinationCity?: string;
  destinationCountry?: string;
  tripType: "round_trip" | "one_way";
  cabinClass: "economy" | "premium_economy" | "business" | "first";
  departureDateFrom?: string;
  departureDateTo?: string;
  returnDateFrom?: string;
  returnDateTo?: string;
  maxStops?: number | null;
  currencyCode: string;
  locale: string;
}

// Singapore (SIN) → Southeast Asia routes - Economy Round Trip
// All destinations within ~5 hours flight time from Singapore
// Price alert tiers (set via PRICE_ALERT_THRESHOLD_SGD / URGENT_ALERT_THRESHOLD_SGD env vars):
//   Normal alert: < 300 SGD (~10,000 TWD)
//   Urgent alert: < 150 SGD (~5,000 TWD)
const seedRows: SeedTrackedDestinationRow[] = [
  // ── Vietnam ──
  {
    id: "sin-sgn-rt-econ",
    originAirportCode: "SIN",
    destinationAirportCode: "SGN",
    destinationCity: "Ho Chi Minh City",
    destinationCountry: "Vietnam",
    tripType: "round_trip",
    cabinClass: "economy",
    departureDateFrom: "2026-07-01",
    departureDateTo: "2026-12-31",
    returnDateFrom: "2026-07-05",
    returnDateTo: "2027-01-07",
    maxStops: 1,
    currencyCode: "SGD",
    locale: "en-SG"
  },
  {
    id: "sin-han-rt-econ",
    originAirportCode: "SIN",
    destinationAirportCode: "HAN",
    destinationCity: "Hanoi",
    destinationCountry: "Vietnam",
    tripType: "round_trip",
    cabinClass: "economy",
    departureDateFrom: "2026-07-01",
    departureDateTo: "2026-12-31",
    returnDateFrom: "2026-07-05",
    returnDateTo: "2027-01-07",
    maxStops: 1,
    currencyCode: "SGD",
    locale: "en-SG"
  },
  {
    id: "sin-dad-rt-econ",
    originAirportCode: "SIN",
    destinationAirportCode: "DAD",
    destinationCity: "Da Nang",
    destinationCountry: "Vietnam",
    tripType: "round_trip",
    cabinClass: "economy",
    departureDateFrom: "2026-07-01",
    departureDateTo: "2026-12-31",
    returnDateFrom: "2026-07-05",
    returnDateTo: "2027-01-07",
    maxStops: 1,
    currencyCode: "SGD",
    locale: "en-SG"
  },
  {
    id: "sin-pqc-rt-econ",
    originAirportCode: "SIN",
    destinationAirportCode: "PQC",
    destinationCity: "Phu Quoc",
    destinationCountry: "Vietnam",
    tripType: "round_trip",
    cabinClass: "economy",
    departureDateFrom: "2026-07-01",
    departureDateTo: "2026-12-31",
    returnDateFrom: "2026-07-05",
    returnDateTo: "2027-01-07",
    maxStops: 1,
    currencyCode: "SGD",
    locale: "en-SG"
  },
  // ── Indonesia ──
  {
    id: "sin-dps-rt-econ",
    originAirportCode: "SIN",
    destinationAirportCode: "DPS",
    destinationCity: "Bali",
    destinationCountry: "Indonesia",
    tripType: "round_trip",
    cabinClass: "economy",
    departureDateFrom: "2026-07-01",
    departureDateTo: "2026-12-31",
    returnDateFrom: "2026-07-05",
    returnDateTo: "2027-01-07",
    maxStops: 1,
    currencyCode: "SGD",
    locale: "en-SG"
  },
  {
    id: "sin-cgk-rt-econ",
    originAirportCode: "SIN",
    destinationAirportCode: "CGK",
    destinationCity: "Jakarta",
    destinationCountry: "Indonesia",
    tripType: "round_trip",
    cabinClass: "economy",
    departureDateFrom: "2026-07-01",
    departureDateTo: "2026-12-31",
    returnDateFrom: "2026-07-04",
    returnDateTo: "2027-01-07",
    maxStops: 1,
    currencyCode: "SGD",
    locale: "en-SG"
  },
  // ── Laos ──
  {
    id: "sin-vte-rt-econ",
    originAirportCode: "SIN",
    destinationAirportCode: "VTE",
    destinationCity: "Vientiane",
    destinationCountry: "Laos",
    tripType: "round_trip",
    cabinClass: "economy",
    departureDateFrom: "2026-07-01",
    departureDateTo: "2026-12-31",
    returnDateFrom: "2026-07-05",
    returnDateTo: "2027-01-07",
    maxStops: 1,
    currencyCode: "SGD",
    locale: "en-SG"
  },
  // ── Thailand ──
  {
    id: "sin-bkk-rt-econ",
    originAirportCode: "SIN",
    destinationAirportCode: "BKK",
    destinationCity: "Bangkok",
    destinationCountry: "Thailand",
    tripType: "round_trip",
    cabinClass: "economy",
    departureDateFrom: "2026-07-01",
    departureDateTo: "2026-12-31",
    returnDateFrom: "2026-07-04",
    returnDateTo: "2027-01-07",
    maxStops: 1,
    currencyCode: "SGD",
    locale: "en-SG"
  },
  {
    id: "sin-cnx-rt-econ",
    originAirportCode: "SIN",
    destinationAirportCode: "CNX",
    destinationCity: "Chiang Mai",
    destinationCountry: "Thailand",
    tripType: "round_trip",
    cabinClass: "economy",
    departureDateFrom: "2026-07-01",
    departureDateTo: "2026-12-31",
    returnDateFrom: "2026-07-05",
    returnDateTo: "2027-01-07",
    maxStops: 1,
    currencyCode: "SGD",
    locale: "en-SG"
  },
  // ── Malaysia ──
  {
    id: "sin-kul-rt-econ",
    originAirportCode: "SIN",
    destinationAirportCode: "KUL",
    destinationCity: "Kuala Lumpur",
    destinationCountry: "Malaysia",
    tripType: "round_trip",
    cabinClass: "economy",
    departureDateFrom: "2026-07-01",
    departureDateTo: "2026-12-31",
    returnDateFrom: "2026-07-04",
    returnDateTo: "2027-01-07",
    maxStops: 0,
    currencyCode: "SGD",
    locale: "en-SG"
  },
  // ── Philippines ──
  {
    id: "sin-ceb-rt-econ",
    originAirportCode: "SIN",
    destinationAirportCode: "CEB",
    destinationCity: "Cebu",
    destinationCountry: "Philippines",
    tripType: "round_trip",
    cabinClass: "economy",
    departureDateFrom: "2026-07-01",
    departureDateTo: "2026-12-31",
    returnDateFrom: "2026-07-05",
    returnDateTo: "2027-01-07",
    maxStops: 1,
    currencyCode: "SGD",
    locale: "en-SG"
  }
];

async function main(): Promise<void> {
  const env = loadEnvironment();
  const client = createTursoClient(getTursoConnectionConfig(env));
  const repository = createTursoRepository(client);

  for (const row of seedRows) {
    await client.execute({
      sql: `
        INSERT OR REPLACE INTO tracked_destinations (
          id,
          origin_airport_code,
          destination_airport_code,
          destination_city,
          destination_country,
          trip_type,
          cabin_class,
          departure_date_from,
          departure_date_to,
          return_date_from,
          return_date_to,
          max_stops,
          currency_code,
          locale,
          is_active,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
      `,
      args: [
        row.id,
        row.originAirportCode,
        row.destinationAirportCode,
        row.destinationCity ?? null,
        row.destinationCountry ?? null,
        row.tripType,
        row.cabinClass,
        row.departureDateFrom ?? null,
        row.departureDateTo ?? null,
        row.returnDateFrom ?? null,
        row.returnDateTo ?? null,
        typeof row.maxStops === "number" ? row.maxStops : null,
        row.currencyCode,
        row.locale
      ]
    });
  }

  // Remove any old routes that are no longer in the seed list
  const activeIds = seedRows.map(r => `'${r.id}'`).join(", ");
  await client.execute({
    sql: `UPDATE tracked_destinations SET is_active = 0 WHERE id NOT IN (${activeIds})`,
    args: []
  });

  const activeDestinations = await repository.listActiveTrackedDestinations();

  console.log(`[seed-tracked-destinations] inserted or updated ${seedRows.length} rows`);
  console.log(`[seed-tracked-destinations] active tracked destinations: ${activeDestinations.length}`);

  for (const destination of activeDestinations) {
    console.log(
      `- ${destination.id}: ${destination.originAirportCode} -> ${destination.destinationAirportCode} (${destination.cabinClass})`
    );
  }

  await client.close();
}

void main().catch((error) => {
  console.error("[seed-tracked-destinations] failed", error);
  process.exitCode = 1;
});
