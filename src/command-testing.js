var ctrlDown = false;
var multipleOccurs = false;
var qDown = false;

var previewId = "SmarterTabSwitchingPreviewPopupBox";

// this is only kept for demonstration
var numSwitches = 0;

window.addEventListener('keydown', (event) => {
    if (event.key == "Control") {
        ctrlDown = true;
    }
});

// helpful message from extension letting us know ctrl and q were pressed together
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.qPressed) {
        qDown = true;
      }
    }
  );  

window.addEventListener('keyup', (event) => {    
    if (event.key == "Control") {
        ctrlDown = false;
        if (multipleOccurs) {
            // this block of code is meant for handling the actual switching of tabs
            // upon multiple tab switching
            console.log("Now switch to another tab from multiple");
           

            var preview = document.getElementById(previewId);
            preview.remove();

            // CTRL TAB HELD
            chrome.runtime.sendMessage(null, {contentPresses: numSwitches % 5});         

            multipleOccurs = false;
            numSwitches = 0;
        } else if (qDown) {
            // this block is meant to handle a single switching, only switching to the previous
            // most recently used tab
            console.log("Single Switch");
            
            qDown = false;

            chrome.runtime.sendMessage(null, {contentPresses: 1});         
        }
    }
    if (event.key == "q") {
        qDown = false;
        if (ctrlDown) {
            // this block of code is meant to handle the behavior of changing which tab preview
            // is selected in the multiple tab switching preview box
            console.log("Select from multiple tabs");
            numSwitches++

            // TODO: need to modify this behavior to be completely different
            // if the popup box isn't shown yet..
            if (!multipleOccurs) {
                console.log("made the box and put it on the screen");
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
                popup.id = previewId;
                // popup.style.transform = 'translate(-50%, -50%)';

                const text_div = document.createElement('div');
                // text_div.style["background-color"] = "white";
                text_div.style.padding = "20px";
                // text_div.style.width = '100%';
                // text_div.style.height = '100%';
                text_div.style.backgroundColor = 'white';
                text_div.style.border = '1px solid black';

                text = document.createTextNode("Switch tab num times: " + numSwitches);
                // text.style["text-align"] = "center";

                text_div.appendChild(text);
                popup.appendChild(text_div);
                document.body.appendChild(popup);
            } else {
                var preview = document.getElementById(previewId);
                preview.children[0].innerHTML = "Switch tab num times: " + numSwitches % 5;
            }


            multipleOccurs = true;




        }
    }
});