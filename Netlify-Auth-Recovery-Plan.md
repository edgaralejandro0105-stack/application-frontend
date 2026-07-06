# Netlify Authentication Recovery Plan

## Issue Summary
Users are experiencing "failed fetch" when trying to access Netlify deployment on other devices due to authentication credential issues.

## Problem Analysis
The authentication system stores JWT tokens in `localStorage`:
- `authToken`: Access token (short-lived)
- `refreshToken`: Refresh token (long-lived) 
- `authUser`: User profile data

**Root Cause**: Netlify's CDN serves static files, making `localStorage` data accessible but not synced across devices, leading to authentication failures.

## Diagnosis Steps

### 1. Verify Environment Configuration
```bash
# Check current environment variables in production
# Inspect what VITE_* variables are set in Netlify dashboard
```

### 2. Test Token Persistence
```javascript
// Verify token retrieval works on different devices
localStorage.getItem("authToken")
localStorage.getItem("refreshToken")
```

### 3. Check API Endpoint Access
```bash
# Test backend accessibility from different devices
curl -I https://your-backend.netlify.app/api/auth/profile
```

## Possible Causes

### 1. Token Storage Issues
- **Problem**: Tokens stored in `localStorage` are not synced across devices
- **Impact**: Each device needs separate authentication
- **Files**: `lib/api-client.js:26-31`, `auth.service.js:20-24`, `context/AuthContext.jsx:10-11`

### 2. Missing Environment Configuration
- **Problem**: `VITE_API_URL` not set in Netlify production environment
- **Impact**: API requests fail due to incorrect base URL
- **Files**: `lib/api-client.js:1`, `vite.config.js:14-15`

### 3. Authentication Flow Breakdown
- **Problem**: Token refresh mechanism may not handle Netlify edge cases
- **Impact**: Stale/expired tokens cause failed requests
- **Files**: `lib/api-client.js:38-90`, `auth.service.js:75-86`

## Implementation Plan

### Phase 1: Immediate Fixes (24h)

#### 1.1 Add Netlify Configuration
Create `netlify.toml`:
```toml
[build]
  environment = {
    VITE_API_URL = "https://your-backend.netlify.app/api"
  }

[functions]
  directory = "netlify/functions"
```

#### 1.2 Secure Token Storage
Implement HTTP-only cookies for tokens:
- Keep `localStorage` for client-side UI state only
- Store `authToken` and `refreshToken` in HttpOnly cookies
- Read tokens via `document.cookie` instead of `localStorage`

#### 1.3 Add Security Headers
Configure Netlify security:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

### Phase 2: Long-term Solutions (1 week)

#### 2.1 Implement Device-based Authentication
- Add device fingerprinting
- Implement session management
- Add multi-device sync via secure storage

#### 2.2 Create Auth Service Layer
```javascript
// lib/auth-service.js
export class AuthService {
  async login(credentials) {
    // Handle device registration
    // Manage multiple device sessions
  }
  
  async refreshToken() {
    // Handle edge cases on Netlify
  }
}
```

#### 2.3 Add Monitoring and Debugging
- Implement logging for authentication failures
- Add diagnostic endpoints for troubleshooting
- Create user-friendly error messages

### Phase 3: Testing and Deployment (2 days)

#### 3.1 Test Scenarios
1. Login on Device A, access on Device B
2. Token refresh during inactivity
3. Network failure recovery
4. Browser isolation scenarios

#### 3.2 Deployment Checklist
- [ ] Netlify environment variables configured
- [ ] Security headers implemented
- [ ] Cookie-based authentication working
- [ ] Error handling improved
- [ ] Testing across multiple devices completed

## Files to Modify

### Core Authentication Files
- `lib/api-client.js:26-31` - Token injection logic
- `auth.service.js:20-24` - LocalStorage token storage
- `context/AuthContext.jsx:10-11` - Token state management

### Configuration Files
- `netlify.toml` - Production environment setup
- `.env.local` - Local development configuration

### Testing Files
- Create test suite for cross-device authentication
- Add integration tests for Netlify deployment
- Implement automated monitoring

## Risk Assessment

### High Risk
- Token management changes
- Production deployment
- Multi-device compatibility

### Mitigation
- Implement rollback strategy
- Add comprehensive testing
- Use feature flags for gradual rollout

## Success Metrics

1. **Authentication Success**: >99% success rate across devices
2. **Response Time**: <500ms for auth-related requests
3. **Error Rate**: <0.1% authentication errors
4. **User Experience**: No manual token sync required

## Rollback Plan

If issues occur:
1. Revert to localStorage authentication
2. Disable new cookie-based system
3. Investigate failed requests
4. Implement incremental fixes

## Dependencies

- Node.js runtime
- Browser compatibility for cookie operations
- Netlify functions for backend APIs

## Communication Plan

1. **Stakeholders**: Daily status updates
2. **Users**: Clear documentation on device compatibility
3. **Team**: Code review and pair programming for critical changes

## Timeline

- **Day 1**: Netlify configuration + basic fixes
- **Day 2-3**: Cookie-based authentication + security headers
- **Day 4-5**: Device authentication system
- **Day 6**: Testing and deployment
- **Day 7**: Monitoring and issue resolution