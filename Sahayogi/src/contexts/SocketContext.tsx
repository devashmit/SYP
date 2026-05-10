import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SOCKET_URL } from '@/config';

interface SocketContextContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        // Only create socket if user is not null
        if (!user) return;

        const token = sessionStorage.getItem('sahayogi_token');
        const newSocket = io(SOCKET_URL, {
            auth: { token } // Pass token for backend authentication
        });
        
        setSocket(newSocket);

        // Clean up socket on unmount
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
