import nodemailer from "nodemailer";

const PROVIDER_ORDER = [
  { prefix: "SMTP_PRIMARY", fallbackName: "gmail" },
  { prefix: "SMTP_SECONDARY", fallbackName: "brevo" },
  { prefix: "SMTP_TERTIARY", fallbackName: "sendgrid" },
];

const transportCache = new Map();

const toBoolean = (value) => String(value ?? "").toLowerCase() === "true";

const buildProviderConfig = ({ prefix, fallbackName }) => {
  const host = process.env[`${prefix}_HOST`];
  const user = process.env[`${prefix}_USER`];
  const pass = process.env[`${prefix}_PASS`];

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

const getConfiguredProviders = () =>
  PROVIDER_ORDER.map(buildProviderConfig).filter(Boolean);

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
      "No hay proveedores SMTP configurados. Revisa las variables SMTP_PRIMARY/SECONDARY/TERTIARY."
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
