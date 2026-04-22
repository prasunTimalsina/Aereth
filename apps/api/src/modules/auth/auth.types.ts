export type AuthUser = {
  id: string;
  displayName: string;
  email: string;
};

export type AuthSession = {
  token: string;
  expiresAt: string;
  user: AuthUser;
};
