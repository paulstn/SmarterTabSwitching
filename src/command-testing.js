var ctrlDown = false;
var multipleOccurs = false;
var qDown = false;

var previewId = "SmarterTabSwitchingPreviewPopupBox";

// this is only kept for demonstration
var numSwitches = 0;

// Array with all of the data URLs for image: 
// TBD replace dummy image URLs with actual data URLs of current snapshot of each tab
var imageUrls = null;

  
// Generates images for image of:
// src: data URL 
// width: width of image display
// height: height of image display
// marginRight: pixel gap between each image
function createImage(src, width, height, marginRight) {
    var img = document.createElement('img');
    img.onload = function() {
      console.log('Image loaded:', this.src);
    };
    img.onerror = function() {
      console.error('Error loading image:', this.src);
    };
    img.src = src;
    img.style.display = "inline-block";
    img.width = width;
    img.height = height;
    img.style.marginRight = marginRight;
    return img;
  }


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
      } else if (request.image) {
        imageUrls = request.image;
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

                // const url = window.location.href;
                // pic1RelPath = `${window.location.origin}/src/preview-pics/1.png`;
                // const pic1Path = new URL(pic1RelPath, url).href;

                // const absolutePath = __dirname + pic1RelPath;

                // var pic2 = createImage(previewPic2, 100, 100, "10px");
                // var pic3 = createImage(previewPic3, 100, 100, "10px");
                // var pic4 = createImage(previewPic4, 100, 100, "10px");
                // var pic5 = createImage(previewPic5, 100, 100, "10px");

                // text_div.appendChild(text);
                // text_div.appendChild(pic2);
                // text_div.appendChild(pic3);
                // text_div.appendChild(pic4);
                // text_div.appendChild(pic5);

                // Appends any number of images to popup UI depending on number of imageUrls passed
                // Currently displays in 100x100 per image TBD: if aspect ratio not defined enough
                text_div.appendChild(text);
                for (var i = 0; i < imageUrls.length; i++) {
                    var img = createImage(imageUrls[i], 100, 100, "10px");
                    text_div.appendChild(img);
                }

                text_div.style.whiteSpace = 'nowrap';


                popup.appendChild(text_div);
                document.body.appendChild(popup);
            } else {
                // This is the branch for when 'Q' is clicked multiple times as 'CTRL' is held
                var preview = document.getElementById(previewId);

                //querySelectorAll() gets all images from preview box
                var images = preview.querySelectorAll('img');
                var numImages = images.length;

                // Updates the outline to highlight the active image:
                // numSwitches: number of times Q is clicked while CNTRL is held down
                // numImages: number of images in preview box
                var currentIndex = numSwitches % numImages;

                 // Update the 3 pixel thick blue outline to highlight the active image
                images.forEach((image, index) => {
                    if (index === currentIndex) {
                      image.style.outline = '3px solid blue';
                    } else {
                      image.style.outline = 'none';
                    }
                  });
                  // preview.children[0].innerHTML = "Switch tab num times: " + numSwitches % 5;
            }


            multipleOccurs = true;




        }
    }
});