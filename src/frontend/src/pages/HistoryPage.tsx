import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  MapPin,
  Monitor,
  Search,
  Shield,
  ShoppingBag,
  Smartphone,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useMyTransactions } from "../hooks/useBackend";
import type { Transaction } from "../types";
import { DeviceType, MerchantCategory, TransactionType } from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  return new Date(ms).toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatAmount(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDuration(seconds: bigint): string {
  const secs = Number(seconds);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

function riskCircleClass(score: number): string {
  if (score >= 0.7) return "bg-destructive text-destructive-foreground";
  if (score >= 0.4) return "bg-yellow-500 text-white";
  return "bg-green-500 text-white";
}

function transactionTypeLabel(t: TransactionType): string {
  const map: Record<TransactionType, string> = {
    [TransactionType.Payment]: "Payment",
    [TransactionType.Transfer]: "Transfer",
    [TransactionType.Withdrawal]: "Withdrawal",
    [TransactionType.OnlinePurchase]: "Online Purchase",
  };
  return map[t] ?? String(t);
}

function DeviceIcon({ d }: { d: DeviceType }) {
  if (d === DeviceType.iOS || d === DeviceType.Android) {
    return <Smartphone className="w-3.5 h-3.5" />;
  }
  return <Monitor className="w-3.5 h-3.5" />;
}

function MerchantIcon({ m }: { m: MerchantCategory }) {
  if (m === MerchantCategory.Shopping)
    return <ShoppingBag className="w-3.5 h-3.5" />;
  if (m === MerchantCategory.Travel) return <MapPin className="w-3.5 h-3.5" />;
  return <CreditCard className="w-3.5 h-3.5" />;
}

// ─── Risk Circle ──────────────────────────────────────────────────────────────

function RiskCircle({ score }: { score: number }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold shrink-0 ${riskCircleClass(score)}`}
    >
      {Math.round(score * 100)}%
    </span>
  );
}

// ─── Expanded Details ─────────────────────────────────────────────────────────

function ExpandedDetails({ tx }: { tx: Transaction }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 border border-border mt-1 text-sm">
      {/* Left: confidence + fraud indicators + device/merchant */}
      <div className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">
            Confidence
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  tx.isFraud ? "bg-destructive" : "bg-green-500"
                }`}
                style={{ width: `${Math.round(tx.confidence * 100)}%` }}
              />
            </div>
            <span className="font-semibold text-foreground tabular-nums w-10 text-right">
              {Math.round(tx.confidence * 100)}%
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">
            Fraud Indicators
          </p>
          {tx.fraudReasons.length === 0 ? (
            <p className="text-muted-foreground italic text-xs">
              No indicators detected
            </p>
          ) : (
            <ul className="space-y-1">
              {tx.fraudReasons.map((r) => (
                <li
                  key={r}
                  className="flex items-start gap-2 text-destructive text-xs"
                >
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-5">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
              Device
            </p>
            <div className="flex items-center gap-1.5 text-foreground">
              <DeviceIcon d={tx.deviceType} />
              <span>{tx.deviceType}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
              Merchant
            </p>
            <div className="flex items-center gap-1.5 text-foreground">
              <MerchantIcon m={tx.merchantCategory} />
              <span>{tx.merchantCategory}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: behavioral context */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          Behavioral Context
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-card border border-border rounded-md p-2.5">
            <p className="text-xs text-muted-foreground mb-0.5">Txns (24h)</p>
            <p className="font-semibold text-foreground">
              {String(tx.autoFeatures.txCount24h)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-md p-2.5">
            <p className="text-xs text-muted-foreground mb-0.5">Avg Amount</p>
            <p className="font-semibold text-foreground">
              {formatAmount(tx.autoFeatures.avgAmount)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-md p-2.5">
            <p className="text-xs text-muted-foreground mb-0.5">Last Txn</p>
            <p className="font-semibold text-foreground">
              {tx.autoFeatures.timeSinceLast === 0n
                ? "First txn"
                : formatDuration(tx.autoFeatures.timeSinceLast)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-md p-2.5">
            <p className="text-xs text-muted-foreground mb-0.5">
              Prev Location
            </p>
            <p className="font-semibold text-foreground truncate">
              {tx.autoFeatures.prevLocation || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Table Row ────────────────────────────────────────────────────────────────

function TransactionRow({ tx, index }: { tx: Transaction; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="border-b border-border last:border-0"
      data-ocid={`history.item.${index + 1}`}
    >
      <div className="grid grid-cols-[minmax(140px,1.5fr)_minmax(90px,1fr)_minmax(100px,1fr)_minmax(90px,1fr)_minmax(70px,0.7fr)_44px_80px_36px] gap-2 items-center px-4 py-3 hover:bg-muted/20 transition-colors">
        {/* Date & Time */}
        <p className="text-sm text-foreground truncate">
          {formatTimestamp(tx.timestamp)}
        </p>

        {/* Amount */}
        <p className="text-sm font-semibold text-foreground tabular-nums">
          {formatAmount(tx.amount)}
        </p>

        {/* Type */}
        <p className="text-sm text-foreground truncate">
          {transactionTypeLabel(tx.transactionType)}
        </p>

        {/* Location */}
        <div className="flex items-center gap-1 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <p className="text-sm text-foreground truncate">{tx.location}</p>
        </div>

        {/* Mode */}
        <Badge variant="outline" className="text-xs justify-center">
          {tx.transactionMode}
        </Badge>

        {/* Risk Score */}
        <div
          className="flex justify-center"
          data-ocid={`history.risk_score.${index + 1}`}
        >
          <RiskCircle score={tx.riskScore} />
        </div>

        {/* Result */}
        <div data-ocid={`history.result.${index + 1}`}>
          {tx.isFraud ? (
            <span className="badge-fraud">
              <AlertTriangle className="w-3 h-3" />
              FRAUD
            </span>
          ) : (
            <span className="badge-safe">
              <CheckCircle className="w-3 h-3" />
              SAFE
            </span>
          )}
        </div>

        {/* Expand */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label={expanded ? "Collapse details" : "Expand details"}
          data-ocid={`history.expand_button.${index + 1}`}
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4">
          <ExpandedDetails tx={tx} />
        </div>
      )}
    </div>
  );
}

// ─── Skeleton Rows ────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => `skeleton-${i}`).map((key) => (
        <div
          key={key}
          className="grid grid-cols-[minmax(140px,1.5fr)_minmax(90px,1fr)_minmax(100px,1fr)_minmax(90px,1fr)_minmax(70px,0.7fr)_44px_80px_36px] gap-2 items-center px-4 py-3 border-b border-border last:border-0"
          data-ocid="history.loading_state"
        >
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
      ))}
    </>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      data-ocid="history.empty_state"
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Shield className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {filtered ? "No matching transactions" : "No transactions yet"}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        {filtered
          ? "Try adjusting your filters or search query."
          : "Run your first transaction analysis to see history here."}
      </p>
      {!filtered && (
        <Link to="/checker">
          <Button data-ocid="history.go_to_checker_button">
            <Activity className="w-4 h-4 mr-2" />
            Analyze a Transaction
          </Button>
        </Link>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ResultFilter = "all" | "fraud" | "safe";
type SortOption = "newest" | "oldest" | "highest_risk" | "amount";

export default function HistoryPage() {
  const { data: transactions, isLoading, error } = useMyTransactions();

  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState<ResultFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const filtered = useMemo<Transaction[]>(() => {
    let list: Transaction[] = transactions ?? [];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (tx) =>
          tx.location.toLowerCase().includes(q) ||
          String(tx.amount).includes(q),
      );
    }

    if (resultFilter === "fraud") list = list.filter((tx) => tx.isFraud);
    if (resultFilter === "safe") list = list.filter((tx) => !tx.isFraud);

    return [...list].sort((a, b) => {
      if (sortBy === "newest") return Number(b.timestamp - a.timestamp);
      if (sortBy === "oldest") return Number(a.timestamp - b.timestamp);
      if (sortBy === "highest_risk") return b.riskScore - a.riskScore;
      if (sortBy === "amount") return b.amount - a.amount;
      return 0;
    });
  }, [transactions, search, resultFilter, sortBy]);

  const total = transactions?.length ?? 0;
  const isFiltered = search.trim() !== "" || resultFilter !== "all";

  return (
    <div className="min-h-screen bg-background" data-ocid="history.page">
      {/* Page Header */}
      <div className="bg-card border-b border-border px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <Clock className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-display font-bold text-foreground">
              Transaction History
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Complete record of all your analyzed transactions
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        {/* Filter Bar */}
        <div className="card-elevated p-4" data-ocid="history.filter_bar">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by location or amount…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background border-input"
                data-ocid="history.search_input"
              />
            </div>

            {/* Result filter */}
            <div
              className="flex items-center rounded-lg border border-border bg-muted/30 p-1 gap-1"
              data-ocid="history.result_filter"
            >
              {(["all", "fraud", "safe"] as const).map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() => setResultFilter(f)}
                  data-ocid={`history.filter_${f}.tab`}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    resultFilter === f
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "all"
                    ? "All"
                    : f === "fraud"
                      ? "Fraud Only"
                      : "Safe Only"}
                </button>
              ))}
            </div>

            {/* Sort */}
            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as SortOption)}
            >
              <SelectTrigger
                className="w-44 bg-background border-input"
                data-ocid="history.sort_select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest_risk">Highest Risk</SelectItem>
                <SelectItem value="amount">Highest Amount</SelectItem>
              </SelectContent>
            </Select>

            {/* Count badge */}
            <Badge
              variant="secondary"
              className="ml-auto shrink-0 tabular-nums"
              data-ocid="history.count_badge"
            >
              {isLoading
                ? "Loading…"
                : `Showing ${filtered.length} of ${total} transactions`}
            </Badge>
          </div>
        </div>

        {/* Table */}
        <div
          className="card-elevated overflow-hidden"
          data-ocid="history.table"
        >
          {/* Column headers */}
          <div className="grid grid-cols-[minmax(140px,1.5fr)_minmax(90px,1fr)_minmax(100px,1fr)_minmax(90px,1fr)_minmax(70px,0.7fr)_44px_80px_36px] gap-2 items-center px-4 py-2.5 bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Date &amp; Time</span>
            <span>Amount</span>
            <span>Type</span>
            <span>Location</span>
            <span>Mode</span>
            <span className="text-center">Risk</span>
            <span>Result</span>
            <span />
          </div>

          {/* Body */}
          {isLoading ? (
            <SkeletonRows />
          ) : error ? (
            <div
              className="flex items-center gap-3 px-4 py-6 text-destructive"
              data-ocid="history.error_state"
            >
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="text-sm">
                Failed to load transactions. Please try again.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState filtered={isFiltered} />
          ) : (
            filtered.map((tx, i) => (
              <TransactionRow key={tx.id} tx={tx} index={i} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
