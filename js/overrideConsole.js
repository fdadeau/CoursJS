window.console.log = function(msg) {
    if (parent) {
        var slide = ":target";
        if (document.location.href.indexOf("?") > 0) {
            slide = document.location.href.substr(document.location.href.indexOf("?")+1);
        }
        parent.postMessage({type: "log", slide: slide, message: String(msg)}, "*");
    }    
}
window.onerror = function(msg,file,line) {
    if (parent) {
        var slide = ":target";
        if (document.location.href.indexOf("?") > 0) {
            slide = document.location.href.substr(document.location.href.indexOf("?")+1);
        }
        parent.postMessage({type: "error", slide: slide, message: String(msg), file: file, line: line}, "*");
    }    
}

window.addEventListener("message", function(event) {
    if (event.data.reload) {
        document.location.reload(true);
        return;
    }
    if (event.data.newcode) {
        var newCSS = document.createElement("style");
        newCSS.innerHTML = event.data.css;
        document.head.appendChild(newCSS);
        
        var newJS = document.createElement("script");
        if (document.location.href.indexOf("angular") > 0) {
            newJS.setAttribute("src","angular.min.js");
        }
        newJS.innerHTML = event.data.js;
        document.head.appendChild(newJS);
        
        document.body.innerHTML = event.data.html;
        nodeScriptReplace(document.body);
        var DOMContentLoaded_event = document.createEvent("Event");
        DOMContentLoaded_event.initEvent("DOMContentLoaded", true, true);
        window.document.dispatchEvent(DOMContentLoaded_event);    
    }
}, false);


/** 
 *  Replace script nodes to make them executable.
 */
function nodeScriptReplace(node) {
    if ( nodeScriptIs(node) === true ) {
        node.parentNode.replaceChild( nodeScriptClone(node) , node );
    }
    else {
        var i        = 0;
        var children = node.childNodes;
        while ( i < children.length ) {
            nodeScriptReplace( children[i++] );
        }
    }
    return node;
}
function nodeScriptIs(node) {
    return node.tagName === 'SCRIPT';
}
function nodeScriptClone(node){
    var script  = document.createElement("script");
    script.text = node.innerHTML;
    for( var i = node.attributes.length-1; i >= 0; i-- ) {
        script.setAttribute( node.attributes[i].name, node.attributes[i].value );
    }
    return script;
}