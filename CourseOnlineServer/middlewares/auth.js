const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Course = require('../models/Course');

module.exports = (db) => {
  const userModel = User(db);
  const courseModel = Course(db);

  // Middleware to check authentication
  const checkAuth = (req, res, next) => {
    const authHeader = req.header('Authorization'); // קבל את הכותרת
    if (authHeader && authHeader.startsWith('Bearer ')) { // בדוק שהיא קיימת ומתחילה ב-'Bearer '
      const token = authHeader.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }
      try {
        const decoded = jwt.verify(token, 'secret');
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
      } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
      }
    } else {
      return res.status(401).json({ message: 'No token provided' }); // אם אין כותרת או פורמט לא נכון
    }
  };

  // Middleware to check admin role
  const checkAdmin = async (req, res, next) => {
    userModel.findById(req.userId, (err, user) => {
      if (err || !user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Access forbidden: Admins only' });
      }
      next();
    });
  };

  // Middleware to check teacher role
  const checkTeacher = async (req, res, next) => {
    userModel.findById(req.userId, (err, user) => {
      if (err || !user || user.role !== 'teacher') {
        return res.status(403).json({ message: 'Access forbidden: Teachers only' });
      }
      next();
    });
  };

  // Middleware to check if the user owns the course
  const checkCourseOwnership = async (req, res, next) => {
    const courseId = req.params.courseId || req.params.id;
    const userId = req.userId;

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID missing from request' });
    }

    courseModel.findById(courseId, (err, course) => {
      if (err) {
        return res.status(500).json({ message: 'Error verifying course ownership' });
      }
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      if (course.teacherId != userId) {
        return res.status(403).json({ message: 'Access forbidden: You do not own this course' });
      }
      next();
    });
  };

  return {
    checkAuth,
    checkAdmin,
    checkTeacher,
    checkCourseOwnership
  };
};