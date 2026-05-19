import type { DiscordEmbed, NormalizedFareObservation } from "../types/domain.js";
import { getAirportInfo } from "../utils/airport-names.js";

export interface NormalFarePriceComparison {
  thirdLowestPriceAmountMinor?: number;
  historicalLowestPriceAmountMinor?: number;
}

// ── Booking URL ────────────────────────────────────────────────────────────
// Primary: SerpAPI's deep_link (contains correct Google entity IDs, always works)
// Fallback: Skyscanner (accepts IATA codes directly, reliable deep-link format)

function buildSkyscannerUrl(fare: NormalizedFareObservation): string {
  const o    = fare.originAirportCode.toLowerCase();
  const d    = fare.destinationAirportCode.toLowerCase();
  const curr = fare.currencyCode.toLowerCase();
  const cabinMap: Record<string, string> = {
    economy: "economy", premium_economy: "premiumeconomy",
    business: "business", first: "first"
  };
  const cabin = cabinMap[fare.cabinClass] ?? "economy";

  // Skyscanner date format: YYMMDD
  function toSkyDate(iso: string | null | undefined): string {
    if (!iso) return "";
    const [y, m, day] = iso.split("-");
    return `${y.slice(2)}${m}${day}`;
  }

  const dep = toSkyDate(fare.departDate);
  const ret = toSkyDate(fare.returnDate);

  if (fare.tripType === "round_trip" && ret) {
    return `https://www.skyscanner.com/transport/flights/${o}/${d}/${dep}/${ret}/?adults=1&cabinclass=${cabin}&currency=${curr}`;
  }
  return `https://www.skyscanner.com/transport/flights/${o}/${d}/${dep}/?adults=1&cabinclass=${cabin}&currency=${curr}`;
}

function getBookingUrl(fare: NormalizedFareObservation): string {
  // SerpAPI deepLink is the exact Google Flights URL for that search (has correct entity IDs).
  // Only fall back to Skyscanner if deepLink is absent.
  return fare.deepLink ?? buildSkyscannerUrl(fare);
}

// ── Date formatting ────────────────────────────────────────────────────────

function fmtDateEn(d: string | null | undefined): string {
  if (!d) return "—";
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const [y, m, day] = d.split("-");
  return `${parseInt(day)} ${months[parseInt(m) - 1]} ${y}`;
}

function fmtDateZh(d: string | null | undefined): string {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${y}年${parseInt(m)}月${parseInt(day)}日`;
}

function nightsBetween(dep: string | null | undefined, ret: string | null | undefined): number | null {
  if (!dep || !ret) return null;
  const n = Math.round((new Date(ret).getTime() - new Date(dep).getTime()) / 86400000);
  return isNaN(n) ? null : n;
}

// ── Money ──────────────────────────────────────────────────────────────────

function formatMoney(currency: string, minor: number): string {
  return `${currency} ${(minor / 100).toFixed(2)}`;
}

// ── English embed ──────────────────────────────────────────────────────────

export function buildNormalFareEmbedEn(
  fare: NormalizedFareObservation,
  comparison: NormalFarePriceComparison = {}
): DiscordEmbed {
  const origin = getAirportInfo(fare.originAirportCode);
  const dest   = getAirportInfo(fare.destinationAirportCode);
  const url    = getBookingUrl(fare);

  const originLabel = origin.countryEn
    ? `${origin.cityEn} (${fare.originAirportCode})`
    : fare.originAirportCode;
  const destLabel = dest.countryEn
    ? `${dest.cityEn}, ${dest.countryEn} (${fare.destinationAirportCode})`
    : fare.destinationAirportCode;

  const tripLabel  = fare.tripType === "round_trip" ? "Round Trip" : "One Way";
  const cabinLabel = fare.cabinClass.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const nights  = nightsBetween(fare.departDate, fare.returnDate);
  const nightsStr = nights !== null ? ` · ${nights} nights` : "";
  const dateStr = fare.tripType === "round_trip" && fare.returnDate
    ? `${fmtDateEn(fare.departDate)} → ${fmtDateEn(fare.returnDate)}${nightsStr}`
    : fmtDateEn(fare.departDate);

  const isTopThree = typeof comparison.thirdLowestPriceAmountMinor === "number";
  const bookSite   = fare.deepLink ? "Google Flights" : "Skyscanner";

  return {
    title: `✈️  ${originLabel}  →  ${destLabel}`,
    description: `${tripLabel}  ·  ${cabinLabel}`,
    url,
    color: isTopThree ? 0xe74c3c : 0x2ecc71,
    fields: [
      { name: "💰  Price",
        value: `**${formatMoney(fare.currencyCode, fare.priceAmountMinor)}**`,
        inline: false },
      { name: "📅  Date",
        value: `**${dateStr}**`,
        inline: false },
      { name: "📊  vs History",
        value: buildPriceComparisonEn(fare, comparison),
        inline: false },
      { name: "🔗  Book",
        value: `[Search on ${bookSite} →](${url})`,
        inline: false },
    ],
    timestamp: fare.observedAt
  };
}

function buildPriceComparisonEn(
  fare: NormalizedFareObservation,
  comparison: NormalFarePriceComparison
): string {
  const lines: string[] = [];
  if (typeof comparison.historicalLowestPriceAmountMinor === "number") {
    const delta = fare.priceAmountMinor - comparison.historicalLowestPriceAmountMinor;
    lines.push(`Lowest seen: ${formatMoney(fare.currencyCode, comparison.historicalLowestPriceAmountMinor)} (${formatMoney(fare.currencyCode, Math.abs(delta))} ${delta <= 0 ? "below ✅" : "above"})`);
  }
  if (typeof comparison.thirdLowestPriceAmountMinor === "number") {
    const delta = comparison.thirdLowestPriceAmountMinor - fare.priceAmountMinor;
    const pct = comparison.thirdLowestPriceAmountMinor > 0
      ? ((delta / comparison.thirdLowestPriceAmountMinor) * 100).toFixed(1) : "0.0";
    lines.push(`🏆 Top-3 threshold: ${formatMoney(fare.currencyCode, comparison.thirdLowestPriceAmountMinor)} — **${pct}% below!**`);
  }
  return lines.length > 0 ? lines.join("\n") : "Not enough historical fares yet.";
}

// ── Chinese embed ──────────────────────────────────────────────────────────

export function buildNormalFareEmbedZh(
  fare: NormalizedFareObservation,
  comparison: NormalFarePriceComparison = {}
): DiscordEmbed {
  const origin = getAirportInfo(fare.originAirportCode);
  const dest   = getAirportInfo(fare.destinationAirportCode);
  const url    = getBookingUrl(fare);

  const originLabel = origin.countryZh
    ? `${origin.cityZh}（${fare.originAirportCode}）`
    : fare.originAirportCode;
  const destLabel = dest.countryZh
    ? `${dest.cityZh}，${dest.countryZh}（${fare.destinationAirportCode}）`
    : fare.destinationAirportCode;

  const tripLabel  = fare.tripType === "round_trip" ? "來回票" : "單程票";
  const cabinMap: Record<string, string> = {
    economy: "經濟艙", premium_economy: "豪華經濟艙",
    business: "商務艙", first: "頭等艙"
  };

  const nights    = nightsBetween(fare.departDate, fare.returnDate);
  const nightsStr = nights !== null ? ` · ${nights} 晚` : "";
  const dateStr   = fare.tripType === "round_trip" && fare.returnDate
    ? `${fmtDateZh(fare.departDate)} → ${fmtDateZh(fare.returnDate)}${nightsStr}`
    : fmtDateZh(fare.departDate);

  const isTopThree = typeof comparison.thirdLowestPriceAmountMinor === "number";
  const bookSite   = fare.deepLink ? "Google Flights" : "Skyscanner";

  return {
    title: `✈️  ${originLabel}  →  ${destLabel}`,
    description: `${tripLabel}  ·  ${cabinMap[fare.cabinClass] ?? fare.cabinClass}`,
    url,
    color: isTopThree ? 0xe74c3c : 0x2ecc71,
    fields: [
      { name: "💰  票價",
        value: `**${formatMoney(fare.currencyCode, fare.priceAmountMinor)}**`,
        inline: false },
      { name: "📅  日期",
        value: `**${dateStr}**`,
        inline: false },
      { name: "📊  歷史比較",
        value: buildPriceComparisonZh(fare, comparison),
        inline: false },
      { name: "🔗  訂票",
        value: `[前往 ${bookSite} 搜尋 →](${url})`,
        inline: false },
    ],
    timestamp: fare.observedAt
  };
}

function buildPriceComparisonZh(
  fare: NormalizedFareObservation,
  comparison: NormalFarePriceComparison
): string {
  const lines: string[] = [];
  if (typeof comparison.historicalLowestPriceAmountMinor === "number") {
    const delta = fare.priceAmountMinor - comparison.historicalLowestPriceAmountMinor;
    lines.push(`歷史最低：${formatMoney(fare.currencyCode, comparison.historicalLowestPriceAmountMinor)}（${delta <= 0 ? "低於 ✅" : "高於"} ${formatMoney(fare.currencyCode, Math.abs(delta))}）`);
  }
  if (typeof comparison.thirdLowestPriceAmountMinor === "number") {
    const delta = comparison.thirdLowestPriceAmountMinor - fare.priceAmountMinor;
    const pct = comparison.thirdLowestPriceAmountMinor > 0
      ? ((delta / comparison.thirdLowestPriceAmountMinor) * 100).toFixed(1) : "0.0";
    lines.push(`🏆 前三名門檻：${formatMoney(fare.currencyCode, comparison.thirdLowestPriceAmountMinor)} — **低 ${pct}%！**`);
  }
  return lines.length > 0 ? lines.join("\n") : "尚無足夠歷史數據。";
}

// ── Legacy alias ───────────────────────────────────────────────────────────
export const buildNormalFareEmbed = buildNormalFareEmbedEn;
