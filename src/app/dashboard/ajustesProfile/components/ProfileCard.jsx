"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import CollapsedBar from "@/app/directory/[id]/components/collapsedBar";
import {
  axiosGetDetailCompany,
  axiosGetGalleryCompanyById,
  axiosGetCertificationCompanyById,
} from "@/app/Func/axios";
import getLocalStorage from "@/app/Func/localStorage";

/**
 * Tarjeta de perfil tipo "directory/[id]" pero sin el Chat.
 * - Si se pasa `companyId`, muestra ese perfil en modo solo lectura (perfil ajeno).
 * - Si no se pasa `companyId`, usa la empresa del usuario logueado.
 * - `editable` habilita los botones de edición que llevan a Ajustes de Empresa.
 */
function ProfileCard({ companyId, editable = false }) {
  const [company, setCompany] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [certification, setCertification] = useState([]);
  const [resolvedId, setResolvedId] = useState(companyId || null);

  useEffect(() => {
    if (companyId) {
      setResolvedId(companyId);
      return;
    }
    const user = getLocalStorage();
    if (user?.company?.id) {
      setResolvedId(user.company.id);
    }
  }, [companyId]);

  useEffect(() => {
    if (resolvedId) {
      axiosGetDetailCompany(resolvedId, setCompany);
      axiosGetGalleryCompanyById(resolvedId, setGallery);
      axiosGetCertificationCompanyById(resolvedId, setCertification);
    }
  }, [resolvedId]);

  if (!resolvedId) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
        No se encontró una empresa asociada a este usuario.
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-2 sm:px-4">
      {editable && (
        <p className="text-xs text-gray-500 px-2 pt-2">
          Vista previa de tu perfil público. Para editar los datos, usá los
          formularios de{" "}
          <a
            href="/dashboard/ajustesEmpresa"
            className="text-primary-600 hover:underline font-medium"
          >
            Ajustes de Empresa
          </a>
          .
        </p>
      )}

      {/* Banner */}
      <div className="relative w-full h-[140px] sm:h-[180px] mt-4 rounded-xl overflow-hidden bg-gray-200">
        {company?.bannerPicture ? (
          <Image
            src={company.bannerPicture}
            alt="Banner de la empresa"
            fill
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="mt-4">
        <CollapsedBar
          title="Compañía"
          company={company}
          intState={false}
          hideChat
        />
        <CollapsedBar title="Licitaciones" company={company} intState={true} />
        <CollapsedBar
          title="Productos/Servicios"
          gallery={gallery}
          intState={true}
        />
        <CollapsedBar
          title="Certificaciones/Homologaciones"
          certification={certification}
          intState={true}
        />
      </div>
    </div>
  );
}

export default ProfileCard;
