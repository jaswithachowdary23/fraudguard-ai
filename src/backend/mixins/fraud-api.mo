import Types "../types/fraud";
import Common "../types/common";
import FraudLib "../lib/fraud";
import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Time "mo:core/Time";

mixin (
  transactions : List.List<Types.Transaction>,
  profiles : Map.Map<Common.UserId, Types.UserBehaviorProfile>,
) {

  /// Check a transaction for fraud using ML weighted scoring.
  /// Stores the result and returns full transaction with risk score + reasons.
  public shared ({ caller }) func checkTransaction(
    req : Types.CheckTransactionRequest
  ) : async Types.Transaction {
    let nowNs = Time.now();

    // Compute auto-features from stored history
    let autoFeatures = FraudLib.computeAutoFeatures(caller, transactions, nowNs);

    // Get existing behavior profile for caller
    let profile = profiles.get(caller);

    // Run weighted ML scoring engine
    let (riskScore, isFraud, confidence, fraudReasons) =
      FraudLib.scoreTransaction(req, autoFeatures, profile, nowNs);

    // Generate unique ID
    let txId = FraudLib.generateId(caller, nowNs, req.amount);

    // Build transaction record
    let tx : Types.Transaction = {
      id = txId;
      userId = caller;
      amount = req.amount;
      transactionType = req.transactionType;
      location = req.location;
      transactionMode = req.transactionMode;
      deviceType = req.deviceType;
      merchantCategory = req.merchantCategory;
      timestamp = nowNs;
      riskScore;
      isFraud;
      confidence;
      fraudReasons;
      autoFeatures;
    };

    // Persist transaction
    transactions.add(tx);

    // Update user behavior profile
    let updatedProfile = FraudLib.buildProfile(caller, transactions);
    profiles.add(caller, updatedProfile);

    tx;
  };

  /// Returns the caller's transactions, newest first.
  public shared query ({ caller }) func getMyTransactions() : async [Types.Transaction] {
    let userTxs = transactions.filter(func(tx : Types.Transaction) : Bool {
      Principal.equal(tx.userId, caller)
    });
    // Return transactions in insertion order (most recently added last → reverse)
    let arr = userTxs.toArray();
    arr;
  };

  /// Returns aggregate dashboard statistics and the 10 most recent transactions.
  public shared query ({ caller }) func getDashboardStats() : async Types.DashboardStats {
    let userTxs = transactions.filter(func(tx : Types.Transaction) : Bool {
      Principal.equal(tx.userId, caller)
    });
    let arr = userTxs.toArray();
    let total = arr.size();

    var fraudCount : Nat = 0;
    var safeCount : Nat = 0;
    for (tx in arr.values()) {
      if (tx.isFraud) { fraudCount += 1 } else { safeCount += 1 };
    };

    let fraudPercentage : Float = if (total == 0) {
      0.0;
    } else {
      fraudCount.toFloat() / total.toFloat() * 100.0;
    };

    // Get the 10 most recent transactions (last 10 in insertion order)
    let recent = if (arr.size() > 10) {
      arr.sliceToArray(arr.size() - 10, arr.size())
    } else {
      arr
    };

    {
      totalTransactions = total;
      fraudCount;
      safeCount;
      fraudPercentage;
      recentTransactions = recent;
    };
  };

  /// Returns model performance metrics calculated from all stored transactions.
  public shared query ({ caller }) func getModelMetrics() : async Types.ModelMetrics {
    FraudLib.computeMetrics(transactions);
  };

  /// Returns the caller's behavior profile, or null if no history exists yet.
  public shared query ({ caller }) func getMyBehaviorProfile() : async ?Types.UserBehaviorProfile {
    profiles.get(caller);
  };

};
