import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LineChartCard = ({ 
  title, 
  data = [], 
  dataKey = "value", 
  xAxisKey = "name",
  color = "#8b5cf6",
  lines = null, // Para múltiples líneas
  height = 300,
  icon,
  className = "",
  showLegend = false,
  loading = false
}) => {
  // Si loading, mostrar skeleton
  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-stroke py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark ${className}`}>
        <div className="animate-pulse">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-stroke py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark ${className}`}>
      <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4 mb-4">
        {icon || (
          <svg
            className="fill-primary dark:fill-white"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 13L9 7L13 11L21 3M21 3H15M21 3V9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-title-md font-bold text-black dark:text-white">
            {title}
          </h4>
        </div>
      </div>

      <div className="mt-6" style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-body dark:stroke-bodydark" />
            <XAxis 
              dataKey={xAxisKey}
              className="text-sm text-body dark:text-bodydark"
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              className="text-sm text-body dark:text-bodydark"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{ color: '#374151' }}
            />
            {showLegend && <Legend />}
            
            {/* Renderizar múltiples líneas si se proporcionan */}
            {lines ? (
              lines.map((line, index) => (
                <Line 
                  key={index}
                  type="monotone" 
                  dataKey={line.dataKey} 
                  stroke={line.color}
                  strokeWidth={2}
                  dot={{ fill: line.color, r: 4 }}
                  activeDot={{ r: 6, fill: line.color }}
                  name={line.name || line.dataKey}
                />
              ))
            ) : (
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, r: 4 }}
                activeDot={{ r: 6, fill: color }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChartCard;
