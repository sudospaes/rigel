export function rootPath() {
  return process.cwd();
}

export function sanitizePath(path: string): string {
  return path.trim().replace(/^"|"$/g, "");
}

export function runDetached(fn: () => Promise<any>) {
  (async () => {
    try {
      await fn();
    } catch (error) {
      console.error(error);
    }
  })();
}
