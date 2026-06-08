export const TS_CONFIG_NOT_FOUND = (configPath: string) => {
  console.warn(
    `No tsconfig file found ${configPath}. Aliases may not resolve.`,
  );
};

export const TS_CONFIG_PARSE_ERROR = (configPath: string) => {
  console.warn(`Malformed ${configPath} configuration`);
};
