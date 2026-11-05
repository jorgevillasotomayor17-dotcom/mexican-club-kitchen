import jwt from 'jsonwebtoken';

export function requiereAdmin(req, res, next) {
  const [tipo, token] = (req.headers.authorization ?? '').split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ mensaje: 'Debes iniciar sesión' });
  }

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = datos.id;
    next();
  } catch {
    res.status(401).json({ mensaje: 'Sesión inválida o vencida' });
  }
}
