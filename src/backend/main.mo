import Types "types/fraud";
import Common "types/common";
import FraudApi "mixins/fraud-api";
import List "mo:core/List";
import Map "mo:core/Map";

actor {
  let transactions = List.empty<Types.Transaction>();
  let profiles = Map.empty<Common.UserId, Types.UserBehaviorProfile>();

  include FraudApi(transactions, profiles);
};
