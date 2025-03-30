const Report = require('../models/Report');
const path = require('path');

module.exports = {
  submitReport: async (req, res) => {
    try {
      const { subject, description, latitude, longitude } = req.body;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const newReport = new Report({
        user: req.user?.id,
        location: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        subject,
        fileType: getFileType(file.mimetype),
        fileUrl: `/uploads/${file.filename}`,
        description
      });

      await newReport.save();
      res.status(201).json(newReport);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getAdminReports: async (req, res) => {
    try {
      const reports = await Report.find().sort({ createdAt: -1 });
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

function getFileType(mimetype) {
  if (mimetype.startsWith('image/')) return 'Imagen';
  if (mimetype.startsWith('video/')) return 'Video';
  if (mimetype.startsWith('audio/')) return 'Audio';
  return 'Texto';
}