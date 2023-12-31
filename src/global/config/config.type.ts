export type DatabaseConfig = {
  host?: string;
  port?: number;
  password?: string;
  database?: string;
  username?: string;
  maxConnections: number;
  synchronize?: boolean;
};

export type AuthConfig = {
  secret: string;
  accessTokenValidity: string;
  refreshTokenValidity: string;
};

export type S3Config = {
  accessKey: string;
  secretAccessKey: string;
  bucket: string;
  region: string;
};

export type Config = {
  db: DatabaseConfig;
  auth: AuthConfig;
};
