# Rate Limiting and Account Locking Implementation

## Steps to Complete:

1. [ ] Update User model to add fields for tracking failed login attempts and account lock status
2. [ ] Enhance the rate limiting middleware to track failed attempts per user/email
3. [ ] Modify the login route to implement account locking after multiple failed attempts
4. [ ] Add account unlock functionality (manual or automatic after timeout)
5. [ ] Update error messages to be more informative for users
6. [ ] Test the implementation to ensure it works correctly

## Implementation Details:

### User Model Updates:
- Add `failedLoginAttempts` field to track number of failed attempts
- Add `accountLockedUntil` field to track when account is locked until
- Add `lastFailedLogin` field to track timestamp of last failed attempt

### Rate Limiting Logic:
- Track failed attempts per email address (not just IP)
- Lock account after 5 failed attempts within 15 minutes
- Auto-unlock after 30 minutes of being locked
- Clear failed attempts counter on successful login

### Security Considerations:
- Prevent brute force attacks
- Provide clear user feedback
- Allow account recovery mechanisms
