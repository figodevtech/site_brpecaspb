// Compatibility entry point: uses the versioned migration history.
import { main } from "./migrate.mjs";
process.argv = [process.argv[0], process.argv[1], "deploy"];
main().catch(() => { console.error("Falha ao migrar. Consulte npm run db:status e o roteiro de integração."); process.exitCode = 1; });
