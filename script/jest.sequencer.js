const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
    sort(tests) {
        const copyTests = Array.from(tests);

        return copyTests.sort((testA, testB) => (parseInt(testA.path.split('.').reverse()[3]) > parseInt(testB.path.split('.').reverse()[3]) ? 1 : -1));
    }
}

module.exports = CustomSequencer;