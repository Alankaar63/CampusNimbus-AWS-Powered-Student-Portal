const configuredApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  "https://x48mm0l3zi.execute-api.ap-south-1.amazonaws.com/prod";

export const APP_CONFIG = {
  cognitoDomain:
    import.meta.env.VITE_COGNITO_DOMAIN ||
    "https://ap-south-1ky4x70fib.auth.ap-south-1.amazoncognito.com",
  clientId:
    import.meta.env.VITE_COGNITO_CLIENT_ID || "3eao6ipnnnkndmuhrj0a494p45",
  redirectUri:
    import.meta.env.VITE_COGNITO_REDIRECT_URI ||
    `${window.location.origin}${import.meta.env.BASE_URL}#/callback`,
  apiBaseUrl: import.meta.env.DEV ? "/api" : configuredApiBaseUrl,
  apiBaseUrlConfigured: configuredApiBaseUrl,
  defaultReportBucket: import.meta.env.VITE_REPORT_BUCKET || "",
  defaultAwsRegion: import.meta.env.VITE_AWS_REGION || "ap-south-1",
};

export const MEDIA_CONFIG = {
  heroVideoUrl: import.meta.env.VITE_HERO_VIDEO_URL || "/media/hero.mp4",
  portalVideoUrl: import.meta.env.VITE_PORTAL_VIDEO_URL || "/media/portal.mp4",
  campusVideoUrl: import.meta.env.VITE_CAMPUS_VIDEO_URL || "/media/siucampus.mp4",
  themeAudioUrl: import.meta.env.VITE_THEME_AUDIO_URL || "/media/theme.mp3",
};
