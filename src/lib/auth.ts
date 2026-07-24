export interface AuthUser {
  id: string;
  name: string;
  email: string;
  password: string;
  company: string;
  createdAt: string;
}

const AUTH_USERS_KEY = "invoicehq_auth_users";
const AUTH_SESSION_KEY = "invoicehq_auth_session";

const DEFAULT_USERS: AuthUser[] = [
  {
    id: "u_1",
    name: "Arjun Kumar",
    email: "ark@arkdesign.in",
    password: "invoicehq123",
    company: "ARK Design Studio",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getStorageItem<T>(key: string, defaultValue: T): T {
  if (!isBrowser()) return defaultValue;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : defaultValue;
  } catch (error) {
    console.error("Auth storage read failed", error);
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Auth storage write failed", error);
  }
}

export function initAuth() {
  if (!isBrowser()) return;
  if (!window.localStorage.getItem(AUTH_USERS_KEY)) {
    setStorageItem(AUTH_USERS_KEY, DEFAULT_USERS);
  }
}

export function getAuthUsers(): AuthUser[] {
  initAuth();
  return getStorageItem<AuthUser[]>(AUTH_USERS_KEY, DEFAULT_USERS);
}

export function findUserByEmail(email: string): AuthUser | undefined {
  return getAuthUsers().find(
    (user) => user.email.toLowerCase() === email.toLowerCase(),
  );
}

export function getSessionUser(): AuthUser | null {
  if (!isBrowser()) return null;
  return getStorageItem<AuthUser | null>(AUTH_SESSION_KEY, null);
}

export function setSessionUser(user: AuthUser | null) {
  if (!isBrowser()) return;
  setStorageItem<AuthUser | null>(AUTH_SESSION_KEY, user);
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: AuthUser | null;
}

export function loginUser(email: string, password: string): AuthResult {
  initAuth();
  const user = findUserByEmail(email);
  if (!user) {
    return { success: false, message: "No account found for this email." };
  }
  if (user.password !== password) {
    return { success: false, message: "Incorrect password. Please try again." };
  }
  setSessionUser(user);
  return { success: true, message: "Logged in successfully.", user };
}

export function signupUser(
  name: string,
  email: string,
  password: string,
  company: string,
): AuthResult {
  initAuth();
  if (!name || !email || !password || !company) {
    return { success: false, message: "Please complete all required fields." };
  }
  if (findUserByEmail(email)) {
    return {
      success: false,
      message: "An account already exists with this email.",
    };
  }
  const users = getAuthUsers();
  const newUser: AuthUser = {
    id: `u_${Date.now()}`,
    name,
    email,
    password,
    company,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  setStorageItem(AUTH_USERS_KEY, users);
  setSessionUser(newUser);
  return {
    success: true,
    message: "Account created successfully.",
    user: newUser,
  };
}

export function logoutUser(): void {
  setSessionUser(null);
}

export function updateUserProfile(
  updated: Partial<Omit<AuthUser, "password">> & { password?: string },
): AuthResult {
  initAuth();
  const current = getSessionUser();
  if (!current) {
    return { success: false, message: "No signed-in user found." };
  }
  const users = getAuthUsers();
  const index = users.findIndex((user) => user.id === current.id);
  if (index === -1) {
    return { success: false, message: "User profile cannot be updated." };
  }

  const updatedUser: AuthUser = {
    ...users[index],
    ...updated,
    password: updated.password ? updated.password : users[index].password,
  };
  users[index] = updatedUser;
  setStorageItem(AUTH_USERS_KEY, users);
  setSessionUser(updatedUser);

  return {
    success: true,
    message: "Profile updated successfully.",
    user: updatedUser,
  };
}
