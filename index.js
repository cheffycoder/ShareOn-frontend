const dropZone = document.querySelector('.drop-zone');
const fileInput = document.querySelector('#file-input');
const browseBtn = document.querySelector('.browse-button')

const host = "https://innshare.herokuapp.com/"
const uploadURL = `${host}api/files`;
// const uploadURL = `${host}api/files`; //--> will use this later for uploading using email.


// MDN JS give us this Web API called DragEvent which senses if somthing is dragged over the droptarget
dropZone.addEventListener("dragover", (e)=>{
    // This is done because the default behaviour on this action is to download and we are preventing it.
    e.preventDefault();
    /* 
        dropZone.classList.add("dragged");

        Adding the dragged class in the dropZone to make sure the animation run, 
        but this isn't efficient because the animation doesn't goes off after we come out of dropZone.
    */

    if(!dropZone.classList.contains("dragged")){
        dropZone.classList.add("dragged");
    }
});


dropZone.addEventListener("dragleave", (e)=>{
    e.preventDefault();

    dropZone.classList.remove("dragged");
})


dropZone.addEventListener("drop", (e)=>{
    e.preventDefault();
    dropZone.classList.remove("dragged");

    // console.log(e.dataTransfer.files.length);
    const fileReceived = e.dataTransfer.files;

    console.log(fileReceived);

    // This check is there to check if files are really being dropped or not.
    if(fileReceived.length){
        fileInput.files = fileReceived;
        // If yes then upload them to the server and send a post request
        uploadFile();
    }   
})



browseBtn.addEventListener("click", (e)=>{
    fileInput.click();
})


// Uploading a file using xhr
const uploadFile = () => {

    const file = fileInput.files[0];

    // This will create a new form object which we will upload using post method. We have to enter our file in the form data to post.
    const formData = new FormData();
    formData.append("myfile",file); // This check was there when we made the post request in backend. Thus, have to pass the first argument as myfile

    // Uploading using xhr request, Adding event listeners to it.
    const xhr = new XMLHttpRequest();

    // This will be triggered once the file will be uploaded
    xhr.onreadystatechange= ()=>{
        console.log(xhr.readyState);
    }


    xhr.open("POST", uploadURL);
    xhr.send(formData);
}


fileInput.addEventListener("change", ()=>{
    uploadFile();
})




/* 
    Creating Progress Bar
*/

const bgProgress = document.querySelector(".bg-progress");
const percentDiv = document.querySelector("#percent");
const progressBar = document.querySelector(".progress-bar");
const progressContainer = document.querySelector("");


const updateProgress = (e)=>{
    const percentage = Math.round((e.loaded/e.total) * 100);
    bgProgress.style.width = `${percent}%`;
    percentDiv.innerText= percent;

    progressBar.style.transform = `scaleX(${percent/100})`
}



// Done till Adding drag and drop




