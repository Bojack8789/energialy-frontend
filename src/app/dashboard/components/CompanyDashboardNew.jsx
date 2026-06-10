"use client";
import { useState, useEffect, useMemo } from "react";
import Buttons from "./Buttons";
import Chat from "@/app/components/Chat";
import { useGetProposalsQuery } from "@/app/redux/services/ProposalApi";
import { useGetTendersQuery } from "@/app/redux/services/tendersApi";
import { useGetCompanyMetricsQuery } from "@/app/redux/services/metricsApi";
import { getCompanyId } from "@/app/Func/sessionStorage";
import PeriodSelector from "@/app/components/dashboard/PeriodSelector";
import SubscriptionWidgets from "@/app/components/dashboard/SubscriptionWidgets";

// Importar nuestros componentes UI
import {
  MetricsGrid,
  BarChartCard,
  DonutChartCard,
  LineChartCard,
  TableCard
} from "@/app/components/ui";

function CompanyDashboardNew({ user }) {
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [userProposals, setUserProposals] = useState([]);
  const [proposalsToUser, setProposalsToUser] = useState([]);
  const [userTenders, setUserTenders] = useState([]);

  const { data: proposals, isLoading: loadingProposals } = useGetProposalsQuery();
  const { data: tenders, isLoading: loadingTenders } = useGetTendersQuery();

  // Obtener métricas del backend
  const { data: metricsData, isLoading: loadingMetrics } = useGetCompanyMetricsQuery({
    companyId: user?.company?.id,
    days: selectedPeriod,
  }, {
    skip: !user?.company?.id,
  });

  const companyId = getCompanyId();

  useEffect(() => {
    if (user.company) {
      setUserProposals(proposals?.filter((proposal) => proposal.company?.id === user.company.id) || []);
      setProposalsToUser(proposals?.filter((proposal) => proposal.tender?.Company?.id === user.company.id) || []);
      setUserTenders(tenders?.filter((tender) => tender.company?.id === user.company.id) || []);
    }
  }, [proposals, tenders, user.company]);

  // Calcular porcentaje de cambio basado en período
  const calculateChange = (current, total) => {
    if (total === 0) return 0;
    return ((current / total) * 100).toFixed(1);
  };

  // Preparar datos para las métricas usando datos reales
  const metrics = useMemo(() => {
    const tendersInPeriod = metricsData?.tenders?.inPeriod || 0;
    const tendersTotal = metricsData?.tenders?.total || userTenders.length;
    const proposalsInPeriod = metricsData?.proposals?.inPeriod || 0;
    const proposalsTotal = metricsData?.proposals?.total || userProposals.length;

    return [
      {
        title: "Licitaciones Activas",
        value: tendersTotal.toString(),
        change: tendersInPeriod > 0 ? `+${calculateChange(tendersInPeriod, tendersTotal)}%` : "0%",
        changeType: tendersInPeriod > 0 ? "positive" : "neutral",
        subtitle: `${tendersInPeriod} en últimos ${selectedPeriod} días`,
      icon: (
        <svg className="fill-primary dark:fill-white" width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 15.1156C4.19376 15.1156 0.825012 8.61876 0.687512 8.34376C0.584387 8.13751 0.584387 7.86251 0.687512 7.65626C0.825012 7.38126 4.19376 0.918762 11 0.918762C17.8063 0.918762 21.175 7.38126 21.3125 7.65626C21.4156 7.86251 21.4156 8.13751 21.3125 8.34376C21.175 8.61876 17.8063 15.1156 11 15.1156ZM2.26876 8.00001C3.02501 9.27189 5.98126 13.5688 11 13.5688C16.0188 13.5688 18.975 9.27189 19.7313 8.00001C18.975 6.72814 16.0188 2.43126 11 2.43126C5.98126 2.43126 3.02501 6.72814 2.26876 8.00001Z" fill=""/>
          <path d="M11 10.9219C9.38438 10.9219 8.07812 9.61562 8.07812 8C8.07812 6.38438 9.38438 5.07812 11 5.07812C12.6156 5.07812 13.9219 6.38438 13.9219 8C13.9219 9.61562 12.6156 10.9219 11 10.9219ZM11 6.625C10.2437 6.625 9.625 7.24375 9.625 8C9.625 8.75625 10.2437 9.375 11 9.375C11.7563 9.375 12.375 8.75625 12.375 8C12.375 7.24375 11.7563 6.625 11 6.625Z" fill=""/>
        </svg>
      ),
      },
      {
        title: "Propuestas Enviadas",
        value: proposalsTotal.toString(),
        change: proposalsInPeriod > 0 ? `+${calculateChange(proposalsInPeriod, proposalsTotal)}%` : "0%",
        changeType: proposalsInPeriod > 0 ? "positive" : "neutral",
        subtitle: `${proposalsInPeriod} en últimos ${selectedPeriod} días`,
      icon: (
        <svg className="fill-primary dark:fill-white" width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.7531 16.4312C10.3781 16.4312 9.27808 15.3312 9.27808 13.9562C9.27808 12.5812 10.3781 11.4812 11.7531 11.4812C13.1281 11.4812 14.2281 12.5812 14.2281 13.9562C14.2281 15.3312 13.1281 16.4312 11.7531 16.4312ZM11.7531 12.7812C11.0968 12.7812 10.5781 13.3 10.5781 13.9562C10.5781 14.6125 11.0968 15.1312 11.7531 15.1312C12.4094 15.1312 12.9281 14.6125 12.9281 13.9562C12.9281 13.3 12.4094 12.7812 11.7531 12.7812Z" fill=""/>
          <path d="M11.7531 21.7187C7.99686 21.7187 4.98436 18.7062 4.98436 14.95V7.09999C4.98436 3.34374 7.99686 0.331238 11.7531 0.331238C15.5094 0.331238 18.5219 3.34374 18.5219 7.09999V14.95C18.5219 18.7062 15.5094 21.7187 11.7531 21.7187ZM11.7531 1.63124C8.71561 1.63124 6.28436 4.06249 6.28436 7.09999V14.95C6.28436 17.9875 8.71561 20.4187 11.7531 20.4187C14.7906 20.4187 17.2219 17.9875 17.2219 14.95V7.09999C17.2219 4.06249 14.7906 1.63124 11.7531 1.63124Z" fill=""/>
        </svg>
      ),
      },
      {
        title: "Propuestas Recibidas",
        value: proposalsToUser.length.toString(),
        change: proposalsToUser.length > 0 ? "+15.3%" : "0%",
        changeType: proposalsToUser.length > 0 ? "positive" : "neutral",
        subtitle: "En mis licitaciones",
      icon: (
        <svg className="fill-primary dark:fill-white" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21.1063 18.0469L19.3875 3.23126C19.2157 1.71876 17.9438 0.584381 16.3969 0.584381H5.56878C4.05628 0.584381 2.78441 1.71876 2.57816 3.23126L0.859406 18.0469C0.756281 18.9063 1.03128 19.7313 1.61566 20.3844C2.20003 21.0375 2.99378 21.3813 3.85316 21.3813H18.1469C19.0063 21.3813 19.8 21.0375 20.3844 20.3844C20.9688 19.7313 21.2438 18.9063 21.1063 18.0469ZM19.2157 19.3531C18.9407 19.6625 18.5625 19.8344 18.1469 19.8344H3.85316C3.4375 19.8344 3.05941 19.6625 2.78441 19.3531C2.50941 19.0438 2.37191 18.6313 2.44066 18.2157L4.12503 3.43751C4.19378 2.71563 4.81253 2.16563 5.56878 2.16563H16.4313C17.1875 2.16563 17.8063 2.71563 17.875 3.43751L19.5594 18.2157C19.6281 18.6313 19.4906 19.0438 19.2157 19.3531Z" fill=""/>
          <path d="M14.0718 8.98126C13.4156 8.98126 12.8999 8.46563 12.8999 7.80938C12.8999 7.15313 13.4156 6.6375 14.0718 6.6375C14.7281 6.6375 15.2437 7.15313 15.2437 7.80938C15.2437 8.46563 14.7281 8.98126 14.0718 8.98126Z" fill=""/>
          <path d="M7.9281 8.98126C7.2718 8.98126 6.75617 8.46563 6.75617 7.80938C6.75617 7.15313 7.2718 6.6375 7.9281 6.6375C8.5843 6.6375 9.09992 7.15313 9.09992 7.80938C9.09992 8.46563 8.5843 8.98126 7.9281 8.98126Z" fill=""/>
        </svg>
      ),
      },
      {
        title: "Ingresos",
        value: "- USD",
        change: "0%",
        changeType: "neutral",
        subtitle: "Próximamente",
      icon: (
        <svg className="fill-primary dark:fill-white" width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.18418 8.03751C9.31543 8.03751 11.0686 6.35313 11.0686 4.25626C11.0686 2.15938 9.31543 0.475006 7.18418 0.475006C5.05293 0.475006 3.2998 2.15938 3.2998 4.25626C3.2998 6.35313 5.05293 8.03751 7.18418 8.03751ZM7.18418 2.05626C8.45605 2.05626 9.52168 3.05313 9.52168 4.29063C9.52168 5.52813 8.49043 6.52501 7.18418 6.52501C5.87793 6.52501 4.84668 5.52813 4.84668 4.29063C4.84668 3.05313 5.9123 2.05626 7.18418 2.05626Z" fill=""/>
          <path d="M15.8124 9.6875C17.6687 9.6875 19.1468 8.24375 19.1468 6.42188C19.1468 4.6 17.6343 3.15625 15.8124 3.15625C13.9905 3.15625 12.478 4.6 12.478 6.42188C12.478 8.24375 13.9905 9.6875 15.8124 9.6875ZM15.8124 4.7375C16.8093 4.7375 17.5999 5.49375 17.5999 6.45625C17.5999 7.41875 16.8093 8.175 15.8124 8.175C14.8155 8.175 14.0249 7.41875 14.0249 6.45625C14.0249 5.49375 14.8155 4.7375 15.8124 4.7375Z" fill=""/>
          <path d="M15.9843 10.0313H15.6749C14.6437 10.0313 13.6468 10.3406 12.7781 10.8563C11.8593 9.61876 10.3812 8.79376 8.73115 8.79376H5.67178C2.85303 8.82814 0.618652 11.0625 0.618652 13.8469V16.3219C0.618652 16.975 1.13428 17.4906 1.78741 17.4906H19.2312C19.8843 17.4906 20.4 16.975 20.4 16.3219V13.1625C20.4312 11.4719 18.9999 10.0313 15.9843 10.0313ZM2.16553 15.9438V13.8469C2.16553 11.8781 3.70178 10.3406 5.67178 10.3406H8.73115C10.7012 10.3406 12.2374 11.8781 12.2374 13.8469V15.9438H2.16553ZM18.8999 15.9438H13.7843V13.8469C13.7843 12.6094 13.3374 11.4719 12.6093 10.6219C13.0562 10.3813 13.5374 10.2625 14.0187 10.2625H15.6312C17.2218 10.2625 18.8999 11.7406 18.8999 13.1625V15.9438Z" fill=""/>
        </svg>
      ),
      },
    ];
  }, [metricsData, userTenders, userProposals, proposalsToUser, selectedPeriod]);

  // Preparar datos para gráfico de tendencias mensual con datos reales
  const monthlyData = useMemo(() => {
    if (!metricsData?.monthlySeries) {
      return [];
    }

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Crear un mapa con los últimos 6 meses
    const now = new Date();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      last6Months.push({
        key: monthKey,
        name: monthNames[date.getMonth()],
        licitaciones: 0,
        propuestas: 0
      });
    }

    // Llenar con datos reales de licitaciones
    metricsData.monthlySeries.tenders?.forEach(item => {
      const date = new Date(item.month);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthData = last6Months.find(m => m.key === monthKey);
      if (monthData) {
        monthData.licitaciones = parseInt(item.count);
      }
    });

    // Llenar con datos reales de propuestas
    metricsData.monthlySeries.proposals?.forEach(item => {
      const date = new Date(item.month);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthData = last6Months.find(m => m.key === monthKey);
      if (monthData) {
        monthData.propuestas = parseInt(item.count);
      }
    });

    return last6Months;
  }, [metricsData]);

  // Datos para gráfico de estados (CORREGIDO: usar valores reales del enum)
  const statusData = useMemo(() => {
    const statusMap = {
      published: { name: 'Publicadas', value: 0, color: '#3C50E0' },
      expired: { name: 'Expiradas', value: 0, color: '#FF5733' },
      working: { name: 'En Ejecución', value: 0, color: '#FFC107' },
      completed: { name: 'Completadas', value: 0, color: '#4CAF50' },
      cancelled: { name: 'Canceladas', value: 0, color: '#9E9E9E' },
    };

    userTenders.forEach(tender => {
      if (statusMap[tender.status]) {
        statusMap[tender.status].value++;
      }
    });

    return Object.values(statusMap).filter(item => item.value > 0);
  }, [userTenders]);

  // Datos para la tabla
  const tableData = useMemo(() => {
    return userTenders.slice(0, 5).map(tender => ({
      titulo: tender.title || 'Sin título',
      estado: tender.status === 'published' ? 'Publicada' :
              tender.status === 'expired' ? 'Expirada' :
              tender.status === 'working' ? 'En Ejecución' :
              tender.status === 'completed' ? 'Completada' :
              tender.status === 'cancelled' ? 'Cancelada' : 'Pendiente',
      fecha: new Date(tender.createdAt).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      propuestas: proposalsToUser.filter(p => p.tender.id === tender.id).length || 0,
    }));
  }, [userTenders, proposalsToUser]);

  const tableHeaders = ['Título', 'Estado', 'Fecha', 'Propuestas'];

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between bg-white dark:bg-boxdark rounded-lg p-4 sm:p-6 shadow-sm">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Hola, {user.firstName}
        </h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <PeriodSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
          <Buttons />
        </div>
      </div>

      {/* Widgets de Suscripción */}
      <SubscriptionWidgets
        companyId={user?.company?.id}
        selectedPeriod={selectedPeriod}
      />

      {/* Métricas principales */}
      <div className="mb-6">
        <MetricsGrid
          metrics={metrics}
          loading={loadingProposals || loadingTenders || loadingMetrics}
        />
      </div>

      {/* Gráficos */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <LineChartCard
          title="Tendencia Mensual"
          data={monthlyData}
          lines={[
            { dataKey: 'licitaciones', color: '#3C50E0', name: 'Licitaciones' },
            { dataKey: 'propuestas', color: '#80CAEE', name: 'Propuestas' }
          ]}
          showLegend={true}
          loading={loadingMetrics}
        />

        <DonutChartCard
          title="Estado de Licitaciones"
          data={statusData.filter(item => item.value > 0)}
          loading={loadingTenders}
          centerText={{
            value: userTenders.length,
            label: 'Total'
          }}
        />
      </div>

      {/* Tabla y Chat */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <TableCard
          title="Mis Licitaciones Recientes"
          headers={tableHeaders}
          data={tableData}
          loading={loadingTenders}
          emptyMessage="No tienes licitaciones creadas"
        />

        <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="h-[400px]">
            <Chat />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyDashboardNew;
