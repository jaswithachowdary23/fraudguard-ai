import Common "common";

module {
  public type TransactionType = {
    #Payment;
    #Transfer;
    #Withdrawal;
    #OnlinePurchase;
  };

  public type TransactionMode = {
    #Mobile;
    #Web;
    #ATM;
    #POS;
  };

  public type DeviceType = {
    #Android;
    #iOS;
    #Desktop;
  };

  public type MerchantCategory = {
    #Shopping;
    #Food;
    #Travel;
    #Bills;
    #Others;
  };

  public type AutoFeatures = {
    txCount24h : Nat;       // transactions in last 24 hours
    avgAmount : Float;      // user's average transaction amount
    timeSinceLast : Int;    // seconds since last transaction
    prevLocation : Text;    // user's previous transaction location
  };

  public type Transaction = {
    id : Text;
    userId : Common.UserId;
    amount : Float;
    transactionType : TransactionType;
    location : Text;
    transactionMode : TransactionMode;
    deviceType : DeviceType;
    merchantCategory : MerchantCategory;
    timestamp : Common.Timestamp;
    riskScore : Float;      // 0.0 to 1.0
    isFraud : Bool;
    confidence : Float;     // model confidence 0.0 to 1.0
    fraudReasons : [Text];  // e.g. "Unusual amount", "New location"
    autoFeatures : AutoFeatures;
  };

  public type CheckTransactionRequest = {
    amount : Float;
    transactionType : TransactionType;
    location : Text;
    transactionMode : TransactionMode;
    deviceType : DeviceType;
    merchantCategory : MerchantCategory;
  };

  public type ModelMetrics = {
    totalTransactions : Nat;
    fraudCount : Nat;
    safeCount : Nat;
    truePositives : Nat;
    trueNegatives : Nat;
    falsePositives : Nat;
    falseNegatives : Nat;
    accuracy : Float;
    precision : Float;
    recall : Float;
    f1Score : Float;
  };

  public type UserBehaviorProfile = {
    userId : Common.UserId;
    avgSpending : Float;
    maxSpending : Float;
    commonLocations : [Text];
    activeHours : [Nat];        // 0-23
    totalTransactions : Nat;
  };

  public type DashboardStats = {
    totalTransactions : Nat;
    fraudCount : Nat;
    safeCount : Nat;
    fraudPercentage : Float;
    recentTransactions : [Transaction];
  };
};
