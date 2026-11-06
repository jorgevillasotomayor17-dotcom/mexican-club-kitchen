import mongoose from 'mongoose';

const mensajeSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    telefono: { type: String, trim: true, maxlength: 20, default: '' },
    mensaje: { type: String, required: true, trim: true, maxlength: 1000 },
    leido: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Mensaje', mensajeSchema);
