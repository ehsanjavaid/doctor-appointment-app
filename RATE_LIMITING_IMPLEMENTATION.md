# Rate Limiting and Account Locking Implementation

## Overview

This implementation provides robust security measures to protect against brute force attacks by implementing rate limiting and account locking mechanisms.

## Features Implemented

### 1. User Model Enhancements
- **`failedLoginAttempts`**: Tracks the number of consecutive failed login attempts
- **`accountLockedUntil`**: Stores the timestamp when the account lock expires
- **`lastFailedLogin`**: Records the timestamp of the last failed login attempt

### 2. Security Methods
- **`handleFailedLogin()`**: Increments failed attempts and locks account after 5 attempts
- **`resetFailedLoginAttempts()`**: Resets all security counters on successful login
- **`isAccountLocked()`**: Checks if account is currently locked
- **`getRemainingLockTime()`**: Returns remaining lock time in minutes

### 3. Rate Limiting Logic
- **5 failed attempts** within **15 minutes** triggers account lock
- Account remains locked for **30 minutes**
- Automatic unlock when lock period expires
- Clear and informative error messages for users

## API Endpoint Changes

### POST `/api/auth/login`
- **Rate Limit**: 5 attempts per 15 minutes per email/IP
- **Error Messages**:
  - `Invalid credentials. X attempts remaining.` - For failed attempts
  - `Account is temporarily locked...` - When account is locked
  - `Too many failed login attempts. Account has been locked...` - When lock is triggered

## Security Benefits

1. **Brute Force Protection**: Prevents automated password guessing attacks
2. **User Awareness**: Clear feedback about remaining attempts and lock status
3. **Automatic Recovery**: Accounts automatically unlock after timeout
4. **No Data Exposure**: Doesn't reveal whether email exists until after validation

## Testing

Run the test script to verify functionality:
```bash
node test-rate-limiting.js
```

## Configuration

The implementation can be easily configured by modifying:
- Lock threshold (currently 5 attempts)
- Lock duration (currently 30 minutes)
- Rate limit window (currently 15 minutes)

## Future Enhancements

1. Admin panel for manual account unlocking
2. Email notifications for account lock events
3. IP-based blocking for repeated attacks
4. Two-factor authentication integration
