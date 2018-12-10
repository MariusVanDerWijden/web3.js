import {SocketProviderAdapter} from 'web3-providers';
import {AbstractWeb3Module} from 'web3-core';
import AbstractCallMethod from '../../../lib/methods/AbstractCallMethod';

// Mocks
jest.mock('SocketProviderAdapter');
jest.mock('AbstractWeb3Module');

/**
 * CallMethodCommand test
 */
describe('AbstractCallMethodTest', () => {
    let abstractCallMethod,
        providerAdapter,
        providerAdapterMock,
        moduleInstance,
        moduleInstanceMock;

    beforeEach(() => {
        providerAdapter = new SocketProviderAdapter({});
        providerAdapterMock = SocketProviderAdapter.mock.instances[0];

        moduleInstance = new AbstractWeb3Module(providerAdapterMock, {}, {}, {});
        moduleInstanceMock = AbstractWeb3Module.mock.instances[0];

        abstractCallMethod = new AbstractCallMethod('RPC_METHOD', 0, Utils, formatters);
    });

    it('constructor check', () => {
        expect(abstractCallMethod.rpcMethod)
            .toBe('RPC_METHOD');

        expect(abstractCallMethod.parametersAmount)
            .toBe(0);

        expect(abstractCallMethod.utils)
            .toEqual(Utils);

        expect(abstractCallMethod.formatters)
            .toEqual(formatters);
    });

    it('Send the request to the connected node', async () => {
        abstractCallMethod.callback = jest.fn();
        abstractCallMethod.beforeExecution = jest.fn();
        abstractCallMethod.afterExecution = jest.fn(() => {
            return '0x00';
        });

        providerAdapterMock.send
            .mockReturnValueOnce(Promise.resolve('0x0'));

        moduleInstanceMock.currentProvider = providerAdapterMock;

        const response = await abstractCallMethod.execute(moduleInstanceMock);

        expect(response)
            .toBe('0x00');

        expect(providerAdapterMock.send)
            .toHaveBeenCalledWith(abstractCallMethod.rpcMethod, abstractCallMethod.parameters);

        expect(abstractCallMethod.callback)
            .toHaveBeenCalledWith(false, '0x00');

        expect(abstractCallMethod.beforeExecution)
            .toHaveBeenCalledWith(moduleInstanceMock);

        expect(abstractCallMethod.afterExecution)
            .toHaveBeenCalledWith('0x0');
    });

    it('Will throw an error on sending the request to the connected node', async () => {
        abstractCallMethod.callback = jest.fn();
        abstractCallMethod.beforeExecution = jest.fn();

        const error = new Error('ERROR ON SEND');
        providerAdapterMock.send = jest.fn(() => {
            throw error;
        });

        moduleInstanceMock.currentProvider = providerAdapterMock;

        try {
            await abstractCallMethod.execute(moduleInstanceMock);
        } catch (error2) {
            expect(error2)
                .toEqual(error);

            expect(providerAdapterMock.send)
                .toHaveBeenCalledWith(abstractCallMethod.rpcMethod, abstractCallMethod.parameters);

            expect(abstractCallMethod.callback)
                .toHaveBeenCalledWith(error, null);

            expect(abstractCallMethod.beforeExecution)
                .toHaveBeenCalledWith(moduleInstanceMock);
        }
    });
});
