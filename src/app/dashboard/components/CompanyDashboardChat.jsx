"use client";
import { useState, useEffect } from "react";
import { getCompanyId, getUserId } from "@/app/Func/sessionStorage";
import getLocalStorage from "@/app/Func/localStorage";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:4000");  // Ajusta la URL según sea necesario

function ChatComponent({ user }) {
  const [allUsers, setAllUsers] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [hasPermission, setHasPermission] = useState(true);

  const companyId = getCompanyId();
  const userId = getUserId();

  // Función para verificar permisos de comunicación
  const checkCommunicationPermission = () => {
    const userData = getLocalStorage();
    if (!userData) return false;
    
    // Si es company_collaborator, verificar que tenga permiso COMUNICACIONES
    if (userData.role === 'company_collaborator') {
      return userData.permissions && userData.permissions.includes('COMUNICACIONES');
    }
    
    // Otros roles (admin, superAdmin, company_owner, bank) tienen acceso por defecto
    return true;
  };

  // * QUIEN ENVIA EL MENSAJE
  const sender = allUsers.find(el => el.company === companyId);

  // * QUIEN RECIBE EL MENSAJE
  const receiver = allUsers.find(el => {
    const { receivedMessages } = el;
    const filterMessage = receivedMessages.find(receivedMessage => {
      const findMatchMessage = allMessages.find(eachMessage => eachMessage.id === receivedMessage.id);
      return findMatchMessage;
    });
    return filterMessage;
  });

  // * LISTA DE CONTACTOS
  const contactos = allUsers.map(user => user.company);

  useEffect(() => {
    // Verificar permisos de comunicación al cargar el componente
    setHasPermission(checkCommunicationPermission());
    
    socket.on("receiveMessage", (message) => {
      setAllMessages((prevMessages) => [...prevMessages, message]);
    });

    // Cleanup on unmount
    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !receiver) {
      setMessageText("");
      return;
    }
    socket.emit("sendMessage", messageText);
    setMessageText("");
    try {
      await axios.post("http://localhost:4000/messages", {
        text: messageText,
        senderId: sender?.id,
        receiverId: receiver?.id,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <section className="">
      <div className="text-center border-solid rounded-sm border-s-sky-100">
        <h2 className="text-base">Mensajes ///</h2>
      </div>
      
      {!hasPermission ? (
        <div className="p-4 text-center text-gray-500">
          <p className="text-sm">No tienes permisos para acceder al chat.</p>
          <p className="text-xs">Contacta a tu empleador para solicitar permisos de comunicación.</p>
        </div>
      ) : !companyId ? (
        <h3>Necesitas una Empresa para acceder al chat.</h3>
      ) : (
        <div className="flex flex-col h-full">
          <div>
            <h2>Lista de Contactos</h2>
            <ul className="bg-while-800">
              {contactos.map(user => (
                <li key={user?.id} className="hover:border-4 border-s-red-950">
                  {user?.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="overflow-y-auto max-h-80" id="chatMessages">
            <h1 className="mb-4 text-xl font-bold">Historial de Chat</h1>
            {allMessages.map((message, index) => (
              <div
                key={message.id || index}
                className={`${message.sender.id === userId ? "text-right" : "text-left"} mb-2`}
              >
                {message.sender.id === userId ? (
                  <div className="p-3 bg-gray-200 rounded-lg">
                    <p>
                      <strong>Tú: </strong>
                      {!message.sender.fullName
                        ? `${message.sender.firstName} ${message.sender.lastName}`
                        : message.sender.fullName}
                    </p>
                    <p>
                      <strong>Mensaje: </strong>
                      {message.text}
                    </p>
                    <p>
                      <strong>Fecha: </strong>
                      {message.createdAt}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-purple-200 rounded-lg">
                    <p>
                      <strong>Usuario: </strong>
                      {!message.sender.fullName
                        ? `${message.sender.firstName} ${message.sender.lastName}`
                        : message.sender.fullName}
                    </p>
                    <p>
                      <strong>Mensaje: </strong>
                      {message.text}
                    </p>
                    <p>
                      <strong>Fecha: </strong>
                      {message.createdAt}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <form className="flex mt-4" onSubmit={sendMessage}>
            <input
              type="text"
              className="flex-1 px-4 py-2 mr-2 border rounded focus:outline-none"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Escribe tu mensaje..."
            />
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </section>
  );
}

export default ChatComponent;
