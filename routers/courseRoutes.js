const express = require('express');
const router = express.Router();
const { createCourse, getCourses, getCourse, updateCourse, deleteCourse } = require('../controllers/courseController');
const {authMiddleware,authorizationMiddleware}=require("../middlewares/authMiddleware.js")


router.get('/allcourse', getCourses);
router.post('/postcourse', authMiddleware, authorizationMiddleware('instructor'), createCourse);
router.get('/onecourse/:id', getCourse);
router.put('/updatecourse/:id',authMiddleware,authorizationMiddleware('instructor'), updateCourse);
router.delete('/deletecourse/:id', authMiddleware,authorizationMiddleware('instructor') , deleteCourse);

module.exports = router;

