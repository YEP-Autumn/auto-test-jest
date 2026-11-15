/**
 * 轮询 JobService.GetJob 直到成功/失败/取消。
 */

import type { StreamControlClient } from "./client";
import { assertResult, sleepMs } from "./util";

export async function waitJob(
  client: StreamControlClient,
  jobId?: number,
  op = "job",
  timeoutMs = 60_000,
): Promise<void> {
  if (!jobId) return;

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const job = await client.unary<any>(client.job, "GetJob", {
      job_id: jobId,
    });
    assertResult(job.result, `JobService.GetJob(${jobId})`);

    // JobState: QUEUED=1 RUNNING=2 SUCCEEDED=3 FAILED=4 CANCELLED=5
    const state = Number(job.state ?? 0);
    if (state === 3) return;
    if (state === 4) {
      const message = job.job_result?.message || job.message || "";
      throw new Error(`[streamcontrol] ${op} job ${jobId} failed: ${message}`);
    }
    if (state === 5) {
      throw new Error(`[streamcontrol] ${op} job ${jobId} cancelled`);
    }
    await sleepMs(100);
  }

  throw new Error(
    `[streamcontrol] ${op} job ${jobId} timeout (${timeoutMs}ms)`,
  );
}
