import mongoose from 'mongoose'

const voteSchema = new mongoose.Schema({
  poll: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  selectedOption: {
    type: String,
    required: true
  },
  votedAt: {
    type: Date,
    default: Date.now
  }
})

voteSchema.index({ poll: 1, user: 1 }, { unique: true }) // evitar votos múltiples

export default mongoose.model('Vote', voteSchema)
