// Legacy export (will be removed after migration)
export { UserService, userService } from "./UserService";

// New modular services
export * from "./interfaces";
export * from "./auth";
export * from "./profile";
export {
  ServiceProvider,
  useServices,
  useAuthService,
  useProfileService,
} from "./ServiceProvider";
