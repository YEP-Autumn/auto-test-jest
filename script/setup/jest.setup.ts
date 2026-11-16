/**
 * Jest 启动前的统一设置。
 *
 * 配置已迁移到 config/env/*.json，这里不再加载 .env。
 * 仅保留 console.log 指向真实控制台，避免被测试框架替换。
 */
console.log = jest.requireActual("console").log;
