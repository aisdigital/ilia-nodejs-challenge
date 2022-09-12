export interface JwtPayload {
  usuario_login: string;
  usuario_tipo: string;
  usuario_id?: string;
  crms?: string[];
  flRedePropria?: boolean;
  hash: string;
}
