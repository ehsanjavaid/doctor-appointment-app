import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

// Create context
const SocketContext = createContext();

// Custom hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// Socket provider component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Create socket connection
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        },
        transports: ['websocket', 'polling']
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // Set up socket
      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    } else {
      // Close socket if not authenticated
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, user]);

  // Join room for user
  useEffect(() => {
    if (socket && isConnected && user) {
      // Join user's personal room
      socket.emit('join-room', `user-${user._id}`);
      
      // Join role-specific room
      if (user.role === 'doctor') {
        socket.emit('join-room', `doctor-${user._id}`);
      } else if (user.role === 'patient') {
        socket.emit('join-room', `patient-${user._id}`);
      }
    }
  }, [socket, isConnected, user]);

  // Socket utility functions
  const joinAppointmentRoom = (appointmentId) => {
    if (socket && isConnected) {
      socket.emit('join-room', `appointment-${appointmentId}`);
    }
  };

  const leaveAppointmentRoom = (appointmentId) => {
    if (socket && isConnected) {
      socket.emit('leave-room', `appointment-${appointmentId}`);
    }
  };

  const sendMessage = (roomId, message) => {
    if (socket && isConnected) {
      socket.emit('send-message', {
        roomId,
        message,
        sender: user?._id,
        timestamp: new Date().toISOString()
      });
    }
  };

  const sendNotification = (recipientId, notification) => {
    if (socket && isConnected) {
      socket.emit('send-notification', {
        recipientId,
        notification: {
          ...notification,
          timestamp: new Date().toISOString()
        }
      });
    }
  };

  const updateAppointmentStatus = (appointmentId, status) => {
    if (socket && isConnected) {
      socket.emit('update-appointment-status', {
        appointmentId,
        status,
        updatedBy: user?._id,
        timestamp: new Date().toISOString()
      });
    }
  };

  const requestVideoCall = (appointmentId, recipientId) => {
    if (socket && isConnected) {
      socket.emit('request-video-call', {
        appointmentId,
        recipientId,
        requester: user?._id,
        timestamp: new Date().toISOString()
      });
    }
  };

  const acceptVideoCall = (appointmentId, recipientId) => {
    if (socket && isConnected) {
      socket.emit('accept-video-call', {
        appointmentId,
        recipientId,
        timestamp: new Date().toISOString()
      });
    }
  };

  const rejectVideoCall = (appointmentId, recipientId, reason) => {
    if (socket && isConnected) {
      socket.emit('reject-video-call', {
        appointmentId,
        recipientId,
        reason,
        timestamp: new Date().toISOString()
      });
    }
  };

  const endVideoCall = (appointmentId) => {
    if (socket && isConnected) {
      socket.emit('end-video-call', {
        appointmentId,
        timestamp: new Date().toISOString()
      });
    }
  };

  const shareScreen = (appointmentId, isSharing) => {
    if (socket && isConnected) {
      socket.emit('share-screen', {
        appointmentId,
        isSharing,
        timestamp: new Date().toISOString()
      });
    }
  };

  const sendTypingIndicator = (roomId, isTyping) => {
    if (socket && isConnected) {
      socket.emit('typing-indicator', {
        roomId,
        isTyping,
        userId: user?._id,
        timestamp: new Date().toISOString()
      });
    }
  };

  const requestFileUpload = (appointmentId, fileInfo) => {
    if (socket && isConnected) {
      socket.emit('request-file-upload', {
        appointmentId,
        fileInfo,
        requester: user?._id,
        timestamp: new Date().toISOString()
      });
    }
  };

  const sendPrescription = (appointmentId, prescription) => {
    if (socket && isConnected) {
      socket.emit('send-prescription', {
        appointmentId,
        prescription,
        doctor: user?._id,
        timestamp: new Date().toISOString()
      });
    }
  };

  const sendLabResults = (appointmentId, labResults) => {
    if (socket && isConnected) {
      socket.emit('send-lab-results', {
        appointmentId,
        labResults,
        sender: user?._id,
        timestamp: new Date().toISOString()
      });
    }
  };

  const requestEmergencyConsultation = (doctorId, urgency) => {
    if (socket && isConnected) {
      socket.emit('request-emergency-consultation', {
        doctorId,
        urgency,
        patient: user?._id,
        timestamp: new Date().toISOString()
      });
    }
  };

  const respondToEmergency = (patientId, response) => {
    if (socket && isConnected) {
      socket.emit('respond-to-emergency', {
        patientId,
        response,
        doctor: user?._id,
        timestamp: new Date().toISOString()
      });
    }
  };

  const value = {
    socket,
    isConnected,
    joinAppointmentRoom,
    leaveAppointmentRoom,
    sendMessage,
    sendNotification,
    updateAppointmentStatus,
    requestVideoCall,
    acceptVideoCall,
    rejectVideoCall,
    endVideoCall,
    shareScreen,
    sendTypingIndicator,
    requestFileUpload,
    sendPrescription,
    sendLabResults,
    requestEmergencyConsultation,
    respondToEmergency
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
