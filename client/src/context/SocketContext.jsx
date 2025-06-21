// src/context/SocketContext.js
import { createContext, useContext } from "react";
import { io } from "socket.io-client";
import env from "../config/env";

const socket = io(env.baseUrl, { autoConnect: false });

const SocketContext = createContext(socket);
export const useSocket = () => useContext(SocketContext);
export default function SocketProvider({ children }) {
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}
