import { debug } from "util";

interface Message<T> {
    target: Target,
    payload: T
}

export type Target = 'self' | 'parent' | string;

// addEventListener support for IE8
function bindEvent(element: any, eventName: string, eventHandler: any) {
    if (element.addEventListener) {
        element.addEventListener(eventName, eventHandler, false);
    } else if (element.attachEvent) {
        element.attachEvent('on' + eventName, eventHandler);
    }
}

interface TargetListener {
    target: Target,
    callback: (msg: any)=>void
}

class Communicator {
    private targetListeners: TargetListener[] = [];

    protected get isInsideIframe() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    constructor() {
        var self = this;
        // Listen to messages from parent window
        bindEvent(window, 'message', function (e: any) {
            try {
                var data = JSON.parse(e.data) as Message<any>;
                if (data.target) {
                    self.targetListeners.map(o => {
                        if (o.target == data.target) {
                            o.callback(data.payload);
                        }
                    });
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    public addListener<T>(target: Target, callback: (msg: T) => void) {
        this.targetListeners.push({ target: target, callback: callback });
    }
    public removeListener<T>(target: Target, callback: (msg: T) => void) {
        this.targetListeners = this.targetListeners.filter(o => o.target != target && o.callback != callback);
    }

    public send<T>(message: T, target: Target = 'parent') {
        const payload = JSON.stringify({
            target: target,
            payload: message
        } as Message<T>);
        switch (target) {
            case 'self':
                window.postMessage(payload, '*');
                break;
            case 'parent':
                window.parent.postMessage(payload, '*');
                break;
            default:
                let iframe = (window.frames as any)[target] as any;
                if (iframe == null) {
                    iframe = document.getElementById(target);
                    if (!iframe || !iframe.contentWindow)
                        throw new Error(`iframe '${target}' not found`);
                    iframe = iframe.contentWindow;
                }
                iframe.postMessage(payload, '*');
                break;
        }
    }
}

export default new Communicator();