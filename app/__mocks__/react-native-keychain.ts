export const ACCESSIBLE = {
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WhenUnlockedThisDeviceOnly',
};

export const ACCESS_CONTROL = {
  BIOMETRY_CURRENT_SET: 'BiometryCurrentSet',
};

export const setGenericPassword = jest.fn().mockResolvedValue(true);
export const getGenericPassword = jest.fn().mockResolvedValue(false);
export const resetGenericPassword = jest.fn().mockResolvedValue(true);
