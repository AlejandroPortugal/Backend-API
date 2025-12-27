import { google } from "googleapis";
import crypto from "crypto";

const calendarScopes = ["https://www.googleapis.com/auth/calendar.events"];

const buildAuthClient = () => {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    console.warn("Google Meet no configurado: faltan credenciales.");
    return null;
  }

  return new google.auth.JWT(clientEmail, undefined, privateKey, calendarScopes);
};

export const scheduleGoogleMeetEvent = async ({
  summary,
  description,
  startDateTime,
  endDateTime,
  attendees = [],
  timeZone = "America/Lima",
}) => {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const authClient = buildAuthClient();

  if (!authClient || !calendarId) {
    console.warn("No se pudo crear el evento en Google Calendar: configuraci��n incompleta.");
    return null;
  }

  await authClient.authorize();

  const calendar = google.calendar({ version: "v3", auth: authClient });

  const { data } = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary,
      description,
      start: {
        dateTime: startDateTime,
        timeZone,
      },
      end: {
        dateTime: endDateTime,
        timeZone,
      },
      attendees,
      reminders: { useDefault: true },
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    },
    conferenceDataVersion: 1,
  });

  const meetLink =
    data?.hangoutLink ||
    data?.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri ||
    null;

  return {
    meetLink,
    eventId: data?.id ?? null,
  };
};
