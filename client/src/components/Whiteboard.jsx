import { Excalidraw, serializeAsJSON, restoreElements } from "@excalidraw/excalidraw";
import { useEffect, useRef, useCallback } from "react";
import { useSimStore } from "../store/useSimStore.js";
import { io } from "socket.io-client";
import { throttle } from "lodash";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function Whiteboard() {
  const { roomCode } = useSimStore();
  const excalidrawAPIRef = useRef(null);
  const socketRef = useRef(null);
  const isSyncing = useRef(false);

  useEffect(() => {
    // Connect socket if not already connected
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    }

    const socket = socketRef.current;

    // When another user draws something
    socket.on("whiteboard-update", ({ elements }) => {
      if (!excalidrawAPIRef.current) return;
      isSyncing.current = true;
      excalidrawAPIRef.current.updateScene({
        elements: restoreElements(elements, null),
      });
      setTimeout(() => {
        isSyncing.current = false;
      }, 50);
    });

    // Get existing canvas when joining mid-session
    socket.on("whiteboard-full-state", ({ elements }) => {
      if (!excalidrawAPIRef.current || !elements?.length) return;
      excalidrawAPIRef.current.updateScene({
        elements: restoreElements(elements, null),
      });
    });

    if (roomCode) {
      socket.emit("whiteboard-join", { roomCode });
    }

    return () => {
      socket.off("whiteboard-update");
      socket.off("whiteboard-full-state");
    };
  }, [roomCode]);

  // Throttle to max 20 emits/second (like Figma)
  const emitChange = useCallback(
    throttle((elements) => {
      if (socketRef.current && roomCode) {
        socketRef.current.emit("whiteboard-update", { roomCode, elements });
      }
    }, 50),
    [roomCode]
  );

  const handleChange = (elements) => {
    if (isSyncing.current) return;
    emitChange(elements);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 48px)",
        position: "relative",
      }}
    >
      <Excalidraw
        excalidrawAPI={(api) => {
          excalidrawAPIRef.current = api;
        }}
        onChange={handleChange}
        theme="light"
        isCollaborating={true}
      />
    </div>
  );
}
