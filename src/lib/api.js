import { APP_CONFIG } from "../config";
import { getStoredTokens } from "./auth";

function isObject(value) {
  return value !== null && typeof value === "object";
}

function sanitizeString(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function isLikelyUnsignedS3Url(url) {
  return (
    typeof url === "string" &&
    /amazonaws\.com/i.test(url) &&
    !/[?&]X-Amz-Signature=/i.test(url)
  );
}

function normalizeDynamoValue(value) {
  if (!isObject(value)) return value;

  if ("S" in value) return value.S;
  if ("N" in value) return Number(value.N);
  if ("BOOL" in value) return Boolean(value.BOOL);
  if ("NULL" in value) return null;
  if ("L" in value && Array.isArray(value.L)) {
    return value.L.map(normalizeDynamoValue);
  }
  if ("M" in value && isObject(value.M)) {
    return Object.fromEntries(
      Object.entries(value.M).map(([k, v]) => [k, normalizeDynamoValue(v)]),
    );
  }

  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => [k, normalizeDynamoValue(v)]),
  );
}

function parseJsonSafe(value) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function normalizeApiPayload(payload) {
  const maybeParsed = parseJsonSafe(payload);

  if (!isObject(maybeParsed)) return maybeParsed;

  if ("body" in maybeParsed) {
    const parsedBody = parseJsonSafe(maybeParsed.body);
    return normalizeDynamoValue(parsedBody);
  }

  if ("Item" in maybeParsed && isObject(maybeParsed.Item)) {
    return normalizeDynamoValue(maybeParsed.Item);
  }

  return normalizeDynamoValue(maybeParsed);
}

function getReportValue(record) {
  if (!isObject(record)) return "";

  const candidates = [
    "ReportFile",
    "reportFile",
    "report_file",
    "reportUrl",
    "report_url",
    "reportCardUrl",
    "report_card_url",
    "s3Url",
    "s3_url",
    "downloadUrl",
    "download_url",
  ];

  for (const key of candidates) {
    if (record[key]) return record[key];
  }

  if (isObject(record.report)) {
    for (const key of candidates) {
      if (record.report[key]) return record.report[key];
    }
  }

  return "";
}

function coerceToPublicS3Url(value) {
  const cleaned = sanitizeString(value);
  if (!cleaned) return "";
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    return cleaned;
  }

  if (cleaned.startsWith("s3://")) {
    const withoutScheme = cleaned.replace("s3://", "");
    const [bucket, ...rest] = withoutScheme.split("/");
    const key = sanitizeString(rest.join("/"));
    if (!bucket || !key) return "";

    return `https://${bucket}.s3.${APP_CONFIG.defaultAwsRegion}.amazonaws.com/${encodeURI(key)}`;
  }

  if (APP_CONFIG.defaultReportBucket) {
    return `https://${APP_CONFIG.defaultReportBucket}.s3.${APP_CONFIG.defaultAwsRegion}.amazonaws.com/${encodeURI(cleaned)}`;
  }

  return "";
}

export async function fetchStudentRecord(prn, token = "") {
  const authToken = token || getStoredTokens().accessToken;
  const sendAuthHeader = import.meta.env.VITE_SEND_AUTH_HEADER === "true";
  if (sendAuthHeader && !authToken) {
    throw new Error("Missing access token. Please login again.");
  }

  if (!prn) {
    throw new Error("Missing PRN. Unable to fetch report card.");
  }

  let res;
  try {
    const headers = {};
    if (sendAuthHeader && authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    res = await fetch(
      `${APP_CONFIG.apiBaseUrl}/student?prn=${encodeURIComponent(prn)}`,
      {
        method: "GET",
        headers,
      },
    );
  } catch {
    throw new Error(
      "Network/CORS error while calling student API. Verify API Gateway CORS or use local proxy.",
    );
  }

  const rawText = await res.text();
  const normalized = normalizeApiPayload(rawText);

  if (!res.ok) {
    const details =
      typeof normalized === "string"
        ? normalized
        : JSON.stringify(normalized || { message: "Unknown API error" });

    throw new Error(`API request failed (${res.status}): ${details}`);
  }

  return normalized;
}

export function extractReportUrl(record) {
  const reportValue = getReportValue(record);
  if (!reportValue) return "";

  const direct = coerceToPublicS3Url(reportValue);
  if (direct) return direct;

  if (typeof reportValue === "string") {
    return sanitizeString(reportValue);
  }

  return "";
}

export function openReportUrl(url) {
  const safeUrl = String(url || "").trim();
  if (!safeUrl) return false;

  if (isLikelyUnsignedS3Url(safeUrl)) {
    throw new Error(
      "S3 object URL is not pre-signed. Backend must return a pre-signed URL (X-Amz-Signature) for private files.",
    );
  }

  const anchor = document.createElement("a");
  anchor.href = safeUrl;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.click();
  return true;
}
