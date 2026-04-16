import assert from 'node:assert/strict';
import test from 'node:test';
import { CoreAbi } from '../dist/core-abi.js';

test.describe('Singleton Pattern', () => {

    test('getInstance returns the same instance', () => {
        const instance1 = CoreAbi.getInstance();
        const instance2 = CoreAbi.getInstance();
        assert.strictEqual(instance1, instance2);
    });

    test('constructor throws error when called directly', () => {
        assert.throws(() => new CoreAbi(), {
            message: /Singleton class/
        });
    });
    
});