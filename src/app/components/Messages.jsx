"use client";
import { useEffect, useRef } from "react";

const Messages = ({ filteredMessages, userId }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [filteredMessages]);

  useEffect(() => {
    scrollToBottom();
  }, []);

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-4 space-y-3" style={{ background: "#f8fafc" }}>
      {filteredMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center px-4 max-w-sm animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg
                className="w-10 h-10 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-base font-semibold text-gray-700 mb-2">
              No hay mensajes todavía
            </p>
            <p className="text-sm text-gray-500">
              Envía el primer mensaje para comenzar la conversación
            </p>
          </div>
        </div>
      ) : (
        <>
          {filteredMessages.map((message, index) => {
            const isSender = message.sender.id === userId;
            const userName =
              message.sender.fullName ||
              `${message.sender.firstName} ${message.sender.lastName}`;

            const showAvatar =
              index === 0 ||
              filteredMessages[index - 1]?.sender.id !== message.sender.id;

            return (
              <div
                key={message.id || index}
                className={`flex items-end gap-2 animate-slide-in ${
                  isSender ? "flex-row-reverse" : "flex-row"
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* Avatar */}
                <div className="flex-shrink-0 w-8 h-8">
                  {showAvatar && !isSender && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-semibold text-xs shadow-md">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Mensaje container */}
                <div
                  className={`flex flex-col max-w-[75%] sm:max-w-[60%] ${
                    isSender ? "items-end" : "items-start"
                  }`}
                >
                  {/* Nombre del usuario */}
                  {showAvatar && (
                    <span
                      className={`text-xs font-medium mb-1 px-2 ${
                        isSender ? "text-blue-700" : "text-gray-600"
                      }`}
                    >
                      {userName}
                    </span>
                  )}

                  {/* Burbuja de mensaje */}
                  <div
                    className={`
                      relative px-4 py-3 rounded-2xl shadow-md break-words
                      transition-all duration-200 hover:shadow-lg
                      ${
                        isSender
                          ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-md"
                          : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                      }
                    `}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.text}
                    </p>

                    {/* Triangulo decorativo */}
                    <div
                      className={`
                        absolute bottom-0 w-0 h-0
                        ${
                          isSender
                            ? "right-0 border-l-8 border-l-transparent border-t-8 border-t-indigo-600"
                            : "left-0 border-r-8 border-r-transparent border-t-8 border-t-white"
                        }
                      `}
                      style={{
                        transform: isSender
                          ? "translate(0, 8px)"
                          : "translate(0, 8px)",
                      }}
                    />
                  </div>

                  {/* Fecha y hora */}
                  <span
                    className={`text-xs text-gray-400 mt-1 px-2 ${
                      isSender ? "text-right" : "text-left"
                    }`}
                  >
                    {message.createdAt}
                  </span>
                </div>

                {/* Espacio para avatar del lado del sender */}
                {isSender && <div className="flex-shrink-0 w-8 h-8" />}
              </div>
            );
          })}
          <div ref={messagesEndRef} className="h-4" />
        </>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        /* Custom scrollbar styling */
        div::-webkit-scrollbar {
          width: 6px;
        }

        div::-webkit-scrollbar-track {
          background: transparent;
        }

        div::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #cbd5e1, #94a3b8);
          border-radius: 10px;
        }

        div::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #94a3b8, #64748b);
        }
      `}</style>
    </div>
  );
};

export default Messages;
