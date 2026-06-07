"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { urlProduction } from "@/app/data/dataGeneric";
import {
  displayFailedMessage,
  displaySuccessMessage,
} from "../components/Toastify";

function AcceptInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [invitationToken, setInvitationToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [invitationData, setInvitationData] = useState(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setInvitationToken(token);
      // Here you could fetch invitation details to show to user
    } else {
      displayFailedMessage("Token de invitación no válido");
      router.push("/");
    }
  }, [searchParams, router]);

  const handleAcceptInvitation = async (e) => {
    e.preventDefault();

    if (!password || password.length < 6) {
      displayFailedMessage("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      displayFailedMessage("Las contraseñas no coinciden");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${urlProduction}/collaborators/accept-invitation`,
        {
          invitationToken,
          password,
        }
      );

      displaySuccessMessage("¡Invitación aceptada exitosamente! Redirigiendo...");
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);

    } catch (error) {
      console.error("Error accepting invitation:", error);
      displayFailedMessage(
        error.response?.data?.error || "Error al aceptar la invitación"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Aceptar Invitación
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Has sido invitado a colaborar en una empresa
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleAcceptInvitation}>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Crear Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirmar Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Confirma tu contraseña"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </div>
                ) : (
                  "Aceptar Invitación"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-center">
              <button
                onClick={() => router.push("/")}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default function AcceptInvitation() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <AcceptInvitationContent />
    </Suspense>
  );
}
