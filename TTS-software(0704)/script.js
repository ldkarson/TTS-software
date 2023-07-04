//Speech module initilization
let speech = new SpeechSynthesisUtterance();
let voices = [];
let voiceSelect = document.querySelector("select");
let synthesizer = window.speechSynthesis;

// Link for saving the audio recorded for download
let downloadLink;

// the module use to record the voice
let mediaRecorder;

// For debugging whether it has recorded the sound
let recordedChunks = [];

// initialize the record
let history = document.getElementById('history');
let history_record = '';


//prompt error message if no sound card

if (typeof AudioContext !== "undefined" || typeof webkitAudioContext !== "undefined"){
    //Sound card is present
    console.log("Sound card is present");
    
    
}else{
    //sound card is not present
    console.log("Sound card is not present.");
    //prompt error message
    alert("Error: Sound card is not present. Please plug-in a audio device to use.");
    //hide the button 
    document.querySelector("button").style.display = "none";
    document.querySelector("#download_button").style.display = "none";
    //show the error message on the textbox
    history.style.fontSize = "24px";
    history.style.color = "red";
    error_message = "Error ! Please refresh the webpage after you have plug-in a audio device.";
    history.value += error_message;
    
}







// Update the voice list when the voices change
window.speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices();
    speech.voice = voices[0]; //default voice

    //Filter the voices to include only Cantonese, English, and Mandarin voices
    voices = voices.filter(voice => {
        return (
            (voice.lang.includes("en") && voice.name.includes("Google") && ((voice.name.includes("Female") || voice.name.includes("Male"))))
            || ((voice.lang.includes("zh-CN") || voice.lang.includes("zh-HK")) && voice.name.includes("Google"))
        );
    });

    //voices.push(customVoice);

    voices.forEach((voice, i) => (voiceSelect.options[i] = new Option(voice.name, i)));
};

//voice selection
voiceSelect.addEventListener("change", () => {
    speech.voice = voices[voiceSelect.value];
});

document.querySelector("button").addEventListener("click", async () => {
    // Capture audio data as it's being generated
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];

    mediaRecorder.start();

    mediaRecorder.addEventListener("dataavailable", event => {
        audioChunks.push(event.data);
        console.log('datavailable event fired');
        console.log(event.data); // log the recorded audio data to the console

        //testing the sound stuff(can delete)
        recordedChunks.push(event.data);
    });


    mediaRecorder.addEventListener("stop", () => {

        //check whether the method is called
        console.log("stopped recording")

        console.log(recordedChunks);
        
        // Create a new Blob object from the audio chunks
        const audioBlob = new Blob(audioChunks, {type: "audio/webm"});

        // Create a URL object from the audio blob
        const audioURL = URL.createObjectURL(audioBlob);

        // Create an audio element to play the audio
        const audioElement = new Audio();
        audioElement.src = audioURL;
        audioElement.controls = true;
        document.body.appendChild(audioElement);

        // Create a download link for the audio data
        downloadLink = document.createElement("a");
        downloadLink.href = audioURL;
        downloadLink.download = "speech.webm";
        document.body.appendChild(downloadLink);

        
    });
    
    try{
        speech.text = document.querySelector("#input_box").value;
        window.speechSynthesis.speak(speech);
    } catch(error){
        alert("Error: " + error.message);
    }
    
    
    //Update the histroy with the result
    let date = new Date();
    let timestamp = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    history_record += "Time: " + timestamp + "   |   Language: " + speech.voice.lang + "   |     Content: " + speech.text + '\n';
    history.value = history_record;

    synthesizer = speech;

    synthesizer.onend = function() {
        mediaRecorder.stop();
    };

    // Show the download button
    document.querySelector("#download_button").style.display = "block";
});

// Add an event listener for the download button
document.querySelector("#download_button").addEventListener("click", function() {
    console.log("Download button clicked");
    mediaRecorder.stop();

    // Simulate a click on the download link to start the download
    console.log(downloadLink);
    downloadLink.click();
    //check whether it has been clicked
    downloadLink.addEventListener("downloadLink clicked", () => {
        console.log("Download link clicked");
    });

    // Clean up the audio element and download link
    document.body.removeChild(audioElement);
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(audioURL);
    
});