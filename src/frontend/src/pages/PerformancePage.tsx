import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  BarChart2,
  Brain,
  Crosshair,
  Star,
  Target,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useModelMetrics } from "../hooks/useBackend";
import type { ModelMetrics } from "../types";

// ─── Feature weights ────────────────────────────────────────────────
const FEATURE_WEIGHTS = [
  { label: "Amount Analysis", pct: 30, color: "bg-primary" },
  { label: "Location Analysis", pct: 25, color: "bg-accent" },
  { label: "Frequency Analysis", pct: 20, color: "bg-purple-400" },
  { label: "Time Analysis", pct: 15, color: "bg-amber-400" },
  { label: "Device / Channel", pct: 10, color: "bg-emerald-400" },
];

// ─── Metric card colour variants ───────────────────────────────────
const METRIC_COLORS = {
  green: "text-emerald-400",
  blue: "text-accent",
  purple: "text-purple-400",
  amber: "text-amber-400",
} as const;

type ColorKey = keyof typeof METRIC_COLORS;

interface MetricDef {
  key: keyof Pick<
    ModelMetrics,
    "accuracy" | "precision" | "recall" | "f1Score"
  >;
  label: string;
  color: ColorKey;
  Icon: React.ElementType;
  tip: string;
}

const METRIC_DEFS: MetricDef[] = [
  {
    key: "accuracy",
    label: "Accuracy",
    color: "green",
    Icon: Target,
    tip: "Ratio of correctly classified transactions",
  },
  {
    key: "precision",
    label: "Precision",
    color: "blue",
    Icon: Crosshair,
    tip: "When flagging fraud, how often is it correct",
  },
  {
    key: "recall",
    label: "Recall",
    color: "purple",
    Icon: Activity,
    tip: "Percentage of actual fraud cases caught",
  },
  {
    key: "f1Score",
    label: "F1 Score",
    color: "amber",
    Icon: Star,
    tip: "Balance between precision and recall",
  },
];

// ─── Chart bar colours ─────────────────────────────────────────────
// Use literal hex values — oklch(var(--token)) does not resolve in SVG fill
const CHART_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#8b5cf6"];

// ─── Helpers ───────────────────────────────────────────────────────
function pct(v: number) {
  return `${(v * 100).toFixed(1)}%`;
}

function num(v: bigint) {
  return Number(v);
}

function hasData(m: ModelMetrics) {
  return num(m.totalTransactions) > 0;
}

// ─── Sub-components ────────────────────────────────────────────────

function LoadingRow({ cols = 4 }: { cols?: number }) {
  const keys = ["a", "b", "c", "d", "e", "f"];
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols} gap-4`}
    >
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={keys[i]} className="h-36 rounded-lg" />
      ))}
    </div>
  );
}

function ModelInfoBanner() {
  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <CardTitle className="text-base font-display">
            Model Architecture
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">FraudGuard AI</span>{" "}
          uses a{" "}
          <span className="text-primary font-medium">
            weighted ensemble scoring model
          </span>{" "}
          that simulates Random Forest + XGBoost behavior — combining
          decision-tree-based feature importance with gradient-boosted risk
          amplification for real-time inference on the Internet Computer.
        </p>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Feature Weights
          </p>
          {FEATURE_WEIGHTS.map(({ label, pct: weight, color }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-sm text-foreground/80 w-44 shrink-0">
                {label}
              </span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${color} transition-all duration-700`}
                  style={{ width: `${weight}%` }}
                />
              </div>
              <span className="text-sm font-mono font-semibold text-foreground w-10 text-right">
                {weight}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({ def, value }: { def: MetricDef; value: number }) {
  const { label, color, Icon, tip } = def;
  return (
    <div
      className="metric-card group"
      data-ocid={`performance.metric.${label.toLowerCase().replace(/\s/g, "_")}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-md bg-muted">
          <Icon className={`w-4 h-4 ${METRIC_COLORS[color]}`} />
        </div>
        <span
          className={`text-3xl font-display font-bold ${METRIC_COLORS[color]}`}
        >
          {pct(value)}
        </span>
      </div>
      <p className="font-semibold text-sm text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground mt-1 leading-snug">{tip}</p>
    </div>
  );
}

function ConfusionMatrix({ m }: { m: ModelMetrics }) {
  const cells = [
    {
      label: "True Positives",
      sub: "Correctly Flagged",
      value: num(m.truePositives),
      cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    },
    {
      label: "False Positives",
      sub: "Incorrectly Flagged",
      value: num(m.falsePositives),
      cls: "border-destructive/40 bg-destructive/10 text-destructive",
    },
    {
      label: "False Negatives",
      sub: "Missed Fraud",
      value: num(m.falseNegatives),
      cls: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    },
    {
      label: "True Negatives",
      sub: "Correctly Cleared",
      value: num(m.trueNegatives),
      cls: "border-accent/40 bg-accent/10 text-accent",
    },
  ];

  return (
    <Card
      className="card-elevated h-full"
      data-ocid="performance.confusion_matrix"
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display">
          Confusion Matrix
        </CardTitle>
        <div className="flex gap-4 text-xs text-muted-foreground mt-1">
          <span className="flex items-center gap-1">
            <span className="font-semibold text-foreground">Rows:</span>
            Predicted
          </span>
          <span className="flex items-center gap-1">
            <span className="font-semibold text-foreground">Cols:</span>
            Actual
          </span>
        </div>
        <div className="flex justify-between text-xs font-medium text-muted-foreground pt-1">
          <span className="ml-auto mr-6">Actual Fraud</span>
          <span>Actual Safe</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {cells.map(({ label, sub, value, cls }, i) => (
            <div
              key={label}
              className={`rounded-lg border p-4 flex flex-col items-center text-center ${cls}`}
              data-ocid={`performance.confusion.cell.${i + 1}`}
            >
              <span className="text-3xl font-display font-bold">
                {value.toLocaleString()}
              </span>
              <span className="text-xs font-semibold mt-1">{label}</span>
              <span className="text-xs opacity-75 mt-0.5">{sub}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-3 text-xs text-muted-foreground px-1">
          <span>← Predicted Fraud</span>
          <span>Predicted Safe →</span>
        </div>
      </CardContent>
    </Card>
  );
}

function DatasetStats({ m }: { m: ModelMetrics }) {
  const total = num(m.totalTransactions);
  const fraud = num(m.fraudCount);
  const safe = num(m.safeCount);
  const fraudPct = total > 0 ? (fraud / total) * 100 : 0;
  const safePct = total > 0 ? (safe / total) * 100 : 0;

  const rows = [
    {
      label: "Total Transactions Analyzed",
      value: total.toLocaleString(),
      cls: "text-foreground",
    },
    {
      label: "Fraud Cases",
      value: fraud.toLocaleString(),
      cls: "text-destructive",
    },
    {
      label: "Safe Transactions",
      value: safe.toLocaleString(),
      cls: "text-emerald-400",
    },
  ];

  return (
    <Card
      className="card-elevated h-full"
      data-ocid="performance.dataset_stats"
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display">
          Dataset Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map(({ label, value, cls }) => (
          <div key={label} className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className={`text-sm font-mono font-semibold ${cls}`}>
              {value}
            </span>
          </div>
        ))}

        {/* Visual split bar */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Fraud / Safe Split</span>
            <span>
              {fraudPct.toFixed(1)}% / {safePct.toFixed(1)}%
            </span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden bg-muted">
            <div
              className="bg-destructive transition-all duration-700"
              style={{ width: `${fraudPct}%` }}
            />
            <div
              className="bg-emerald-500 transition-all duration-700"
              style={{ width: `${safePct}%` }}
            />
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-destructive inline-block" />
              Fraud
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Safe
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground italic pt-1 border-t border-border">
          Metrics calculated from all stored transactions
        </p>
      </CardContent>
    </Card>
  );
}

function MetricsBarChart({ m }: { m: ModelMetrics }) {
  const chartData = [
    {
      name: "Accuracy",
      value: Number.parseFloat((m.accuracy * 100).toFixed(1)),
    },
    {
      name: "Precision",
      value: Number.parseFloat((m.precision * 100).toFixed(1)),
    },
    { name: "Recall", value: Number.parseFloat((m.recall * 100).toFixed(1)) },
    {
      name: "F1 Score",
      value: Number.parseFloat((m.f1Score * 100).toFixed(1)),
    },
  ];

  return (
    <Card className="card-elevated" data-ocid="performance.metrics_chart">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-primary" />
          <CardTitle className="text-base font-display">
            Model Metrics Comparison
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(var(--border))"
              horizontal={false}
            />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fill: "oklch(var(--muted-foreground))", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "oklch(var(--muted-foreground))", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={72}
            />
            <Tooltip
              cursor={{ fill: "oklch(var(--muted)/0.4)" }}
              contentStyle={{
                background: "oklch(var(--popover))",
                border: "1px solid oklch(var(--border))",
                borderRadius: "8px",
                color: "oklch(var(--foreground))",
                fontSize: 12,
              }}
              formatter={(v: number) => [`${v}%`, ""]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={32}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={
                    CHART_COLORS[chartData.indexOf(entry) % CHART_COLORS.length]
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function NoDataState() {
  const placeholderMetrics: ModelMetrics = {
    totalTransactions: 0n,
    fraudCount: 0n,
    safeCount: 0n,
    truePositives: 0n,
    trueNegatives: 0n,
    falsePositives: 0n,
    falseNegatives: 0n,
    accuracy: 0,
    precision: 0,
    recall: 0,
    f1Score: 0,
  };

  return (
    <div className="space-y-6" data-ocid="performance.empty_state">
      <div className="flex items-center gap-3 p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400">
        <BarChart2 className="w-5 h-5 shrink-0" />
        <p className="text-sm">
          No transaction data yet. Run your first fraud check to generate model
          metrics.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 opacity-40 pointer-events-none select-none">
        {METRIC_DEFS.map((def) => (
          <MetricCard key={def.key} def={def} value={0} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 opacity-40 pointer-events-none select-none">
        <ConfusionMatrix m={placeholderMetrics} />
        <DatasetStats m={placeholderMetrics} />
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────
export default function PerformancePage() {
  const { data: metrics, isLoading } = useModelMetrics();

  return (
    <div
      className="space-y-8 p-6 max-w-7xl mx-auto"
      data-ocid="performance.page"
    >
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
          Model Performance
        </h1>
        <p className="text-sm text-muted-foreground">
          ML fraud detection model analytics and evaluation metrics
        </p>
      </div>

      {/* Row 1 — Model info banner */}
      <ModelInfoBanner />

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-6" data-ocid="performance.loading_state">
          <LoadingRow cols={4} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
          <Skeleton className="h-56 rounded-lg" />
        </div>
      )}

      {/* No data state */}
      {!isLoading && (!metrics || !hasData(metrics)) && <NoDataState />}

      {/* Data state */}
      {!isLoading && metrics && hasData(metrics) && (
        <div className="space-y-6">
          {/* Row 2 — Metric cards */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            data-ocid="performance.metrics_row"
          >
            {METRIC_DEFS.map((def) => (
              <MetricCard
                key={def.key}
                def={def}
                value={metrics[def.key] as number}
              />
            ))}
          </div>

          {/* Row 3 — Confusion matrix + dataset stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ConfusionMatrix m={metrics} />
            <DatasetStats m={metrics} />
          </div>

          {/* Row 4 — Bar chart */}
          <MetricsBarChart m={metrics} />
        </div>
      )}
    </div>
  );
}
