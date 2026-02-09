import * as loginUsecase from "./login.usecase.js";

const sendUsecaseError = (res, result) => {
  if (!result?.error) return false;
  res.status(result.error.status).json({ message: result.error.message });
  return true;
};

export const loginUser = async (req, res) => {
  try {
    const result = await loginUsecase.loginUser(req.body);
    if (sendUsecaseError(res, result)) return;
    res.json(result.data);
  } catch (error) {
    console.error("Error en el inicio de sesion:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
