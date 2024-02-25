const dropZoneElem = document.querySelector(".drop-zone");
const fileInputElem = document.querySelector("#file-input");
const browseBtnElem = document.querySelector(".browse-button");

const progressContainerElem = document.querySelector(".progress-container");
const uploadProgressElem = document.querySelector(".upload-progress");
const percentageValueElem = document.getElementById("percent-value");

const sharingContainerElem = document.querySelector(".sharing-container");
const copyFileURL_Elem = document.querySelector("#copyFileURL");
const copyIconElem = document.querySelector("#copy-icon");

const emailFormElem = document.querySelector("#email-form");

const toastElem = document.querySelector(".toast");

const host = "https://share-on-backend.onrender.com/";
const uploadURL = `${host}api/files`;
const emailURL = `${host}api/files/send`;

const resetFileInput = () => {
  fileInputElem.value = "";
};

const MAX_FILE_UPLOAD_SIZE = 100 * 1024 * 1024; // 100MB

// Adding the button to get the click for fileInputElem which is displayed none, and called click on hidden input field which will open file menu.
browseBtnElem.addEventListener("click", () => {
  // This click will trigger the fileMenu opener and as soon as we select a file, change event listener on fileInputElem is triggered to upload the selected file.
  fileInputElem.click();
});

//--------------- Animation Setup ----------->

// Adding the animation to the dropzoneElem by adding an extra class called draggable to the dropzoneElem
dropZoneElem.addEventListener("dragover", (e) => {
  // This is done because the default behaviour on this action is to download and we are preventing it.
  e.preventDefault();
  /**
   * dropZoneElem.classList.add("dragged");
   *
   * Adding the dragged class in the dropZoneElem to make sure the animation run,
   * but this isn't efficient because the animation doesn't goes off after we come out of dropZoneElem.
   *
   * Thus, adding dragged class only when there is no dragged class already existing.
   */
  if (!dropZoneElem.classList.contains("dragged")) {
    dropZoneElem.classList.add("dragged");
  }
});

// Stopping the animation by removing the class as soon as drag element is left
dropZoneElem.addEventListener("dragleave", (e) => {
  e.preventDefault();
  dropZoneElem.classList.remove("dragged");
});

/** As soon as the file is dropped then remove the animation class,
 * then get the files from dropEvent using e.dataTransfer.files
 * and save them to the inputHTMLElement files object.
 * */
dropZoneElem.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZoneElem.classList.remove("dragged");

  const fileReceived = e.dataTransfer.files;

  // This check is there to check if files are really being dropped or not.
  if (fileReceived.length) {
    fileInputElem.files = fileReceived;
    // Get the first file out of all the dropped files and upload only that one.
    const firstFile = fileInputElem.files[0];
    uploadFile(firstFile);
  }
});

// Also send the upload request other than drop when someone selects a file from browse.
fileInputElem.addEventListener("change", () => {
  const receivedFile = fileInputElem.files[0];
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
  // If we upload more than 1 file tell user to upload only 1 file
  if (fileInputElem.files.length > 1) {
    showToast("Please add a single file to upload");
    resetFileInput();
    return; // Returning because we want nothing ahead to run.
  }

  if (file.size > MAX_FILE_UPLOAD_SIZE) {
    showToast("File size cannot be more than 100MB");
    resetFileInput();
    return;
  }

  // Showing the progress element as soon as someone uploads a file.
  updateContainerElem(progressContainerElem, "flex");

  const formData = new FormData();
  formData.append("myfile", file);

  const xhr = new XMLHttpRequest();

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      // Showing the download link to the user, response returns an object with file property containing the link.
      onUploadSuccess(JSON.parse(xhr.response));
    }
  };

  // ---------------- Monitoring uplaod progress  ------------>

  xhr.upload.addEventListener("progress", updateProgress);

  // Adding toast if error occured while uploading files.
  xhr.upload.onerror = () => {
    // If there is an error in uplading file then we also have to clear the fileInput that are there in the fileInputElem
    resetFileInput();
    showToast(`Error in uploading file: ${xhr.statusText}`);
    updateContainerElem(progressContainerElem, "none");
  };

  xhr.open("POST", uploadURL);
  xhr.send(formData);
};

const updateContainerElem = (element, displayValue) => {
  element.style.display = displayValue;
};

const updateProgress = (event) => {
  const uploadPercentage = Math.round((event.loaded / event.total) * 100);

  percentageValueElem.textContent = uploadPercentage;
  uploadProgressElem.style.width = `${uploadPercentage}%`;
};

const onUploadSuccess = ({ file: fileDownloadLink }) => {
  // Closing the progressContainer as soon as the file is fully uploaded
  updateContainerElem(progressContainerElem, "none");

  // Removing the disabled attribute added with last transfer from the Send Email button
  emailFormElem[2].removeAttribute("disabled");
  // We also have to clear the fileInput that are there in the fileInputElem
  resetFileInput();

  // Also show the link Expiry text with the download link
  updateContainerElem(sharingContainerElem, "block");

  copyFileURL_Elem.value = fileDownloadLink;
  // Also show the send link through email element
};

const copyToClipboard = () => {
  // This will select the whole fileURL
  copyFileURL_Elem.select();
  // This will copy the whole selected value to the Clipboard
  navigator.clipboard.writeText(copyFileURL_Elem.value);
  showToast("Link copied");
};

copyIconElem.addEventListener("click", copyToClipboard);

emailFormElem.addEventListener("submit", (event) => {
  // This is to save the values going into the url.
  event.preventDefault();

  const fileDownloadLink = copyFileURL_Elem.value;
  const uuid = fileDownloadLink.split("/").splice(-1, 1)[0];

  const formData = {
    uuid,
    emailTo: emailFormElem.elements["to-email"].value,
    emailFrom: emailFormElem.elements["from-email"].value,
  };

  // Disabling the form button, this will take the 3rd element of the email form and make it disabled.
  emailFormElem[2].setAttribute("disabled", true);

  // Send data in the form to the Backend
  fetch(emailURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then(({ success }) => {
      if (success) {
        // If email is sent successfully then hide the sharing container
        updateContainerElem(sharingContainerElem, "none");
        showToast("Email sent");
        emailFormElem.reset();
      }
    });
});

// Clearing the toastTimeOut for the previous toast if it exists.
let toastTimeoutID;

const showToast = (message) => {
  const toastVisibleTime = 2000;

  toastElem.innerText = message;
  toastElem.style.transform = "translateX(0%)";

  clearTimeout(toastTimeoutID);

  toastTimeoutID = setTimeout(() => {
    toastElem.style.transform = "translateX(200%)";
  }, toastVisibleTime);
};
