const fs = require('fs');
const { lessonModel } = require('../models/lessonModel.js');
const { courseModel } = require('../models/courseModel.js');
const { videoUpload} = require('../config/videoCloudinary.js');


const createLesson = async (req, res) => {
  try {
    const { title, description, courseId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    // ✅ Upload video to Cloudinary
    const uploadResult = await videoUpload(req.file.path);
    const videoUrl = uploadResult.secure_url || uploadResult.url;

    if (!videoUrl) {
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ message: 'Cloudinary upload failed: no video URL received' });
    }

    // ✅ Delete local file after successful upload
    try { fs.unlinkSync(req.file.path); } catch (err) { console.warn('Cleanup failed:', err.message); }

    // ✅ Validate course
    const course = await courseModel.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // ✅ Calculate order number automatically
    const count = await lessonModel.countDocuments({ course: courseId });

    // ✅ Create and save lesson
    const lesson = new lessonModel({
      title,
      description,
      videourl: videoUrl,
      course: courseId,
      order: count + 1,
    });

    await lesson.save();
    course.lessons.push(lesson._id);
    await course.save();

    res.status(201).json({ message: 'Lesson created successfully', lesson });
  } catch (err) {
    console.error('Error creating lesson:', err);

    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch {}
    }

    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// other handlers remain same but ensure they use `course` field
const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await lessonModel.find({ course: courseId }).sort({ order: 1 });
    res.json(lessons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getLesson = async (req, res) => {
  try {
    const id = req.params.id;
    const lesson = await lessonModel.findById(id)//.populate('course', 'title');
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json(lesson);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;

    // req.body may be empty if using multipart/form-data
    const title = req.body.title || null;
    const description = req.body.description || null;

    const lesson = await lessonModel.findById(id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    // Optional: handle video update
    if (req.file) {
      const uploadResult = await videoUpload(req.file.path);
      lesson.videourl = uploadResult.secure_url || uploadResult.url;
      fs.unlinkSync(req.file.path);
    }

    // Update text fields if provided
    if (title) lesson.title = title;
    if (description) lesson.description = description;

    await lesson.save();
    res.json({ message: 'Lesson updated successfully', lesson });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await lessonModel.findById(id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    // Remove lesson from its course
    await courseModel.findByIdAndUpdate(lesson.course, { $pull: { lessons: id } });

    await lesson.deleteOne();
    res.json({ message: 'Lesson deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createLesson,
  getLessonsByCourse,
  getLesson,
  updateLesson,
  deleteLesson
};
