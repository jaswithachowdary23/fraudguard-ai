import type { backendInterface, Transaction, DashboardStats, ModelMetrics, UserBehaviorProfile } from "../backend";
import { DeviceType, MerchantCategory, TransactionMode, TransactionType } from "../backend";
import { Principal } from "@icp-sdk/core/principal";

const mockUserId = Principal.fromText("2vxsx-fae");

const mockTransactions: Transaction[] = [
  {
    id: "txn-001",
    fraudReasons: ["Unusual transaction amount", "New location detected"],
    transactionMode: TransactionMode.Mobile,
    transactionType: TransactionType.OnlinePurchase,
    userId: mockUserId,
    autoFeatures: {
      avgAmount: 1200,
      txCount24h: BigInt(8),
      timeSinceLast: BigInt(15),
      prevLocation: "Hyderabad",
    },
    merchantCategory: MerchantCategory.Shopping,
    isFraud: true,
    timestamp: BigInt(Date.now()) * BigInt(1_000_000),
    deviceType: DeviceType.Android,
    confidence: 0.91,
    amount: 15000,
    location: "New York",
    riskScore: 0.87,
  },
  {
    id: "txn-002",
    fraudReasons: [],
    transactionMode: TransactionMode.POS,
    transactionType: TransactionType.Payment,
    userId: mockUserId,
    autoFeatures: {
      avgAmount: 800,
      txCount24h: BigInt(3),
      timeSinceLast: BigInt(120),
      prevLocation: "Mumbai",
    },
    merchantCategory: MerchantCategory.Food,
    isFraud: false,
    timestamp: BigInt(Date.now() - 3600000) * BigInt(1_000_000),
    deviceType: DeviceType.iOS,
    confidence: 0.95,
    amount: 450,
    location: "Mumbai",
    riskScore: 0.12,
  },
  {
    id: "txn-003",
    fraudReasons: ["Odd transaction time"],
    transactionMode: TransactionMode.ATM,
    transactionType: TransactionType.Withdrawal,
    userId: mockUserId,
    autoFeatures: {
      avgAmount: 600,
      txCount24h: BigInt(5),
      timeSinceLast: BigInt(45),
      prevLocation: "Delhi",
    },
    merchantCategory: MerchantCategory.Bills,
    isFraud: false,
    timestamp: BigInt(Date.now() - 7200000) * BigInt(1_000_000),
    deviceType: DeviceType.Desktop,
    confidence: 0.67,
    amount: 3200,
    location: "Delhi",
    riskScore: 0.48,
  },
  {
    id: "txn-004",
    fraudReasons: [],
    transactionMode: TransactionMode.Web,
    transactionType: TransactionType.Transfer,
    userId: mockUserId,
    autoFeatures: {
      avgAmount: 900,
      txCount24h: BigInt(2),
      timeSinceLast: BigInt(200),
      prevLocation: "Bangalore",
    },
    merchantCategory: MerchantCategory.Travel,
    isFraud: false,
    timestamp: BigInt(Date.now() - 86400000) * BigInt(1_000_000),
    deviceType: DeviceType.Desktop,
    confidence: 0.98,
    amount: 850,
    location: "Bangalore",
    riskScore: 0.05,
  },
];

const mockDashboardStats: DashboardStats = {
  fraudCount: BigInt(124),
  safeCount: BigInt(1876),
  recentTransactions: mockTransactions,
  fraudPercentage: 6.2,
  totalTransactions: BigInt(2000),
};

const mockModelMetrics: ModelMetrics = {
  trueNegatives: BigInt(1820),
  fraudCount: BigInt(124),
  truePositives: BigInt(118),
  f1Score: 0.924,
  safeCount: BigInt(1876),
  precision: 0.937,
  falseNegatives: BigInt(6),
  falsePositives: BigInt(56),
  totalTransactions: BigInt(2000),
  recall: 0.951,
  accuracy: 0.969,
};

const mockBehaviorProfile: UserBehaviorProfile = {
  avgSpending: 1250,
  userId: mockUserId,
  maxSpending: 18000,
  activeHours: [BigInt(9), BigInt(10), BigInt(11), BigInt(14), BigInt(15), BigInt(20), BigInt(21)],
  commonLocations: ["Hyderabad", "Mumbai", "Bangalore"],
  totalTransactions: BigInt(47),
};

export const mockBackend: backendInterface = {
  checkTransaction: async (_req) => mockTransactions[0],
  getDashboardStats: async () => mockDashboardStats,
  getModelMetrics: async () => mockModelMetrics,
  getMyBehaviorProfile: async () => mockBehaviorProfile,
  getMyTransactions: async () => mockTransactions,
};
