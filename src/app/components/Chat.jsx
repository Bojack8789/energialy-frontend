"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Messages from "./Messages";
import getLocalStorage from "@/app/Func/localStorage";

import {
  axiosGetAllMessages,
  axiosGetAllUsers,
  axiosPostMessage,
} from "@/app/Func/axios";

import {
  getCompanyId,
  getCompanyName,
  getUserId,
  getAccessToken,
} from "@/app/Func/sessionStorage";

import io from "socket.io-client";
const socketIo = io(process.env.NEXT_PUBLIC_BASE_URL);

const Chat = ({ id, company }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);

  const [buttonChat, setButtonChat] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [receiver, setReceiver] = useState(null);
  const [sender, setSender] = useState(null);

  const companyId = getCompanyId();
  const userId = getUserId();
  const myName = getCompanyName();
  let usuariosUnicos = new Set();

  const checkCommunicationPermission = async () => {
    const userData = getLocalStorage();
    if (!userData) return false;
    if (userData.role !== "company_collaborator") return true;

    try {
      const token = getAccessToken();
      if (!token) return false;

      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/users/${userData.id}/permissions`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.permissions && data.permissions.includes("COMUNICACIONES");
      }
      return false;
    } catch (error) {
      console.error("Error verificando permisos:", error);
      return false;
    }
  };

  const convertirFecha = (fechaISO) => {
    try {
      let fecha = new Date(fechaISO);
      if (isNaN(fecha.getTime())) return new Date().toISOString();

      let dia = fecha.getUTCDate();
      let mes = fecha.getUTCMonth() + 1;
      let año = fecha.getUTCFullYear();
      let hora = fecha.getUTCHours() - 3;
      let minutos = fecha.getUTCMinutes();

      if (hora < 0) { hora += 24; dia -= 1; }

      return `${dia}-${mes}-${año}-${hora}:${minutos}`;
    } catch (error) {
      return new Date().toISOString();
    }
  };

  useEffect(() => {
    const checkPermissions = async () => {
      const hasAccess = await checkCommunicationPermission();
      setHasPermission(hasAccess);
    };
    checkPermissions();
    socketIo.emit("authenticate", { companyId });
    socketIo.on("connect", () => console.log("Connected to server"));
  }, []);

  useEffect(() => {
    axiosGetAllUsers(setAllUsers);
    axiosGetAllMessages(setAllMessages);
    !company && setShowPopup(true);
  }, []);

  useEffect(() => {
    if (company && allUsers.length > 0) {
      const companyUser = allUsers.find(
        (user) => user.company?.name === company.name
      );
      if (companyUser) {
        setReceiver(companyUser);
        setSelectedCompany(company.name);

        if (allMessages.length > 0) {
          const filtered = allMessages.filter((message) => {
            const senderCompany = message.sender?.company?.name || message.sender?.Company?.name;
            const receiverCompany = message.receiver?.company?.name || message.receiver?.Company?.name;
            return (
              (senderCompany === company.name && receiverCompany === myName) ||
              (senderCompany === myName && receiverCompany === company.name)
            );
          });
          setFilteredMessages(filtered);
        } else {
          setFilteredMessages([]);
        }
      }
    }
  }, [company, allUsers, allMessages, myName]);

  useEffect(() => {
    if (allUsers.length > 0) {
      const foundSender = companyId
        ? allUsers.find((user) => user.company?.id === companyId)
        : allUsers.find((user) => user.id === userId);

      if (foundSender) setSender(foundSender);

      if (id) {
        const foundReceiver = allUsers.find((user) => user.company?.id === id);
        if (foundReceiver) {
          setReceiver(foundReceiver);
          setSelectedCompany(foundReceiver.company.name);
        }
      }
    }
  }, [allUsers, id, companyId]);

  useEffect(() => {
    if (selectedCompany && allUsers.length > 0) {
      const cleanCompanyName = selectedCompany.replace("🔔", "");

      if (selectedCompany !== cleanCompanyName) {
        setSelectedCompany(cleanCompanyName);
        setButtonChat((prev) =>
          prev.map((b) => (b === selectedCompany ? cleanCompanyName : b))
        );
      }

      const newReceiver = allUsers.find(
        (user) => user.company?.name === cleanCompanyName
      );
      if (newReceiver) setReceiver(newReceiver);

      if (allMessages.length > 0) {
        const filtered = allMessages.filter((message) => {
          const senderCompany = message.sender?.company?.name || message.sender?.Company?.name;
          const receiverCompany = message.receiver?.company?.name || message.receiver?.Company?.name;

          if (!myName) {
            return (
              (message.senderId === userId && receiverCompany === cleanCompanyName) ||
              (senderCompany === cleanCompanyName && message.receiverId === userId)
            );
          }

          return (
            (senderCompany === cleanCompanyName && receiverCompany === myName) ||
            (senderCompany === myName && receiverCompany === cleanCompanyName)
          );
        });
        setFilteredMessages(filtered);
      } else {
        setFilteredMessages([]);
      }
    }
  }, [selectedCompany, allUsers, allMessages, myName]);

  useEffect(() => {
    if (allUsers.length > 0) {
      allUsers.forEach((item) => {
        if (item.company?.name && item.company.name !== myName) {
          usuariosUnicos.add(item.company.name);
        }
      });
      let arr = Array.from(usuariosUnicos);

      if (allMessages.length > 0) {
        const lastMessageTime = new Map();
        allMessages.forEach((msg) => {
          const senderCompany = msg.sender?.company?.name || msg.sender?.Company?.name;
          const receiverCompany = msg.receiver?.company?.name || msg.receiver?.Company?.name;
          const otherCompany = senderCompany === myName ? receiverCompany : senderCompany;
          if (!otherCompany) return;
          const msgTime = new Date(msg.createdAt).getTime() || 0;
          if (!lastMessageTime.has(otherCompany) || msgTime > lastMessageTime.get(otherCompany)) {
            lastMessageTime.set(otherCompany, msgTime);
          }
        });

        arr.sort((a, b) => {
          const timeA = lastMessageTime.get(a) || 0;
          const timeB = lastMessageTime.get(b) || 0;
          return timeB - timeA;
        });
      }

      if (company) {
        const button = arr.find((b) => b === company.name);
        const rest = arr.filter((e) => e !== company.name);
        if (button) rest.unshift(button);
        setButtonChat(rest);
      } else {
        setButtonChat(arr);
      }
    }
  }, [allUsers, allMessages, myName]);

  useEffect(() => {
    if (!socketIo) return;
    const messageListener = (message) => {
      const { _message, _sender, _receiver } = message;
      const foundReceiver = allUsers.find((user) => user.company?.id === _sender);
      const foundSender = allUsers.find((user) => user.company?.id === _receiver);

      if (foundSender && foundReceiver) {
        const newMessage = {
          text: _message,
          sender: foundReceiver,
          receiver: foundSender,
          createdAt: new Date().toISOString(),
        };
        setAllMessages((prev) => [...prev, newMessage]);
      }

      const foundCompanyName = foundReceiver?.company?.name;
      if (selectedCompany !== foundCompanyName && foundCompanyName) {
        const existingIdx = buttonChat.findIndex(
          (b) => b === foundCompanyName || b === foundCompanyName + "🔔"
        );
        if (existingIdx !== -1) {
          const updated = [...buttonChat];
          updated.splice(existingIdx, 1);
          updated.unshift(foundCompanyName + "🔔");
          setButtonChat(updated);
        } else {
          setButtonChat((prev) => [foundCompanyName + "🔔", ...prev]);
        }
      }
    };

    socketIo.on("message", messageListener);
    return () => socketIo.off("message", messageListener);
  }, [allMessages, allUsers, sender, receiver]);

  const handleSendMessage = useCallback(
    async (event) => {
      event.preventDefault();
      if (!socketIo || !messageText.trim()) return;

      if (company) {
        if (!receiver || !receiver.company) {
          alert(`No se pudo establecer conexión con ${company.name}. Inténtalo nuevamente.`);
          return;
        }
      } else {
        if (!selectedCompany) {
          alert("Por favor, selecciona una empresa para enviar el mensaje.");
          return;
        }
        if (!receiver || !receiver.company) {
          alert("Error de conexión. Por favor, vuelve a seleccionar la empresa.");
          return;
        }
      }

      const newMessage = {
        text: messageText,
        sender,
        receiver,
        createdAt: convertirFecha(new Date().toISOString()),
      };

      setAllMessages((prev) => [...prev, newMessage]);

      socketIo.emit("sendMessage", {
        _message: messageText,
        _sender: companyId || userId,
        _receiver: receiver.company.id,
      });

      try {
        await axiosPostMessage({
          text: messageText,
          senderId: sender?.id || userId,
          receiverId: receiver.id,
        });
      } catch (error) {
        console.error("Error al guardar mensaje:", error);
        if (error.response?.status === 401) {
          alert("Error de autenticación. Por favor, inicia sesión nuevamente.");
        } else if (error.response?.status === 403) {
          alert("No tienes permisos para enviar mensajes.");
        } else {
          alert("Error al guardar el mensaje. Inténtalo nuevamente.");
        }
      }

      setMessageText("");
    },
    [messageText, sender, receiver, companyId, id, company]
  );

  const handleSelectCompany = (companyName) => {
    const cleanCompanyName = companyName.replace("🔔", "");
    setSelectedCompany(cleanCompanyName);

    if (companyName.includes("🔔")) {
      setButtonChat((prev) =>
        prev.map((b) => (b === companyName ? cleanCompanyName : b))
      );
    }
  };

  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: "#fee2e2" }}>
          <svg className="w-6 h-6" style={{ color: "#dc2626" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-700">Sin permiso de comunicación</p>
        <p className="text-xs text-gray-500 mt-1">Contacta a tu empleador para obtener acceso.</p>
      </div>
    );
  }

  return (
    <>
      {company ? (
        <div className="w-full h-full flex flex-col overflow-hidden">
          <div className="flex-1 border border-gray-200 rounded-lg mb-3 overflow-hidden min-h-0">
            <Messages filteredMessages={filteredMessages} userId={userId} />
          </div>

          <form className="flex gap-2 flex-shrink-0" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ "--tw-ring-color": "#43c6ac" }}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={`Mensaje a ${company.name}...`}
            />
            <button
              type="submit"
              disabled={!messageText.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: messageText.trim() ? "#191654" : "#e5e7eb",
                color: messageText.trim() ? "#ffffff" : "#9ca3af",
                cursor: messageText.trim() ? "pointer" : "not-allowed",
              }}
            >
              Enviar
            </button>
          </form>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-t-lg flex-shrink-0"
            style={{ background: "#191654" }}
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h2 className="text-sm font-semibold text-white">Chat</h2>
          </div>

          <div className="flex gap-2 flex-1 min-h-0 border border-gray-200 rounded-b-lg overflow-hidden bg-white">
            {/* Lista de empresas - columna izquierda */}
            <div
              className="flex flex-col flex-shrink-0 border-r border-gray-100 overflow-y-auto"
              style={{ width: 52 }}
            >
              <div className="flex flex-col items-center py-2 gap-1.5">
                {buttonChat.length === 0 ? (
                  <div className="flex flex-col items-center pt-4 px-1">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#f3f4f6" }}>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  buttonChat.map((item) => {
                    const companyUser = allUsers.find(
                      (user) => user.company?.name === item.replace("🔔", "")
                    );
                    const profilePicture = companyUser?.company?.profilePicture;
                    const companyName = item.replace("🔔", "");
                    const hasNotif = item.includes("🔔");
                    const isSelected = selectedCompany === companyName;

                    return (
                      <button
                        key={item}
                        onClick={() => handleSelectCompany(companyName)}
                        title={companyName}
                        className="relative flex-shrink-0 transition-all duration-150"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          outline: isSelected ? `2px solid #43c6ac` : "2px solid transparent",
                          outlineOffset: 2,
                        }}
                      >
                        {profilePicture ? (
                          <img
                            src={profilePicture}
                            alt={companyName}
                            style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          style={{
                            display: profilePicture ? "none" : "flex",
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            background: isSelected ? "#191654" : "#e0e7ff",
                            color: isSelected ? "#ffffff" : "#191654",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          {companyName.charAt(0).toUpperCase()}
                        </div>
                        {hasNotif && (
                          <div
                            style={{
                              position: "absolute",
                              top: -2,
                              right: -2,
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              background: "#ef4444",
                              border: "2px solid white",
                            }}
                          />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Área de mensajes */}
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Nombre empresa seleccionada */}
              <div
                className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-100 flex-shrink-0"
                style={{ minHeight: 36 }}
              >
                {selectedCompany ? (
                  <>
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: "#43c6ac" }}
                    />
                    <span className="text-xs font-semibold text-gray-700 truncate">
                      {selectedCompany}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-gray-400">
                    Selecciona una empresa
                  </span>
                )}
              </div>

              {/* Mensajes con scroll */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <Messages filteredMessages={filteredMessages} userId={userId} />
              </div>
            </div>
          </div>

          {/* Formulario de envío */}
          <form
            className="flex gap-2 pt-2 flex-shrink-0"
            onSubmit={handleSendMessage}
          >
            <input
              type="text"
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white placeholder-gray-400 focus:outline-none"
              style={{
                border: "1px solid #d1d5db",
              }}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={
                selectedCompany
                  ? "Escribe tu mensaje..."
                  : "Selecciona una empresa..."
              }
              disabled={!selectedCompany}
            />
            <button
              type="submit"
              disabled={!selectedCompany || !messageText.trim()}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap"
              style={{
                background:
                  selectedCompany && messageText.trim() ? "#191654" : "#e5e7eb",
                color:
                  selectedCompany && messageText.trim() ? "#ffffff" : "#9ca3af",
                cursor:
                  selectedCompany && messageText.trim()
                    ? "pointer"
                    : "not-allowed",
              }}
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chat;
