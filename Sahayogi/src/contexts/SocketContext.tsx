import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { user } = useAuth();
    const API_URL = 'http://localhost:3000';

    useEffect(() => {
        // Only connect if we have a user to join a room
        const newSocket = io(API_URL);

        newSocket.on('connect', () => {
            if (user) {
                newSocket.emit('join', user.id);
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
