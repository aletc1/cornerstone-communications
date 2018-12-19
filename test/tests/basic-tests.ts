import 'reflect-metadata';
import { expect } from 'chai';
import communicator from '../../src/index'
import 'mocha';

describe('Types', () => {
    it('can send and receive messages', (done) => {
        debugger;
        let resultPayload = "";
        let resultType = "";
        let resultFrom = "";
        communicator.addListener<string>((from, type, payload) => {
            resultFrom = from;
            resultPayload = payload;
            resultType = type;
        });
        communicator.send<string>('msgtype', 'hello world', 'self');

        setTimeout(() => {
            expect(resultPayload).to.eq('hello world');
            expect(resultType).to.eq('msgtype');
            expect(resultFrom).not.eq('self');
            done();                      
        }, 10);
    });
});