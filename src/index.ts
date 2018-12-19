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

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

class Communicator {
    private name: string;
    private targetListeners: CallbackType[] = [];

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
                if (typeof e.data === 'string') {
                    var data = JSON.parse(e.data) as Message<any>;
                    if (data.target) {
                        if (data.target == 'parent' || data.target == 'self')
                            data.target = self.name;
                        self.targetListeners.map(callback => {
                            try {
                                callback(data.from, data.type, data.payload);
                            } catch (error) {
                                console.error(error);
                            }
                        });
                    }
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    public addListener<T>(callback: CallbackType) {
        this.targetListeners.push(callback);
    }
    public removeListener<T>(callback: CallbackType) {
        this.targetListeners = this.targetListeners.filter(o => o != callback);
    }

    public send<T>(type: string, message: T, target: Target = 'self') {
        const payload = JSON.stringify({
            from: this.name,
            type: type,
            target: target == 'self' ? this.name : target,
            payload: message
        } as Message<T>);
        switch (target) {
            case 'self':
                window.postMessage(payload, '*');
                break;
            case 'parent':
                if (!window.parent)
                    throw new Error(`ERR: parent windows not found!`);
                window.parent.postMessage(payload, '*');
                break;
            default:
                let iframe = (window.frames as any)[target] as any;
                if (iframe == null) {
                    iframe = document.getElementById(target);
                    if (!iframe || !iframe.contentWindow)
                        throw new Error(`ERR: iframe '${target}' not found!`);
                    iframe = iframe.contentWindow;
                }
                iframe.postMessage(payload, '*');
                break; 
        }
    }
}

export default new Communicator();