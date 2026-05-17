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

// Singapore (SIN) routes - Economy Round Trip
// Price target: under ~450 SGD (~15,000 TWD)
const seedRows: SeedTrackedDestinationRow[] = [
  {
        id: "sin-tpe-rt-econ",
        originAirportCode: "SIN",
        destinationAirportCode: "TPE",
        destinationCity: "Taipei",
        destinationCountry: "Taiwan",
        tripType: "round_trip",
        cabinClass: "economy",
        departureDateFrom: "2026-07-01",
        departureDateTo: "2026-12-31",
        returnDateFrom: "2026-07-07",
        returnDateTo: "2027-01-07",
        maxStops: 1,
        currencyCode: "SGD",
        locale: "en-SG"
  },
  {
        id: "sin-nrt-rt-econ",
        originAirportCode: "SIN",
        destinationAirportCode: "NRT",
        destinationCity: "Tokyo",
        destinationCountry: "Japan",
        tripType: "round_trip",
        cabinClass: "economy",
        departureDateFrom: "2026-07-01",
        departureDateTo: "2026-12-31",
        returnDateFrom: "2026-07-07",
        returnDateTo: "2027-01-07",
        maxStops: 1,
        currencyCode: "SGD",
        locale: "en-SG"
  },
  {
        id: "sin-kix-rt-econ",
        originAirportCode: "SIN",
        destinationAirportCode: "KIX",
        destinationCity: "Osaka",
        destinationCountry: "Japan",
        tripType: "round_trip",
        cabinClass: "economy",
        departureDateFrom: "2026-07-01",
        departureDateTo: "2026-12-31",
        returnDateFrom: "2026-07-07",
        returnDateTo: "2027-01-07",
        maxStops: 1,
        currencyCode: "SGD",
        locale: "en-SG"
  },
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
        id: "sin-syd-rt-econ",
        originAirportCode: "SIN",
        destinationAirportCode: "SYD",
        destinationCity: "Sydney",
        destinationCountry: "Australia",
        tripType: "round_trip",
        cabinClass: "economy",
        departureDateFrom: "2026-07-01",
        departureDateTo: "2026-12-31",
        returnDateFrom: "2026-07-07",
        returnDateTo: "2027-01-07",
        maxStops: 1,
        currencyCode: "SGD",
        locale: "en-SG"
  },
  {
        id: "sin-mel-rt-econ",
        originAirportCode: "SIN",
        destinationAirportCode: "MEL",
        destinationCity: "Melbourne",
        destinationCountry: "Australia",
        tripType: "round_trip",
        cabinClass: "economy",
        departureDateFrom: "2026-07-01",
        departureDateTo: "2026-12-31",
        returnDateFrom: "2026-07-07",
        returnDateTo: "2027-01-07",
        maxStops: 1,
        currencyCode: "SGD",
        locale: "en-SG"
  },
  {
        id: "sin-pvg-rt-econ",
        originAirportCode: "SIN",
        destinationAirportCode: "PVG",
        destinationCity: "Shanghai",
        destinationCountry: "China",
        tripType: "round_trip",
        cabinClass: "economy",
        departureDateFrom: "2026-07-01",
        departureDateTo: "2026-12-31",
        returnDateFrom: "2026-07-07",
        returnDateTo: "2027-01-07",
        maxStops: 1,
        currencyCode: "SGD",
        locale: "en-SG"
  },
  {
        id: "sin-pek-rt-econ",
        originAirportCode: "SIN",
        destinationAirportCode: "PEK",
        destinationCity: "Beijing",
        destinationCountry: "China",
        tripType: "round_trip",
        cabinClass: "economy",
        departureDateFrom: "2026-07-01",
        departureDateTo: "2026-12-31",
        returnDateFrom: "2026-07-07",
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
  {
        id: "sin-hkg-rt-econ",
        originAirportCode: "SIN",
        destinationAirportCode: "HKG",
        destinationCity: "Hong Kong",
        destinationCountry: "Hong Kong",
        tripType: "round_trip",
        cabinClass: "economy",
        departureDateFrom: "2026-07-01",
        departureDateTo: "2026-12-31",
        returnDateFrom: "2026-07-04",
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
