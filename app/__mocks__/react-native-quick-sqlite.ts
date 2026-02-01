export type QuickSQLiteConnection = {
  execute: jest.Mock;
  close: jest.Mock;
};

export const open = jest.fn().mockReturnValue({
  execute: jest.fn().mockReturnValue({rows: {length: 0, item: jest.fn()}}),
  close: jest.fn(),
});
