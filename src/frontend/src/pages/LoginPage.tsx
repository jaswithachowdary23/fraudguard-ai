import { Button } from "@/components/ui/button";
import { Bell, Brain, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../hooks/useAuth";

const FEATURES = [
  {
    icon: Zap,
    title: "Real-Time Analysis",
    description: "Instant fraud scoring on every transaction",
  },
  {
    icon: Brain,
    title: "Explainable AI",
    description: "Understand exactly why a transaction is flagged",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Immediate alerts when high-risk activity is detected",
  },
];

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden"
      data-ocid="login.page"
    >
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="text-center"
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30">
              <Shield className="w-10 h-10 text-primary" />
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-50" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-primary/70" />
              </span>
            </div>
          </div>

          {/* Branding */}
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            FraudGuard AI
          </h1>
          <p className="text-muted-foreground text-base mb-8">
            AI-Powered Fraud Detection for Modern Banking
          </p>

          {/* CTA */}
          <div className="card-elevated p-6 mb-8">
            <p className="text-sm text-muted-foreground mb-4">
              Sign in with Internet Identity to access your fraud detection
              dashboard
            </p>
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="w-full h-11 font-semibold text-sm"
              data-ocid="login.submit_button"
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  Connecting…
                </span>
              ) : (
                "Connect with Internet Identity"
              )}
            </Button>
          </div>

          {/* Feature highlights */}
          <div
            className="grid grid-cols-3 gap-3"
            data-ocid="login.features.list"
          >
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
                className="p-3 rounded-lg border border-border bg-card/50 text-left"
                data-ocid={`login.features.item.${i + 1}`}
              >
                <feature.icon className="w-4 h-4 text-primary mb-1.5" />
                <p className="text-xs font-semibold text-foreground leading-tight">
                  {feature.title}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
