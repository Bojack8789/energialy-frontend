"use client";

import React, { useState } from 'react';
import { useGetAdminMetricsQuery } from '@/app/redux/services/metricsApi';
import PeriodSelector from '@/app/components/dashboard/PeriodSelector';

const StatsCard = ({ title, value, icon, color = "primary", loading = false }) => {
  const colorClasses = {
    primary: "bg-primary",
    meta: {
      3: "bg-meta-3",
      5: "bg-meta-5",
      6: "bg-meta-6",
      7: "bg-meta-7"
    }
  };

  const bgColor = typeof color === 'string' ? colorClasses[color] : colorClasses.meta[color];

  if (loading) {
    return (
      <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4 animate-pulse">
          <div className={`h-8 w-8 rounded-full ${bgColor}`}></div>
        </div>
        <div className="mt-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${bgColor}`}>
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-title-md font-bold text-black dark:text-white">
            {value}
          </h4>
          <span className="text-sm font-medium">{title}</span>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  // Obtener métricas del backend
  const { data: metricsData, isLoading } = useGetAdminMetricsQuery(selectedPeriod);

  // Calcular estadísticas desde los datos reales
  const totalTenders = metricsData?.tenders?.total || 0;
  const totalProposals = metricsData?.proposals?.total || 0;
  const acceptedProposals = metricsData?.proposals?.accepted || 0;
  const subscriptionDistribution = metricsData?.subscriptions || [];

  // Calcular ingresos estimados (basado en suscripciones activas)
  const estimatedRevenue = subscriptionDistribution.reduce((acc, sub) => {
    // Asumiendo precios aproximados por plan
    const prices = { 'BASE': 50, 'PLUS': 100, 'PREMIUM': 200 };
    const planName = sub['Subscription.name']?.toUpperCase() || 'BASE';
    const count = parseInt(sub.count) || 0;
    const price = prices[planName] || 0;
    return acc + (count * price);
  }, 0);

  return (
    <div>
      {/* Selector de período */}
      <div className="mb-6 flex justify-end">
        <PeriodSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <StatsCard
          title={`Licitaciones (${selectedPeriod}d)`}
          value={totalTenders.toString()}
          color="primary"
          loading={isLoading}
        icon={
          <svg
            className="fill-primary dark:fill-white"
            width="22"
            height="16"
            viewBox="0 0 22 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11 15.1156C4.19376 15.1156 0.825012 8.61876 0.687512 8.34376C0.584387 8.13751 0.584387 7.86251 0.687512 7.65626C0.825012 7.38126 4.19376 0.918762 11 0.918762C17.8063 0.918762 21.175 7.38126 21.3125 7.65626C21.4156 7.86251 21.4156 8.13751 21.3125 8.34376C21.175 8.61876 17.8063 15.1156 11 15.1156ZM2.26876 8.00001C3.02501 9.27189 5.98126 13.5688 11 13.5688C16.0188 13.5688 18.975 9.27189 19.7313 8.00001C18.975 6.72814 16.0188 2.43126 11 2.43126C5.98126 2.43126 3.02501 6.72814 2.26876 8.00001Z"
              fill=""
            />
            <path
              d="M11 10.9219C9.38438 10.9219 8.07812 9.61562 8.07812 8C8.07812 6.38438 9.38438 5.07812 11 5.07812C12.6156 5.07812 13.9219 6.38438 13.9219 8C13.9219 9.61562 12.6156 10.9219 11 10.9219ZM11 6.625C10.2437 6.625 9.625 7.24375 9.625 8C9.625 8.75625 10.2437 9.375 11 9.375C11.7563 9.375 12.375 8.75625 12.375 8C12.375 7.24375 11.7563 6.625 11 6.625Z"
              fill=""
            />
          </svg>
        }
      />

        <StatsCard
          title={`Propuestas (${selectedPeriod}d)`}
          value={totalProposals.toString()}
          color={3}
          loading={isLoading}
        icon={
          <svg
            className="fill-primary dark:fill-white"
            width="20"
            height="22"
            viewBox="0 0 20 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.7531 16.4312C10.3781 16.4312 9.27808 17.5312 9.27808 18.9062C9.27808 20.2812 10.3781 21.3812 11.7531 21.3812C13.1281 21.3812 14.2281 20.2812 14.2281 18.9062C14.2281 17.5656 13.1281 16.4312 11.7531 16.4312ZM11.7531 19.8687C11.2375 19.8687 10.7906 19.4218 10.7906 18.9062C10.7906 18.3906 11.2375 17.9437 11.7531 17.9437C12.2687 17.9437 12.7156 18.3906 12.7156 18.9062C12.7156 19.4218 12.2343 19.8687 11.7531 19.8687Z"
              fill=""
            />
            <path
              d="M5.22183 16.4312C3.84683 16.4312 2.74683 17.5312 2.74683 18.9062C2.74683 20.2812 3.84683 21.3812 5.22183 21.3812C6.59683 21.3812 7.69683 20.2812 7.69683 18.9062C7.69683 17.5656 6.59683 16.4312 5.22183 16.4312ZM5.22183 19.8687C4.7062 19.8687 4.25933 19.4218 4.25933 18.9062C4.25933 18.3906 4.7062 17.9437 5.22183 17.9437C5.73746 17.9437 6.18433 18.3906 6.18433 18.9062C6.18433 19.4218 5.7062 19.8687 5.22183 19.8687Z"
              fill=""
            />
            <path
              d="M19.0062 0.618744H17.15C16.325 0.618744 15.6031 1.23749 15.5 2.06249L14.95 6.01562H1.37185C1.0281 6.01562 0.684353 6.18749 0.443728 6.46249C0.237478 6.73749 0.134353 7.11562 0.237478 7.45937L2.36873 13.9562C2.50623 14.4375 2.9531 14.7812 3.46873 14.7812H12.9562C13.4719 14.7812 13.9187 14.4375 14.0562 13.9562L16.1875 7.45937C16.2906 7.11562 16.1875 6.73749 15.9812 6.46249C15.7406 6.18749 15.4312 6.01562 15.0875 6.01562H8.6156L9.16873 2.06249C9.30623 1.23749 10.0281 0.618744 10.8531 0.618744H19.0062C19.4594 0.618744 19.8031 0.275 19.8031 0.00937439C19.8031 -0.324998 19.4594 -0.668748 19.0062 -0.668748ZM14.0219 13.2687H3.95935L2.13748 7.52812H14.8094L14.0219 13.2687Z"
              fill=""
            />
          </svg>
        }
      />

        <StatsCard
          title={`Propuestas Aceptadas`}
          value={acceptedProposals.toString()}
          color={5}
          loading={isLoading}
        icon={
          <svg
            className="fill-primary dark:fill-white"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.1063 18.0469L19.3875 3.23126C19.2157 1.71876 17.9438 0.584381 16.3969 0.584381H5.56878C4.05628 0.584381 2.78441 1.71876 2.57816 3.23126L0.859406 18.0469C0.756281 18.9063 1.03128 19.7313 1.61566 20.3844C2.20003 21.0375 2.99066 21.3813 3.85003 21.3813H18.1157C18.975 21.3813 19.8 21.0031 20.35 20.3844C20.9 19.7656 21.2094 18.9063 21.1063 18.0469ZM19.2157 19.3531C18.9407 19.6625 18.5625 19.8344 18.15 19.8344H3.85003C3.43753 19.8344 3.05941 19.6625 2.78441 19.3531C2.50941 19.0438 2.37191 18.6313 2.44066 18.2188L4.12503 3.43751C4.19378 2.71563 4.81253 2.16563 5.56878 2.16563H16.4313C17.1875 2.16563 17.8063 2.71563 17.875 3.43751L19.5938 18.2531C19.6282 18.6656 19.4907 19.0438 19.2157 19.3531Z"
              fill=""
            />
          </svg>
        }
      />

        <StatsCard
          title="Ingresos Estimados"
          value={`$${estimatedRevenue.toLocaleString()}`}
          color={6}
          loading={isLoading}
        icon={
          <svg
            className="fill-primary dark:fill-white"
            width="20"
            height="22"
            viewBox="0 0 20 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.7531 16.4312C10.3781 16.4312 9.27808 17.5312 9.27808 18.9062C9.27808 20.2812 10.3781 21.3812 11.7531 21.3812C13.1281 21.3812 14.2281 20.2812 14.2281 18.9062C14.2281 17.5656 13.1281 16.4312 11.7531 16.4312ZM11.7531 19.8687C11.2375 19.8687 10.7906 19.4218 10.7906 18.9062C10.7906 18.3906 11.2375 17.9437 11.7531 17.9437C12.2687 17.9437 12.7156 18.3906 12.7156 18.9062C12.7156 19.4218 12.2343 19.8687 11.7531 19.8687Z"
              fill=""
            />
          </svg>
          }
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
