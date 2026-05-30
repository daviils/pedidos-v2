export const jwtConstants = {
  secret: process.env.JWT_SECRET ?? 'pedidos-api-jwt-secret',
  expiresIn: '1d',
} as const;
