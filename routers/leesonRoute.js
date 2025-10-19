const express = require('express');
const router = express.Router();
const upload=require("../config/videoMulter.js")
const {createLesson,getLessonsByCourse,getLesson,updateLesson,deleteLesson} = require("../controllers/lessonController.js");

const { authMiddleware,authorizationMiddleware } = require("../middlewares/authMiddleware.js");

router.post('/postlesson', authMiddleware, authorizationMiddleware('instructor'),upload.single('video'),createLesson);
router.get('/alllessons/:courseId', getLessonsByCourse);
router.get('/onelesson/:id', getLesson);
router.put('/updatelesson/:id', authMiddleware, authorizationMiddleware('instructor'), upload.single("video"),updateLesson);
router.delete('/deletelesson/:id', authMiddleware, authorizationMiddleware('instructor'), deleteLesson);

module.exports = router;
