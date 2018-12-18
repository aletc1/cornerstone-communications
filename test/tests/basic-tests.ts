import 'reflect-metadata';
import { expect } from 'chai';
import communicator from '../../src/index'
import 'mocha';

describe('Types', () => {
    it('can send and receive messages', (done) => {
        debugger;
        let result = "";
        communicator.addListener<string>('self', msg => {
            debugger;
            result = msg;
        });
        communicator.send<string>('hello world', 'self');

        setTimeout(() => {
            debugger;
            expect(result).to.eq('hello world');
            done();                      
        }, 10);
    });
});