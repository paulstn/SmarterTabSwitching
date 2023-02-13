window.addEventListener('keydown', (event) => {
    // console.log(event);
    if (event.ctrlKey && event.key == "q") {
        console.log("CTRL Q PRESSED");
        chrome.runtime.sendMessage(null,
                                   "CTRL Q PRESSED", 
                                   (response)=>{
            console.log("Sent key value: " + response)
        });
    }
});