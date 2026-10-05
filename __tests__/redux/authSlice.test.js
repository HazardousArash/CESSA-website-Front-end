import authReducer, { setSession, clearAuth, triggerAlarm, clearAlarm } from '@/redux/slices/authSlice';

describe('AuthSlice Redux State Tests', () => {
  const initialState = {
    token: null,
    role: null,
    user: null,
    isAuthenticated: false,
    authChecked: false,
    isAlarm: false,
    alarmMessage: "",
  };

  it('should handle initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setSession', () => {
    const actual = authReducer(initialState, setSession({
      token: 'fake-jwt-token',
      role: 'Admin',
      user: { id: '123', email: 'admin@cessa.com' }
    }));
    expect(actual.isAuthenticated).toEqual(true);
    expect(actual.token).toEqual('fake-jwt-token');
    expect(actual.role).toEqual('Admin');
    expect(actual.authChecked).toEqual(true);
  });

  it('should handle clearAuth', () => {
    const loggedInState = { ...initialState, isAuthenticated: true, token: '123' };
    const actual = authReducer(loggedInState, clearAuth());
    expect(actual.isAuthenticated).toEqual(false);
    expect(actual.token).toEqual(null);
  });

  it('should trigger and clear alarm', () => {
    let actual = authReducer(initialState, triggerAlarm("Network Error"));
    expect(actual.isAlarm).toEqual(true);
    expect(actual.alarmMessage).toEqual("Network Error");

    actual = authReducer(actual, clearAlarm());
    expect(actual.isAlarm).toEqual(false);
    expect(actual.alarmMessage).toEqual("");
  });
});