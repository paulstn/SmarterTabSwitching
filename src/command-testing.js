var ctrlDown = false;
// ctrl counter seems janky, I think there is a way to tell if its repeating
var ctrlCtr = 0;



window.addEventListener('keydown', (event) => {
    console.log(event);
    // console.log(ctrlCtr);

    // check to make sure the control key wasn't being pressed previously
    // if (ctrlRpt == false && event.ctrlKey && event.key == "q") {

    // }
    if (event.key == "Control") {
        console.log("control press");
        ctrlDown = true;
        ctrlCtr++;
    }
});

window.addEventListener('keyup', (event) => {
    // console.log(event);
    // should be quick switching...? because control key not pressed
    // change ctrl rpt back to ctrl down and check thats true, ctrlKey false, key q
    if (ctrlDown && event.ctrlKey == false && event.key == "q") {
        console.log("Type 1");
        chrome.runtime.sendMessage(null,
                                   "CTRL Q PRESSED", 
                                   (response)=>{
            console.log("Sent key value: " + response)
        });
    }

    // slow switching...?
    if (event.ctrlKey && event.key == "q") {
        console.log("Type 2");
        // console.log(ctrlRpt);

        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.display = "flex";
        popup.style["align-items"] = "center";
        popup.style["justify-content"] = "center";
        popup.style.zIndex = "2147483647"; // max z-index, will appear above all other things
        // popup.style.width = "100%";
        // popup.style.height = "100%";
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.bottom = '50%';
        popup.style.right = '50%';
        // popup.style.transform = 'translate(-50%, -50%)';

        const text_div = document.createElement('div');
        // text_div.style["background-color"] = "white";
        // text_div.style["padding"] = "20px";
        // text_div.style.width = '100%';
        // text_div.style.height = '100%';
        text_div.style.backgroundColor = 'white';
        text_div.style.border = '20px solid white';

        const text = document.createTextNode("Popup box");
        // text.style["text-align"] = "center";

        text_div.appendChild(text);
        popup.appendChild(text_div);
        document.body.appendChild(popup);

        // box.style.top = '50%';
        // box.style.left = '50%';
        // box.style.backgroundColor = '#f0f0f0';
        // box.style.border = '1px solid #ccc';
        // box.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';

        // fetch(chrome.runtime.getURL('/previews.html'))
        // .then(response => response.text())
        // .then(html => {
        //     document.body.insertAdjacentHTML('beforebegin', html);
        //     document.body.insertAdjacentHTML('afterend', html);
        //     // other code
        //     // eg update injected elements,
        //     // add event listeners or logic to connect to other parts of the app
        // }).catch(err => {
        //     // handle error
        // });

        // chrome.runtime.sendMessage(null,
        //                            "CTRL HELD", 
        //                            (response)=>{
        //     console.log("Sent key value: " + response)
        // });
    }
    
    if (event.key == "Control") {
        ctrlDown = false;
        ctrlCtr = 0;
    }
});