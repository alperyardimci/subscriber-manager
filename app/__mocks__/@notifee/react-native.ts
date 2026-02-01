export const AndroidImportance = {HIGH: 4};
export const TriggerType = {TIMESTAMP: 0};
export type TimestampTrigger = {type: number; timestamp: number};

export default {
  createChannel: jest.fn().mockResolvedValue(''),
  requestPermission: jest.fn().mockResolvedValue({authorizationStatus: 1}),
  createTriggerNotification: jest.fn().mockResolvedValue(''),
  cancelNotification: jest.fn().mockResolvedValue(''),
  cancelAllNotifications: jest.fn().mockResolvedValue(''),
};
