type LogFields = Record<string, unknown>;

export function logAppEvent(
  level: "info" | "warn" | "error",
  event: string,
  fields: LogFields = {}
) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    event,
    ...fields,
  };
  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.info(line);
  }
}
