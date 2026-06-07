# Componentes UI TailAdmin

Esta biblioteca contiene componentes UI reutilizables con la estética de TailAdmin para gráficos, tarjetas y elementos del dashboard.

## Componentes Disponibles

### Cards (Tarjetas)

#### StatCard
Tarjeta de estadística simple con icono, valor y cambio porcentual.

```jsx
import { StatCard } from '@/app/components/ui';

<StatCard
  title="Total de Usuarios"
  value="1,250"
  change="+12.5%"
  changeType="positive"
  subtitle="Este mes"
  icon={<YourIcon />}
  loading={false}
/>
```

#### MetricsGrid
Grid de métricas múltiples con layout responsivo.

```jsx
import { MetricsGrid } from '@/app/components/ui';

const metrics = [
  {
    title: "Ventas",
    value: "1,250",
    change: "+12.5%",
    changeType: "positive",
    subtitle: "Este mes",
    icon: <YourIcon />
  },
  // ... más métricas
];

<MetricsGrid metrics={metrics} loading={false} />
```

#### TableCard
Tabla con estilo TailAdmin y acciones personalizables.

```jsx
import { TableCard } from '@/app/components/ui';

<TableCard
  title="Lista de Usuarios"
  headers={['Nombre', 'Email', 'Estado']}
  data={[
    { nombre: 'Juan', email: 'juan@email.com', estado: 'Activo' },
    // ... más datos
  ]}
  actions={(row, index) => (
    <button onClick={() => edit(row)}>Editar</button>
  )}
  loading={false}
/>
```

#### ProgressCard
Tarjeta con indicador de progreso circular.

```jsx
import { ProgressCard } from '@/app/components/ui';

<ProgressCard
  title="Progreso del Proyecto"
  percentage={75}
  value={75}
  total={100}
  color="#3C50E0"
  loading={false}
/>
```

### Charts (Gráficos)

#### BarChartCard
Gráfico de barras con tooltips y leyenda.

```jsx
import { BarChartCard } from '@/app/components/ui';

const data = [
  { name: 'Ene', ventas: 4000 },
  { name: 'Feb', ventas: 3000 },
  // ... más datos
];

<BarChartCard
  title="Ventas Mensuales"
  data={data}
  dataKey="ventas"
  xAxisKey="name"
  color="#3C50E0"
  height={350}
  loading={false}
/>
```

#### LineChartCard
Gráfico de líneas con múltiples series.

```jsx
import { LineChartCard } from '@/app/components/ui';

<LineChartCard
  title="Tendencias"
  data={data}
  lines={[
    { dataKey: 'ventas', color: '#3C50E0', name: 'Ventas' },
    { dataKey: 'gastos', color: '#80CAEE', name: 'Gastos' }
  ]}
  showLegend={true}
  loading={false}
/>
```

#### DonutChartCard
Gráfico circular con centro personalizable.

```jsx
import { DonutChartCard } from '@/app/components/ui';

const data = [
  { name: 'Activos', value: 400 },
  { name: 'Inactivos', value: 300 },
];

<DonutChartCard
  title="Estado de Usuarios"
  data={data}
  colors={['#3C50E0', '#6577F3', '#8FD0EF']}
  centerText={{ value: '700', label: 'Total' }}
  loading={false}
/>
```

#### AreaChartCard
Gráfico de área con gradiente.

```jsx
import { AreaChartCard } from '@/app/components/ui';

<AreaChartCard
  title="Ingresos Mensuales"
  data={data}
  dataKey="ingresos"
  color="#3C50E0"
  loading={false}
/>
```

#### ComposedChartCard
Gráfico combinado con barras, líneas y áreas.

```jsx
import { ComposedChartCard } from '@/app/components/ui';

<ComposedChartCard
  title="Análisis Completo"
  data={data}
  bars={[{ dataKey: 'ventas', fill: '#3C50E0', name: 'Ventas' }]}
  lines={[{ dataKey: 'meta', stroke: '#FF5733', name: 'Meta' }]}
  areas={[{ dataKey: 'area', fill: '#3C50E040', stroke: '#3C50E0', name: 'Área' }]}
  loading={false}
/>
```

## Características

- **Tema Dark/Light**: Todos los componentes soportan el modo oscuro de TailAdmin
- **Responsive**: Diseño adaptable a diferentes tamaños de pantalla
- **Loading States**: Estados de carga con skeleton animations
- **Tooltips**: Tooltips personalizados con estilo TailAdmin
- **Accesibilidad**: Componentes accesibles con ARIA labels
- **TypeScript Ready**: Preparado para TypeScript (agregue tipos según necesidad)

## Paleta de Colores TailAdmin

- **Primary**: `#3C50E0`
- **Secondary**: `#6577F3`
- **Success**: `#10B981`
- **Warning**: `#F59E0B`
- **Danger**: `#EF4444`
- **Info**: `#06B6D4`

## Instalación de Dependencias

Estos componentes requieren:

```bash
npm install recharts
```

## Estructura de Archivos

```
src/app/components/ui/
├── cards/
│   ├── StatCard.jsx
│   ├── MetricsGrid.jsx
│   ├── TableCard.jsx
│   └── ProgressCard.jsx
├── charts/
│   ├── BarChartCard.jsx
│   ├── LineChartCard.jsx
│   ├── DonutChartCard.jsx
│   ├── AreaChartCard.jsx
│   └── ComposedChartCard.jsx
└── index.js
```

## Uso Recomendado

1. **Import centralizado**: Use `import { ComponentName } from '@/app/components/ui'`
2. **Consistencia**: Use la misma paleta de colores en toda la aplicación
3. **Loading states**: Siempre maneje los estados de carga
4. **Responsividad**: Use los grids de TailAdmin para layouts responsivos
