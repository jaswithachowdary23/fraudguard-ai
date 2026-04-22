import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as Accordion from "@radix-ui/react-accordion";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useForm } from "react-hook-form";
import { useCheckTransaction } from "../hooks/useBackend";
import {
  DeviceType,
  MerchantCategory,
  TransactionMode,
  TransactionType,
} from "../types";
import type { Transaction } from "../types";

interface FormValues {
  amount: string;
  transactionType: TransactionType;
  location: string;
  transactionMode: TransactionMode;
  deviceType: DeviceType;
  merchantCategory: MerchantCategory;
}

function getRiskLevel(score: number): "high" | "medium" | "low" {
  if (score > 0.7) return "high";
  if (score >= 0.3) return "medium";
  return "low";
}

function formatTimeSinceLast(seconds: bigint): string {
  const secs = Number(seconds);
  if (secs < 60) return `${secs} second${secs !== 1 ? "s" : ""}`;
  if (secs < 3600) {
    const mins = Math.floor(secs / 60);
    return `${mins} minute${mins !== 1 ? "s" : ""}`;
  }
  const hrs = Math.floor(secs / 3600);
  return `${hrs} hour${hrs !== 1 ? "s" : ""}`;
}

function RiskBanner({ score }: { score: number }) {
  const level = getRiskLevel(score);

  if (level === "high") {
    return (
      <div
        className="alert-banner rounded-xl p-5 flex items-start gap-4"
        data-ocid="checker.risk_banner.high"
      >
        <ShieldAlert className="w-6 h-6 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-base leading-tight">
            ⚠️ High Risk Transaction Detected
          </p>
          <p className="text-sm mt-1 opacity-80">
            This transaction has been flagged as potentially fraudulent
          </p>
        </div>
      </div>
    );
  }

  if (level === "medium") {
    return (
      <div
        className="risk-medium rounded-xl p-5 flex items-start gap-4"
        data-ocid="checker.risk_banner.medium"
      >
        <AlertTriangle className="w-6 h-6 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-base leading-tight">
            ⚠️ Suspicious Transaction
          </p>
          <p className="text-sm mt-1 opacity-80">
            This transaction shows some suspicious patterns worth reviewing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="risk-low rounded-xl p-5 flex items-start gap-4"
      data-ocid="checker.risk_banner.low"
    >
      <ShieldCheck className="w-6 h-6 mt-0.5 shrink-0" />
      <div>
        <p className="font-semibold text-base leading-tight">
          ✓ Transaction Appears Safe
        </p>
        <p className="text-sm mt-1 opacity-80">
          No fraud indicators detected for this transaction
        </p>
      </div>
    </div>
  );
}

function ResultCard({ result }: { result: Transaction }) {
  const level = getRiskLevel(result.riskScore);
  const scorePercent = Math.round(result.riskScore * 100);
  const confidencePercent = Math.round(result.confidence * 100);

  const scoreColorClass =
    level === "high"
      ? "text-destructive"
      : level === "medium"
        ? "text-yellow-500 dark:text-yellow-400"
        : "text-green-500 dark:text-green-400";

  return (
    <div className="space-y-4" data-ocid="checker.result_card">
      <RiskBanner score={result.riskScore} />

      <Card className="card-elevated">
        <CardContent className="pt-6 space-y-5">
          {/* Score + Badge row */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm text-muted-foreground mb-0.5">Risk Score</p>
              <p
                className={`text-4xl font-display font-bold ${scoreColorClass}`}
                data-ocid="checker.risk_score"
              >
                {scorePercent}%
              </p>
            </div>
            <div>
              {result.isFraud ? (
                <span
                  className="badge-fraud text-sm px-3 py-1.5"
                  data-ocid="checker.verdict_badge"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  FRAUD DETECTED
                </span>
              ) : (
                <span
                  className="badge-safe text-sm px-3 py-1.5"
                  data-ocid="checker.verdict_badge"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  SAFE
                </span>
              )}
            </div>
          </div>

          {/* Confidence bar */}
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">Confidence Level</span>
              <span
                className="font-medium"
                data-ocid="checker.confidence_value"
              >
                {confidencePercent}%
              </span>
            </div>
            <Progress
              value={confidencePercent}
              className="h-2"
              data-ocid="checker.confidence_bar"
            />
          </div>

          {/* Why this result */}
          {result.fraudReasons.length > 0 && (
            <div className="border-t border-border pt-4">
              <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                Why this result?
              </p>
              <ul className="space-y-2" data-ocid="checker.reasons_list">
                {result.fraudReasons.map((reason, i) => (
                  <li
                    key={reason}
                    className={`flex items-start gap-2 text-sm ${result.isFraud ? "text-destructive" : "text-green-600 dark:text-green-400"}`}
                    data-ocid={`checker.reason.${i + 1}`}
                  >
                    {result.isFraud ? (
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    )}
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Auto-generated context accordion */}
          <div className="border-t border-border pt-4">
            <Accordion.Root type="single" collapsible>
              <Accordion.Item value="context">
                <Accordion.Trigger
                  className="flex w-full items-center justify-between text-sm font-semibold py-1 hover:text-primary transition-colors group"
                  data-ocid="checker.context_accordion"
                >
                  Auto-Generated Transaction Context
                  <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
                <Accordion.Content className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-up-4 data-[state=open]:slide-down-4">
                  <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
                    <li className="flex justify-between">
                      <span>Transactions in last 24h</span>
                      <span
                        className="font-mono text-foreground"
                        data-ocid="checker.ctx_tx_count"
                      >
                        {Number(result.autoFeatures.txCount24h)}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Average transaction amount</span>
                      <span
                        className="font-mono text-foreground"
                        data-ocid="checker.ctx_avg_amount"
                      >
                        ₹
                        {result.autoFeatures.avgAmount.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Time since last transaction</span>
                      <span
                        className="font-mono text-foreground"
                        data-ocid="checker.ctx_time_since"
                      >
                        {formatTimeSinceLast(result.autoFeatures.timeSinceLast)}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Previous location</span>
                      <span
                        className="font-mono text-foreground"
                        data-ocid="checker.ctx_prev_location"
                      >
                        {result.autoFeatures.prevLocation || "—"}
                      </span>
                    </li>
                  </ul>
                </Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckerPage() {
  const { mutate, isPending, data: result, error } = useCheckTransaction();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      transactionType: TransactionType.Payment,
      transactionMode: TransactionMode.Mobile,
      deviceType: DeviceType.Android,
      merchantCategory: MerchantCategory.Shopping,
    },
  });

  function onSubmit(values: FormValues) {
    mutate({
      amount: Number(values.amount),
      transactionType: values.transactionType,
      location: values.location.trim(),
      transactionMode: values.transactionMode,
      deviceType: values.deviceType,
      merchantCategory: values.merchantCategory,
    });
  }

  return (
    <div
      className="max-w-2xl mx-auto px-4 py-8 space-y-8"
      data-ocid="checker.page"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Transaction Checker
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Analyze any transaction for fraud risk in real time using ML-powered
          detection.
        </p>
      </div>

      {/* Input Form */}
      <Card className="card-elevated" data-ocid="checker.form_card">
        <CardHeader>
          <CardTitle className="text-lg font-display">
            Check Transaction
          </CardTitle>
          <CardDescription>
            Enter transaction details for fraud analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            data-ocid="checker.form"
          >
            {/* Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                min={1}
                step="0.01"
                placeholder="Enter amount"
                className={errors.amount ? "border-destructive" : ""}
                data-ocid="checker.amount.input"
                {...register("amount", {
                  required: "Amount is required",
                  min: { value: 1, message: "Amount must be at least ₹1" },
                })}
              />
              {errors.amount && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="checker.amount.field_error"
                >
                  {errors.amount.message}
                </p>
              )}
            </div>

            {/* Transaction Type */}
            <div className="space-y-1.5">
              <Label>Transaction Type</Label>
              <Select
                defaultValue={TransactionType.Payment}
                onValueChange={(v) =>
                  setValue("transactionType", v as TransactionType)
                }
              >
                <SelectTrigger data-ocid="checker.transaction_type.select">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TransactionType.Payment}>
                    Payment
                  </SelectItem>
                  <SelectItem value={TransactionType.Transfer}>
                    Transfer
                  </SelectItem>
                  <SelectItem value={TransactionType.Withdrawal}>
                    Withdrawal
                  </SelectItem>
                  <SelectItem value={TransactionType.OnlinePurchase}>
                    Online Purchase
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter city name"
                className={errors.location ? "border-destructive" : ""}
                data-ocid="checker.location.input"
                {...register("location", { required: "Location is required" })}
              />
              {errors.location && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="checker.location.field_error"
                >
                  {errors.location.message}
                </p>
              )}
            </div>

            {/* Two-column row: Mode + Device */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Transaction Mode</Label>
                <Select
                  defaultValue={TransactionMode.Mobile}
                  onValueChange={(v) =>
                    setValue("transactionMode", v as TransactionMode)
                  }
                >
                  <SelectTrigger data-ocid="checker.transaction_mode.select">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TransactionMode.Mobile}>
                      Mobile
                    </SelectItem>
                    <SelectItem value={TransactionMode.Web}>Web</SelectItem>
                    <SelectItem value={TransactionMode.ATM}>ATM</SelectItem>
                    <SelectItem value={TransactionMode.POS}>POS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Device Type</Label>
                <Select
                  defaultValue={DeviceType.Android}
                  onValueChange={(v) => setValue("deviceType", v as DeviceType)}
                >
                  <SelectTrigger data-ocid="checker.device_type.select">
                    <SelectValue placeholder="Select device" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DeviceType.Android}>Android</SelectItem>
                    <SelectItem value={DeviceType.iOS}>iOS</SelectItem>
                    <SelectItem value={DeviceType.Desktop}>Desktop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Merchant Category */}
            <div className="space-y-1.5">
              <Label>Merchant Category</Label>
              <Select
                defaultValue={MerchantCategory.Shopping}
                onValueChange={(v) =>
                  setValue("merchantCategory", v as MerchantCategory)
                }
              >
                <SelectTrigger data-ocid="checker.merchant_category.select">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MerchantCategory.Shopping}>
                    Shopping
                  </SelectItem>
                  <SelectItem value={MerchantCategory.Food}>Food</SelectItem>
                  <SelectItem value={MerchantCategory.Travel}>
                    Travel
                  </SelectItem>
                  <SelectItem value={MerchantCategory.Bills}>Bills</SelectItem>
                  <SelectItem value={MerchantCategory.Others}>
                    Others
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isPending}
              data-ocid="checker.submit_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Analyze Transaction
                </>
              )}
            </Button>

            {error && (
              <p
                className="text-sm text-destructive text-center"
                data-ocid="checker.form.error_state"
              >
                {error.message || "Analysis failed. Please try again."}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          >
            <ResultCard result={result} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
