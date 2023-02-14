var ctrlRpt = false;
// ctrl counter seems janky, I think there is a way to tell if its repeating
var ctrlCtr = 0;

window.addEventListener('keydown', (event) => {
    // console.log(event);
    // console.log(ctrlCtr);

    // check to make sure the control key wasn't being pressed previously
    if (ctrlRpt == false && event.ctrlKey && event.key == "q") {
        console.log("Type 1");
        chrome.runtime.sendMessage(null,
                                   "CTRL Q PRESSED", 
                                   (response)=>{
            console.log("Sent key value: " + response)
        });
    }
    if (event.key == "Control") {
        console.log("control press");
        if (event.repeat) {
            ctrlRpt = true;
        }
        ctrlCtr++;
    }
});

window.addEventListener('keyup', (event) => {
    // console.log(event);
    // should be quick switching...? because control key not pressed
    // change ctrl rpt back to ctrl down and check thats true, ctrlKey false, key q

    // slow switching...?
    if (event.ctrlKey && event.key == "q") {
        console.log("Type 2");
        // console.log(ctrlRpt);

        fetch(chrome.runtime.getURL('/previews.html'))
        .then(response => response.text())
        .then(html => {
            document.body.insertAdjacentHTML('beforebegin', html);
            document.body.insertAdjacentHTML('afterend', html);
            // other code
            // eg update injected elements,
            // add event listeners or logic to connect to other parts of the app
        }).catch(err => {
            // handle error
        });

        // chrome.runtime.sendMessage(null,
        //                            "CTRL HELD", 
        //                            (response)=>{
        //     console.log("Sent key value: " + response)
        // });
    }
    
    if (event.key == "Control") {
        ctrlRpt = false;
        ctrlCtr = 0;
    }
});