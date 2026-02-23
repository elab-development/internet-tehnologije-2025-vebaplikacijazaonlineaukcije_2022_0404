import { useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { useAdminStatsStore } from '../../stores/adminStats.store';

const COLORS = {
  text: 'rgba(255,255,255,0.85)',
  textMuted: 'rgba(255,255,255,0.65)',
  grid: 'rgba(255,255,255,0.10)',
  axis: 'rgba(255,255,255,0.18)',
  tooltipBg: 'rgba(20, 20, 24, 0.88)',
  tooltipBorder: 'rgba(255,255,255,0.14)',

  bids: '#22d3ee', // cyan-400
  tx: '#a78bfa', // violet-400
  revenue: '#f59e0b', // amber-500
  categories: '#34d399', // emerald-400
  sellers: '#60a5fa', // blue-400
};

function num(n) {
  const x = Number(n ?? 0);
  return Number.isFinite(x) ? x : 0;
}

function money(n) {
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD',
    maximumFractionDigits: 0,
  }).format(num(n));
}

function shortDayLabel(isoDate) {
  // "YYYY-MM-DD" -> "DD.MM"
  if (!isoDate || typeof isoDate !== 'string') return isoDate;
  const [y, m, d] = isoDate.split('-');
  if (!d || !m) return isoDate;
  return `${d}.${m}`;
}

function shortMonthLabel(isoMonth) {
  // "YYYY-MM-01" -> "MM.YY"
  if (!isoMonth || typeof isoMonth !== 'string') return isoMonth;
  const [y, m] = isoMonth.split('-');
  if (!y || !m) return isoMonth;
  return `${m}.${String(y).slice(-2)}`;
}

function GlassTooltip({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
}) {
  if (!active || !payload || !payload.length) return null;

  const shownLabel = labelFormatter ? labelFormatter(label) : label;

  return (
    <div
      className='rounded-2xl px-3.5 py-3 shadow-xl'
      style={{
        background: COLORS.tooltipBg,
        border: `1px solid ${COLORS.tooltipBorder}`,
        backdropFilter: 'blur(10px)',
        color: COLORS.text,
        minWidth: 160,
      }}
    >
      <div style={{ color: COLORS.textMuted, fontSize: 12 }}>{shownLabel}</div>

      <div className='mt-2 space-y-1'>
        {payload.map((p) => {
          const val = valueFormatter
            ? valueFormatter(p.value, p.dataKey)
            : p.value;
          return (
            <div
              key={p.dataKey}
              className='flex items-center justify-between gap-3'
            >
              <div className='flex items-center gap-2'>
                <span
                  className='inline-block h-2.5 w-2.5 rounded-full'
                  style={{ background: p.color || p.stroke || COLORS.text }}
                />
                <span style={{ fontSize: 12, color: COLORS.textMuted }}>
                  {p.name ?? p.dataKey}
                </span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const stats = useAdminStatsStore((s) => s.stats);
  const loading = useAdminStatsStore((s) => s.loading);
  const error = useAdminStatsStore((s) => s.error);
  const clearError = useAdminStatsStore((s) => s.clearError);
  const fetchAdminStats = useAdminStatsStore((s) => s.fetchAdminStats);

  const errorText =
    error?.message || error?.data?.message || 'Failed to load admin stats.';

  useEffect(() => {
    fetchAdminStats().catch(() => {});
  }, []);

  const k = stats?.kpis || {};
  const c = stats?.charts || {};

  const bidsPerDay = useMemo(
    () =>
      (c?.bids_per_day_last_30 || []).map((d) => ({
        ...d,
        count: num(d.count),
      })),
    [c],
  );

  const txPerMonth = useMemo(
    () =>
      (c?.transactions_per_month_last_12 || []).map((m) => ({
        ...m,
        tx_count: num(m.tx_count),
        revenue: num(m.revenue),
      })),
    [c],
  );

  const topCategories = useMemo(
    () =>
      (c?.top_categories_by_auctions || []).map((x) => ({
        ...x,
        auctions_count: num(x.auctions_count),
      })),
    [c],
  );

  const topSellers = useMemo(
    () =>
      (c?.top_sellers_by_auctions || []).map((x) => ({
        ...x,
        auctions_count: num(x.auctions_count),
      })),
    [c],
  );

  const axisCommon = {
    tick: { fill: COLORS.textMuted, fontSize: 12 },
    tickLine: { stroke: COLORS.axis },
    axisLine: { stroke: COLORS.axis },
  };

  return (
    <div className='text-white'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-semibold'>Admin Dashboard</h2>
          <p className='mt-1 text-sm text-white/70'>
            KPI + charts (last 30 days / last 12 months)
          </p>
        </div>

        <button
          onClick={() => {
            clearError();
            fetchAdminStats().catch(() => {});
          }}
          className='inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 hover:bg-white/15 text-white px-4 py-2 shadow-md transition'
        >
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      {error && (
        <div className='mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 text-red-100 px-4 py-3 flex gap-2'>
          <FiAlertTriangle className='mt-0.5 shrink-0' />
          <div className='text-sm'>{errorText}</div>
        </div>
      )}

      {/* KPI cards */}
      <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <KpiCard
          title='Users'
          value={num(k.users_total)}
          sub={`Sellers: ${num(k.users_sellers)} · Buyers: ${num(k.users_buyers)}`}
          accent={COLORS.sellers}
        />
        <KpiCard
          title='Auctions'
          value={num(k.auctions_total)}
          sub={`Active: ${num(k.auctions_active)} · Finished: ${num(k.auctions_finished)}`}
          accent={COLORS.categories}
        />
        <KpiCard
          title='Bids'
          value={num(k.bids_total)}
          sub={`Avg / auction: ${num(k.avg_bids_per_auction)}`}
          accent={COLORS.bids}
        />
        <KpiCard
          title='Revenue'
          value={money(k.revenue_total)}
          sub={`Avg tx: ${money(k.avg_final_price)} · Conv: ${num(k.finished_to_transaction_rate_percent)}%`}
          accent={COLORS.revenue}
        />
      </div>

      {/* Charts */}
      <div className='mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <Panel title='Bids per day (last 30 days)' accent={COLORS.bids}>
          <div className='h-72'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart
                data={bidsPerDay}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid stroke={COLORS.grid} strokeDasharray='4 4' />
                <XAxis
                  dataKey='day'
                  {...axisCommon}
                  tickFormatter={shortDayLabel}
                />
                <YAxis {...axisCommon} />
                <Tooltip
                  content={
                    <GlassTooltip
                      labelFormatter={(l) => `DAY: ${shortDayLabel(l)}`}
                      valueFormatter={(v) => `${num(v)}`}
                    />
                  }
                />
                <Legend wrapperStyle={{ color: COLORS.textMuted }} />
                <Line
                  type='monotone'
                  dataKey='count'
                  name='Bids'
                  stroke={COLORS.bids}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          title='Transactions & revenue per month (last 12 months)'
          accent={COLORS.tx}
        >
          <div className='h-72'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={txPerMonth}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid stroke={COLORS.grid} strokeDasharray='4 4' />
                <XAxis
                  dataKey='month'
                  {...axisCommon}
                  tickFormatter={shortMonthLabel}
                />
                <YAxis yAxisId='left' {...axisCommon} />
                <YAxis yAxisId='right' orientation='right' {...axisCommon} />
                <Tooltip
                  content={
                    <GlassTooltip
                      labelFormatter={(l) => `MONTH: ${shortMonthLabel(l)}`}
                      valueFormatter={(v, key) =>
                        key === 'revenue' ? money(v) : `${num(v)}`
                      }
                    />
                  }
                />
                <Legend wrapperStyle={{ color: COLORS.textMuted }} />

                <Bar
                  yAxisId='left'
                  dataKey='tx_count'
                  name='Transactions'
                  fill={COLORS.tx}
                  radius={[10, 10, 4, 4]}
                />
                <Bar
                  yAxisId='right'
                  dataKey='revenue'
                  name='Revenue'
                  fill={COLORS.revenue}
                  radius={[10, 10, 4, 4]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title='Top categories by auctions' accent={COLORS.categories}>
          <div className='h-72'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={topCategories}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid stroke={COLORS.grid} strokeDasharray='4 4' />
                <XAxis dataKey='category' {...axisCommon} />
                <YAxis {...axisCommon} />
                <Tooltip
                  content={
                    <GlassTooltip
                      labelFormatter={(l) => `CATEGORY: ${l}`}
                      valueFormatter={(v) => `${num(v)} auctions`}
                    />
                  }
                />
                <Legend wrapperStyle={{ color: COLORS.textMuted }} />
                <Bar
                  dataKey='auctions_count'
                  name='Auctions'
                  fill={COLORS.categories}
                  radius={[10, 10, 4, 4]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title='Top sellers by auctions' accent={COLORS.sellers}>
          <div className='h-72'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={topSellers}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid stroke={COLORS.grid} strokeDasharray='4 4' />
                <XAxis dataKey='seller' {...axisCommon} />
                <YAxis {...axisCommon} />
                <Tooltip
                  content={
                    <GlassTooltip
                      labelFormatter={(l) => `SELLER: ${l}`}
                      valueFormatter={(v) => `${num(v)} auctions`}
                    />
                  }
                />
                <Legend wrapperStyle={{ color: COLORS.textMuted }} />
                <Bar
                  dataKey='auctions_count'
                  name='Auctions'
                  fill={COLORS.sellers}
                  radius={[10, 10, 4, 4]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {stats?.meta?.generated_at && (
        <div className='mt-4 text-xs text-white/50'>
          Generated: {stats.meta.generated_at}
        </div>
      )}

      {loading && !stats && (
        <div className='mt-4 text-white/70'>Loading dashboard...</div>
      )}
    </div>
  );
}

function Panel({ title, children, accent }) {
  return (
    <div className='rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-lg p-5'>
      <div className='flex items-center justify-between gap-3'>
        <div className='text-white font-semibold'>{title}</div>
        <span
          className='h-2.5 w-2.5 rounded-full'
          style={{ background: accent, boxShadow: `0 0 24px ${accent}` }}
        />
      </div>
      <div className='mt-4'>{children}</div>
    </div>
  );
}

function KpiCard({ title, value, sub, accent }) {
  return (
    <div className='rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-lg p-5'>
      <div className='flex items-center justify-between gap-3'>
        <div className='text-sm text-white/70'>{title}</div>
        <span
          className='h-2.5 w-2.5 rounded-full'
          style={{ background: accent, boxShadow: `0 0 24px ${accent}` }}
        />
      </div>

      <div className='mt-2 text-2xl font-semibold'>{value}</div>
      {sub && <div className='mt-1 text-xs text-white/60'>{sub}</div>}
    </div>
  );
}
