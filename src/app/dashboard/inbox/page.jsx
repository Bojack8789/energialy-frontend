"use client";
import { useState, useEffect, useCallback } from "react";
import Messages from "@/app/components/Messages";
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
import { IoSend, IoSearchOutline, IoClose } from "react-icons/io5";
import { BiMessageRoundedDots } from "react-icons/bi";
import { HiOutlineUserGroup } from "react-icons/hi";

const socketIo = io(process.env.NEXT_PUBLIC_BASE_URL);

// Empresas recomendadas cuando no hay conversaciones previas
const RECOMMENDED_LIMIT = 5;

function InboxPage() {
  const [allUsers, setAllUsers] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [hasPermission, setHasPermission] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Empresas con las que se ha conversado (sidebar derecho)
  const [conversedCompanies, setConversedCompanies] = useState([]);
  // Todas las empresas del sistema (para búsqueda)
  const [allCompanies, setAllCompanies] = useState([]);

  const [filteredMessages, setFilteredMessages] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [receiver, setReceiver] = useState(null);
  const [sender, setSender] = useState(null);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const companyId = getCompanyId();
  const userId = getUserId();
  const myName = getCompanyName();

  // Verificar permisos
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
      return `${dia}-${mes}-${año}-${hora}:${String(minutos).padStart(2, "0")}`;
    } catch {
      return new Date().toISOString();
    }
  };

  // Inicialización
  useEffect(() => {
    const init = async () => {
      const hasAccess = await checkCommunicationPermission();
      setHasPermission(hasAccess);
    };
    init();
    socketIo.emit("authenticate", { companyId });
    socketIo.on("connect", () => console.log("Connected"));
  }, []);

  useEffect(() => {
    axiosGetAllUsers(setAllUsers);
    axiosGetAllMessages(setAllMessages);
  }, []);

  // Cargar sender
  useEffect(() => {
    if (allUsers.length > 0) {
      const foundSender = companyId
        ? allUsers.find((u) => u.company?.id === companyId)
        : allUsers.find((u) => u.id === userId);
      if (foundSender) setSender(foundSender);
    }
  }, [allUsers, companyId]);

  // Construir lista de TODAS las empresas del sistema (menos la propia)
  useEffect(() => {
    if (allUsers.length > 0) {
      const companies = [];
      const seen = new Set();
      allUsers.forEach((u) => {
        if (u.company?.name && u.company.name !== myName && !seen.has(u.company.name)) {
          seen.add(u.company.name);
          companies.push({
            name: u.company.name,
            profilePicture: u.company.profilePicture || null,
          });
        }
      });
      setAllCompanies(companies);
    }
  }, [allUsers, myName]);

  // Construir lista de empresas con CONVERSACIÓN (ordenadas por último mensaje)
  useEffect(() => {
    if (allMessages.length === 0 || allUsers.length === 0) {
      setConversedCompanies([]);
      return;
    }

    const companyLastMessage = new Map();

    allMessages.forEach((msg) => {
      const senderCompany = msg.sender?.company?.name || msg.sender?.Company?.name;
      const receiverCompany = msg.receiver?.company?.name || msg.receiver?.Company?.name;

      let otherCompany = null;

      if (!myName) {
        // Super admin
        if (msg.senderId === userId) otherCompany = receiverCompany;
        else if (msg.receiverId === userId) otherCompany = senderCompany;
      } else {
        if (senderCompany === myName) otherCompany = receiverCompany;
        else if (receiverCompany === myName) otherCompany = senderCompany;
      }

      if (otherCompany && otherCompany !== myName) {
        const existing = companyLastMessage.get(otherCompany);
        const msgTime = new Date(msg.createdAt).getTime() || 0;
        if (!existing || msgTime > existing.time) {
          companyLastMessage.set(otherCompany, { time: msgTime, msg });
        }
      }
    });

    // Ordenar por más reciente
    const sorted = Array.from(companyLastMessage.entries())
      .sort((a, b) => b[1].time - a[1].time)
      .map(([name]) => name);

    setConversedCompanies(sorted);
  }, [allMessages, allUsers, myName, userId]);

  // Filtrar mensajes de la empresa seleccionada
  useEffect(() => {
    if (!selectedCompany || allUsers.length === 0) return;

    const newReceiver = allUsers.find(
      (u) => u.company?.name === selectedCompany
    );
    if (newReceiver) setReceiver(newReceiver);

    if (allMessages.length > 0) {
      const filtered = allMessages.filter((message) => {
        const senderCompany = message.sender?.company?.name || message.sender?.Company?.name;
        const receiverCompany = message.receiver?.company?.name || message.receiver?.Company?.name;

        if (!myName) {
          return (
            (message.senderId === userId && receiverCompany === selectedCompany) ||
            (senderCompany === selectedCompany && message.receiverId === userId)
          );
        }

        return (
          (senderCompany === selectedCompany && receiverCompany === myName) ||
          (senderCompany === myName && receiverCompany === selectedCompany)
        );
      });
      setFilteredMessages(filtered);
    } else {
      setFilteredMessages([]);
    }
  }, [selectedCompany, allUsers, allMessages, myName]);

  // Recibir mensajes por socket
  useEffect(() => {
    if (!socketIo) return;
    const messageListener = (message) => {
      const { _message, _sender, _receiver } = message;
      const foundReceiver = allUsers.find((u) => u.company?.id === _sender);
      const foundSender = allUsers.find((u) => u.company?.id === _receiver);

      if (foundSender && foundReceiver) {
        const newMessage = {
          text: _message,
          sender: foundReceiver,
          receiver: foundSender,
          createdAt: new Date().toISOString(),
        };
        setAllMessages((prev) => [...prev, newMessage]);
      }
    };

    socketIo.on("message", messageListener);
    return () => socketIo.off("message", messageListener);
  }, [allUsers]);

  // Enviar mensaje
  const handleSendMessage = useCallback(
    async (event) => {
      event.preventDefault();
      if (!socketIo || !messageText.trim()) return;

      if (!selectedCompany) {
        alert("Por favor, selecciona una empresa para enviar el mensaje.");
        return;
      }
      if (!receiver || !receiver.company) {
        alert("Error de conexión. Por favor, vuelve a seleccionar la empresa.");
        return;
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
      }

      setMessageText("");
    },
    [messageText, sender, receiver, companyId, userId, selectedCompany]
  );

  const handleSelectCompany = (companyName) => {
    setSelectedCompany(companyName);
    setIsMobileSidebarOpen(false);
    setIsSearching(false);
    setSearchTerm("");
  };

  // Búsqueda: cuando el usuario escribe, muestra resultados de TODAS las empresas
  const searchResults = searchTerm.trim()
    ? allCompanies.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Sidebar: empresas con conversación + badge de notificación
  const [notifiedCompanies, setNotifiedCompanies] = useState(new Set());

  useEffect(() => {
    if (!socketIo) return;
    const notifListener = (message) => {
      const { _sender } = message;
      const foundReceiver = allUsers.find((u) => u.company?.id === _sender);
      const name = foundReceiver?.company?.name;
      if (name && name !== selectedCompany) {
        setNotifiedCompanies((prev) => new Set([...prev, name]));
      }
    };
    socketIo.on("message", notifListener);
    return () => socketIo.off("message", notifListener);
  }, [allUsers, selectedCompany]);

  // Limpiar notificación al seleccionar empresa
  useEffect(() => {
    if (selectedCompany) {
      setNotifiedCompanies((prev) => {
        const next = new Set(prev);
        next.delete(selectedCompany);
        return next;
      });
    }
  }, [selectedCompany]);

  // Empresas recomendadas: las que NO han conversado aún
  const recommendedCompanies = allCompanies
    .filter((c) => !conversedCompanies.includes(c.name))
    .slice(0, RECOMMENDED_LIMIT);

  // Helper: obtener datos de empresa por nombre
  const getCompanyData = (name) =>
    allCompanies.find((c) => c.name === name) || { name, profilePicture: null };

  const CompanyAvatar = ({ name, profilePicture, size = 44, selected = false }) => (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        overflow: "hidden",
        border: selected ? `2px solid #43c6ac` : "2px solid #e5e7eb",
      }}
    >
      {profilePicture ? (
        <img
          src={profilePicture}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            e.target.style.display = "none";
            e.target.parentNode.style.background = "#191654";
            e.target.parentNode.style.display = "flex";
            e.target.parentNode.style.alignItems = "center";
            e.target.parentNode.style.justifyContent = "center";
            e.target.parentNode.style.color = "#fff";
            e.target.parentNode.style.fontWeight = "700";
            e.target.parentNode.style.fontSize = "16px";
            e.target.parentNode.textContent = name.charAt(0).toUpperCase();
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: selected ? "#191654" : "#e0e7ff",
            color: selected ? "#fff" : "#191654",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: size > 36 ? 16 : 13,
          }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );

  const CompanyListItem = ({ name, profilePicture, isSelected, hasNotif, subtitle, onClick }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-150 text-left"
      style={{
        background: isSelected ? "#191654" : "transparent",
        borderRadius: 10,
      }}
      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#f3f4f6"; }}
      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
    >
      <div className="relative flex-shrink-0">
        <CompanyAvatar name={name} profilePicture={profilePicture} size={42} selected={isSelected} />
        {hasNotif && (
          <div
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#43c6ac",
              border: "2px solid white",
            }}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold truncate"
          style={{ color: isSelected ? "#ffffff" : "#1e293b" }}
        >
          {name}
        </p>
        {subtitle && (
          <p
            className="text-xs truncate mt-0.5"
            style={{ color: isSelected ? "#93c5fd" : "#64748b" }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {hasNotif && !isSelected && (
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: "#43c6ac" }}
        />
      )}
    </button>
  );

  if (!hasPermission) {
    return (
      <div
        className="flex items-center justify-center h-full min-h-[600px]"
        style={{ background: "#f8fafc" }}
      >
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center border border-gray-100">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "#fee2e2" }}
          >
            <svg className="w-8 h-8" style={{ color: "#dc2626" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Acceso Restringido</h3>
          <p className="text-gray-600 mb-1">No tienes permisos para acceder al chat.</p>
          <p className="text-sm text-gray-500">Contacta a tu empleador para solicitar permisos de comunicación.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "#f8fafc" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#191654" }}>
            Mensajes
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {conversedCompanies.length > 0
              ? `${conversedCompanies.length} conversación${conversedCompanies.length !== 1 ? "es" : ""}`
              : "Sin conversaciones aún"}
          </p>
        </div>
        {/* Botón mobile */}
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="lg:hidden p-2.5 rounded-xl text-white transition-all"
          style={{ background: "#191654" }}
        >
          <HiOutlineUserGroup className="text-xl" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Overlay mobile */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 z-20 lg:hidden"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* ═══════════════════════════════════════════
            SIDEBAR DERECHO — Contactos
           ═══════════════════════════════════════════ */}
        <div
          className={`
            fixed lg:relative top-[73px] lg:top-0 bottom-0 left-0 z-30 lg:z-0
            flex flex-col transform transition-transform duration-300 ease-in-out
            ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
          style={{
            width: 300,
            background: "#ffffff",
            borderRight: "1px solid #e2e8f0",
            flexShrink: 0,
          }}
        >
          {/* Cabecera sidebar */}
          <div className="flex-shrink-0 px-4 pt-4 pb-3" style={{ borderBottom: "1px solid #f1f5f9" }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold" style={{ color: "#191654" }}>
                Contactos
              </h2>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="lg:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <IoClose className="text-lg text-gray-500" />
              </button>
            </div>

            {/* Buscador — busca cualquier empresa del sistema */}
            <div className="relative">
              <IoSearchOutline
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                style={{ fontSize: 15 }}
              />
              <input
                type="text"
                placeholder="Buscar cualquier empresa..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsSearching(e.target.value.trim().length > 0);
                }}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg focus:outline-none transition-all"
                style={{
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  color: "#1e293b",
                }}
                onFocus={(e) => (e.target.style.border = "1px solid #43c6ac")}
                onBlur={(e) => (e.target.style.border = "1px solid #e2e8f0")}
              />
              {searchTerm && (
                <button
                  onClick={() => { setSearchTerm(""); setIsSearching(false); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <IoClose style={{ fontSize: 14 }} />
                </button>
              )}
            </div>
          </div>

          {/* Lista de contactos con scroll */}
          <div className="flex-1 overflow-y-auto px-2 py-2" style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}>

            {/* ── RESULTADOS DE BÚSQUEDA ── */}
            {isSearching ? (
              <div>
                <p className="text-xs font-semibold px-2 mb-1" style={{ color: "#64748b" }}>
                  Resultados ({searchResults.length})
                </p>
                {searchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                    <IoSearchOutline className="text-3xl mb-2 text-gray-300" />
                    <p className="text-sm text-gray-400">Sin resultados para "{searchTerm}"</p>
                  </div>
                ) : (
                  searchResults.map((c) => (
                    <CompanyListItem
                      key={c.name}
                      name={c.name}
                      profilePicture={c.profilePicture}
                      isSelected={selectedCompany === c.name}
                      hasNotif={notifiedCompanies.has(c.name)}
                      subtitle={conversedCompanies.includes(c.name) ? "Conversación previa" : "Nueva conversación"}
                      onClick={() => handleSelectCompany(c.name)}
                    />
                  ))
                )}
              </div>
            ) : (
              <>
                {/* ── CONVERSACIONES ACTIVAS ── */}
                {conversedCompanies.length > 0 ? (
                  <div className="mb-4">
                    <p className="text-xs font-semibold px-2 mb-1" style={{ color: "#64748b" }}>
                      Conversaciones
                    </p>
                    {conversedCompanies.map((name) => {
                      const data = getCompanyData(name);
                      return (
                        <CompanyListItem
                          key={name}
                          name={name}
                          profilePicture={data.profilePicture}
                          isSelected={selectedCompany === name}
                          hasNotif={notifiedCompanies.has(name)}
                          subtitle={notifiedCompanies.has(name) ? "Nuevo mensaje" : ""}
                          onClick={() => handleSelectCompany(name)}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-6 text-center px-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                      style={{ background: "#f0fdf4" }}
                    >
                      <BiMessageRoundedDots className="text-2xl" style={{ color: "#43c6ac" }} />
                    </div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Aún no hay conversaciones</p>
                    <p className="text-xs text-gray-400">Busca una empresa arriba para comenzar</p>
                  </div>
                )}

                {/* ── RECOMENDACIONES — solo cuando no hay conversaciones previas ── */}
                {conversedCompanies.length === 0 && recommendedCompanies.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold px-2 mb-1 mt-2" style={{ color: "#64748b" }}>
                      Empresas sugeridas
                    </p>
                    {recommendedCompanies.map((c) => (
                      <CompanyListItem
                        key={c.name}
                        name={c.name}
                        profilePicture={c.profilePicture}
                        isSelected={selectedCompany === c.name}
                        hasNotif={false}
                        subtitle="Comenzar conversación"
                        onClick={() => handleSelectCompany(c.name)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            ÁREA DE CHAT
           ═══════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {selectedCompany ? (
            <>
              {/* Chat Header */}
              <div
                className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
                style={{
                  background: "#191654",
                  borderBottom: "1px solid #1e1f6b",
                }}
              >
                {(() => {
                  const data = getCompanyData(selectedCompany);
                  return (
                    <CompanyAvatar
                      name={selectedCompany}
                      profilePicture={data.profilePicture}
                      size={38}
                      selected={false}
                    />
                  );
                })()}
                <div>
                  <h2 className="font-semibold text-white text-sm leading-tight">
                    {selectedCompany}
                  </h2>
                  {filteredMessages.length > 0 && (
                    <p className="text-xs" style={{ color: "#43c6ac" }}>
                      {filteredMessages.length} mensaje{filteredMessages.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>

              {/* Mensajes — scroll aquí */}
              <div className="flex-1 overflow-hidden" style={{ background: "#f8fafc" }}>
                <Messages filteredMessages={filteredMessages} userId={userId} />
              </div>

              {/* Input de envío */}
              <div
                className="flex-shrink-0 px-4 py-3"
                style={{ background: "#ffffff", borderTop: "1px solid #e2e8f0" }}
              >
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 rounded-xl focus:outline-none transition-all"
                    style={{
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                    }}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`Escribe un mensaje a ${selectedCompany}...`}
                    onFocus={(e) => (e.target.style.border = "1px solid #43c6ac")}
                    onBlur={(e) => (e.target.style.border = "1px solid #e2e8f0")}
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150"
                    style={{
                      background: messageText.trim() ? "#191654" : "#e5e7eb",
                      color: messageText.trim() ? "#ffffff" : "#9ca3af",
                      cursor: messageText.trim() ? "pointer" : "not-allowed",
                    }}
                  >
                    <span className="hidden sm:inline">Enviar</span>
                    <IoSend style={{ fontSize: 16 }} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Estado vacío */
            <div
              className="flex-1 flex items-center justify-center"
              style={{ background: "#f8fafc" }}
            >
              <div className="text-center px-6 max-w-sm">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: "#191654" }}
                >
                  <BiMessageRoundedDots className="text-white text-4xl" />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: "#191654" }}>
                  Selecciona una conversación
                </h3>
                <p className="text-sm text-gray-500 mb-5">
                  Elige una empresa de la lista o usa el buscador para encontrar cualquier empresa
                </p>
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all"
                  style={{ background: "#191654" }}
                >
                  Ver Contactos
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InboxPage;
