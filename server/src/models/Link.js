import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true }, // immutable identifier mapped by QR
    destinationUrl: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Link', linkSchema);