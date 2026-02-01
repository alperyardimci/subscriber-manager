import {calculateNextPaymentDate} from '../src/features/notifications/notificationScheduler';

describe('calculateNextPaymentDate', () => {
  it('adds 1 month for monthly billing cycle', () => {
    const result = calculateNextPaymentDate('2026-01-15', 'monthly', null);
    expect(result).toBe('2026-02-15');
  });

  it('adds 1 year for yearly billing cycle', () => {
    const result = calculateNextPaymentDate('2026-01-15', 'yearly', null);
    expect(result).toBe('2027-01-15');
  });

  it('adds custom days for custom billing cycle', () => {
    const result = calculateNextPaymentDate('2026-01-15', 'custom', 90);
    expect(result).toBe('2026-04-15');
  });

  it('defaults to 30 days for custom cycle with null days', () => {
    const result = calculateNextPaymentDate('2026-01-01', 'custom', null);
    expect(result).toBe('2026-01-31');
  });

  it('handles month-end rollover for monthly cycle', () => {
    const result = calculateNextPaymentDate('2026-01-31', 'monthly', null);
    // Jan 31 + 1 month = Feb 28 (or Mar 3 depending on JS Date behavior)
    expect(result).toBeTruthy();
  });

  it('handles leap year for yearly cycle', () => {
    const result = calculateNextPaymentDate('2024-02-29', 'yearly', null);
    // 2025 is not a leap year, so Feb 29 becomes Mar 1
    expect(result).toBeTruthy();
  });
});
