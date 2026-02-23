export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface ValidatedUser {
  userId: string;
  email: string;
  role: string;
}
