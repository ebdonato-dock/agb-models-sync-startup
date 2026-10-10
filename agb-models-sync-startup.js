import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

// Instale em ~/.pi/agent/extensions/agb-models-sync-startup.js.
export default async function modelsSyncStartup(pi) {
  const command = "agentic-bus models sync";
  // No Windows, "bash" pode apontar para o WSL em vez do Git Bash.
  const isWindows = process.platform === "win32";
  const shell = isWindows ? "cmd.exe" : "bash";
  const args = isWindows ? ["/d", "/s", "/c", command] : ["-c", command];
  const configuredDir = process.env.PI_CODING_AGENT_DIR;
  const agentDir = configuredDir
    ? resolve(configuredDir.replace(/^~(?=$|[\\/])/, homedir()))
    : join(homedir(), ".pi", "agent");
  const modelsPath = join(agentDir, "models.json");

  let failure;

  try {
    // O Pi aguarda a factory antes de atualizar o catálogo e escolher o modelo.
    // pi.exec usa o diretório de trabalho fornecido pelo loader do Pi.
    const result = await pi.exec(shell, args);

    if (result.code !== 0 || result.killed) {
      const output = [result.stderr.trim(), result.stdout.trim()]
        .filter(Boolean)
        .join("\n");
      const reason = result.killed
        ? "Execução interrompida."
        : `Código de saída: ${result.code}.`;
      throw new Error([reason, output].filter(Boolean).join("\n"));
    }
  } catch (error) {
    failure = new Error(
      `Falha ao executar ${command}:\n${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (!failure) {
    try {
      const content = await readFile(modelsPath, "utf8");
      JSON.parse(content.replace(/^\uFEFF/, ""));
    } catch (error) {
      failure = new Error(
        `O comando ${command} terminou, mas não foi possível ler um models.json válido em ${modelsPath}:\n${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  if (failure) {
    const message = `A sincronização de modelos falhou. O Pi continuará disponível.\n${failure.message}`;
    if (pi.ui?.notify) {
      pi.ui.notify(message, "error");
    } else {
      process.stderr.write(`${message}\n`);
    }
  }
}
