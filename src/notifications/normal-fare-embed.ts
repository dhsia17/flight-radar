import type { DiscordEmbed, NormalizedFareObservation } from "../types/domain.js";
import { getAirportInfo } from "../utils/airport-names.js";

export interface NormalFarePriceComparison {
  thirdLowestPriceAmountMinor?: number;
  historicalLowestPriceAmountMinor?: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatMoney(currencyCode: string, amountMinor: number): string {
  return `${currencyCode} ${(amountMinor / 100).toFixed(2)}`;
}

function buildGoogleFlightsUrl(fare: NormalizedFareObservation): string {
  const cabinMap: Record<string, number> = {
    economy: 1, premium_economy: 2, business: 3, first: 4
  };
  const e = cabinMap[fare.cabinClass] ?? 1;
  const o = fare.originAirportCode;
  const d = fare.destinationAirportCode;
  const dep = fare.departDate ?? "";
  if (fare.tripType === "round_trip" && fare.returnDate) {
    return `https://www.google.com/flights#flt=${o}.${d}.${dep}*${d}.${o}.${fare.returnDate};c:${fare.currencyCode};e:${e};sd:1;t:f`;
  }
  return `https://www.google.com/flights#flt=${o}.${d}.${dep};c:${fare.currencyCode};e:${e};sd:1;t:o`;
}

// Format date: "2026-05-22" -> "22 May 2026"
function fmtDateEn(d: string | null | undefined): string {
  if (!d) return "—";
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const [y, m, day] = d.split("-");
  return `${parseInt(day)} ${months[parseInt(m) - 1]} ${y}`;
}

// Format date: "2026-05-22" -> "2026年5月22日"
function fmtDateZh(d: string | null | undefined): string {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${y}年${parseInt(m)}月${parseInt(day)}日`;
}

// Night count between two dates
function nightCount(dep: string | null | undefined, ret: string | null | undefined): string {
  if (!dep || !ret) return "";
  const diff = (new Date(ret).getTime() - new Date(dep).getTime()) / 86400000;
  return isNaN(diff) ? "" : ` · ${Math.round(diff)} nights`;
}

// ── English embed ──────────────────────────────────────────────────────────

export function buildNormalFareEmbedEn(
  fare: NormalizedFareObservation,
  comparison: NormalFarePriceComparison = {}
): DiscordEmbed {
  const origin = getAirportInfo(fare.originAirportCode);
  const dest   = getAirportInfo(fare.destinationAirportCode);

  const originLabel = origin.countryEn
    ? `${origin.cityEn} (${fare.originAirportCode})`
    : fare.originAirportCode;
  const destLabel = dest.countryEn
    ? `${dest.cityEn}, ${dest.countryEn} (${fare.destinationAirportCode})`
    : fare.destinationAirportCode;

  const bookingUrl = fare.deepLink ?? buildGoogleFlightsUrl(fare);

  const tripLabel  = fare.tripType === "round_trip" ? "Round Trip" : "One Way";
  const cabinLabel = fare.cabinClass.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
  const nights     = fare.tripType === "round_trip" ? nightCount(fare.departDate, fare.returnDate) : "";
  const dateStr    = fare.tripType === "round_trip" && fare.returnDate
    ? `${fmtDateEn(fare.departDate)} → ${fmtDateEn(fare.returnDate)}${nights}`
    : fmtDateEn(fare.departDate);

  const isTopThree = typeof comparison.thirdLowestPriceAmountMinor === "number";

  return {
    title: `✈️  ${originLabel}  →  ${destLabel}`,
    description: `${tripLabel}  ·  ${cabinLabel}`,
    url: bookingUrl,
    color: isTopThree ? 0xe74c3c : 0x2ecc71,
    fields: [
      {
        name: "💰  Price",
        value: `**${formatMoney(fare.currencyCode, fare.priceAmountMinor)}**`,
        inline: false
      },
      {
        name: "📅  Date",
        value: `**${dateStr}**`,
        inline: false
      },
      {
        name: "📊  vs History",
        value: buildPriceComparisonEn(fare, comparison),
        inline: false
      },
      {
        name: "🔗  Book",
        value: `[Open Google Flights →](${bookingUrl})`,
        inline: false
      },
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

  const originLabel = origin.countryZh
    ? `${origin.cityZh}（${fare.originAirportCode}）`
    : fare.originAirportCode;
  const destLabel = dest.countryZh
    ? `${dest.cityZh}，${dest.countryZh}（${fare.destinationAirportCode}）`
    : fare.destinationAirportCode;

  const bookingUrl = fare.deepLink ?? buildGoogleFlightsUrl(fare);

  const tripLabel  = fare.tripType === "round_trip" ? "來回票" : "單程票";
  const cabinMap: Record<string, string> = {
    economy: "經濟艙", premium_economy: "豪華經濟艙",
    business: "商務艙", first: "頭等艙"
  };
  const cabinLabel = cabinMap[fare.cabinClass] ?? fare.cabinClass;

  const nightsZh   = fare.tripType === "round_trip" ? (() => {
    const diff = !fare.departDate || !fare.returnDate ? NaN
      : (new Date(fare.returnDate).getTime() - new Date(fare.departDate).getTime()) / 86400000;
    return isNaN(diff) ? "" : ` · ${Math.round(diff)} 晚`;
  })() : "";

  const dateStr = fare.tripType === "round_trip" && fare.returnDate
    ? `${fmtDateZh(fare.departDate)} → ${fmtDateZh(fare.returnDate)}${nightsZh}`
    : fmtDateZh(fare.departDate);

  const isTopThree = typeof comparison.thirdLowestPriceAmountMinor === "number";

  return {
    title: `✈️  ${originLabel}  →  ${destLabel}`,
    description: `${tripLabel}  ·  ${cabinLabel}`,
    url: bookingUrl,
    color: isTopThree ? 0xe74c3c : 0x2ecc71,
    fields: [
      {
        name: "💰  票價",
        value: `**${formatMoney(fare.currencyCode, fare.priceAmountMinor)}**`,
        inline: false
      },
      {
        name: "📅  日期",
        value: `**${dateStr}**`,
        inline: false
      },
      {
        name: "📊  歷史比較",
        value: buildPriceComparisonZh(fare, comparison),
        inline: false
      },
      {
        name: "🔗  訂票",
        value: `[前往 Google Flights 查詢 →](${bookingUrl})`,
        inline: false
      },
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
