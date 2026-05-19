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
  const c = fare.currencyCode;
  const o = fare.originAirportCode;
  const d = fare.destinationAirportCode;
  const dep = fare.departDate ?? "";
  if (fare.tripType === "round_trip" && fare.returnDate) {
    return `https://www.google.com/flights#flt=${o}.${d}.${dep}*${d}.${o}.${fare.returnDate};c:${c};e:${e};sd:1;t:f`;
  }
  return `https://www.google.com/flights#flt=${o}.${d}.${dep};c:${c};e:${e};sd:1;t:o`;
}

// ── English embed ──────────────────────────────────────────────────────────

export function buildNormalFareEmbedEn(
  fare: NormalizedFareObservation,
  comparison: NormalFarePriceComparison = {}
): DiscordEmbed {
  const origin = getAirportInfo(fare.originAirportCode);
  const dest   = getAirportInfo(fare.destinationAirportCode);

  const originLabel = origin.countryEn
    ? `${origin.cityEn}, ${origin.countryEn} (${fare.originAirportCode})`
    : fare.originAirportCode;
  const destLabel = dest.countryEn
    ? `${dest.cityEn}, ${dest.countryEn} (${fare.destinationAirportCode})`
    : fare.destinationAirportCode;

  const bookingUrl = fare.deepLink ?? buildGoogleFlightsUrl(fare);
  const tripLabel  = fare.tripType === "round_trip" ? "Round Trip" : "One Way";
  const cabinLabel = fare.cabinClass.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());

  return {
    title: `✈️ ${originLabel} → ${destLabel}`,
    description: buildDescriptionEn(comparison),
    url: bookingUrl,
    color: 0x2ecc71,
    fields: [
      { name: "💰 Price",  value: formatMoney(fare.currencyCode, fare.priceAmountMinor), inline: true },
      { name: "🛫 Trip",   value: tripLabel,  inline: true },
      { name: "💺 Cabin",  value: cabinLabel, inline: true },
      { name: "📅 Depart", value: fare.departDate ?? "—", inline: true },
      { name: "📅 Return", value: fare.returnDate ?? "—", inline: true },
      { name: "​",    value: "​",   inline: true },
      { name: "📊 Price vs History", value: buildPriceComparisonEn(fare, comparison), inline: false },
      { name: "🔗 Book",   value: `[Search on Google Flights →](${bookingUrl})`, inline: false },
    ],
    timestamp: fare.observedAt
  };
}

function buildDescriptionEn(comparison: NormalFarePriceComparison): string {
  if (typeof comparison.thirdLowestPriceAmountMinor === "number") {
    return "🎉 This fare entered the **historical top 3** for this route!";
  }
  return "New fare found while historical baseline is still being built.";
}

function buildPriceComparisonEn(
  fare: NormalizedFareObservation,
  comparison: NormalFarePriceComparison
): string {
  const lines: string[] = [];
  if (typeof comparison.historicalLowestPriceAmountMinor === "number") {
    const delta = fare.priceAmountMinor - comparison.historicalLowestPriceAmountMinor;
    lines.push(`Lowest seen: ${formatMoney(fare.currencyCode, comparison.historicalLowestPriceAmountMinor)} (${formatMoney(fare.currencyCode, Math.abs(delta))} ${delta <= 0 ? "below" : "above"})`);
  }
  if (typeof comparison.thirdLowestPriceAmountMinor === "number") {
    const delta = comparison.thirdLowestPriceAmountMinor - fare.priceAmountMinor;
    const pct = comparison.thirdLowestPriceAmountMinor > 0
      ? ((delta / comparison.thirdLowestPriceAmountMinor) * 100).toFixed(1) : "0.0";
    lines.push(`Top-3 threshold: ${formatMoney(fare.currencyCode, comparison.thirdLowestPriceAmountMinor)} (${formatMoney(fare.currencyCode, Math.abs(delta))} cheaper, ${pct}% below)`);
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
    ? `${origin.cityZh}，${origin.countryZh}（${fare.originAirportCode}）`
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

  return {
    title: `✈️ ${originLabel} → ${destLabel}`,
    description: buildDescriptionZh(comparison),
    url: bookingUrl,
    color: 0x2ecc71,
    fields: [
      { name: "💰 票價",  value: formatMoney(fare.currencyCode, fare.priceAmountMinor), inline: true },
      { name: "🛫 行程",  value: tripLabel,  inline: true },
      { name: "💺 艙等",  value: cabinMap[fare.cabinClass] ?? fare.cabinClass, inline: true },
      { name: "📅 出發",  value: fare.departDate ?? "—", inline: true },
      { name: "📅 回程",  value: fare.returnDate ?? "—", inline: true },
      { name: "​",   value: "​",   inline: true },
      { name: "📊 歷史比較", value: buildPriceComparisonZh(fare, comparison), inline: false },
      { name: "🔗 訂票",  value: `[在 Google Flights 搜尋 →](${bookingUrl})`, inline: false },
    ],
    timestamp: fare.observedAt
  };
}

function buildDescriptionZh(comparison: NormalFarePriceComparison): string {
  if (typeof comparison.thirdLowestPriceAmountMinor === "number") {
    return "🎉 此票價進入該航線**歷史最低前三名**！";
  }
  return "尚在建立歷史基準，新票價已記錄。";
}

function buildPriceComparisonZh(
  fare: NormalizedFareObservation,
  comparison: NormalFarePriceComparison
): string {
  const lines: string[] = [];
  if (typeof comparison.historicalLowestPriceAmountMinor === "number") {
    const delta = fare.priceAmountMinor - comparison.historicalLowestPriceAmountMinor;
    lines.push(`歷史最低：${formatMoney(fare.currencyCode, comparison.historicalLowestPriceAmountMinor)}（${delta <= 0 ? "低於" : "高於"} ${formatMoney(fare.currencyCode, Math.abs(delta))}）`);
  }
  if (typeof comparison.thirdLowestPriceAmountMinor === "number") {
    const delta = comparison.thirdLowestPriceAmountMinor - fare.priceAmountMinor;
    const pct = comparison.thirdLowestPriceAmountMinor > 0
      ? ((delta / comparison.thirdLowestPriceAmountMinor) * 100).toFixed(1) : "0.0";
    lines.push(`前三門檻：${formatMoney(fare.currencyCode, comparison.thirdLowestPriceAmountMinor)}（便宜 ${formatMoney(fare.currencyCode, Math.abs(delta))}，低 ${pct}%）`);
  }
  return lines.length > 0 ? lines.join("\n") : "尚無足夠歷史數據。";
}

// ── Legacy alias ───────────────────────────────────────────────────────────
export const buildNormalFareEmbed = buildNormalFareEmbedEn;
