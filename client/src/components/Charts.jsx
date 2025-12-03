import React from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom'
    },
    title: {
      display: false
    }
  }
}

export function BarChart({ data }) {
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        label: '数量',
        data: data.map(item => item.value),
        backgroundColor: data.map(item => item.color || '#3b82f6'),
        borderColor: data.map(item => item.color || '#3b82f6'),
        borderWidth: 1,
      },
    ],
  }

  return <Bar data={chartData} options={chartOptions} />
}

export function DoughnutChart({ data }) {
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: data.map(item => item.color || '#3b82f6'),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  }

  const options = {
    ...chartOptions,
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    cutout: '60%'
  }

  return <Doughnut data={chartData} options={options} />
}

export function LineChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: '完成任务数',
        data: data.data,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  return <Line data={chartData} options={chartOptions} />
}