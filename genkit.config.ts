// genkit.config.ts
import { defineConfig } from 'genkit';

export default defineConfig({
  telemetry: {
    enabled: false, // 禁用 OpenTelemetry，避免載入 Jaeger 模組
  },
});
