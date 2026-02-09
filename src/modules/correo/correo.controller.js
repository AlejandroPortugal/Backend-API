import * as correoUsecase from "./correo.usecase.js";

const sendUsecaseError = (res, result, fallbackMessage) => {
  if (!result?.error) return false;
  res.status(result.error.status).json({ error: result.error.message || fallbackMessage });
  return true;
};

export const enviarCorreo = async (reqOrPayload, res) => {
  const isHttp = Boolean(res && reqOrPayload?.body);
  const payload = isHttp ? reqOrPayload.body : reqOrPayload;

  try {
    const result = await correoUsecase.enviarCorreo(payload);

    if (!isHttp) {
      return result;
    }

    if (sendUsecaseError(res, result, "Error al enviar el correo")) return;
    res.status(200).json(result.data);
  } catch (error) {
    console.error("Error al enviar el correo:", error?.message || error);
    if (isHttp) {
      res.status(500).json({ error: "Error al enviar el correo" });
    }
    return undefined;
  }
};

export const enviarCodigoConfirmacion = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await correoUsecase.enviarCodigoConfirmacion(email);
    if (sendUsecaseError(res, result, "Error al enviar el correo electronico")) return;
    res.status(200).json({
      message: "Correo enviado exitosamente.",
      codigoConfirmacion: result.data.codigoConfirmacion,
    });
  } catch (error) {
    console.error("Error al enviar el correo:", error?.message || error);
    res.status(500).json({ error: "Error al enviar el correo electronico." });
  }
};
