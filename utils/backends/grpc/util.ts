/**
 * streamcontrol 后端的通用小工具。
 */

/** 业务错误检查：契约约定 Result.code != 0 表示失败 */
export function assertResult(result: any, op: string): void {
  if (!result) return;
  const code = Number(result.code ?? 0);
  if (code !== 0) {
    const detail = [
      `code=${code}`,
      result.message ? `message=${result.message}` : "",
      result.path ? `path=${result.path}` : "",
    ]
      .filter(Boolean)
      .join(" ");
    throw new Error(`[streamcontrol] ${op} failed: ${detail}`);
  }
}

export function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 批量抓包阈值：capture 帧数达到该值后优先走
 * Capture.Download + FileService.Download + 本地 pcap 解析。
 *
 * 设为 0 表示只要停止抓包就批量下载；设为很大的值可退回 ReadByIndex。
 */
export function batchCaptureThreshold(): number {
  const raw = process.env.STREAM_CONTROL_BATCH_CAPTURE_MIN;
  if (raw === undefined) return 64;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : 64;
}
