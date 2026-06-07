"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetTenderByIdQuery } from "@/app/redux/services/tendersApi";
import { Card, Typography } from "@material-tailwind/react";
import axios from "axios";
import { displaySuccessMessage, displayFailedMessage } from "@/app/components/Toastify";
import { ToastContainer } from "react-toastify";
import getLocalStorage from "@/app/Func/localStorage";

export default function EditTender({ params }) {
  const router = useRouter();
  const tenderId = params.id;
  const userData = getLocalStorage();

  const { data: tender, isLoading } = useGetTenderByIdQuery(tenderId);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: 0,
    projectDuration: "",
    validityDate: "",
    address: "",
  });

  useEffect(() => {
    if (tender) {
      // Verificar que sea el dueño de la licitación
      if (tender.company?.id !== userData?.company?.id) {
        displayFailedMessage("No tienes permiso para editar esta licitación");
        router.back();
        return;
      }

      setFormData({
        title: tender.title || "",
        description: tender.description || "",
        budget: tender.budget || 0,
        projectDuration: tender.projectDuration || "",
        validityDate: tender.validityDate ? tender.validityDate.split('T')[0] : "",
        address: tender.address || "",
      });
    }
  }, [tender]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const accessToken = sessionStorage.getItem('accessToken');

      await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/tenders/${tenderId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      displaySuccessMessage("Licitación actualizada exitosamente");
      setTimeout(() => router.back(), 2000);
    } catch (error) {
      console.error("Error updating tender:", error);
      displayFailedMessage(error?.response?.data?.error || "Error al actualizar la licitación");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Cargando...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card className="p-6 max-w-4xl mx-auto">
        <Typography variant="h4" className="mb-6">
          Editar Licitación
        </Typography>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Título *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Descripción *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={6}
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Presupuesto y Duración */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Presupuesto (U$D) *
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                required
                min="0"
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Duración del Proyecto *
              </label>
              <input
                type="text"
                name="projectDuration"
                value={formData.projectDuration}
                onChange={handleChange}
                required
                placeholder="Ej: 30 días"
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Fecha límite */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Fecha límite para enviar Propuestas *
            </label>
            <input
              type="date"
              name="validityDate"
              value={formData.validityDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Dirección del Proyecto
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Dirección del proyecto"
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </Card>

      <ToastContainer style={{ marginTop: "100px" }} />
    </div>
  );
}
