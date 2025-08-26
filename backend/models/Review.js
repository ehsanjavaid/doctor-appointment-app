const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  reportedCount: {
    type: Number,
    default: 0
  },
  isHidden: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure one review per appointment
reviewSchema.index({ appointment: 1 }, { unique: true });

// Ensure one review per patient-doctor combination
reviewSchema.index({ patient: 1, doctor: 1 }, { unique: true });

// Virtual for formatted rating
reviewSchema.virtual('ratingText').get(function() {
  const ratings = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  };
  return ratings[this.rating] || 'Unknown';
});

// Method to update doctor's average rating
reviewSchema.statics.updateDoctorRating = async function(doctorId) {
  const stats = await this.aggregate([
    {
      $match: {
        doctor: doctorId,
        isHidden: false
      }
    },
    {
      $group: {
        _id: '$doctor',
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    const User = require('./User');
    await User.findByIdAndUpdate(doctorId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].totalReviews
    });
  }
};

// Update doctor rating when review is saved/updated
reviewSchema.post('save', async function() {
  await this.constructor.updateDoctorRating(this.doctor);
});

reviewSchema.post('findOneAndUpdate', async function() {
  if (this.doctor) {
    await this.constructor.updateDoctorRating(this.doctor);
  }
});

reviewSchema.post('findOneAndDelete', async function() {
  if (this.doctor) {
    await this.constructor.updateDoctorRating(this.doctor);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
