import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "@/hooks/useBackend";
import { type Transaction, TransactionMode, TransactionType } from "@/types";
import { Activity, AlertTriangle, ShieldCheck, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function formatTransactionType(type: TransactionType): string {
  const map: Record<TransactionType, string> = {
    [TransactionType.Payment]: "Payment",
    [TransactionType.Transfer]: "Transfer",
    [TransactionType.Withdrawal]: "Withdrawal",
    [TransactionType.OnlinePurchase]: "Online Purchase",
  };
  return map[type] ?? String(type);
}

function formatMode(mode: TransactionMode): string {
  const map: Record<TransactionMode, string> = {
    [TransactionMode.Mobile]: "Mobile",
    [TransactionMode.Web]: "Web",
    [TransactionMode.ATM]: "ATM",
    [TransactionMode.POS]: "POS",
  };
  return map[mode] ?? String(mode);
}

function getRiskLevel(score: number): "high" | "medium" | "low" {
  if (score >= 0.7) return "high";
  if (score >= 0.4) return "medium";
  return "low";
}

function getRiskColor(score: number): string {
  const level = getRiskLevel(score);
  if (level === "high") return "risk-high";
  if (level === "medium") return "risk-medium";
  return "risk-low";
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  const date = new Date(ms);
  return date.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ──────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass?: string;
  ocid: string;
}

function MetricCard({ label, value, icon, colorClass, ocid }: MetricCardProps) {
  return (
    <div className="metric-card flex items-start gap-4" data-ocid={ocid}>
      <div
        className={`p-2.5 rounded-lg ${colorClass ?? "bg-primary/15 text-primary"}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground font-body">{label}</p>
        <p className="text-2xl font-display font-bold text-foreground mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}

function MetricSkeleton() {
  return (
    <div className="metric-card flex items-start gap-4">
      <Skeleton className="w-10 h-10 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-7 w-16" />
      </div>
    </div>
  );
}

function buildBarData(transactions: Transaction[]) {
  const types = [
    TransactionType.Payment,
    TransactionType.Transfer,
    TransactionType.Withdrawal,
    TransactionType.OnlinePurchase,
  ];
  return types.map((type) => {
    const typeLabel = formatTransactionType(type);
    const all = transactions.filter((t) => t.transactionType === type);
    const fraud = all.filter((t) => t.isFraud).length;
    const safe = all.filter((t) => !t.isFraud).length;
    return { name: typeLabel, Fraud: fraud, Safe: safe };
  });
}

interface BarSectionProps {
  transactions: Transaction[];
}

function TransactionBarChart({ transactions }: BarSectionProps) {
  const data = buildBarData(transactions);
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="name"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--foreground))",
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}
        />
        <Bar dataKey="Safe" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
        <Bar
          dataKey="Fraud"
          fill="hsl(var(--destructive))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface PieSectionProps {
  fraudCount: number;
  safeCount: number;
}

function FraudPieChart({ fraudCount, safeCount }: PieSectionProps) {
  const total = fraudCount + safeCount;

  if (total === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center h-60 gap-2"
        data-ocid="dashboard.pie.empty_state"
      >
        <ShieldCheck className="w-10 h-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No transactions yet</p>
      </div>
    );
  }

  const data = [
    { name: "Fraud", value: fraudCount },
    { name: "Safe", value: safeCount },
  ];
  const COLORS = ["hsl(var(--destructive))", "hsl(var(--chart-3))"];

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          label={false}
          labelLine={false}
        >
          {data.map((entry) => (
            <Cell
              key={`cell-${entry.name}`}
              fill={COLORS[data.indexOf(entry) % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--foreground))",
          }}
          formatter={(value: number, name: string) => [value, name]}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}
          formatter={(value) => (
            <span style={{ color: "hsl(var(--muted-foreground))" }}>
              {value}
            </span>
          )}
        />
        {/* Centre label via foreignObject workaround */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fill="hsl(var(--foreground))"
          fontSize={22}
          fontWeight={700}
        >
          {total}
        </text>
        <text
          x="50%"
          y="calc(50% + 18px)"
          textAnchor="middle"
          dominantBaseline="central"
          fill="hsl(var(--muted-foreground))"
          fontSize={11}
          dy={18}
        >
          Total
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
}

// ──────────────────────────────────────────────
// Main page
// ──────────────────────────────────────────────

export default function DashboardPage() {
  const { data, isLoading } = useDashboardStats();

  return (
    <div className="space-y-8 py-2" data-ocid="dashboard.page">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Fraud Risk Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time overview of transaction analysis
        </p>
      </div>

      {/* ROW 1 — Metric cards */}
      <section
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
        data-ocid="dashboard.metrics.section"
      >
        {isLoading ? (
          ["total", "fraud", "safe", "rate"].map((k) => (
            <MetricSkeleton key={k} />
          ))
        ) : (
          <>
            <MetricCard
              ocid="dashboard.total_transactions.card"
              label="Total Transactions"
              value={Number(data?.totalTransactions ?? 0).toLocaleString()}
              icon={<Activity className="w-5 h-5" />}
              colorClass="bg-primary/15 text-primary"
            />
            <MetricCard
              ocid="dashboard.fraud_detected.card"
              label="Fraud Detected"
              value={Number(data?.fraudCount ?? 0).toLocaleString()}
              icon={<AlertTriangle className="w-5 h-5" />}
              colorClass="bg-destructive/15 text-destructive"
            />
            <MetricCard
              ocid="dashboard.safe_transactions.card"
              label="Safe Transactions"
              value={Number(data?.safeCount ?? 0).toLocaleString()}
              icon={<ShieldCheck className="w-5 h-5" />}
              colorClass="bg-green-500/15 text-green-500"
            />
            <MetricCard
              ocid="dashboard.fraud_rate.card"
              label="Fraud Rate"
              value={`${(data?.fraudPercentage ?? 0).toFixed(1)}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              colorClass="bg-yellow-500/15 text-yellow-500"
            />
          </>
        )}
      </section>

      {/* ROW 2 — Charts */}
      <section
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        data-ocid="dashboard.charts.section"
      >
        {/* Bar chart */}
        <div className="card-elevated p-6" data-ocid="dashboard.bar_chart.card">
          <h2 className="text-base font-display font-semibold text-foreground mb-4">
            Transaction Overview
          </h2>
          {isLoading ? (
            <div
              className="space-y-2"
              data-ocid="dashboard.bar_chart.loading_state"
            >
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          ) : (
            <TransactionBarChart
              transactions={data?.recentTransactions ?? []}
            />
          )}
        </div>

        {/* Pie chart */}
        <div className="card-elevated p-6" data-ocid="dashboard.pie_chart.card">
          <h2 className="text-base font-display font-semibold text-foreground mb-4">
            Fraud Distribution
          </h2>
          {isLoading ? (
            <div
              className="flex items-center justify-center h-60"
              data-ocid="dashboard.pie_chart.loading_state"
            >
              <Skeleton className="h-44 w-44 rounded-full" />
            </div>
          ) : (
            <FraudPieChart
              fraudCount={Number(data?.fraudCount ?? 0)}
              safeCount={Number(data?.safeCount ?? 0)}
            />
          )}
        </div>
      </section>

      {/* ROW 3 — Recent transactions table */}
      <section data-ocid="dashboard.transactions.section">
        <div className="card-elevated overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-base font-display font-semibold text-foreground">
              Recent Transactions
            </h2>
          </div>

          {isLoading ? (
            <div
              className="p-6 space-y-3"
              data-ocid="dashboard.transactions.loading_state"
            >
              {["r1", "r2", "r3", "r4", "r5"].map((k) => (
                <Skeleton key={k} className="h-10 w-full rounded" />
              ))}
            </div>
          ) : !data?.recentTransactions?.length ? (
            <div
              className="flex flex-col items-center justify-center py-16 gap-3"
              data-ocid="dashboard.transactions.empty_state"
            >
              <Activity className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No transactions yet. Submit one using the Transaction Checker.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {[
                      "Time",
                      "Amount (₹)",
                      "Type",
                      "Location",
                      "Mode",
                      "Result",
                      "Risk Score",
                    ].map((col) => (
                      <th
                        key={col}
                        className={`px-4 py-3 text-muted-foreground font-medium text-xs uppercase tracking-wide ${
                          col === "Amount (₹)" || col === "Risk Score"
                            ? "text-right"
                            : col === "Result"
                              ? "text-center"
                              : "text-left"
                        }`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recentTransactions.slice(0, 10).map((tx, idx) => (
                    <tr
                      key={tx.id}
                      data-ocid={`dashboard.transactions.item.${idx + 1}`}
                      className={`border-b border-border last:border-0 transition-colors hover:bg-muted/20 ${
                        tx.isFraud ? "bg-destructive/5" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs whitespace-nowrap">
                        {formatTimestamp(tx.timestamp)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">
                        ₹{tx.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {formatTransactionType(tx.transactionType)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[120px] truncate">
                        {tx.location}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatMode(tx.transactionMode)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {tx.isFraud ? (
                          <span className="badge-fraud">
                            <AlertTriangle className="w-3 h-3" />
                            FRAUD
                          </span>
                        ) : (
                          <span className="badge-safe">
                            <ShieldCheck className="w-3 h-3" />
                            SAFE
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-semibold tabular-nums ${getRiskColor(tx.riskScore)}`}
                        >
                          {(tx.riskScore * 100).toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
