import { useInternetIdentity } from "@caffeineai/core-infrastructure";

export function useAuth() {
  const {
    identity,
    login,
    clear,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
  } = useInternetIdentity();

  const principal = identity?.getPrincipal();
  const principalText = principal?.toText() ?? null;
  const shortPrincipal = principalText
    ? `${principalText.slice(0, 5)}...${principalText.slice(-5)}`
    : null;

  return {
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    identity,
    principal,
    principalText,
    shortPrincipal,
    login,
    logout: clear,
  };
}
