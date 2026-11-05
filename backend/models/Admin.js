import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

export default mongoose.model('Admin', adminSchema);
