import chalk from "chalk";

/**
 * Example:
 * 成功标签：chalk.bgGreen.black(' PASS ')
 * 失败标签：chalk.bgRed.white.bold(' FAIL ')
 * 运行中：chalk.bgBlue.black(' RUNS ')
 */

console.log(chalk.bgBlueBright.white(`蓝底白字`));
console.log(chalk.bgRed.white("红底白字"));
console.log(chalk.bgRed.black("红底黑字"));
console.log(chalk.bgBlack.red("黑底红字"));
console.log(chalk.bgHex("#e61919ff").hex("#000000ff")("红底黑字"));
console.log(chalk.bgHex("#e61919ff").hex("#16c2ecff")("红底蓝字"));
console.log(chalk.bgHex("#e61919ff").hex("#ffffffff")("红底白字"));
