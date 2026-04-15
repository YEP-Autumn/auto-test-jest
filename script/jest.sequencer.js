const Sequencer = require("@jest/test-sequencer").default;

class CustomSequencerDefault extends Sequencer {
  sort(tests) {
    const copyTests = Array.from(tests);
    return copyTests;
  }
}

class CustomSequencerPrefixNum extends Sequencer {
  sort(tests) {
    const copyTests = Array.from(tests);

    // 从文件路径中提取开头的数字并按数值大小排序
    const getSortKey = (path) => {
      // 提取文件名（路径的最后一部分）
      const fileName = path.split('/').pop();
      // 使用正则表达式匹配文件名开头的数字
      const match = fileName.match(/^(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    };

    return copyTests.sort((testA, testB) => {
      const keyA = getSortKey(testA.path);
      const keyB = getSortKey(testB.path);

      // 按数值大小排序
      return keyA - keyB;
    });
  }
}

module.exports = CustomSequencerPrefixNum;
