export declare type Target = 'self' | 'parent' | string;
export declare type CallbackType = (from: string, type: string, payload: any) => void;
declare class Communicator {
    private name;
    private targetListeners;
    protected readonly isInsideIframe: boolean;
    constructor();
    addListener<T>(callback: CallbackType): void;
    removeListener<T>(callback: CallbackType): void;
    send<T>(type: string, message: T, target?: Target): void;
}
declare const _default: Communicator;
export default _default;
