let i=0;
setInterval(function() {
    i++;
    if (i % 100 == 0) {
        postMessage(i);   
    }
    if (i % 100000 == 0) {
        i=0;   
    }
}, 10);