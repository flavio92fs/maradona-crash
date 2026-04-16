const { execSync } = require("child_process");
const os = require("os");
const path = require("path");

const host = process.argv[2];
const remotePath = "/var/www/maradona3D";
const localDist = path.join(__dirname, "dist");

if (!host) {
  console.error("\x1b[31m✗ Specifica l'host SSH.\x1b[0m");
  console.error("  Uso: npm run deploy -- <ssh-host>");
  console.error("  Es:  npm run deploy -- maradona");
  process.exit(1);
}

const isWindows = os.platform() === "win32";

function run(cmd, label) {
  if (label) console.log(`  ${label}`);
  execSync(cmd, { stdio: "inherit" });
}

console.log(`\x1b[36m→ Deploy su ${host}:${remotePath}\x1b[0m\n`);

try {
  // 1. Pulisci la cartella remota
  const cleanCmd = `ssh ${host} "rm -rf ${remotePath}/* && mkdir -p ${remotePath}"`;
  run(cleanCmd, "Pulizia cartella remota...");

  // 2. Upload
  if (isWindows) {
    run(`scp -r "${localDist}\\." ${host}:${remotePath}`, "Upload (scp)...");
  } else {
    run(`rsync -avz --delete "${localDist}/" ${host}:${remotePath}/`, "Upload (rsync)...");
  }

  console.log(`\n\x1b[32m✓ Deploy completato!\x1b[0m`);
} catch (e) {
  console.error(`\n\x1b[31m✗ Deploy fallito (exit code ${e.status})\x1b[0m`);
  process.exit(1);
}
