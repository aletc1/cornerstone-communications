import { debug } from "util";

interface Message<T> {
    type: string,
    from: string,
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

export type CallbackType = (from: string, type: string, payload: any) => void;

interface TargetListener {
    target: Target,
    callback: CallbackType
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

class Communicator {
    private name: string;
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
        this.name = window.name;
        if (!this.name) {
            if (window.frameElement) {
                this.name = window.frameElement.getAttribute("Id") as string;
            }
        }
        if (!this.name) {
            this.name = uuidv4();
        }
        // Listen to messages from parent window
        bindEvent(window, 'message', function (e: any) {
            try {
                var data = JSON.parse(e.data) as Message<any>;
                if (data.target) {
                    self.targetListeners.map(o => {
                        if (o.target == data.target) {
                            o.callback(data.from, data.type, data.payload);
                        }
                    });
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    public addListener<T>(target: Target, callback: CallbackType) {
        this.targetListeners.push({ target: target, callback: callback });
    }
    public removeListener<T>(target: Target, callback: CallbackType) {
        this.targetListeners = this.targetListeners.filter(o => o.target != target && o.callback != callback);
    }

    public send<T>(type: string, message: T, target: Target = 'self') {
        const payload = JSON.stringify({
            from: target == 'self' ? 'self' : this.name,
            type: type,
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