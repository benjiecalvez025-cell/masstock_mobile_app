# TODO - Backend JWT Auth Wiring

- [ ] Update `app/auth/login.tsx` to call `apiService.login` and set context user from backend response.
- [ ] Update `app/auth/signup.tsx` to call `apiService.signup` and set context user from backend response.
- [ ] Update `context/app-context.tsx` to load user from AsyncStorage (`user` key) on startup and remove Firebase auth listener.
- [ ] Smoke test: Signup -> (tabs) navigation; Login -> (tabs); Cart/Orders/Payments requests succeed with Authorization header.
