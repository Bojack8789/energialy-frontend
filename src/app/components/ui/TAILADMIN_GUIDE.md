# TailAdmin UI Components Library - v2.0

Una biblioteca completa de componentes UI diseñados específicamente para seguir la estética y patrones de diseño de TailAdmin. Todos los componentes están optimizados para el panel de administrador de Energialy.

## 🎨 Componentes Disponibles

### 📊 Componentes de Datos

#### `StatCard`
Tarjetas de estadísticas con iconos, valores y tendencias.

```jsx
import { StatCard } from '../ui';

<StatCard
  title="Total Users"
  value="3,456"
  percentage="11.01%"
  trend="up"
  icon={<IconComponent />}
/>
```

#### `MetricsGrid`
Grid responsivo que organiza múltiples StatCards.

```jsx
import { MetricsGrid } from '../ui';

<MetricsGrid 
  metrics={metricsArray}
  className="mb-6" 
/>
```

#### `ProgressCard`
Tarjeta con indicador de progreso circular estilo TailAdmin.

```jsx
import { ProgressCard } from '../ui';

<ProgressCard
  title="Monthly Target"
  subtitle="Target you've set for each month"
  percentage={75.55}
  targetValue="20K"
  currentValue="20K"
  todayValue="20K"
/>
```

### 📈 Componentes de Gráficos

#### `BarChartCard`
Gráfico de barras con el estilo exacto de TailAdmin.

```jsx
import { BarChartCard } from '../ui';

<BarChartCard
  title="Monthly Sales"
  data={salesData}
  dataKey="value"
  height={350}
  barColor="#3C50E0"
/>
```

#### `DonutChartCard`
Gráfico de dona con leyenda y valor central.

```jsx
import { DonutChartCard } from '../ui';

<DonutChartCard
  title="Company Subscriptions"
  data={subscriptionData}
  centerValue="135"
  centerLabel="Total Companies"
  height={300}
/>
```

#### `AreaChartCard`
Gráfico de área con gradiente y pestañas opcionales.

```jsx
import { AreaChartCard } from '../ui';

<AreaChartCard
  title="Statistics"
  subtitle="Target you've set for each month"
  data={statisticsData}
  dataKey="value"
  height={350}
  showTabs={true}
  tabs={[
    { label: 'Overview', active: true },
    { label: 'Sales', active: false }
  ]}
/>
```

### 📋 Componentes de Tabla

#### `TableCard`
Tabla completa con búsqueda, filtros y paginación.

```jsx
import { TableCard } from '../ui';

const columns = [
  { header: 'Name', accessor: 'name', type: 'avatar' },
  { header: 'Email', accessor: 'email' },
  { header: 'Status', accessor: 'status', type: 'status' }
];

<TableCard
  title="Recent Orders"
  data={ordersData}
  columns={columns}
  showSearch={true}
  showFilter={true}
  searchPlaceholder="Search..."
  onRowClick={(row) => console.log(row)}
/>
```

## 🎯 Patrones de Diseño TailAdmin

### Colores
- **Primary**: `#3C50E0` (Azul principal)
- **Success**: `#10B981` (Verde éxito) 
- **Warning**: `#FFA70B` (Amarillo advertencia)
- **Danger**: `#F87171` (Rojo peligro)
- **Secondary**: `#80CAEE` (Azul secundario)

### Tipografía
- **Títulos**: `text-title-md2 font-semibold`
- **Subtítulos**: `text-xl font-semibold`
- **Texto cuerpo**: `text-sm font-medium`
- **Etiquetas**: `text-xs font-medium`

### Espaciado
- **Contenedores**: `p-4 md:p-6 2xl:p-10`
- **Cards**: `px-5 pt-7.5 pb-5` o `px-7.5 py-6`
- **Grid gaps**: `gap-4 md:gap-6 2xl:gap-7.5`

### Sombras y Bordes
- **Card shadow**: `shadow-default`
- **Bordes**: `border border-stroke dark:border-strokedark`
- **Radius**: `rounded-sm` para cards, `rounded-full` para badges

## 🌙 Soporte Dark Mode

Todos los componentes incluyen soporte completo para modo oscuro usando las clases de Tailwind:

```jsx
// Ejemplo de classes con dark mode
"bg-white dark:bg-boxdark text-black dark:text-white"
```

## 📱 Responsividad

Todos los componentes usan el sistema de grid responsivo de TailAdmin:

```jsx
// Grid responsivo
"grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4"

// Breakpoints específicos
"px-4 md:px-6 2xl:px-10"
```

## 🔧 Implementación en Páginas

### Dashboard Principal
```jsx
import { 
  StatCard, 
  BarChartCard, 
  DonutChartCard, 
  AreaChartCard, 
  TableCard, 
  ProgressCard, 
  MetricsGrid 
} from '../ui';

const TailAdminDashboard = () => {
  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <MetricsGrid metrics={metricsData} className="mb-6" />
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6 2xl:gap-7.5 mb-6">
        <div className="md:col-span-8">
          <BarChartCard title="Monthly Sales" data={salesData} dataKey="value" />
        </div>
        <div className="md:col-span-4">
          <ProgressCard title="Monthly Target" percentage={75.55} />
        </div>
      </div>
    </div>
  );
};
```

---

**Creado para Energialy** - Biblioteca de componentes UI estilo TailAdmin para el panel de administrador.
