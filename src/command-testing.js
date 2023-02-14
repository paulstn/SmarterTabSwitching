var ctrlDown = false;
var multipleOccurs = false;
var qDown = false;

window.addEventListener('keydown', (event) => {
    if (event.key == "Control") {
        ctrlDown = true;
    }

    if (event.key == "q") {
        qDown = true;
    }
});

window.addEventListener('keyup', (event) => {    
    if (event.key == "Control") {
        ctrlDown = false;
        if (multipleOccurs) {
            // this block of code is meant for handling the actual switching of tabs
            // upon multiple tab switching
            console.log("Now switch to another tab from multiple");
            multipleOccurs = false;

            // TODO: need to implement removing of the preview box
        } else if (qDown) {
            // this block is meant to handle a single switching, only switching to the previous
            // most recently used tab
            console.log("Single Switch");   

            chrome.runtime.sendMessage(null,
                                    "CTRL Q PRESSED", 
                                    (response)=>{
                console.log("Sent key value: " + response)
            });         
        }
    }
    if (event.key == "q") {
        qDown = false;
        if (ctrlDown) {
            // this block of code is meant to handle the behavior of changing which tab preview
            // is selected in the multiple tab switching preview box
            console.log("Select from multiple tabs");
            multipleOccurs = true;

            // create the popup box below, TODO: we should handle this in some other block of code
            // hopefully only need to make the below element once...? does that matter?
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

        }
    }
});