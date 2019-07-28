//awtrix WebSockets client library v0.91

/*jslint browser: true*/
/*global $, jQuery, WebSocket*/
/*jshint curly: false */
"use strict";
var awtrix_ws;
var awtrix_closeMessage = false;
//only called as a result of a server request that is waiting for result.
//this method should not be called in any other case.
function awtrix_sendData(data) {
    awtrix_ws.send(JSON.stringify({ type: "data", data: data }));
}
function awtrix_raiseEvent(eventName, parameters) {
    try {
        if (awtrix_ws.readyState !== 1) {
            if (awtrix_closeMessage === false) {
                window.console.error("connection is closed.");
                if (typeof ReconnectingWebSocket !== 'undefined')
                    window.alert("Server is currently not available.");
                else
                    window.alert("Connection is closed. Please refresh the page to reconnect.");
                awtrix_closeMessage = true;
            }
        } else {
            awtrix_closeMessage = false;
            awtrix_ws.send(JSON.stringify({ type: "event", event: eventName, params: parameters }));
        }
    } catch (e) {
        window.console.error(e);
    }
}
function awtrix_addEvent(selector, event, eventName, preventDefault) {
    var obj = $(selector);
    if (obj.length > 0) {
        obj.on(event, function (e) {
            if (preventDefault) {
                e.preventDefault();
                e.stopPropagation();
            }
            awtrix_raiseEvent(eventName, { which: e.which, target: e.target.id, pageX: e.pageX, pageY: e.pageY, metaKey: e.metaKey });
        });
    }
}
function awtrix_addAutomaticEvents(data) {
    $.each(data, function (index, value) {
        awtrix_addEvent("#" + value.id, value.event, value.id + "_" + value.event, true);
    });
}
function awtrix_runFunction(func, params) {
    return window[func].apply(null, params);
}

function awtrix_eval(params, script) {
    var f = new Function(script);
    return f.apply(null, params);
}

function awtrix_connect(absolutePath) {
    if (typeof WebSocket === 'undefined') {
        window.alert("WebSockets are not supported by your browser.");
        return;
    }
    var l = window.location, fullpath;
    fullpath = ((l.protocol === "https:") ? "wss://" : "ws://") + l.hostname + ":" + l.port + absolutePath;
    if (typeof ReconnectingWebSocket === 'undefined')
        awtrix_ws = new WebSocket(fullpath);
    else
        awtrix_ws = new ReconnectingWebSocket(fullpath);
    awtrix_ws.onmessage = function (event) {
        var ed = JSON.parse(event.data);
        if (ed.etype === "runmethod") {
            $(ed.id)[ed.method].apply($(ed.id), ed.params);
        } else if (ed.etype === "runmethodWithResult") {
            awtrix_sendData($(ed.id)[ed.method].apply($(ed.id), ed.params));
        } else if (ed.etype === "setAutomaticEvents") {
            awtrix_addAutomaticEvents(ed.data);
        } else if (ed.etype === "runFunction") {
            awtrix_runFunction(ed.prop, ed.value);
        } else if (ed.etype === "runFunctionWithResult") {
            awtrix_sendData(awtrix_runFunction(ed.prop, ed.value));
        } else if (ed.etype === "eval") {
            awtrix_eval(ed.value, ed.prop);
        } else if (ed.etype === "evalWithResult") {
            awtrix_sendData(awtrix_eval(ed.value, ed.prop));
        } else if (ed.etype === "alert") {
            window.alert(ed.prop);
        }

    };
}



