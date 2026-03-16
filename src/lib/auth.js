import { jwtDecode } from "jwt-decode";
import { APP_CONFIG } from "../config";

export function getStoredTokens() {
  return {
    accessToken: localStorage.getItem("access_token") || "",
    idToken: localStorage.getItem("id_token") || "",
  };
}

export function getDecodedIdToken() {
  const { idToken } = getStoredTokens();
  if (!idToken) return null;

  try {
    return jwtDecode(idToken);
  } catch {
    return null;
  }
}

export function getUserContext() {
  const decoded = getDecodedIdToken() || {};

  const role =
    decoded["custom:role"] ||
    decoded["cognito:groups"]?.[0] ||
    localStorage.getItem("role") ||
    "Student";

  const prn =
    decoded["custom:prn"] ||
    decoded.prn ||
    decoded.username ||
    decoded["cognito:username"] ||
    localStorage.getItem("prn") ||
    "";

  const username =
    decoded.name ||
    decoded.preferred_username ||
    decoded.email ||
    decoded["cognito:username"] ||
    "User";

  return { role, prn, username, claims: decoded };
}

export function getLoginUrl() {
  const params = new URLSearchParams({
    client_id: APP_CONFIG.clientId,
    response_type: "code",
    scope: "openid email",
    redirect_uri: APP_CONFIG.redirectUri,
  });

  return `${APP_CONFIG.cognitoDomain}/login?${params.toString()}`;
}

export function clearSession() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("id_token");
  localStorage.removeItem("role");
  localStorage.removeItem("prn");
}
