const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#file-input");
const browseBtn = document.querySelector(".browse-button");

const host = "https://innshare.herokuapp.com/";
const uploadURL = `${host}api/files`;
// const uploadURL = `${host}api/files`; //--> will use this later for uploading using email.

// Adding the button to get the click for fileInput which is displayed none, and called click on hidden input field which will open file menu.
browseBtn.addEventListener("click", () => {
  // This click will trigger the fileMenu opener and as soon as we select a file, change event listener on fileInput is triggered to upload the selected file.
  fileInput.click();
});

//--------------- Animation Setup ----------->

// Adding the animation to the dropzone by adding an extra class called draggable to the dropzone
dropZone.addEventListener("dragover", (e) => {
  // This is done because the default behaviour on this action is to download and we are preventing it.
  e.preventDefault();
  /**
   * dropZone.classList.add("dragged");
   *
   * Adding the dragged class in the dropZone to make sure the animation run,
   * but this isn't efficient because the animation doesn't goes off after we come out of dropZone.
   *
   * Thus, adding dragged class only when there is no dragged class already existing.
   */
  if (!dropZone.classList.contains("dragged")) {
    dropZone.classList.add("dragged");
  }
});

// Stopping the animation by removing the class as soon as drag element is left
dropZone.addEventListener("dragleave", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragged");
});

/** As soon as the file is dropped then remove the animation class,
 * then get the files from dropEvent using e.dataTransfer.files
 * and save them to the inputHTMLElement files object.
 * */
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragged");

  const fileReceived = e.dataTransfer.files;

  // This check is there to check if files are really being dropped or not.
  if (fileReceived.length) {
    fileInput.files = fileReceived;
    // Get the first file out of all the dropped files and upload only that one.
    const firstFile = fileInput.files[0];
    uploadFile(firstFile);
  }
});

// Also send the upload request other than drop when someone selects a file from browse.
fileInput.addEventListener("change", () => {
  const receivedFile = fileInput.files[0];
  uploadFile(receivedFile);
});

/**
 * Upload the file by making an XHR(XML HTTP Request) post method call using the formObject.
 * For that we have to give the file as a formData where the key for the fileUploaded is "myfile",
 * this key is agreed upon by both backend and frontend.
 *
 * Thus, make a new formDataInstance and then call the append method on it to append your file to that formData.
 */

/**
 * This will be triggered once the call will go and will take care of every step of the API call.
 * xhr.readyState is the value that will take care of the State
 * XMLHttpRequest.DONE is the final stage telling us that request is success and response is there.
 * We can access the response using xhr.response
 */
const uploadFile = (file) => {
  const formData = new FormData();
  formData.append("myfile", file);

  const xhr = new XMLHttpRequest();

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      console.log(xhr.response);
    }
  };

  xhr.open("POST", uploadURL);
  xhr.send(formData);
};

// fileInput.addEventListener("change", () => {
//     console.log("shivam")
//   uploadFile();
// });

// /*
//     Creating Progress Bar
// */

// const bgProgress = document.querySelector(".bg-progress");
// const percentDiv = document.querySelector("#percent");
// const progressBar = document.querySelector(".progress-bar");
// const progressContainer = document.querySelector("");

// const updateProgress = (e)=>{
//     const percentage = Math.round((e.loaded/e.total) * 100);
//     bgProgress.style.width = `${percent}%`;
//     percentDiv.innerText= percent;

//     progressBar.style.transform = `scaleX(${percent/100})`
// }

// // Done till Adding drag and drop
