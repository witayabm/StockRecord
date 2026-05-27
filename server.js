const { startBackend } = require("./backend/server");
const { startFrontend } = require("./frontend/server");

async function start() {
  const [backendServer, frontendServer] = await Promise.all([
    startBackend(),
    startFrontend()
  ]);

  return { backendServer, frontendServer };
}

if (require.main === module) {
  start().catch((error) => {
    console.error("Failed to start Stock Record servers:", error);
    process.exit(1);
  });
}

module.exports = {
  start
};
