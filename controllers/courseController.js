const {courseModel} = require("../models/courseModel.js");
const mongoose=require("mongoose")
const createCourse = async (req, res) => {
  const { title, description, category } = req.body;
  const course = new courseModel({ title, description, category, createdBy: req.user._id });
  await course.save();
  res.status(201).json(course);
};

const getCourses = async (req, res) => {
  const courses = await courseModel.find().populate('createdBy', 'username email');
  res.json(courses);
};

const getCourse = async (req, res) => {
  const id = req.params.id;

  // Optionally: validate ObjectId to avoid errors
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid course ID format" });
  }

  const course = await courseModel
    .findById(id)
    .populate('createdBy', 'username email') // 👈 populate createdBy too
    .populate('lessons');

  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  res.status(200).json(course);
};



const updateCourse = async (req, res) => {
    const  id=req.params.id
      // ✅ validate ID format first
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid course ID format" });
  }
  const course = await courseModel.findById(id);
  if (!course) return res.status(404).json({ message: 'course Not found' });
  if (course.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  Object.assign(course, req.body);
  await course.save();
  res.json(course);
};


const deleteCourse = async (req, res) => {
  const course = await courseModel.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'course Not found for delete' });
  if (course.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  await courseModel.findByIdAndDelete(req.params.id)
  res.json({ message: 'course Deleted' });
};

module.exports = { createCourse, getCourses, getCourse, updateCourse, deleteCourse };
