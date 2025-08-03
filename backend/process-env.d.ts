declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number;
      CONN_STRING: string;
    }
  }
}

export { };
