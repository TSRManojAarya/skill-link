import Message from '../models/Message.js';

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
    try {
        const { receiverId, content, bookingId } = req.body;

        if (!receiverId || !content) {
            return res.status(400).json({ message: 'Receiver and content are required' });
        }

        const message = await Message.create({
            sender: req.user.id,
            receiver: receiverId,
            booking: bookingId, // Optional
            content,
            isRead: false
        });

        res.status(201).json({
            id: message._id,
            senderId: message.sender,
            receiverId: message.receiver,
            bookingId: message.booking,
            content: message.content,
            timestamp: message.createdAt,
            isRead: message.isRead
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get messages
// @route   GET /api/messages
// @access  Private
export const getMessages = async (req, res) => {
    try {
        // Get all messages where user is sender OR receiver
        const messages = await Message.find({
            $or: [{ sender: req.user.id }, { receiver: req.user.id }]
        }).sort({ createdAt: 1 });

        const formattedMessages = messages.map(m => ({
            id: m._id,
            senderId: m.sender,
            receiverId: m.receiver,
            bookingId: m.booking,
            content: m.content,
            timestamp: m.createdAt,
            isRead: m.isRead
        }));

        res.json(formattedMessages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
