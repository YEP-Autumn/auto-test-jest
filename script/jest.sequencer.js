const Sequencer = require("@jest/test-sequencer").default;

/**
 * 设备用例有状态依赖，执行顺序必须稳定且符合模块树：
 *
 *   NN-模块 / NN-UG小节 / NN-子功能 / NNNN-用例
 *
 * Jest 默认顺序不可控；只按文件名开头的数字排序（旧实现）又会把不同目录的
 * 0010 / 0020 交错在一起（每个子功能都从 0010 重新编号）。
 *
 * 因此这里按路径逐段比较：每段若以数字开头（`03-ETHERNET`、`0010-XXX.test.ts`），
 * 先比数字；否则按字符串比较。效果等同于「按模块树深度优先、同目录内序号递增」。
 *
 * 注意：调整排序会改变用例执行顺序，改动后需在设备上回归一次。
 */
function compareSegment(a, b) {
  if (a === b) return 0;

  const numA = a.match(/^(\d+)/);
  const numB = b.match(/^(\d+)/);

  if (numA && numB) {
    const diff = Number(numA[1]) - Number(numB[1]);
    if (diff !== 0) return diff;
  }

  return a < b ? -1 : 1;
}

function comparePath(pathA, pathB) {
  const a = pathA.split("/");
  const b = pathB.split("/");
  const len = Math.min(a.length, b.length);

  for (let i = 0; i < len; i++) {
    const diff = compareSegment(a[i], b[i]);
    if (diff !== 0) return diff;
  }

  return a.length - b.length;
}

class PathNaturalSequencer extends Sequencer {
  sort(tests) {
    return Array.from(tests).sort((testA, testB) => comparePath(testA.path, testB.path));
  }
}

module.exports = PathNaturalSequencer;
