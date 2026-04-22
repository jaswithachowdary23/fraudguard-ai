import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type UserId = Principal;
export type Timestamp = bigint;
export interface CheckTransactionRequest {
    transactionMode: TransactionMode;
    transactionType: TransactionType;
    merchantCategory: MerchantCategory;
    deviceType: DeviceType;
    amount: number;
    location: string;
}
export interface ModelMetrics {
    trueNegatives: bigint;
    fraudCount: bigint;
    truePositives: bigint;
    f1Score: number;
    safeCount: bigint;
    precision: number;
    falseNegatives: bigint;
    falsePositives: bigint;
    totalTransactions: bigint;
    recall: number;
    accuracy: number;
}
export interface AutoFeatures {
    avgAmount: number;
    txCount24h: bigint;
    timeSinceLast: bigint;
    prevLocation: string;
}
export interface UserBehaviorProfile {
    avgSpending: number;
    userId: UserId;
    maxSpending: number;
    activeHours: Array<bigint>;
    commonLocations: Array<string>;
    totalTransactions: bigint;
}
export interface DashboardStats {
    fraudCount: bigint;
    safeCount: bigint;
    recentTransactions: Array<Transaction>;
    fraudPercentage: number;
    totalTransactions: bigint;
}
export interface Transaction {
    id: string;
    fraudReasons: Array<string>;
    transactionMode: TransactionMode;
    transactionType: TransactionType;
    userId: UserId;
    autoFeatures: AutoFeatures;
    merchantCategory: MerchantCategory;
    isFraud: boolean;
    timestamp: Timestamp;
    deviceType: DeviceType;
    confidence: number;
    amount: number;
    location: string;
    riskScore: number;
}
export enum DeviceType {
    iOS = "iOS",
    Android = "Android",
    Desktop = "Desktop"
}
export enum MerchantCategory {
    Food = "Food",
    Bills = "Bills",
    Travel = "Travel",
    Shopping = "Shopping",
    Others = "Others"
}
export enum TransactionMode {
    ATM = "ATM",
    POS = "POS",
    Web = "Web",
    Mobile = "Mobile"
}
export enum TransactionType {
    OnlinePurchase = "OnlinePurchase",
    Withdrawal = "Withdrawal",
    Transfer = "Transfer",
    Payment = "Payment"
}
export interface backendInterface {
    checkTransaction(req: CheckTransactionRequest): Promise<Transaction>;
    getDashboardStats(): Promise<DashboardStats>;
    getModelMetrics(): Promise<ModelMetrics>;
    getMyBehaviorProfile(): Promise<UserBehaviorProfile | null>;
    getMyTransactions(): Promise<Array<Transaction>>;
}
