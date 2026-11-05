import mongoose from 'mongoose';

const platoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, required: true, trim: true },
    precio: { type: Number, required: true, min: 0 },
    categoria: {
      type: String,
      required: true,
      enum: ['Tacos', 'Burritos', 'Quesadillas', 'Bebidas'],
    },
    imagen: { type: String, default: '' },
    disponible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Plato', platoSchema);
