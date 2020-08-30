var slides = new (function() {
    
    "use strict";
    
    var nbSlides = 0;
    
    /**
     *  Initializes the slides by parsing the existing tags (mask & slideshow) to generate HTML-fine tags)
     */
    this.init = function() {
        
        // create and add spinner for a little animation while loading...
        var spinner = document.createElement("div");
        spinner.className = "spinner";
        spinner.appendChild(document.createElement("div"));
        document.body.appendChild(spinner);
        
        // create mask div
        var mask = document.createElement("div");
        mask.id = "mask";
        document.body.appendChild(mask);

        //
        var theMask = document.body.querySelector("mask");
        if (theMask) {
            document.body.removeChild(theMask);
            while (theMask.hasChildNodes()) {
                var first = theMask.firstChild;
                mask.appendChild(first);
                theMask.remove(first);
            };
        }

        var currentSection = null;
        var currentSubsection = null;
        var currentSubsubsection = null;
        var nbTotalSlides = document.body.querySelectorAll("slide").length;
        nbSlides = 0;

        var labels = {};
        
        var outline = {
            main: null,
            content: []
        };        
        
        /** 
         *  Processes the current element.
         */
        var process = function(elem) {
            /** 
             *  Capture special nodes (titles: main, sections, etc.)
             */
            if (elem.nodeName == "TITLE") {
                outline.main = labels["title"] = elem.innerHTML;
                return null;
            }
            var ret = null;
            if (elem.nodeName == "SECTION") {
                currentSection = { 
                    title: elem.innerHTML, 
                    slide: nbSlides+1,
                    slides: [],
                    content: []
                };
                currentSubsection = null;
                currentSubsubsection = null;
                outline.content.push(currentSection);
                labels["currentSection"] = elem.innerHTML;
                labels["currentSubsection"] = null;
                labels["currentSubsubsection"] = null;
                ret = document.createElement("h2");
                ret.innerHTML = outline.content.length + ". " + elem.innerHTML;
                return ret;
            }
            if (elem.nodeName == "SUBSECTION") {
                currentSubsection = {
                    title: elem.innerHTML,
                    slide: nbSlides+1,
                    slides: [],
                    content: []
                };
                currentSubsubsection = null;
                currentSection.content.push(currentSubsection);
                labels["currentSubsection"] = elem.innerHTML;
                labels["currentSubsubsection"] = null;
                ret = document.createElement("h3");
                ret.innerHTML = outline.content.length + "." + currentSection.content.length + ". " + elem.innerHTML;
                return ret;
            }
            if (elem.nodeName == "SUBSUBSECTION") {
                currentSubsubsection = {
                    title: elem.textContent,
                    slide: nbSlides+1,
                    slides: []
                };
                currentSubsection.content.push(currentSubsubsection);
                labels["currentSubsubsection"] = elem.innerHTML;
                ret = document.createElement("h4");
                ret.innerHTML = outline.content.length + "." + currentSection.content.length + "." + currentSubsection.content.length + ". " + elem.innerHTML;elem.innerHTML;
                return ret;
            }
            /**
             *  Otherwise, transpile (transform + compile)
             */
            return transpile(elem, document.body);
        }
        
        /**
         *  Analyzes the current element and computes the resulting one. 
         */ 
        var transpile = function(elem, parent) {
            if (elem.nodeName == "SLIDE") {
                nbSlides++;
                var slide = createDivWithClass(elem, "slide", false);
                slide.id = nbSlides;
                if (elem.getAttribute("outline") === "") {
                    if (elem.getAttribute("class")) {
                        slide.className += " " + elem.getAttribute("class");
                    }
                    slide.classList.add("outline");
                }
                if (elem.getAttribute("options")) {
                    slide.setAttribute("data-options", elem.getAttribute("options"));
                }
                appendWithOnSlide(parent, slide);
                // computation of steps and limits 
                var max = 1;
                var forslides = slide.querySelectorAll("input[data-onslide]");
                forslides.forEach(function(fe) {
                    fe.dataset.onslide = fe.dataset.onslide.split(",").map(function(slNum) {
                        var arrSlNum = slNum.split("-");
                        if (arrSlNum.length == 1) {
                            if (Number(slNum) > max) {
                                max = Number(slNum);
                            }
                            return slNum;
                        }
                        // flatteing of X--Y ranges
                        var listSlNum = [];
                        for (var i=Number(arrSlNum[0]); i <= Number(arrSlNum[1]); i++) {
                            listSlNum.push(i);
                        }
                        if (Number(arrSlNum[1]) > max) {
                            max = Number(arrSlNum[1]);
                        } 
                        return listSlNum.join(",");
                    }).join(",");
                });
                slide.setAttribute("data-step",1);
                slide.setAttribute("data-limit", max);
                slide.innerHTML = "<div class='number'>" + nbSlides + "/" + nbTotalSlides + "</div>" + slide.innerHTML;
                var nav = "<div class='navigation'>";
                if (currentSection) {
                    nav += "<a href='#" + currentSection.slide + "'>" + currentSection.title + "</a>";
                    if (currentSubsection) {
                        nav += " &gt; <a href='#" + currentSubsection.slide + "'>" + currentSubsection.title + "</a>";
                        if (currentSubsubsection) {
                            nav += " &gt; <a href='#" + currentSubsubsection.slide + "'>" + currentSubsubsection.title + "</a>";
                        }
                    }
                }
                nav += "</div>";
                slide.innerHTML = nav + slide.innerHTML;
                if (currentSection) currentSection.slides.push(slide.id);
                if (currentSubsection) currentSubsection.slides.push(slide.id);
                if (currentSubsubsection) currentSubsubsection.slides.push(slide.id);
            }
            else if (elem.nodeName == "BLOCK") {
                var block = createDivWithClass(elem, "block", false);
                if (elem.getAttribute("title")) {
                    var blocktitle = document.createElement("div");
                    blocktitle.className = "title";
                    blocktitle.innerHTML = elem.getAttribute("title");
                    block.insertBefore(blocktitle, block.childNodes[0]);                    
                }
                if (elem.getAttribute("onslide")) {
                    block.setAttribute("onslide", elem.getAttribute("onslide"));
                }
                if (elem.getAttribute("style")) {
                    block.setAttribute("style", elem.getAttribute("style"));
                }
                appendWithOnSlide(parent, block);
            }
            else if (elem.nodeName == "TITLE") {
                appendWithOnSlide(parent, createDivWithClass(elem, "title", true));
            }
            else if (elem.nodeName == "TITLE1") {
                appendWithOnSlide(parent, createDivWithClass(elem, "title1", true));
            }
            else if (elem.nodeName == "TITLE2") {
                appendWithOnSlide(parent, createDivWithClass(elem, "title2", true));
            }
            else if (elem.nodeName == "TITLE3") {
                appendWithOnSlide(parent, createDivWithClass(elem, "title3", true));
            }
            else if (elem.nodeName == "SPEECH") {
                appendWithOnSlide(parent, createDivWithClass(elem, "speech", true));
            }
            else if (elem.nodeName == "ROW") {
                appendWithOnSlide(parent, createDivWithClass(elem, "row", false));
            }
            else if (elem.nodeName == "COLUMN") {
                appendWithOnSlide(parent, createDivWithClass(elem, "column", false));
            }
            else if (elem.nodeName == "URL") {
                var url = document.createElement("a");
                url.href = elem.innerHTML;
                url.innerHTML = (elem.innerHTML.length > 100) ? (elem.innerHTML.substr(0, 100) + "...") : elem.innerHTML;
                url.setAttribute("target", "_blank");
                appendWithOnSlide(parent, url);
            }
            else if (elem.nodeName == "#text") {
                // filter out text nodes
                var content = processText(elem.textContent);
                if (content.trim().length > 0) {
                    var span = document.createElement("span");
                    span.textContent = content;
                    appendWithOnSlide(parent, span);
                }
            }
            // default behavior
            else {
                var numchildren = elem.childNodes.length;
                for (var i=0; i < numchildren; i++) {
                    var child1 = elem.childNodes[0];
                    elem.removeChild(child1);
                    transpile(child1, elem);
                }
                appendWithOnSlide(parent, elem);
            }
        }
        var processText = function(txt) {
            var ret = txt;
            var patt = /@ref\{[^\}]*\}/g;
            var patt1 = /@ref\{[^\}]*\}/;
            var matches = txt.match(patt);
            if (matches) {
                matches = matches.map(function(elem) {
                    return labels[elem.substr(5, elem.length-6)];
                });
                matches.forEach(function(elem) {
                    ret = ret.replace(patt1, elem); 
                });
            }
            return ret;    
        }
        var createDivWithClass = function(source, className, copyInnerHTML) {
            var ret = document.createElement("div");
            ret.className = className;
            // recopy attributes
            if (copyInnerHTML) {
                ret.innerHTML = processText(source.innerHTML);
            }
            else {
                for (var i=0; i < source.childNodes.length; i++) {
                    transpile(source.childNodes[i], ret);
                }
            }
            return ret;
        } 
        var appendWithOnSlide = function(parent, child) {
            if (parent.getAttribute("onslide")) {
                var inputCB = document.createElement("input");
                inputCB.type = "checkbox";
                inputCB.setAttribute("data-onslide", parent.getAttribute("onslide"));
                parent.removeAttribute("onslide");
                parent.appendChild(inputCB);
            }
            if (child.getAttribute && child.getAttribute("onslide")) {
                var inputCB = document.createElement("input");
                inputCB.type = "checkbox";
                inputCB.setAttribute("data-onslide", child.getAttribute("onslide"));
                child.removeAttribute("onslide");
                parent.appendChild(inputCB);
            }
            parent.appendChild(child);
        }
        
        var slideshow = document.body.querySelector("slideshow");
        if (slideshow) {
            document.body.removeChild(slideshow);
            while (slideshow.hasChildNodes()) {
                var node = slideshow.firstChild;
                slideshow.removeChild(node);
                var newNode = process(node);
                if (newNode) {
                    document.body.appendChild(newNode);
                }
            } 
        }
        
        /** Menu generation */
        var menu =
            '<div class="menu" onclick="slides.menu.toggle();"><a></a>' +
                '<div onclick="event.stopPropagation()">' +
                    '<div id="btnFullScreen" onclick="slides.menu.fullscreen();"></div>' +
                    '<div id="btnSettings" onclick="slides.menu.settings();"></div>' +
                    '<div id="btnFirst" onclick="slides.menu.first()"></div>' + 
                    '<div id="btnPrevious" onclick="slides.menu.previous()"></div>' +
                    '<div id="btnPlay" onclick="slides.speech.playSpeech()"></div>' +
                    '<div id="btnNext" onclick="slides.menu.next()"></div>' +
                    '<div id="btnLast" onclick="slides.menu.last()"></div>' +
                '</div>'+
            '</div>';
        
        /** Settings */
        var settings = 
            '<div id="settings"><table id="parameters"><tr><td>Voix pour la synthèse vocale </td><td><select id="selVoice" onchange="slides.menu.saveSettings()">"</select></td></tr>' +
            '<tr><td>Lecture automatique du discours</td><td><input type="checkbox" id="cbAutoplay" onchange="slides.menu.saveSettings()"><label for="cbAutoplay"></label></td></tr>' +
            '<tr><td>Sous-titres au discours</td><td><input type="checkbox" id="cbSubtitles" onchange="slides.menu.saveSettings()"><label for="cbSubtitles"></td></tr>' +
            '<tr><td colspan="2"><input type="button" value="Fermer" onclick="slides.menu.settings()"></td></tr>' +
            '</table></div>';
        
        // add to the mask
        //mask.innerHTML += menu + settings + "<div id='subtitles'></div>";

        // build outlines 
        function buildOutline(id) {
            var innerHTML = "<ol>";
            outline.content.forEach(function(sec) {
                innerHTML += "<li class='section" + (sec.slides.indexOf(id) >= 0 ? " currentSection" : "") + "'><a href='#" + sec.slide + "'>" + sec.title + "</a>";
                if (sec.content.length > 0) {
                    innerHTML += "<ol>";
                    sec.content.forEach(function(subsec) {
                        innerHTML += "<li class='subsection" + (subsec.slides.indexOf(id) >= 0 ? " currentSubsection" : "") + "'><a href='#" + subsec.slide + "'>" + subsec.title + "</a>";
                        if (subsec.content.length > 0) {
                            innerHTML += "<ol>";
                            subsec.content.forEach(function(subsubsec) {
                                innerHTML += "<li" + (sec.slides.indexOf(id) >= 0 ? " class='currentSubsubsection'" : "") + "><a href='#" + subsubsec.slide + "'>" + subsubsec.title + "</a></li>";
                            });
                            innerHTML += "</ol>";
                        }
                        innerHTML += "</li>";
                    });
                    innerHTML += "</ol>";
                }
                innerHTML += "</li>";
            });
            innerHTML += "</ol>";
            return innerHTML;
        }
    
        var htmlOutline = buildOutline(0);
        //
        document.body.querySelectorAll(".slide.outline").forEach(function(slide) {
            slide.innerHTML = buildOutline(slide.id) + slide.innerHTML;
        });
        //
        var nav = document.createElement("nav");
        nav.innerHTML = htmlOutline;
        nav.addEventListener("click", function(e) {
            if (e.target.tagName == "A") {
                e.preventDefault();
                var i = e.target.href.substr(e.target.href.indexOf("#")+1);
                var target = document.querySelector(".slide[id='" + i + "']");
                while (! target.tagName.startsWith("H")) {
                    target = target.previousElementSibling;   
                }
                target.scrollIntoView();
                window.scrollBy(0, -60);
            }
        });
        document.body.insertBefore(nav, document.body.firstChild);
        
        // end of the loading 
        document.body.removeChild(spinner);
        
        if (document.location.href.indexOf("#") < 0) {
            document.location.href += "#1";   
        }

        // ajouter bouton pour charger manuellement playgrounds
        var pgs = document.querySelectorAll("div.playground");
        for (var pg0 of pgs) {
            // ajouter un bouton 
            var pgButton = document.createElement("button");
            pgButton.style = "display: inline; width: auto;";
            pgButton.innerHTML = "Charger l'exemple";
            var pgSlide = pg0.parentElement;
            while (!pgSlide.classList.contains("slide")) {
                pgSlide = pgSlide.parentElement;    
            }
            pgButton.addEventListener("click", loadPlayground.bind(null, ".slide[id='" + pgSlide.id + "']"));
            pg0.appendChild(pgButton);
            
            if (pg0.parentElement.tagName == "DIV" && pg0.parentElement.classList.contains("block")) {
                pg0.parentElement.classList.add("example");   
            }
        }
        
        document.body.className = (portrait) ? "portrait" : "landscape";

        document.dispatchEvent(new Event("slideLoaded"))
    };
    
    
    
    /******************************************************* 
     *              Object managing the menu
     *******************************************************/
    this.menu = new (function() {
        
        /**
         * Moves to the next slide. Remains on the last if no-one exists. 
         */
        this.next = function() {
            if (window.innerWidth < window.innerHeight * 1.4) {
                return;
            }
            
            // check if there is something to update on the slide
            if (slides.incrementStep(1)) {
                return;
            }
            
            var url = document.location.href.split("#");
            var next = 1;
            if (url.length > 1) {
                var num = Number(url[1]);
                next = (num) ? num+1 : 1;
                if (next > nbSlides) {
                    next = nbSlides;
                }
            }
            document.location.href = url[0] + "#" + next;
            document.dispatchEvent(new Event("slideLoaded"))
        };

        /**
         * Moves to the previous slide. Remains on the last if no-one exists. 
         */
        this.previous = function() {
            
            if (window.innerWidth < window.innerHeight * 1.4) {
                return;
            }

            // check if there is something to update on the slide
            if (slides.incrementStep(-1)) {
                return;
            }
            
            var url = document.location.href.split("#");
            var prev = 1;
            if (url.length > 1) {
                var num = Number(url[1]);
                prev = (num && num-1 > 0) ? num-1 : 1;  
            }
            document.location.href = url[0] + "#" + prev;
            document.dispatchEvent(new Event("slideLoaded"));
        };
    
        /**
         *  Moves to the first slide.
         */
        this.first = function() {
            document.location.href = document.location.href.split("#")[0] + "#1";
            document.dispatchEvent(new Event("slideLoaded"));
        };

        /**
         *  Moves to the last slide.
         */
        this.last = function() {
            document.location.href = document.location.href.split("#")[0] + "#" + nbSlides;
            document.dispatchEvent(new Event("slideLoaded"));
        };
        
        /**
         *  Switches the display to full screen (ON/OFF).
         */
        this.fullscreen = function() {
            // full-screen available?
            if (document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled) {
                if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
                    // exit fullscreen
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                }
                else {
                    var i = document.body;
                    // go full-screen
                    if (i.requestFullscreen) {
                        i.requestFullscreen();
                    } else if (i.webkitRequestFullscreen) {
                        i.webkitRequestFullscreen();
                    } else if (i.mozRequestFullScreen) {
                        i.mozRequestFullScreen();
                    } else if (i.msRequestFullscreen) {
                        i.msRequestFullscreen();
                    }
                }
            }
        };
        
        /**
         *  Sets the menu play/stop button to the appropriate icon
         */
        this.switchPlayStop = function(which) {
            document.getElementById("btnPlay").classList.toggle("stop"); 
        }
        
        /**  
         *  Switches the fullscreen button to the appropriate one.
         */
        this.switchFullScreenButton = function(isFullscreen) {
            var deg = isFullscreen ? 180 : 0
            document.getElementById("btnFullScreen").style.WebkitTransform = "rotate(" + deg + "deg)";
            document.getElementById("btnFullScreen").style.transform = "rotate(" + deg + "deg)";
        }
        
        /**
         *  Toggles the visibility of the menu - let CSS do the animation. 
         */
        this.toggle = function() {
            document.getElementsByClassName("menu").item(0).classList.toggle('visible');    
        }
        
        
        /**
         *  Opens/closes the settings panel.
         */
        this.settings = function() {
            document.getElementById("settings").classList.toggle("visible");
            if (document.getElementById("settings").classList.contains("visible")) {
                // update the display
                document.getElementById("cbAutoplay").checked = slides.speech.autoplay;
                document.getElementById("cbSubtitles").checked = slides.speech.subtitles;
                if (! slides.speech.isSupported) {
                    document.getElementById("selVoice").innerHTML = "<option>Non supportée</option>";
                }
                else {
                    var selVoice = "";
                    speechSynthesis.getVoices().forEach(function(voice, i) {
                        if (voice.lang.startsWith("fr") > 0) {
                            selVoice += 
                                "<option value='" + voice.name + "'" + 
                                (voice.name.startsWith(slides.speech.voice) ? " selected" : "") + 
                                ">" + voice.name + " (" + voice.lang + ")</option>";
                        }
                    });
                    document.getElementById("selVoice").innerHTML = selVoice;
                }
            }
        }
        
        this.saveSettings = function() {
            slides.speech.autoplay = document.getElementById("cbAutoplay").checked;
            slides.speech.voice = document.getElementById("selVoice").value;
            slides.speech.subtitles = document.getElementById("cbSubtitles").checked;
            slides.speech.saveConfig();
        }
    
        
        // returns this singleton object
        return this;
    })();
        
    
    this.incrementStep = function(inc) {
        var current = document.body.querySelector(".slide:target");
        if (! current) {
            return false;
        }
        if (current.dataset.step && current.dataset.limit && (inc > 0 && current.dataset.step < current.dataset.limit) || 
                                                             (inc < 0 && current.dataset.step > 1)) {
            var nextStep = Number(current.dataset.step) + inc;
            current.dataset.step = nextStep;
            this.updateSlide(current);
            return true;
        }
        return false;
    };

    this.updateSlide = function(current) {
        var animable = current.querySelectorAll("[data-onslide]");
        animable.forEach(function(elem) {
            elem.checked = (elem.dataset.onslide.split(",").indexOf(current.dataset.step) >= 0);
        });
    };
    
    
    
    /************************************************************************************************ 
     *********                  Web speech API for reading the slides                     ***********
     ************************************************************************************************/
    this.speech = new (function() {
    
        // read configuration from local storage (if any)
        var config = JSON.parse(localStorage.getItem("config"));
        localStorage.getItem("config");
                
        // parameters 
        this.autoplay = (config && config.autoplay) ? config.autoplay : false;
        
        // volume 0..1
        this.volume =  (config && config.volume) ? config.volume : 1;

        // subtitles on/off
        this.subtitles =  (config && config.subtitles) ? config.subtitles : false;
        
        // voice selection
        this.voice = (config && config.voice) ? config.voice : "Google français";
        
        /** 
         *  Saves the configuration to the localstorage (using a JSON object)
         */
        this.saveConfig = function() {
            var config = {
                autoplay: slides.speech.autoplay,
                volume: slides.speech.volume,
                subtitles: slides.speech.subtitles,
                voice: slides.speech.voice
            };
            localStorage.setItem("config", JSON.stringify(config));
        };
        
        this.isSupported = (typeof speechSynthesis !== 'undefined');        

        // preload of voices
        var voices = this.isSupported && speechSynthesis.getVoices();
        
        // index of the current text
        var index = -1;        
        var speechRunning = false;
        
        /**
         *  Reads the speech associated to the current slide. 
         *  If it exists, the speech is located in the <p class="speech"> element of the slide (if any).
         */
        this.playSpeech = function() {
            
            if (! this.isSupported) {
                alert("Votre navigateur ne supporte pas la synthèse vocale.");
                return;
            }
            
            var current = document.body.querySelector(".slide:target");
            // reset the visibility
            if (current.dataset.step) {
                current.dataset.step = 1;
                slides.updateSlide(current);
            }
            var speechtxt = current.getElementsByClassName("speech");
            if (speechtxt.length == 0)
                // -> not to say: exit
                return;
            speechtxt = speechtxt.item(0).innerHTML.split("|");        
            
            // wait for the current speech instance to end 
            if (speechRunning || index >= 0 || speechSynthesis.pending || speechSynthesis.speaking || speechSynthesis.paused) {
                // -> end & exit
                this.stopSpeech();
                return;
            }

            // Create a new instance of SpeechSynthesisUtterance.
            var speechSynth = new SpeechSynthesisUtterance();  
            
            // Set the attributes.
            speechSynth.volume = this.volume;
            speechSynth.rate = 1;   // fixed to avoid issues.
            speechSynth.pitch = 1; 

            var debut;
            
            // If a voice has been selected, find the voice and set the
            // utterance instance's voice attribute.
            speechSynth.voice = speechSynthesis.getVoices().filter(function(voice) { 
                return voice.name.startsWith(this.voice);
            }.bind(this))[0];

            // TODO: find something to trigger next speech and bypass (timeout /w appropriate timer ?)
            speechSynth.addEventListener("end", function(e) {
                slides.speech.setSubtitles("");
                var elapsed = (Date.now() - debut);
                var chars = speechSynth.text.length;
                sayNext();
            });
            speechSynth.addEventListener("start", function(e) {
                debut = Date.now();
            });
        
            function sayNext() {
                if (! speechRunning || index+1 >= speechtxt.length) { 
                    slides.speech.stopSpeech();
                    return;
                }
                // Queue this next utterance.
                index++
                var text = speechtxt[index].trim();
                speechSynth.text = getCleanTextForSpeech(text);
                if (text.startsWith("/pause")) {
                    var nbSec = Number(text.substring(6)) * 1000;
                    slides.speech.setSubtitles("...");
                    setTimeout(sayNext, nbSec);
                }
                else if (text.startsWith("/next")) {
                    slides.menu.next();
                    sayNext();
                }
                else {
                    console.log(speechSynth);
                    if (slides.speech.subtitles) {
                        slides.speech.setSubtitles(getCleanTextForDisplay(text));
                    }
                    speechSynthesis.speak(speechSynth);
                }
            };
            // runs the first speech
            index = -1;
            speechRunning = true;
            slides.menu.switchPlayStop("stop");
            sayNext();
        };
        
        /**
         *  Stops the current speech and resets all indexes. 
         */
        this.stopSpeech = function() {
            speechSynthesis.cancel();
            index = -1;
            speechRunning = false;
            slides.menu.switchPlayStop("play");
            slides.speech.setSubtitles("");            
        };
        
        /**
         *  Sets the displayed subtitles.
         */
        this.setSubtitles = function(txt) {
            document.getElementById("subtitles").innerHTML = (this.subtitles && txt) ? txt : "";
        };       

        
        var getCleanTextForSpeech = function(txt) {
            var ret = txt;
            var patt = /\{[^\}]*\}\[[^\]]*\]/g;
            var patt1 = /\{[^\}]*\}\[[^\]]*\]/;
            var matches = txt.match(patt);
            if (matches) {
                matches = matches.map(function(elem) { return (elem.substr(1, elem.length-2).split("}["))[1]; });
                matches.forEach(function(elem) {
                    ret = ret.replace(patt1, elem); 
                });
            }
            return ret;
        };
        
        var getCleanTextForDisplay = function(txt) {
            var ret = txt;
            var patt = /\{[^\}]*\}\[[^\]]*\]/g;
            var patt1 = /\{[^\}]*\}\[[^\]]*\]/;
            var matches = txt.match(patt);
            if (matches) {
                matches = matches.map(function(elem) { return (elem.substr(1, elem.length-2).split("}["))[0]; });
                matches.forEach(function(elem) {
                    ret = ret.replace(patt1, elem); 
                });
            }
            return ret;
        };
        
        // on slide change --> stop speech
        document.addEventListener("slideLoaded", function(e) {
            // slides.speech.stopSpeech();    
        });
        
        // returns newly-created singleton
        return this;
    })();
        
    
    /****************************************************************************************************************
     ****************                                EVENT LISTENERS                                 ****************
     ****************************************************************************************************************
     */
    
    /**
     *  Full screen switching (--> update button)
     */
    this.onFullScreenChange = function() {
        var fullscreen = (document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement);
        slides.menu.switchFullScreenButton(fullscreen != undefined && fullscreen != null);
    }
    document.addEventListener("fullscreenchange", this.onFullScreenChange, false);
    document.addEventListener("webkitfullscreenchange", this.onFullScreenChange, false);
    document.addEventListener("mozfullscreenchange", this.onFullScreenChange, false);
    
    /**
     *  Keyboard navigation
     */
    document.addEventListener("keydown", function(e) {
        switch (e.keyCode) {
            case 39:    // left arrow
                if (document.body.querySelector(":target .playground :focus") && 
                    document.body.querySelector(":target .playground :focus").tagName === "TEXTAREA") return;
            case 34:    // page up
                slides.menu.next();
                break;
            case 37:    // right arrow
                if (document.body.querySelector(":target .playground :focus") && 
                    document.body.querySelector(":target .playground :focus").tagName === "TEXTAREA") return;
            case 33:    // page down
                slides.menu.previous();
                break;
            case 70:    // f
                if (document.body.querySelector(":target .playground :focus") && 
                    document.body.querySelector(":target .playground :focus").tagName === "TEXTAREA") return;
            case 116:   // f5
                slides.menu.fullscreen();
                break; 
        }
    }, true);
    
    /**
     *  Touch-events (left <-> right slide)
     */
    var touch = null;
    document.addEventListener("touchstart", function(e) {
        touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, false);
    document.addEventListener("touchmove", function(e) {
        if (touch) {    
            if (e.touches[0].clientX > touch.x + 50) {
                touch = null;
                slides.menu.previous();
            }
            else {
                if (e.touches[0].clientX < touch.x - 50) {
                    touch = null;
                    slides.menu.next();
                }
            }
        }
    }, false);
    document.addEventListener("touchend", function(e) {
        touch = null; 
    }, false);
    document.addEventListener("touchleave", function(e) {
        touch = null; 
    }, false);
    
    
    // gestion de l'orientation et du passage entre les deux modes 
    

    // fonction utilitaire
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    
    var portrait = window.innerWidth < window.innerHeight * 1.4;
    
    window.addEventListener("resize", function(e) {
        var old = portrait;
        portrait = window.innerWidth < window.innerHeight * 1.4;
        if (old && !portrait) {
            // portrait --> paysage
            var elements = document.querySelectorAll(".slide");
            var elem = elements.item(0);
            for (var el of elements) {
                if (isInViewport(el) && !el.classList.contains("outline")) {
                    elem = el;
                    break;
                }
            }
            document.body.className = "landscape";
            //console.log(elem.id);
            document.location.replace(document.location.href.substr(0, document.location.href.indexOf("#")+1) + elem.id);
        }
        else if (!old && portrait) {
            // paysage --> portrait
            var slide = 1;
            if (document.location.href.indexOf("#") > 0) {
                slide = document.location.href.substr(document.location.href.indexOf("#")+1);
            }
            console.log(slide);
            document.body.className = "portrait";
            document.querySelector(".slide[id='" + slide + "']").scrollIntoView(); 
        }
    });
    

    return this;
})();



document.addEventListener("DOMContentLoaded", function(e) {
    console.log("Initializing slides...");
    slides.init(); 
    console.log("Done.")
});  



