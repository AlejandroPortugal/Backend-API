import nodemailer from "nodemailer";

const PROVIDER_ORDER = [
  { prefix: "SMTP_PRIMARY", fallbackName: "gmail" },
  { prefix: "SMTP_SECONDARY", fallbackName: "brevo" },
  { prefix: "SMTP_TERTIARY", fallbackName: "sendgrid" },
];

const transportCache = new Map();

const toBoolean = (value) => String(value ?? "").toLowerCase() === "true";
const normalizeSecret = (value) => String(value ?? "").trim();

const buildProviderConfig = ({ prefix, fallbackName }) => {
  const host = process.env[`${prefix}_HOST`];
  const user = process.env[`${prefix}_USER`];
  const pass = normalizeSecret(process.env[`${prefix}_PASS`]);

  if (!host || !user || !pass) return null;

  const portRaw = process.env[`${prefix}_PORT`];
  const port = portRaw ? Number(portRaw) : 587;
  const secure = toBoolean(process.env[`${prefix}_SECURE`]);
  const name = process.env[`${prefix}_NAME`] || fallbackName;
  const from = process.env[`${prefix}_FROM`] || null;

  return {
    name,
    host,
    port: Number.isNaN(port) ? 587 : port,
    secure,
    auth: { user, pass },
    from,
  };
};

const buildLegacyMailConfig = () => {
  const user = process.env.MAIL_USER || process.env.SMTP_USER || null;
  const pass = normalizeSecret(
    process.env.MAIL_PASSWORD || process.env.MAIL_PASS || process.env.SMTP_PASS
  );

  if (!user || !pass) return null;

  const host = process.env.MAIL_HOST || "smtp.gmail.com";
  const portRaw = process.env.MAIL_PORT;
  const port = portRaw ? Number(portRaw) : 587;
  const secure = toBoolean(process.env.MAIL_SECURE);
  const from = process.env.MAIL_FROM || user;

  return {
    name: "legacy-mail",
    host,
    port: Number.isNaN(port) ? 587 : port,
    secure,
    auth: { user, pass },
    from,
  };
};

const getConfiguredProviders = () => {
  const providers = PROVIDER_ORDER.map(buildProviderConfig).filter(Boolean);
  if (providers.length > 0) return providers;

  const legacy = buildLegacyMailConfig();
  return legacy ? [legacy] : [];
};

const getTransporter = (provider) => {
  if (transportCache.has(provider.name)) {
    return transportCache.get(provider.name);
  }

  const transporter = nodemailer.createTransport({
    host: provider.host,
    port: provider.port,
    secure: provider.secure,
    auth: provider.auth,
    tls: {
      rejectUnauthorized: false,
    },
  });

  transportCache.set(provider.name, transporter);
  return transporter;
};

export const sendEmailWithFallback = async ({ to, subject, text, html, from }) => {
  const providers = getConfiguredProviders();

  if (!providers.length) {
    throw new Error(
      "No hay proveedores SMTP configurados. Revisa SMTP_PRIMARY/SECONDARY/TERTIARY o MAIL_USER/MAIL_PASSWORD."
    );
  }

  let lastError = null;

  for (const provider of providers) {
    try {
      const transporter = getTransporter(provider);
      const resolvedFrom = from || provider.from || provider.auth.user;

      await transporter.sendMail({
        from: resolvedFrom,
        to,
        subject,
        text,
        html,
      });

      return { provider: provider.name, from: resolvedFrom };
    } catch (error) {
      lastError = error;
      console.error(
        `Error enviando correo con ${provider.name}:`,
        error.message
      );
    }
  }

  throw lastError;
};
