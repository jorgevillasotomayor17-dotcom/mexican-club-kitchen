import { Router } from 'express';
import { ApiError, FinishReason, GoogleGenAI, ThinkingLevel } from '@google/genai';
import { rateLimit } from 'express-rate-limit';
import Plato from '../models/Plato.js';

const router = Router();

// Modelos de Google con nivel gratuito: si el primero está saturado, se intenta con el segundo
const MODELOS = ['gemini-3.6-flash', 'gemini-3.5-flash-lite'];
const ESPERA_MAXIMA_MS = 20000;
const MAX_MENSAJES = 10;
const MAX_CARACTERES = 500;
const MAX_POR_PLATO = 50;
const MAX_PLATOS_DISTINTOS = 20;

// Precios como los escribimos en Colombia: $ 22.000
const formatoPesos = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

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
  if (!cliente) {
    cliente = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { timeout: ESPERA_MAXIMA_MS },
    });
  }
  return cliente;
}

// El modelo está saturado (503), Google tardó demasiado (504) o se agotó nuestra espera (AbortError)
function estaSaturado(error) {
  return (
    error?.name === 'AbortError' ||
    (error instanceof ApiError && (error.status === 503 || error.status === 504))
  );
}

// Pregunta al primer modelo; si está saturado, prueba con el siguiente
async function preguntarAGemini(peticion) {
  let ultimoError;

  for (const modelo of MODELOS) {
    try {
      return await obtenerCliente().models.generateContent({ ...peticion, model: modelo });
    } catch (error) {
      if (!estaSaturado(error)) throw error;
      console.warn(`El modelo ${modelo} está saturado o tardó demasiado. Probando el siguiente.`);
      ultimoError = error;
    }
  }

  throw ultimoError;
}

function crearInstrucciones(platos) {
  const menu = platos
    .map(
      (plato) =>
        `- ${plato.nombre} (${plato.categoria}): ${plato.descripcion} Precio: ${formatoPesos.format(plato.precio)}. Código: ${plato._id}`
    )
    .join('\n');

  return `Eres Brisi, la asistente virtual de Mexican Club Kitchen, un restaurante de comida mexicana a domicilio en Barranquilla, Colombia.

Cómo respondes:
- Siempre en español, con un tono cálido y cercano, como alguien de Barranquilla.
- Respuestas cortas: máximo 3 oraciones. Es un chat pequeño en una página web.
- Empieza tu respuesta de inmediato, sin rodeos.
- Sin formato Markdown (nada de asteriscos ni listas con guiones): solo texto simple.
- Escribe los precios como en el menú, por ejemplo $ 22.000.

Qué puedes hacer:
- Recomendar platos del menú según los gustos de la persona.
- Explicar los platos, sus ingredientes y sus precios, usando solo el menú de abajo.
- Contar curiosidades breves de la comida mexicana.
- Ayudar a armar el pedido: cuando la persona diga que quiere pedir o agregar platos concretos, pon esos platos (con su código y cantidad) en el campo "platos". En "respuesta" resume lo que vas a agregar con el total y dile que toque el botón "Agregar al pedido" que aparece debajo de tu mensaje. Después podrá enviar el pedido desde el botón "Pedido" de arriba, donde escribe su nombre, teléfono y dirección.
- Si la persona solo pregunta o pide recomendaciones, deja "platos" vacío.

Límites:
- Usa únicamente los platos y precios del menú. Si te preguntan por algo que no está, di que no lo tenemos.
- No inventes horarios, teléfonos, direcciones, tiempos de entrega, promociones ni costos de domicilio. Para eso, invita a escribir en el formulario de la sección "Contacto" de esta página.
- No recibes pagos ni datos personales por el chat: nunca pidas nombre, teléfono ni dirección. Esos datos se escriben en el formulario del pedido.
- Si no queda claro qué plato o cuántas unidades quiere, pregunta antes de agregar.
- No muestres los códigos de los platos en "respuesta": son solo para el campo "platos".
- Si te piden algo que no tenga que ver con el restaurante o la comida, responde con amabilidad que solo puedes ayudar con el menú de Mexican Club Kitchen.

Menú disponible hoy:
${menu || '(No hay platos disponibles en este momento.)'}`;
}

// Forma exacta que debe tener la respuesta de Gemini (salida estructurada en JSON)
function crearEsquema(platos) {
  const codigo = { type: 'string', description: 'Código del plato, tal como aparece en el menú.' };
  // enum obliga a Gemini a elegir solo códigos que existen en el menú
  if (platos.length > 0) codigo.enum = platos.map((plato) => String(plato._id));

  return {
    type: 'object',
    properties: {
      respuesta: { type: 'string', description: 'Lo que Brisi le dice a la persona.' },
      platos: {
        type: 'array',
        description: 'Platos para agregar al pedido. Vacío si la persona no pidió agregar nada.',
        items: {
          type: 'object',
          properties: {
            codigo,
            cantidad: { type: 'integer', minimum: 1, maximum: MAX_POR_PLATO },
          },
          required: ['codigo', 'cantidad'],
        },
      },
    },
    required: ['respuesta', 'platos'],
  };
}

// Convierte el JSON de Gemini en datos seguros: solo platos reales y cantidades válidas
function leerRespuesta(texto, platos) {
  let datos;
  try {
    datos = JSON.parse(texto);
  } catch {
    return null;
  }

  if (typeof datos?.respuesta !== 'string' || datos.respuesta.trim() === '') {
    return null;
  }

  const platosPorId = new Map(platos.map((plato) => [String(plato._id), plato]));
  const sugeridos = [];

  for (const item of Array.isArray(datos.platos) ? datos.platos : []) {
    const plato = platosPorId.get(item?.codigo);
    const cantidadValida =
      Number.isInteger(item?.cantidad) && item.cantidad >= 1 && item.cantidad <= MAX_POR_PLATO;
    const repetido = sugeridos.some((sugerido) => sugerido._id === item?.codigo);

    if (plato && cantidadValida && !repetido && sugeridos.length < MAX_PLATOS_DISTINTOS) {
      sugeridos.push({
        _id: String(plato._id),
        nombre: plato.nombre,
        precio: plato.precio, // El precio sale de la base de datos, no de la IA
        cantidad: item.cantidad,
      });
    }
  }

  return { respuesta: datos.respuesta.trim(), platos: sugeridos };
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

    const respuesta = await preguntarAGemini({
      contents: mensajes,
      config: {
        systemInstruction: crearInstrucciones(platos),
        maxOutputTokens: 2048,
        // Pedimos JSON con la forma del esquema en vez de texto libre
        responseMimeType: 'application/json',
        responseJsonSchema: crearEsquema(platos),
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
        platos: [],
      });
    }

    const resultado = leerRespuesta(respuesta.text ?? '', platos);

    res.json(
      resultado ?? {
        respuesta: 'Perdón, no te entendí bien. ¿Me lo repites con otras palabras?',
        platos: [],
      }
    );
  } catch (error) {
    if (estaSaturado(error)) {
      return res.status(503).json({ mensaje: 'Brisi está atendiendo a mucha gente. Intenta en un momento.' });
    }
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
