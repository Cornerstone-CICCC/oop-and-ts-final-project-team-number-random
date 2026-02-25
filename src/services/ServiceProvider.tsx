import { createContext, useContext, useMemo, type ReactNode } from "react";
import { auth, db } from "@/lib/firebase";
import { AuthService } from "./auth";
import { ProfileService } from "./profile";
import type { IAuthService, IProfileService } from "./interfaces";

/**
 * Service Context Value
 * Contains all service instances for dependency injection (DIP)
 */
type ServiceContextValue = {
  authService: IAuthService;
  profileService: IProfileService;
};

const ServiceContext = createContext<ServiceContextValue | null>(null);

type ServiceProviderProps = {
  children: ReactNode;
};

/**
 * ServiceProvider - Dependency Injection Container
 * Provides service instances to the component tree (DIP - Dependency Inversion)
 *
 * Benefits:
 * - Components depend on interfaces, not concrete implementations
 * - Easy to swap implementations (e.g., for testing)
 * - Centralized service instantiation
 */
export function ServiceProvider({ children }: ServiceProviderProps) {
  const services = useMemo<ServiceContextValue>(
    () => ({
      authService: new AuthService(auth, db),
      profileService: new ProfileService(auth, db),
    }),
    []
  );

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
}

/**
 * useServices Hook
 * Access all services from the context
 */
export function useServices(): ServiceContextValue {
  const context = useContext(ServiceContext);

  if (!context) {
    throw new Error("useServices must be used within a ServiceProvider");
  }

  return context;
}

/**
 * useAuthService Hook
 * Access only the authentication service
 */
export function useAuthService(): IAuthService {
  const { authService } = useServices();
  return authService;
}

/**
 * useProfileService Hook
 * Access only the profile service
 */
export function useProfileService(): IProfileService {
  const { profileService } = useServices();
  return profileService;
}
