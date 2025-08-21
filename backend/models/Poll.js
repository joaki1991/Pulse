import mongoose from 'mongoose'

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 200
  },
  options: {
    type: [String],
    validate: [arr => arr.length >= 2, 'At least two options are required']
  },
  image: {
    type: String, // URL de la imagen en Cloudinary
    required: false
  },
  imagePublicId: {
    type: String, // ID público de Cloudinary para eliminación
    required: false
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  voters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vote'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('Poll', pollSchema)
