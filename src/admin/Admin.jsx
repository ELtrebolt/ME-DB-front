import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './Admin.css';

const constants = require('../app/constants');

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LINE_COLOR = '#ffc107';
const GRID_COLOR = 'rgba(229, 231, 235, 0.15)';
const TICK_COLOR = '#e5e7eb';

function buildLineData(label, entries, xKey, color) {
  return {
    labels: entries.map(e => e[xKey]),
    datasets: [
      {
        label,
        data: entries.map(e => e.count),
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

function buildLineOptions(yTitle) {
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
        ticks: { color: TICK_COLOR, stepSize: 1 },
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

function avg(arr) {
  if (!arr.length) return 0;
  return Math.round(arr.reduce((s, d) => s + d.count, 0) / arr.length);
}

function formatDate(iso) {
  if (!iso) return <span className="admin-no-email">—</span>;
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function ChartBlock({ title, entries, xKey, yTitle, color }) {
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
            <Line data={buildLineData(title, entries, xKey, color)} options={buildLineOptions(yTitle)} />
          </div>
        ) : (
          <div className="admin-chart-empty">No data for this range</div>
        )
      )}
    </div>
  );
}

function UsersTable() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('lastActiveAt');
  const [order, setOrder] = useState('desc');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(
      `${constants.SERVER_URL}/api/admin/users?page=${page}&sort=${sort}&order=${order}`,
      { withCredentials: true }
    )
      .then(res => { if (res.data.success) setData(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, sort, order]);

  const SORT_FIELDS = ['lastActiveAt', 'createdAt', 'totalRecords'];

  const handleSort = (field) => {
    if (!SORT_FIELDS.includes(field)) return;
    if (sort === field) {
      setOrder(o => o === 'desc' ? 'asc' : 'desc');
    } else {
      setSort(field);
      setOrder('desc');
    }
    setPage(1);
  };

  const sortIcon = (field) => {
    if (sort !== field) return <span className="admin-sort-icon inactive">↕</span>;
    return <span className="admin-sort-icon">{order === 'desc' ? '↓' : '↑'}</span>;
  };

  return (
    <div className="admin-chart-block admin-users-block">
      <div className="admin-users-header">
        <h2>All Users</h2>
        <div className="admin-users-controls">
          {data && (
            <span className="admin-users-page-info">
              Page {data.page} of {data.totalPages} ({data.total} total)
            </span>
          )}
          <button
            className="admin-page-btn"
            onClick={() => setPage(p => p - 1)}
            disabled={!data || page <= 1}
            aria-label="Previous page"
          >
            &#8592;
          </button>
          <button
            className="admin-page-btn"
            onClick={() => setPage(p => p + 1)}
            disabled={!data || page >= data.totalPages}
            aria-label="Next page"
          >
            &#8594;
          </button>
        </div>
      </div>
      {loading ? (
        <div className="admin-users-loading">
          <div className="spinner-border spinner-border-sm text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="admin-table-scroll">
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Display Name</th>
              <th>Email</th>
              <th
                className="admin-sort-col"
                onClick={() => handleSort('lastActiveAt')}
              >
                Last Active {sortIcon('lastActiveAt')}
              </th>
              <th
                className="admin-sort-col"
                onClick={() => handleSort('createdAt')}
              >
                Joined {sortIcon('createdAt')}
              </th>
              <th
                className="admin-sort-col admin-total-records"
                onClick={() => handleSort('totalRecords')}
              >
                Total Records {sortIcon('totalRecords')}
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.users.map((u, i) => (
              <tr key={u._id || i}>
                <td>{(data.page - 1) * 10 + i + 1}</td>
                <td>{u.displayName}</td>
                <td>{u.email || <span className="admin-no-email">—</span>}</td>
                <td>{formatDate(u.lastActiveAt)}</td>
                <td>{formatDate(u.createdAt)}</td>
                <td className="admin-total-records">{u.totalRecords ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}

const Admin = () => {
  const [range, setRange] = useState(30);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `${constants.SERVER_URL}/api/admin/stats?range=${range}`,
          { withCredentials: true }
        );
        if (res.data.success) {
          setStats(res.data);
        } else {
          setError('Failed to load admin stats.');
        }
      } catch (err) {
        if (err.response?.status === 403) {
          setError('Access denied.');
        } else {
          setError('Error loading admin stats.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [range]);

  if (loading) {
    return (
      <div className="admin-empty">
        <div className="text-center">
          <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="admin-loading-text">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-empty">
        <div className="alert alert-danger" role="alert">{error}</div>
      </div>
    );
  }

  const avgDAU = avg(stats.dailyActiveUsers);
  const avgMAU = avg(stats.monthlyActiveUsers);
  const totalSignups = stats.newSignupsPerDay.reduce((s, d) => s + d.count, 0);

  return (
    <div className="admin-dashboard">
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

      <div className="admin-stat-cards">
        <div className="admin-stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-label">Avg Daily Active</div>
          <div className="stat-value">{avgDAU.toLocaleString()}</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-label">Avg Monthly Active</div>
          <div className="stat-value">{avgMAU.toLocaleString()}</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-label">New Signups (range)</div>
          <div className="stat-value">{totalSignups.toLocaleString()}</div>
        </div>
      </div>

      <div className="admin-charts">
        <UsersTable />

        <ChartBlock
          title="Daily Active Users"
          entries={stats.dailyActiveUsers}
          xKey="date"
          yTitle="Users"
          color={LINE_COLOR}
        />
        <ChartBlock
          title="Monthly Active Users"
          entries={stats.monthlyActiveUsers}
          xKey="month"
          yTitle="Users"
          color="#4ECDC4"
        />
        <ChartBlock
          title="New Signups Per Day"
          entries={stats.newSignupsPerDay}
          xKey="date"
          yTitle="Signups"
          color="#74b9ff"
        />
      </div>
    </div>
  );
};

export default Admin;
