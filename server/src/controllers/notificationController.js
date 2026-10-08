const Notification = require('../models/Notification');
const cache = require('../utils/cache');

/**
 * @route GET /api/notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const cacheKey = `notif_${req.user._id}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(30)
        .lean(),
      Notification.countDocuments({ userId: req.user._id, read: false }),
    ]);

    const result = {
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications,
    };

    cache.set(cacheKey, result, 15);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route PUT /api/notifications/:id/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    ).lean();

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    cache.delete(`notif_${req.user._id}`);

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route PUT /api/notifications/mark-all-read
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    cache.delete(`notif_${req.user._id}`);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
