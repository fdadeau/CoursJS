window.addEventListener("message", function(event) {
    if (!event.data.type) {
        return;
    }
    // console.log(event);
    var selector = ".slide[id='" + event.data.slide + "']";
    switch (event.data.type) {
        case "code": 
            var iframe = document.body.querySelector(selector + " iframe");
            if (iframe) {
                iframe.dispatchEvent(new CustomEvent("ifLoaded", 
                                                     { detail: {html: event.data.html, 
                                                                css: event.data.css, 
                                                                js: event.data.js}}));
            }
            break;
        case "log":
            var console1 = document.body.querySelector(selector + " .output .console");
            if (console1) {
                console1.innerHTML += "<p class='log'>"+ String(event.data.message).split("\n").join("<br>") +"</p>";
            }
            break;
        case "error":
            var console1 = document.body.querySelector(selector + " .output .console");
            if (console1) {
                console1.innerHTML += "<p class='error'><span class='line'>"+event.data.line+"</span>" + event.data.message + "</p>";
            }
            break;
    }
}, false);


document.addEventListener("slideLoaded", function(e) {
    loadPlayground(":target");    
});
    

function loadPlayground(selector) {
    var playground = document.body.querySelector(selector + " .playground"); 
    if (!playground) return;
                
//    console.log(playground);
    
    var nb = document.body.querySelector(selector).id;
    var readonly = playground.classList.contains("readonly");

    
    var html = '<div class="code">' + 
                    '<input type="radio" name="forWhat' + nb + '" id="forHTML' + nb + '" checked>' +
                        '<label for="forHTML' + nb + '">HTML</label>' + 
                        '<div class="html"></div>' +
                    '<input type="radio" name="forWhat' + nb + '" id="forCSS' + nb + '"' + (playground.dataset.opened == "css" ? " checked" : "") + '>' + 
                        '<label for="forCSS' + nb + '">CSS</label>' +
                        '<div class="css"></div>' +
                    '<input type="radio" name="forWhat' + nb + '" id="forJS' + nb + '"' + (playground.dataset.opened == "js" ? " checked" : "") + '>' +
                        '<label for="forJS' + nb + '">JS</label>' +
                        '<div class="js"></div>' +
                '</div><div class="output"><div><button class="btnRecharger"></button>';
    if (!readonly) {
        html += '<button title="Exécuter le code" class="btnExecuter"></button>';
    }
    html += "<button class='btnAgrandir'></button>"
            + '</div>' +
                    '<iframe></iframe>' + 
                    '<div class="console"></div>' +
                '</div>';
    
    playground.innerHTML = html;

    playground.addEventListener("keydown", function(e) {
        e.stopPropagation();
    }, false);
            
    var htmlCodeMirror = CodeMirror(document.body.querySelector(selector + " .html"), {
        lineNumbers: true,
        mode: "text/html",
        readOnly: readonly,
        matchBrackets: true
    });
            
    var cssCodeMirror = CodeMirror(document.body.querySelector(selector + " .css"), { 
        lineNumbers: true,
        readOnly: readonly,
        mode: "css"
    });
            
    var jsCodeMirror = CodeMirror(document.body.querySelector(selector + " .js"), { 
        lineNumbers: true,
        mode: "javascript", 
        readOnly: readonly,
        json: true
    });
         
    var iframe = document.body.querySelector(selector + " iframe");
    iframe.addEventListener("ifLoaded", function(e) {
        // loads initial content
        var initialHTML = e.detail.html; 
        htmlCodeMirror.setValue(initialHTML);
        
        var initialCSS = e.detail.css; 
        cssCodeMirror.setValue(initialCSS);
        
        var initialJS = e.detail.js; 
        jsCodeMirror.setValue(initialJS);
        
        var executer = function(html, css, js) {
            // reset console
            document.body.querySelector(selector + " .output .console").innerHTML = "";
            // reload the empty page
            iframe.contentWindow.postMessage({reload:1}, "*");
        }
        playground.querySelector("button:first-child").addEventListener("click", function(e) {
            // restores initial HTML, CSS and JS code values
            htmlCodeMirror.setValue(initialHTML);
            cssCodeMirror.setValue(initialCSS);
            jsCodeMirror.setValue(initialJS);
            // executes them by reloading the iframe content
            executer(initialHTML, initialCSS, initialJS);
        });
        if (!readonly) {
            playground.querySelector("button:nth-child(2)").addEventListener("click", function(e) {
                // executes the current code by reloading the iframe content
                executer(htmlCodeMirror.getValue(), cssCodeMirror.getValue(), jsCodeMirror.getValue());
            });
            // opens an empty page with appropriate message processing 
            var ifSource = (playground.classList.contains("angular")) ? "?angular" : ("?" + nb);     
            iframe.src = "./examples/empty.html" + ifSource;
            iframe.addEventListener("load", function(event) {
                iframe.contentWindow.postMessage({newcode: 1, 
                                                  html: htmlCodeMirror.getValue(), 
                                                  css: cssCodeMirror.getValue(), 
                                                  js: jsCodeMirror.getValue()}, "*");
            });
        }
        playground.querySelector("button:last-child").addEventListener("click", function(e) {
            var p = this.parentElement;
            while (! p.classList.contains("playground")) {
                p = p.parentElement;   
            }
            p.classList.toggle("fullsize");
        });
    });
    iframe.src = playground.dataset.href + "?" + nb;

}

