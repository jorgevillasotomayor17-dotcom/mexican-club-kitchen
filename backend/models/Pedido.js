import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    plato: { type: mongoose.Schema.Types.ObjectId, ref: 'Plato', required: true },
    nombre: { type: String, required: true },
    precio: { type: Number, required: true, min: 0 },
    cantidad: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const pedidoSchema = new mongoose.Schema(
  {
    cliente: { type: String, required: true, trim: true, maxlength: 80 },
    telefono: { type: String, required: true, trim: true, maxlength: 20 },
    direccion: { type: String, required: true, trim: true, maxlength: 200 },
    items: {
      type: [itemSchema],
      validate: (items) => items.length > 0,
    },
    total: { type: Number, required: true, min: 0 },
    estado: {
      type: String,
      enum: ['pendiente', 'preparando', 'en camino', 'entregado', 'cancelado'],
      default: 'pendiente',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Pedido', pedidoSchema);
