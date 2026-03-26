import { io } from 'socket.io-client';

let socketInstance;
let activeConsumers = 0;

const resolveSocketOrigin = () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

    if (/^https?:\/\//i.test(apiBaseUrl)) {
        return new URL(apiBaseUrl).origin;
    }

    return window.location.origin;
};

const ensureSocket = () => {
    if (!socketInstance) {
        socketInstance = io(resolveSocketOrigin(), {
            autoConnect: false,
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });
    }

    return socketInstance;
};

export const acquireChatSocket = () => {
    const socket = ensureSocket();
    activeConsumers += 1;

    if (!socket.connected) {
        socket.connect();
    }

    return socket;
};

export const releaseChatSocket = () => {
    if (!socketInstance) return;

    activeConsumers = Math.max(0, activeConsumers - 1);

    if (activeConsumers === 0 && socketInstance.connected) {
        socketInstance.disconnect();
    }
};
