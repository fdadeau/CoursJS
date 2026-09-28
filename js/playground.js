window.addEventListener("message", function(event) {
    if (!event.data.type) {
        return;
    }
    // console.log(event);
    const playground = document.body.querySelector("div#" + event.data.slide);

    switch (event.data.type) {
        case "code": 
            var iframe = playground.querySelector("iframe");
            iframe.dispatchEvent(new CustomEvent("ifLoaded", 
                                                    { detail: { html: event.data.html, 
                                                                css: event.data.css, 
                                                                js: event.data.js
                                                            }
                                                    }
                                                )
                                );
            break;
        case "log":
            var console1 = playground.querySelector(".output .console");
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
    const playgrounds = document.body.querySelectorAll(selector + " .playground"); 
    if (playgrounds.length == 0) return;
                
//    console.log(playground);
    
    playgrounds.forEach((playground,i) => {

        const nb = "PG" + document.querySelector(selector).id + "_" + i;

        playground.id = nb;

        const readonly = playground.classList.contains("readonly");

        const labelJS = playground.classList.contains("jsx") ? "JSX" : "JS";

        let html = '<div class="code">' + 
                    '<input type="radio" name="forWhat' + nb + '" id="forHTML' + nb + '" checked>' +
                        '<label for="forHTML' + nb + '">HTML</label>' + 
                        '<div class="html"></div>' +
                    '<input type="radio" name="forWhat' + nb + '" id="forCSS' + nb + '"' + (playground.dataset.opened == "css" ? " checked" : "") + '>' + 
                        '<label for="forCSS' + nb + '">CSS</label>' +
                        '<div class="css"></div>' +
                    '<input type="radio" name="forWhat' + nb + '" id="forJS' + nb + '"' + (playground.dataset.opened == "js" ? " checked" : "") + '>' +
                        '<label for="forJS' + nb + '">' + labelJS + '</label>' +
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
            
        const htmlCodeMirror = CodeMirror(playground.querySelector(".code .html"), {
            lineNumbers: true,
            mode: "text/html",
            readOnly: readonly,
            matchBrackets: true
        });
            
        const cssCodeMirror = CodeMirror(playground.querySelector(".code .css"), { 
            lineNumbers: true,
            readOnly: readonly,
            mode: "css"
        });
            
        const isJSX = playground.classList.contains("jsx");
        const jsCodeMirror = CodeMirror(playground.querySelector(".code .js"), { 
            lineNumbers: true,
            mode: isJSX ? "jsx" : "javascript", 
            readOnly: readonly,
            json: true
        });
         
        // iframe pour le rendu
        const iframe = playground.querySelector("iframe");
        iframe.addEventListener("ifLoaded", function(e) {
            // loads initial content
            var initialHTML = e.detail.html; 
            htmlCodeMirror.setValue(initialHTML);
            
            var initialCSS = e.detail.css; 
            cssCodeMirror.setValue(initialCSS);
            
            var initialJS = e.detail.js; 
            jsCodeMirror.setValue(initialJS);

            console.log({initialHTML, initialCSS, initialJS});
            
            var executer = function(html, css, js) {
                // reset console
                playground.querySelector(".output .console").innerHTML = "";
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
                playground.classList.toggle("fullsize");
            });
        });
        iframe.src = playground.dataset.href + "?" + nb;
    })
}

