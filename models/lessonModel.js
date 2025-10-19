const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: {type:String,required:true},
  videourl:{type:String,required:true},
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course',required:true },
  order:{type:Number,default:1},
  createdAt: { type: Date, default: Date.now }
});
const lessonModel= mongoose.model('Lesson', lessonSchema);

module.exports={lessonModel}