export function rootPath() {
  return process.cwd();
}

export function sanitizePath(path: string): string {
  return path.trim().replace(/^"|"$/g, "");
}
