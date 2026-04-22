import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  CheckTransactionRequest,
  DashboardStats,
  ModelMetrics,
  Transaction,
  UserBehaviorProfile,
} from "../types";

function useBackendActor() {
  return useActor(createActor);
}

export function useDashboardStats() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useMyTransactions() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Transaction[]>({
    queryKey: ["myTransactions"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getMyTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useModelMetrics() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<ModelMetrics>({
    queryKey: ["modelMetrics"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getModelMetrics();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyBehaviorProfile() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<UserBehaviorProfile | null>({
    queryKey: ["behaviorProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getMyBehaviorProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCheckTransaction() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation<Transaction, Error, CheckTransactionRequest>({
    mutationFn: async (req: CheckTransactionRequest) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.checkTransaction(req);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["myTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["behaviorProfile"] });
    },
  });
}
