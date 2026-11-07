import { Router } from 'express';
import { ApiError, FinishReason, GoogleGenAI, ThinkingLevel } from '@google/genai';
import { rateLimit } from 'express-rate-limit';
import Plato from '../models/Plato.js';

const router = Router();

// Modelo de Google con nivel gratuito
const MODELO = 'gemini-3.8-flash';
const MAX_MENSAJES = 10;
const MAX_CARACTERES = 500;

// Cada persona (por IP) puede enviar 20 mensajes cada 10 minutos: cada respuesta cuesta dinero
const limitador = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { mensaje: 'Brisi necesita un descanso. Intenta de nuevo en unos minutos.' },
});

// El cliente se crea la primera vez que se usa, cuando ya existe la clave
let cliente = null;
function obtenerCliente() {
  if (!cliente) cliente = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return cliente;
}

function crearInstrucciones(platos) {
  const menu = platos
    .map((plato) => `- ${plato.nombre} (${plato.categoria}): ${plato.descripcion} Precio: $${plato.precio} COP.`)
    .join('\n');

  return `Eres Brisi, la asistente virtual de Mexican Club Kitchen, un restaurante de comida mexicana a domicilio en Barranquilla, Colombia.

Cómo respondes:
- Siempre en español, con un tono cálido y cercano, como alguien de Barranquilla.
- Respuestas cortas: máximo 3 oraciones. Es un chat pequeño en una página web.
- Empieza tu respuesta de inmediato, sin rodeos.
- Sin formato Markdown (nada de asteriscos ni listas con guiones): solo texto simple.

Qué puedes hacer:
- Recomendar platos del menú según los gustos de la persona.
- Explicar los platos, sus ingredientes y sus precios, usando solo el menú de abajo.
- Contar curiosidades breves de la comida mexicana.

Límites:
- Usa únicamente los platos y precios del menú. Si te preguntan por algo que no está, di que no lo tenemos.
- No inventes horarios, teléfonos, direcciones, tiempos de entrega, promociones ni costos de domicilio. Para eso, invita a escribir en el formulario de la sección "Contacto" de esta página.
- Todavía no puedes tomar pedidos ni recibir pagos por el chat. Si alguien quiere pedir, invítalo a escribir en la sección "Contacto".
- Si te piden algo que no tenga que ver con el restaurante o la comida, responde con amabilidad que solo puedes ayudar con el menú de Mexican Club Kitchen.

Menú disponible hoy:
${menu || '(No hay platos disponibles en este momento.)'}`;
}

// Revisa la conversación que envía el navegador y la convierte al formato de la API
function prepararMensajes(mensajes) {
  if (!Array.isArray(mensajes) || mensajes.length === 0 || mensajes.length > MAX_MENSAJES) {
    return null;
  }

  const validos = mensajes.every(
    (m) =>
      (m?.rol === 'usuario' || m?.rol === 'brisi') &&
      typeof m.texto === 'string' &&
      m.texto.trim() !== '' &&
      m.texto.length <= MAX_CARACTERES
  );

  const empiezaYTerminaConUsuario =
    mensajes[0]?.rol === 'usuario' && mensajes.at(-1)?.rol === 'usuario';

  if (!validos || !empiezaYTerminaConUsuario) {
    return null;
  }

  return mensajes.map((m) => ({
    role: m.rol === 'usuario' ? 'user' : 'model',
    parts: [{ text: m.texto.trim() }],
  }));
}

router.post('/', limitador, async (req, res) => {
  const mensajes = prepararMensajes(req.body?.mensajes);

  if (!mensajes) {
    return res.status(400).json({
      mensaje: `Envía entre 1 y ${MAX_MENSAJES} mensajes de máximo ${MAX_CARACTERES} caracteres`,
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ mensaje: 'Brisi no está disponible en este momento.' });
  }

  try {
    const platos = await Plato.find({ disponible: true }).sort({ categoria: 1, nombre: 1 }).lean();

    const respuesta = await obtenerCliente().models.generateContent({
      model: MODELO,
      contents: mensajes,
      config: {
        systemInstruction: crearInstrucciones(platos),
        maxOutputTokens: 2048,
        // Pensar poco basta para un chat de recomendaciones y responde más rápido
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    // Los filtros de seguridad de Google pueden bloquear la pregunta o la respuesta
    const bloqueada =
      respuesta.promptFeedback?.blockReason ||
      respuesta.candidates?.[0]?.finishReason === FinishReason.SAFETY;

    if (bloqueada) {
      return res.json({
        respuesta: 'Uy, con eso no te puedo ayudar. ¿Quieres que te recomiende algo del menú?',
      });
    }

    const texto = respuesta.text?.trim();

    res.json({
      respuesta: texto || 'Perdón, no te entendí bien. ¿Me lo repites con otras palabras?',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 429) {
        // En el plan gratuito, Google limita cuántas preguntas se pueden hacer por minuto y por día
        return res.status(429).json({ mensaje: 'Brisi está atendiendo a mucha gente. Intenta en un momento.' });
      }
      if (error.status === 400 || error.status === 401 || error.status === 403) {
        console.error(`Gemini rechazó la petición (${error.status}). Revisa GEMINI_API_KEY:`, error.message);
        return res.status(503).json({ mensaje: 'Brisi no está disponible en este momento.' });
      }
      console.error(`Error de la API de Gemini (${error.status}):`, error.message);
      return res.status(502).json({ mensaje: 'Brisi tuvo un problema. Intenta de nuevo.' });
    }
    console.error('Error en el chat:', error.message);
    res.status(500).json({ mensaje: 'Brisi tuvo un problema. Intenta de nuevo.' });
  }
});

export default router;
