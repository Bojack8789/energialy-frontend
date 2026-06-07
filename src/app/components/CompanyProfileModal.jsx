'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import placeholder from '@/app/assets/placeholder.jpg';
import {
  axiosGetDetailCompany,
  axiosGetGalleryCompanyById,
  axiosGetCertificationCompanyById,
} from '@/app/Func/axios';

function dateTransform(string) {
  if (!string) return 'Fecha no disponible';
  const formatDate = new Date(string);
  return formatDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function Section({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-lg mb-3">
      <button
        className="w-full flex justify-between items-center px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span>{title}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function CompanyProfileModal({ companyId, companyName, onClose }) {
  const [company, setCompany] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    Promise.all([
      axiosGetDetailCompany(companyId, setCompany),
      axiosGetGalleryCompanyById(companyId, setGallery),
      axiosGetCertificationCompanyById(companyId, setCertifications),
    ]).finally(() => setLoading(false));
  }, [companyId]);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-lg font-bold text-gray-800">
            {company?.name || companyName || 'Perfil de Empresa'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Banner */}
              {company?.bannerPicture && (
                <div className="relative w-full h-36 rounded-xl overflow-hidden mb-4 bg-gray-200">
                  <Image src={company.bannerPicture} alt="Banner" fill className="object-cover" />
                </div>
              )}

              {/* Info principal */}
              <Section title="Información de la Empresa" defaultOpen={true}>
                <div className="flex flex-col sm:flex-row gap-6 pt-2">
                  {/* Logo + datos */}
                  <div className="flex flex-col items-center sm:items-start gap-3 sm:w-1/3">
                    <Image
                      src={company?.profilePicture || placeholder}
                      width={120}
                      height={120}
                      alt={company?.name || 'Logo'}
                      className="rounded-lg object-contain border border-gray-100"
                    />
                    <div className="text-center sm:text-left space-y-1">
                      <h3 className="font-bold text-gray-800 text-base">{company?.name}</h3>
                      {company?.organizationType && (
                        <span className="inline-block text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">
                          {company.organizationType}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 space-y-1 text-center sm:text-left">
                      <p><span className="font-medium">Miembro desde:</span> {dateTransform(company?.createdAt)}</p>
                      {company?.foundationYear && (
                        <p><span className="font-medium">Fundación:</span> {company.foundationYear}</p>
                      )}
                      {company?.annualRevenue && (
                        <p><span className="font-medium">Facturación:</span> {company.annualRevenue}</p>
                      )}
                      {company?.employeeCount && (
                        <p><span className="font-medium">Empleados:</span> {company.employeeCount}</p>
                      )}
                      {company?.website && (
                        <p>
                          <span className="font-medium">Web:</span>{' '}
                          <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {company.website}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Descripción + tags */}
                  <div className="flex-1 space-y-4">
                    {company?.description && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Descripción</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{company.description}</p>
                      </div>
                    )}

                    {company?.locations?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Ubicaciones</p>
                        <div className="flex flex-wrap gap-1">
                          {company.locations.map((loc) => (
                            <span key={loc.id} className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-0.5">
                              📍 {loc.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {company?.categories?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Categorías</p>
                        <div className="flex flex-wrap gap-1">
                          {company.categories.map((cat) => (
                            <span key={cat.id} className="text-xs bg-secondary-100 text-secondary-700 rounded-full px-2 py-0.5">
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {company?.subcategories?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Sub-categorías</p>
                        <div className="flex flex-wrap gap-1">
                          {company.subcategories.map((sub) => (
                            <span key={sub.id} className="text-xs bg-primary-100 text-primary-700 rounded-full px-2 py-0.5">
                              {sub.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Section>

              {/* Servicios (services array del modelo) */}
              {company?.services?.length > 0 && (
                <Section title={`Servicios (${company.services.length})`}>
                  <div className="space-y-2 pt-2">
                    {company.services.map((service, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm">
                        {typeof service === 'string' ? service : (
                          <div>
                            {service.name && <p className="font-semibold text-gray-800">{service.name}</p>}
                            {service.description && <p className="text-gray-600 mt-0.5">{service.description}</p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Galería de Productos/Servicios */}
              {gallery?.length > 0 && (
                <Section title={`Productos / Servicios (${gallery.length})`}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {gallery.map((item) => (
                      <div
                        key={item.id}
                        className="cursor-pointer group relative rounded-lg overflow-hidden border border-gray-200 hover:border-primary-400 transition-colors"
                        onClick={() => setSelectedImage(item)}
                      >
                        <div className="relative w-full h-28">
                          <Image
                            src={item.url || item.imageUrl || item.publicId}
                            alt={item.description || 'Imagen'}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        {item.description && (
                          <p className="text-xs text-gray-600 px-2 py-1 truncate bg-white">{item.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Certificaciones */}
              {certifications?.length > 0 && (
                <Section title={`Certificaciones / Homologaciones (${certifications.length})`}>
                  <div className="space-y-2 pt-2">
                    {certifications.map((cert) => (
                      <div key={cert.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                        <div className="shrink-0 w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{cert.description || 'Certificación'}</p>
                          {cert.url && (
                            <a
                              href={cert.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Ver documento
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Lightbox imagen galería */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-60 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative w-full h-96 rounded-xl overflow-hidden">
              <Image
                src={selectedImage.url || selectedImage.imageUrl || selectedImage.publicId}
                alt={selectedImage.description || 'Imagen'}
                fill
                className="object-contain bg-black"
              />
            </div>
            {selectedImage.description && (
              <p className="text-white text-center text-sm mt-3">{selectedImage.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CompanyProfileModal;
