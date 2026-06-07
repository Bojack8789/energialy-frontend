export const annualRevenueOptions = ['No Revelado', '0 - 10M U$S', '10M - 100M U$D', '100M - 1B U$S', '+1B U$S'];

export const employeeCountOptions = [
  'Menos de 50 empleados',
  'De 50 a 200 empleados',
  'De 200 a 1000 empleados',
  'De 1000 a 5000 empleados',
  'Mas de 5000 empleados',
];

export const organizationTypes = [
  'Organismo Público',
  'Operadora',
  'PyME',
  'Cámara/Cluster/Federación',
  'Profesional independiente',
  'Servicios especiales',
];

export const tendersTypes = [
  'Licitación área (Licitación pública de área)',
  'Servicio completo (Desarrollo total de un proyecto)',
  'Individual (Servicio específico en un proyecto)',
];

export const duration = ['Menos de una semana', 'Menos de un mes', 'De 1 a 3 meses', 'De 3 a 6 meses', 'Más de 6 meses'];

export const etapa = ['Upstream', 'Midstream', 'Downstream'];

// Datos de ejemplo para cuando no hay conectividad con la API
export const exampleCategories = [
  {
    id: 1,
    name: 'Perforación y Completación',
    subcategories: [
      { id: 1, name: 'Perforación direccional', CategoryId: 1 },
      { id: 2, name: 'Cementación', CategoryId: 1 },
      { id: 3, name: 'Servicios de lodo', CategoryId: 1 },
      { id: 4, name: 'Tubería de revestimiento', CategoryId: 1 }
    ]
  },
  {
    id: 2,
    name: 'Producción',
    subcategories: [
      { id: 5, name: 'Bombas de subsuelo', CategoryId: 2 },
      { id: 6, name: 'Tratamiento de agua', CategoryId: 2 },
      { id: 7, name: 'Facilidades de superficie', CategoryId: 2 },
      { id: 8, name: 'Medición y control', CategoryId: 2 }
    ]
  },
  {
    id: 3,
    name: 'Transporte y Logística',
    subcategories: [
      { id: 9, name: 'Transporte de personal', CategoryId: 3 },
      { id: 10, name: 'Transporte de equipos', CategoryId: 3 },
      { id: 11, name: 'Logística integral', CategoryId: 3 },
      { id: 12, name: 'Almacenamiento', CategoryId: 3 }
    ]
  },
  {
    id: 4,
    name: 'Medio Ambiente y Seguridad',
    subcategories: [
      { id: 13, name: 'Estudios ambientales', CategoryId: 4 },
      { id: 14, name: 'Seguridad industrial', CategoryId: 4 },
      { id: 15, name: 'Gestión de residuos', CategoryId: 4 },
      { id: 16, name: 'Monitoreo ambiental', CategoryId: 4 }
    ]
  }
];

export const exampleLocations = [
  { id: 1, name: 'Neuquén, Argentina' },
  { id: 2, name: 'Mendoza, Argentina' },
  { id: 3, name: 'Santa Cruz, Argentina' },
  { id: 4, name: 'Chubut, Argentina' },
  { id: 5, name: 'Río Negro, Argentina' },
  { id: 6, name: 'Buenos Aires, Argentina' },
  { id: 7, name: 'Córdoba, Argentina' },
  { id: 8, name: 'Salta, Argentina' },
  { id: 9, name: 'Tierra del Fuego, Argentina' },
  { id: 10, name: 'La Pampa, Argentina' }
];

export const urlProduction = process.env.NEXT_PUBLIC_BASE_URL;
