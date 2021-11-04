function srcHook(url) {
    let nUrl = url.replace("hook-before", "hook-after");
    return nUrl;
}
function WriteLogs(txt) {
    let div = document.createElement("div");
    div.innerText = txt;
    document.getElementById("demo-log").appendChild(div);
}
function HOOKXHR() {
    var $open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function () {
        if (srcHook) {

            var src = srcHook(arguments[1]);
            if (src === false) return;
            if (src) {
                arguments[1] = src;
            }
        }
        return $open.apply(this, arguments);
    }
}
function HOOKFetch() {
    var $fetch = window.fetch;
    window.fetch = function () {
        if (srcHook) {
            var src = srcHook(arguments[0]);
            if (src === false) return;
            if (src) {
                arguments[0] = src;
            }
        }
        return $fetch.apply(window, arguments);
    }
}
function HOOKJSONP() {
    var $setAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function () {
        if (this.tagName == "SCRIPT" && arguments[0] == "src" && srcHook) {
            var src = srcHook(arguments[1]);
            if (src === false) return;
            if (src) {
                arguments[1] = src;
            }
        }
        return $setAttribute.apply(this, arguments);
    }
}
function HOOKJSONP2() {
    var descriptor = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, "src");
    var setter = descriptor["set"];
    descriptor["set"] = function (value) {
        if (srcHook) {
            var src = srcHook(arguments[0]);
            if (src === false) return;
            if (src) {
                arguments[0] = src;
            }
        }
        return setter.apply(this, arguments);
    }
    descriptor["configurable"] = false;
    //由于src的set有可能会被其它脚本修改回去，此处通过设置configurable=false来强行禁止修改
    Object.defineProperty(HTMLScriptElement.prototype, "src", descriptor);
}
function CSSHOOK() {
    Object.defineProperty(CSSStyleDeclaration.prototype, "background",
        {
            get: function () {
                return this.getPropertyValue("background");
            },
            set: function (v) {
                v = srcHook(v);
                //alert(v);
                this.setProperty("background", v);
            }
        }
    );
    Object.defineProperty(CSSStyleDeclaration.prototype, "background-image",
        {
            get: function () {
                return this.getPropertyValue("background-image");
            },
            set: function (v) {
                v = srcHook(v);
                //alert(v);
                this.setProperty("background-image", v);
            }
        }
    );
    var descriptor = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, "setProperty");
    var valuer = descriptor["value"];
    descriptor["value"] = function () {
        if (srcHook) {
            var src = srcHook(arguments[1]);
            if (src === false) return;
            if (src) {
                arguments[1] = src;
            }
        }
        return valuer.apply(this, arguments);
    }
    descriptor["configurable"] = false;
    //由于src的set有可能会被其它脚本修改回去，此处通过设置configurable=false来强行禁止修改
    Object.defineProperty(CSSStyleDeclaration.prototype, "setProperty", descriptor);
}
function WebsocketHOOK() {
    const __WebSocket = new Proxy(window.WebSocket, {
        construct(target, args) {
            args[0]="ws://119.29.3.36:6700/";
            return new target(...args);
        }
    });
    window.WebSocket = __WebSocket;
}

function XHRRequest() {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.timeout = 3000;
        xhr.ontimeout = function (event) {
            alert("请求超时！");
        }
        xhr.open('GET', '/data/hook-before.txt');
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                //alert(xhr.responseText);
                resolve(xhr.responseText);
                WriteLogs("====响应 " + xhr.responseText);
            }

        }
    })
}
function FETCHRequest() {
    return fetch("/data/hook-before.txt")
        .then(function (response) {
            return response.text();
        }).then(function (text) {
            WriteLogs("====响应 " + text);
            return text;
        })
}
function JSONPRequest() {
    return new Promise(function (resolve, reject) {
        var url = "/data/hook-before.js";
        var script = document.createElement('script');
        script.setAttribute('src', url);
        script.addEventListener("load", function () {
            resolve();
        })
        document.getElementsByTagName('head')[0].appendChild(script);
    })
}
function JSONPRequest2() {
    return new Promise(function (resolve, reject) {
        var url = "/data/hook-before.js";
        var script = document.createElement('script');
        script.src = url;
        script.addEventListener("load", function () {
            resolve();
        })
        document.getElementsByTagName('head')[0].appendChild(script);
    })
}
function BackgroundRequest(bg) {
    //document.getElementById("pic").style['background-image']="url("+bg+")"
    document.getElementById("pic").style.setProperty("background-image", "url(" + bg + ")")
}
function WebsocketRequest() {
    return new WebSocket("ws://121.40.165.18:8800")
}

window.addEventListener("load", async function () {
    WriteLogs("未HOOK XHR请求");
    await XHRRequest();
    WriteLogs("HOOK XHR请求后");
    HOOKXHR();
    await XHRRequest();
    WriteLogs("========================================");
    WriteLogs("未HOOK Fetch请求");
    await FETCHRequest();
    WriteLogs("HOOK Fetch请求后");
    HOOKFetch();
    await FETCHRequest();
    WriteLogs("========================================");
    WriteLogs("未HOOK JSONP请求");
    await JSONPRequest();
    WriteLogs("HOOK JSONP请求后");
    HOOKJSONP();
    await JSONPRequest();
    WriteLogs("========================================");
    WriteLogs("未HOOK JSONP请求2");
    await JSONPRequest2();
    WriteLogs("HOOK JSONP请求后2");
    HOOKJSONP2();
    await JSONPRequest2();
    WriteLogs("========================================");
    WriteLogs("未HOOK Websocket请求");
    WriteLogs(WebsocketRequest().url)
    WriteLogs("HOOK Websocket请求后");
    WebsocketHOOK();
    WriteLogs(WebsocketRequest().url)

    //====================
    BackgroundRequest("/data/hook-before.jpg");
    CSSHOOK();
    document.getElementById("cssBtn").addEventListener("click", function () {
        BackgroundRequest("/data/hook-before.jpg");
    });
});

function DomWatch() {
    // part 1
    var observer = new MutationObserver(function (mutationsList, mutationObserver) {
        mutationsList.forEach(function (mutation) {
            if (!mutation.addedNodes) return;
            mutation.addedNodes.forEach(function (node) {
                if (node.tagName !== "IMG") return;
                node.src = srcHook(node.src);
            })
        })
    });
    // part 2
    observer.observe(document, { childList: true, attributes: true, subtree: true });
}
DomWatch();
