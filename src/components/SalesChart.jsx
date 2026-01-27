import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { parse, format, startOfWeek, endOfWeek, eachDayOfInterval, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

const SalesChart = ({ orders }) => {
    // Process data: Group sales by date (last 30 days usually, or all time)
    // For simplicity, let's show last 7 days sales + future projections based on due dates if needed, 
    // but typically sales charts show creation date or payment date.
    
    // Aggregate by Date
    const salesByDate = orders.reduce((acc, order) => {
        // Warning: order.date is "DD/MM/YYYY" string -> need parsing
        // Assuming format is DD/MM/YYYY. 
        // Logic: parse string -> normalized key -> sum total
        try {
            const [day, month, year] = order.date.split('/');
            const dateKey = `${year}-${month}-${day}`; // ISO for sorting
            
            if (!acc[dateKey]) acc[dateKey] = 0;
            acc[dateKey] += parseFloat(order.total);
        } catch(e) {}
        return acc;
    }, {});

    // Transform to Array
    const data = Object.keys(salesByDate).sort().map(date => ({
        date,
        total: salesByDate[date],
        displayDate: format(new Date(date), 'dd MMM', { locale: es })
    }));

    return (
        <div className="h-[300px] w-full bg-slate-800 p-4 rounded-xl border border-slate-700">
            <h3 className="text-slate-400 text-sm font-bold mb-4 uppercase">Ventas (Histórico)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="displayDate" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} unit="$" />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                        formatter={(value) => [`$${value}`, 'Ventas']}
                    />
                    <Area type="monotone" dataKey="total" stroke="#F59E0B" fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SalesChart;
