import * as Location from 'expo-location';

export type ForegroundPermissionSnapshot = {
  granted: boolean;
  canAskAgain: boolean;
  servicesEnabled: boolean;
};

/**
 * Read-only permission state (no prompt). Use after returning from Settings or background.
 */
export async function getForegroundPermissionSnapshot(): Promise<ForegroundPermissionSnapshot> {
  const [permission, servicesEnabled] = await Promise.all([
    Location.getForegroundPermissionsAsync(),
    Location.hasServicesEnabledAsync(),
  ]);

  return {
    granted: permission.status === Location.PermissionStatus.GRANTED,
    canAskAgain: permission.canAskAgain,
    servicesEnabled,
  };
}
