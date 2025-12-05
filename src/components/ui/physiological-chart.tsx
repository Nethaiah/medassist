import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';
import { PhysiologicalImpact } from '@/lib/types';

interface Props {
  data?: PhysiologicalImpact[];
}

export const PhysiologicalChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-gray-400 text-sm p-4 text-center">No physiological simulation data available</div>;

  return (
    <div className="w-full h-64 relative bg-white rounded-lg p-2">
      <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider text-center">Physiological Risk Simulator</h4>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="parameter" tick={{ fill: '#64748b', fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Baseline"
            dataKey="baseline"
            stroke="#94a3b8"
            fill="#94a3b8"
            fillOpacity={0.3}
          />
          <Radar
            name="Predicted Impact"
            dataKey="predicted"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.5}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: 'none', fontSize: '12px' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};