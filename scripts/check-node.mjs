const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 22 || (major === 22 && minor < 12)) {
  console.error(
    "Taska requires Node.js 22.12 or newer. Install Node.js 24 LTS, then reopen your terminal.",
  );
  process.exit(1);
}
