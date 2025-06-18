module.exports = (db) => {
    return {
      create: (title, content, courseId, callback) => {
        const sql = 'INSERT INTO lessons (title, content, courseId) VALUES (?, ?, ?)';
        db.run(sql, [title, content, courseId], function(err) {
          callback(err, this.lastID);
        });
      },
      findById: (id, callback) => {
        const sql = 'SELECT * FROM lessons WHERE id = ?';
        db.get(sql, [id], callback);
      },
      findAllByCourseId: (courseId, callback) => {
        const sql = 'SELECT * FROM lessons WHERE courseId = ?';
        db.all(sql, [courseId], callback);
      },
      updateById: (id, updates, callback) => {
        const { title, content } = updates;
        // Ensure we have the required fields before attempting to update
        if (title === undefined || content === undefined) {
          return callback(new Error('Title and content are required for update.'));
        }
        const sql = 'UPDATE lessons SET title = ?, content = ? WHERE id = ?';
        db.run(sql, [title, content, id], callback);
      },
      deleteById: (id, callback) => {
        const sql = 'DELETE FROM lessons WHERE id = ?';
        db.run(sql, [id], callback);
      }
    };
  };