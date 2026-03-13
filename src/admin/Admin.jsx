import React, { useState } from 'react';
import PageMeta from '../app/components/ui/PageMeta';
import { Line } from 'react-chartjs-2';
import '../app/components/stats/chartConfig';
import './Admin.css';
import UsersTab from './UsersTab';
import PerfTab from './PerfTab';

export const LINE_COLOR = '#ffc107';
export const GRID_COLOR = 'rgba(229, 231, 235, 0.15)';
export const TICK_COLOR = '#e5e7eb';

export function buildLineData(label, entries, xKey, color, yKey = 'count') {
  return {
    labels: entries.map(e => e[xKey]),
    datasets: [
      {
        label,
        data: entries.map(e => e[yKey]),
        borderColor: color,
        backgroundColor: color + '33',
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
      },
    ],
  };
}

export function buildLineOptions(yTitle) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: TICK_COLOR, precision: 0 },
        title: { display: true, text: yTitle, color: TICK_COLOR },
        grid: { color: GRID_COLOR },
      },
      x: {
        ticks: { color: TICK_COLOR, maxRotation: 45, minRotation: 0 },
        grid: { color: GRID_COLOR },
      },
    },
  };
}

export function ChartBlock({ title, entries, xKey, yTitle, color, yKey = 'count' }) {
  const [open, setOpen] = useState(true);
  const hasData = entries.length > 0;

  return (
    <div className="admin-chart-block">
      <button className="admin-chart-header" onClick={() => setOpen(o => !o)}>
        <h2>{title}</h2>
        <span className={`admin-chart-toggle${open ? '' : ' admin-chart-toggle--closed'}`}>▾</span>
      </button>
      {open && (
        hasData ? (
          <div className="admin-chart-wrapper">
            <Line data={buildLineData(title, entries, xKey, color, yKey)} options={buildLineOptions(yTitle)} />
          </div>
        ) : (
          <div className="admin-chart-empty">No data for this range</div>
        )
      )}
    </div>
  );
}

const Admin = () => {
  const [range, setRange] = useState(30);
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="admin-dashboard">
      <PageMeta title="Admin" />
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <select
          className="admin-range-select"
          value={range}
          onChange={e => setRange(Number(e.target.value))}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'users' ? 'admin-tab--active' : ''}`}
          onClick={() => setActiveTab('users')}
        >Users</button>
        <button
          className={`admin-tab ${activeTab === 'perf' ? 'admin-tab--active' : ''}`}
          onClick={() => setActiveTab('perf')}
        >Performance</button>
      </div>

      {activeTab === 'users' && <UsersTab range={range} />}
      {activeTab === 'perf' && <PerfTab range={range} />}
    </div>
  );
};

export default Admin;
