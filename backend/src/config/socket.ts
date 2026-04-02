import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import Session from '../models/Session';
import User from '../models/User';
import mongoose from 'mongoose';

let io: SocketServer;

const socketMap = new Map<string, { userId: string; name: string; email: string; sessionCode: string }>();

// FIX 2: Track all participants per session so we can emit the full list
const sessionParticipants = new Map<string, Map<string, { _id: string; name: string; email: string; points: number; avatar?: string }>>();

const pulseCheckResponses = new Map<string, Set<string>>();
const whiteboardHistory = new Map<string, Array<any>>();

export const initSocket = (server: HttpServer) => {
    io = new SocketServer(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket: Socket) => {
        console.log(`🔌 New client connected: ${socket.id}`);

        socket.on('join_session', async (payload: any) => {
            let sessionCode = '';
            let user = null;

            if (typeof payload === 'string') {
                sessionCode = payload;
            } else {
                sessionCode = payload.sessionCode;
                user = payload.user;
            }

            if (!sessionCode) return;

            socket.join(sessionCode);
            console.log(`📁 User ${socket.id} joined session: ${sessionCode}`);

            if (user && user._id) {
                try {
                    socketMap.set(socket.id, {
                        userId: user._id,
                        name: user.name,
                        email: user.email,
                        sessionCode
                    });

                    await Session.findOneAndUpdate(
                        { code: sessionCode },
                        {
                            $push: {
                                attendance: {
                                    student: user._id,
                                    name: user.name,
                                    email: user.email,
                                    joinTime: new Date()
                                }
                            }
                        }
                    );

                    const freshUser = await User.findById(user._id).select('name email points avatar role');

                    // FIX 1: Skip teachers — they should not appear in the participants list
                    if (freshUser && freshUser.role === 'Teacher') {
                        return;
                    }

                    // FIX 2: Add this student to the session participants map
                    if (!sessionParticipants.has(sessionCode)) {
                        sessionParticipants.set(sessionCode, new Map());
                    }

                    if (freshUser) {
                        sessionParticipants.get(sessionCode)!.set(user._id.toString(), {
                            _id: freshUser._id.toString(),
                            name: freshUser.name,
                            email: freshUser.email,
                            points: freshUser.points,
                            avatar: freshUser.avatar
                        });
                    }

                    // FIX 2: Emit the full participants array so the frontend always has the complete list
                    const allParticipants = Array.from(sessionParticipants.get(sessionCode)!.values());
                    io.to(sessionCode).emit('participants_updated', allParticipants);

                } catch (error) {
                    console.error('Error recording attendance:', error);
                }
            }
        });

        socket.on('leave_session', async (sessionCode: string) => {
            socket.leave(sessionCode);
            console.log(`🚪 User ${socket.id} left session: ${sessionCode}`);
            await handleUserLeave(socket.id);
        });

        socket.on('disconnect', async () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
            await handleUserLeave(socket.id);
        });

        // Whiteboard Synchronisation
        socket.on('whiteboard_open', ({ sessionCode }) => {
            socket.to(sessionCode).emit('whiteboard_open', { teacherId: socket.id });
        });

        socket.on('whiteboard_close', ({ sessionCode }) => {
            socket.to(sessionCode).emit('whiteboard_close');
        });

        socket.on('whiteboard_draw', ({ sessionCode, data }) => {
            if (!whiteboardHistory.has(sessionCode)) {
                whiteboardHistory.set(sessionCode, []);
            }
            const existing = whiteboardHistory.get(sessionCode) || [];
            existing.push(data);
            if (existing.length > 3000) {
                existing.splice(0, existing.length - 3000);
            }
            whiteboardHistory.set(sessionCode, existing);
            socket.to(sessionCode).emit('whiteboard_draw', data);
        });

        socket.on('whiteboard_clear', ({ sessionCode }) => {
            whiteboardHistory.set(sessionCode, []);
            socket.to(sessionCode).emit('whiteboard_clear');
        });

        socket.on('whiteboard_history_request', ({ sessionCode }) => {
            const history = whiteboardHistory.get(sessionCode) || [];
            socket.emit('whiteboard_history', history);
        });

        // Engagement Features
        socket.on('student_understanding_update', ({ sessionCode, understanding, user }) => {
            socket.to(sessionCode).emit('teacher_understanding_update', {
                socketId: socket.id,
                understanding,
                user
            });
        });

        socket.on('student_hand_raise', ({ sessionCode, isRaised, user }) => {
            socket.to(sessionCode).emit('teacher_hand_raise', {
                socketId: socket.id,
                isRaised,
                user
            });
        });

        // Private Messaging
        socket.on('send_private_msg', ({ recipientId, message, sender }) => {
            for (const [sId, data] of socketMap.entries()) {
                if (data.userId.toString() === recipientId.toString() && data.sessionCode === sender.sessionCode) {
                    io.to(sId).emit('receive_private_msg', {
                        sender,
                        message,
                        timestamp: new Date()
                    });
                }
            }
        });

        // Pulse Check Features
        socket.on('pulse_check_init', ({ sessionCode }) => {
            pulseCheckResponses.set(sessionCode, new Set<string>());
            socket.to(sessionCode).emit('pulse_check_start');
        });

        socket.on('pulse_check_response', async ({ userId, sessionCode }) => {
            console.log(`💓 Pulse check response from user ${userId} in session ${sessionCode}`);

            if (!pulseCheckResponses.has(sessionCode)) {
                pulseCheckResponses.set(sessionCode, new Set<string>());
            }
            pulseCheckResponses.get(sessionCode)?.add(userId);

            try {
                const user = await User.findByIdAndUpdate(userId, { $inc: { points: 15 } }, { new: true });

                const userObjectId = new mongoose.Types.ObjectId(userId);
                const result = await Session.updateOne(
                    { code: sessionCode, "attendance.student": userObjectId },
                    { $inc: { "attendance.$.score": 15 } }
                );

                if (result.matchedCount === 0) {
                    console.warn(`⚠️ Failed to update session score for user ${userId}.`);
                } else {
                    console.log(`✅ Session score updated for user ${userId} (+15 pts).`);
                }

                if (user) {
                    // FIX 2: Keep the in-memory participants map in sync with new points
                    if (sessionParticipants.has(sessionCode)) {
                        const participant = sessionParticipants.get(sessionCode)!.get(userId.toString());
                        if (participant) {
                            participant.points = user.points;
                        }
                    }
                    io.to(sessionCode).emit('points_updated', { userId, points: user.points, name: user.name });
                }

                const responseCount = pulseCheckResponses.get(sessionCode)?.size || 0;
                io.to(sessionCode).emit('pulse_check_update', {
                    respondedCount: responseCount,
                    userId,
                    userName: user?.name || 'Unknown'
                });
            } catch (error) {
                console.error('❌ Pulse check reward error:', error);
            }
        });

        // Emoji Reaction
        socket.on('emoji_reaction', ({ sessionCode, emoji, user }) => {
            io.to(sessionCode).emit('stream_emoji', { emoji, user, id: Math.random().toString(36).substr(2, 9) });
        });

        // Save Bookmark
        socket.on('save_bookmark', async ({ userId, sessionCode, sessionTitle }) => {
            try {
                await User.findByIdAndUpdate(userId, {
                    $push: {
                        bookmarks: { sessionTitle, sessionCode, timestamp: new Date() }
                    }
                });
                socket.emit('bookmark_saved', { success: true });
            } catch (error) {
                console.error('Bookmark error:', error);
                socket.emit('bookmark_saved', { success: false });
            }
        });

        // Trigger Mystery Spotlight
        socket.on('trigger_spotlight', async ({ sessionCode, teacherId }) => {
            const uniqueStudentsMap = new Map();

            for (const [sId, data] of socketMap.entries()) {
                if (data.sessionCode === sessionCode && data.userId.toString() !== teacherId.toString()) {
                    uniqueStudentsMap.set(data.userId.toString(), { id: data.userId, name: data.name });
                }
            }

            const sessionUsers = Array.from(uniqueStudentsMap.values());

            if (sessionUsers.length === 0) {
                socket.emit('spotlight_error', { message: 'No active students to spotlight!' });
                return;
            }

            const winner = sessionUsers[Math.floor(Math.random() * sessionUsers.length)];
            console.log(`🎯 Spotlight winner in ${sessionCode}: ${winner.name}`);
            io.to(sessionCode).emit('spotlight_result', { winner, spinDuration: 3000 });
        });
    });

    return io;
};

const handleUserLeave = async (socketId: string) => {
    const data = socketMap.get(socketId);
    if (!data) return;

    const { userId, sessionCode } = data;

    try {
        const session = await Session.findOne({ code: sessionCode });
        if (session) {
            let entryIndex = -1;
            for (let i = session.attendance.length - 1; i >= 0; i--) {
                if (session.attendance[i].student.toString() === userId.toString() && !session.attendance[i].leaveTime) {
                    entryIndex = i;
                    break;
                }
            }

            if (entryIndex !== -1) {
                session.attendance[entryIndex].leaveTime = new Date();
                await session.save();
            }
        }
    } catch (error) {
        console.error('Error recording leave time:', error);
    }

    // FIX 2: Remove from participants map and broadcast the updated list
    if (sessionParticipants.has(sessionCode)) {
        sessionParticipants.get(sessionCode)!.delete(userId.toString());
        const allParticipants = Array.from(sessionParticipants.get(sessionCode)!.values());
        io.to(sessionCode).emit('participants_updated', allParticipants);
    }

    socketMap.delete(socketId);
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

export const emitToSession = (sessionCode: string, event: string, data: any) => {
    if (io) {
        io.to(sessionCode).emit(event, data);
    }
};