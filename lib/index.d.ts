export declare type Target = 'self' | 'parent' | string;
declare class Communicator {
    private targetListeners;
    protected readonly isInsideIframe: boolean;
    constructor();
    addListener<T>(target: Target, callback: (msg: T) => void): void;
    removeListener<T>(target: Target, callback: (msg: T) => void): void;
    send<T>(message: T, target?: Target): void;
}
declare const _default: Communicator;
export default _default;
