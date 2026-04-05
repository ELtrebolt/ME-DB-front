import React, { useState, useEffect } from 'react';
import { api as axios } from '../app/api';
import { Bar } from 'react-chartjs-2';
import { ChartBlock, GRID_COLOR, TICK_COLOR } from './Admin';

import constants from '../app/constants';

const METRIC_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000, unit: 'ms' },
  CLS: { good: 100, poor: 250, unit: '×10⁻³' },
  INP: { good: 200, poor: 500, unit: 'ms' },
  TTFB: { good: 800, poor: 1800, unit: 'ms' },
};

const TREND_COLORS = {
  LCP: '#ffc107',
  CLS: '#22c55e',
  INP: '#f59e0b',
  TTFB: '#74b9ff',
};

function ratingClass(name, value) {
  const t = METRIC_THRESHOLDS[name];
  if (!t) return '';
  if (value <= t.good) return 'perf-good';
  if (value <= t.poor) return 'perf-needs-improvement';
  return 'perf-poor';
}

export default function PerfTab({ range }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    axios.get(`${constants.SERVER_URL}/api/admin/perf?range=${range}`)
      .then(res => {
        if (res.data.success) setData(res.data);
        else setError('Failed to load performance data.');
      })
      .catch(() => setError('Failed to load performance data.'))
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) {
    return (
      <div className="admin-users-loading">
        <div className="spinner-border spinner-border-sm text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) return <div className="admin-error" role="alert">{error}</div>;
  if (!data) return null;

  const { current, previous, trends } = data;

  if (!current.length && (!trends || !trends.length)) {
    return (
      <div className="admin-chart-empty" style={{ padding: '48px 0' }}>
        No performance data yet. Browse the app to generate metrics.
      </div>
    );
  }

  const globalMetrics = {};
  current.forEach(c => {
    if (!globalMetrics[c.name]) globalMetrics[c.name] = [];
    globalMetrics[c.name].push(c);
  });

  const summaryCards = ['LCP', 'CLS', 'INP', 'TTFB'].map(name => {
    const items = globalMetrics[name] || [];
    if (!items.length) return { name, p75: null, count: 0 };
    const allP75 = items.map(i => i.p75).filter(v => v != null);
    allP75.sort((a, b) => a - b);
    const median = allP75.length ? allP75[Math.floor(allP75.length / 2)] : null;
    const count = items.reduce((s, i) => s + i.count, 0);
    return { name, p75: median, count };
  });

  const lcpByRoute = (globalMetrics['LCP'] || [])
    .filter(r => r.p75 != null)
    .sort((a, b) => b.p75 - a.p75)
    .slice(0, 5);

  const slowestRoutesData = {
    labels: lcpByRoute.map(r => r.route),
    datasets: [{
      label: 'p75 LCP (ms)',
      data: lcpByRoute.map(r => Math.round(r.p75)),
      backgroundColor: lcpByRoute.map(r => {
        if (r.p75 <= 2500) return '#22c55e';
        if (r.p75 <= 4000) return '#f59e0b';
        return '#ef4444';
      }),
      borderRadius: 4,
    }],
  };

  const slowestRoutesOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: TICK_COLOR },
        grid: { color: GRID_COLOR },
        title: { display: true, text: 'p75 LCP (ms)', color: TICK_COLOR },
      },
      y: {
        ticks: { color: TICK_COLOR, font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  const prevMap = {};
  previous.forEach(p => { prevMap[`${p.name}|${p.route}`] = p; });

  const regressions = current
    .filter(c => {
      const prev = prevMap[`${c.name}|${c.route}`];
      return prev && prev.p75 > 0 && c.p75 != null;
    })
    .map(c => {
      const prev = prevMap[`${c.name}|${c.route}`];
      const delta = ((c.p75 - prev.p75) / prev.p75) * 100;
      return { ...c, prevP75: prev.p75, delta };
    })
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 5);

  const trendsByMetric = {};
  if (trends) {
    trends.forEach(t => {
      if (!trendsByMetric[t.name]) trendsByMetric[t.name] = [];
      trendsByMetric[t.name].push(t);
    });
  }

  return (
    <>
      <div className="admin-stat-cards perf-stat-cards">
        {summaryCards.map(card => (
          <div key={card.name} className="admin-stat-card">
            <div className="stat-label">p75 {card.name}</div>
            <div className={`stat-value ${card.p75 != null ? ratingClass(card.name, card.p75) : ''}`}>
              {card.p75 != null ? Math.round(card.p75) : '—'}
            </div>
            <div className="perf-stat-unit">
              {card.p75 != null ? METRIC_THRESHOLDS[card.name]?.unit : ''}
              {card.count > 0 && <span className="perf-stat-samples"> ({card.count} samples)</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="admin-charts">
        {lcpByRoute.length > 0 && (
          <div className="admin-chart-block">
            <h2>Slowest Routes by LCP (p75)</h2>
            <div className="admin-chart-wrapper">
              <Bar data={slowestRoutesData} options={slowestRoutesOptions} />
            </div>
          </div>
        )}

        <div className="admin-chart-block">
          <h2>Biggest Changes vs Previous Period</h2>
          {regressions.length > 0 ? (
            <div className="perf-regressions">
              {regressions.map((r, i) => {
                const improved = r.delta < 0;
                return (
                  <div key={i} className="perf-regression-card">
                    <div className="perf-regression-route">{r.route}</div>
                    <div className="perf-regression-metric">{r.name}</div>
                    <div className={`perf-regression-delta ${improved ? 'perf-improved' : 'perf-regressed'}`}>
                      {improved ? '↓' : '↑'} {Math.abs(r.delta).toFixed(1)}%
                    </div>
                    <div className="perf-regression-values">
                      {Math.round(r.prevP75)} → {Math.round(r.p75)} {METRIC_THRESHOLDS[r.name]?.unit}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="admin-chart-empty">No previous-period data for comparison</div>
          )}
        </div>

        {['LCP', 'CLS', 'INP', 'TTFB'].map(metric => {
          const entries = trendsByMetric[metric] || [];
          return (
            <ChartBlock
              key={metric}
              title={`${metric} Daily Trend (p75)`}
              entries={entries}
              xKey="day"
              yTitle={`p75 ${metric} (${METRIC_THRESHOLDS[metric].unit})`}
              color={TREND_COLORS[metric]}
              yKey="p75"
            />
          );
        })}
      </div>
    </>
  );
}
