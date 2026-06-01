import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

// Auto-detect giá trị phù hợp
function getValue(item) {
    return item.totalDuration ?? item.duration ?? item.count ?? item.plays ?? item.listens ?? item.value ?? 0;
}

export default function ListeningChart({ data }) {
    const labels = data.map((item) => item.day ?? item.date ?? item.label);
    const values = data.map((item) => getValue(item));

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Thống kê',
                data: values,
                borderColor: '#4A90E2',
                backgroundColor: 'rgba(74, 144, 226, 0.3)',
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 4,
                // fill: true,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
        },
    };

    return <Line data={chartData} options={options} />;
}
