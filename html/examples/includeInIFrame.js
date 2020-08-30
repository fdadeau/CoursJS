document.addEventListener("DOMContentLoaded", function(_event) {
    if (parent) {
        var html = document.body.innerHTML.trim();
        var c = document.head.getElementsByTagName("style"); 
        var css = "";
        if (c.length > 0) {
            css = c[c.length - 1].textContent.trim();
        }
        var j = document.head.querySelector("script:not([src])");
        var js = "";
        if (j) js = j.textContent.trim();
        var lib = document.head.querySelectorAll("script[src]");
        var libs = [];
        for (var i=0; i < lib.length; i++) {
            if (lib[i].src.indexOf("includeInIFrame.js") == -1) {
                libs.push(lib[i].src);   
            }
        }
        var slide = ":target";
        if (document.location.href.indexOf("?") > 0) {
            slide = document.location.href.substr(document.location.href.indexOf("?")+1);
        }
        parent.postMessage({type:"code", slide: slide, html: html, css: css, js: js, libs: libs}, "*");
    }
});

window.addEventListener("message", function(event) {
    if (event.data.reload) {
        document.location.reload(true);
        return;
    }
});