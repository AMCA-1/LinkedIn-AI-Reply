import editIcon from "~/assets/edit.svg";
import insertIcon from "~/assets/insert.svg";
import generateIcon from "~/assets/generate.svg";
import regenerateIcon from "~/assets/regenerate.svg";

// Alright, time to set up the script for LinkedIn pages
export default defineContentScript({
  matches: ["*://*.linkedin.com/*"], // Targeting LinkedIn URLs here
  main() {
    // Here’s the HTML for my custom modal that’s going to pop up
    const modalHtml = `
    <div id="custom-modal" style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: none; justify-content: center; align-items: center; z-index: 4000;">
      <div id="modal-content" style="background: white; border-radius: 8px; width: 100%; max-width: 570px; padding: 20px;">
        <div id="messages" style="margin-top: 10px; max-height: 200px; overflow-y: auto; padding: 10px; display: flex; flex-direction: column;"></div>
        <div style="margin-bottom: 10px;">
          <input id="input-text" type="text" placeholder="Your prompt" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; outline: none; box-shadow: none;"/>
        </div>
        <div style="text-align: right; margin-top: 12px;">
          <button id="insert-btn" style="background: #fff; color: #666D80; padding: 8px 16px; border: 2px solid #666D80; border-radius: 4px; cursor: pointer; display: none; margin-right: 10px;">
            <img src="${insertIcon}" alt="Insert" style="vertical-align: middle; margin-right: 5px; width: 14px; height: 14px;"> 
            <b>Insert</b>
          </button>
          <button id="generate-btn" style="background: #007bff; color: white; padding: 8px 16px; border: 2px solid #007bff; border-radius: 4px; cursor: pointer;">
            <img src="${generateIcon}" alt="Generate" style="vertical-align: middle; margin-right: 5px; width: 14px; height: 14px"> 
            <b>Generate</b>
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Add CSS rule to style the input field on focus
  const style = document.createElement('style');
  style.textContent = `
    #input-text {
      transition: border-color 0.3s ease-in-out;
    }
    #input-text:focus {
      outline: none;
      border-color: #ddd; /* Matches the subtle color seen in the screenshot */
      box-shadow: none;   /* Removes the default shadow on focus */
    }
  `;
  document.head.appendChild(style);
  
  

    // Let’s add this modal to the page. It starts hidden, of course.
    document.body.insertAdjacentHTML("beforeend", modalHtml);

    // Grab references to the modal and its elements for later – don’t forget these
    const modal = document.getElementById("custom-modal") as HTMLDivElement;
    const generateBtn = document.getElementById("generate-btn") as HTMLButtonElement;
    const insertBtn = document.getElementById("insert-btn") as HTMLButtonElement;
    const inputText = document.getElementById("input-text") as HTMLInputElement;
    const messagesDiv = document.getElementById("messages") as HTMLDivElement;

    // Gotta keep track of the last generated message and where to insert it
    let lastGeneratedMessage = "";
    let parentElement: HTMLElement | null = null;

    // Listen for clicks on LinkedIn message input areas
    document.addEventListener("click", (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check if I clicked on a message input area
      if (
        target.matches(".msg-form__contenteditable") ||
        target.closest(".msg-form__contenteditable")
      ) {
        // Set the parent element to the message input container
        parentElement =
          target.closest(".msg-form__container") ||
          target.closest(".msg-form__contenteditable");

        const contentContainer = parentElement?.closest(
          ".msg-form_msg-content-container"
        );

        // Make sure the message form looks active and ready for typing
        if (parentElement && contentContainer) {
          contentContainer.classList.add(
            "msg-form_msg-content-container--is-active"
          );
          parentElement.setAttribute("data-artdeco-is-focused", "true");
        }

        // Time to add the edit icon if it’s not already there
        if (parentElement && !parentElement.querySelector(".edit-icon")) {
          parentElement.style.position = "relative";

          const icon = document.createElement("img");
          icon.className = "edit-icon";
          icon.src = editIcon;
          icon.alt = "Edit";
          icon.style.position = "absolute";
          icon.style.bottom = "5px";
          icon.style.right = "5px";
          icon.style.width = "30px";
          icon.style.height = "30px";
          icon.style.cursor = "pointer";
          icon.style.zIndex = "1000";
          parentElement.appendChild(icon);

          // Open the modal when I click the edit icon
          icon.addEventListener("click", (e) => {
            e.stopPropagation();
            modal.style.display = "flex"; // Show the modal
          });
        }
      }
    });

    // Basic message generator – keep it simple for now
    const generateMessage = () => {
      const messages = [
        "Thank you for the opportunity! If you have any more questions or if there's anything else I can help you with, feel free to ask.",
      ];
      return messages[0]; // Just returning the first message for now
    };

    // Handle clicks on the 'Generate' button
    generateBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent event bubbling

      // Grab the text from the input field
      const inputValue = inputText.value.trim();
      if (!inputValue) return; // Don't do anything if the input's empty

      // Add the user's message to the modal
      const userMessageDiv = document.createElement("div");
      userMessageDiv.textContent = inputValue;
      Object.assign(userMessageDiv.style, {
        backgroundColor: "#DFE1E7",
        color: "#666D80",
        borderRadius: "12px",
        padding: "10px",
        marginBottom: "5px",
        textAlign: "right",
        maxWidth: "80%",
        alignSelf: "flex-end",
        marginLeft: "auto",
      });
      messagesDiv.appendChild(userMessageDiv);

      // Disable the 'Generate' button and show a loading state
      generateBtn.disabled = true;
      generateBtn.textContent = "Loading...";
      generateBtn.style.backgroundColor = "#666D80";

      // Simulate an API call to generate a message
      setTimeout(() => {
        lastGeneratedMessage = generateMessage(); // Get the generated message
        const generatedMessageDiv = document.createElement("div");
        generatedMessageDiv.textContent = lastGeneratedMessage;
        Object.assign(generatedMessageDiv.style, {
          backgroundColor: "#DBEAFE",
          color: "#666D80",
          borderRadius: "12px",
          padding: "10px",
          marginBottom: "5px",
          textAlign: "left",
          maxWidth: "80%",
          alignSelf: "flex-start",
          marginRight: "auto",
        });

        // Add the generated message to the modal
        messagesDiv.appendChild(generatedMessageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to show the latest message

        // Enable the 'Generate' button and change its text to 'Regenerate'
        generateBtn.disabled = false;
        generateBtn.style.backgroundColor = "#007bff";
        generateBtn.style.color = "white";
        generateBtn.innerHTML = `<img src="${regenerateIcon}" alt="Regenerate" style="vertical-align: middle; margin-right: 5px; width: 16px; height: 16px"> <b>Regenerate</b>`;

        // Clear the input field and show the 'Insert' button
        inputText.value = "";
        insertBtn.style.display = "inline-block";
      }, 500); // Wait a bit to simulate processing time
    });

    // Handle clicks on the 'Insert' button to put the generated message into the LinkedIn message area
    insertBtn.addEventListener("click", () => {
      if (lastGeneratedMessage && parentElement) {
        // Focus on the message area before inserting the text
        parentElement.focus();

        // Clear placeholder text if present
        if (parentElement.innerText.trim() === "Write a message...") {
          parentElement.innerHTML = ""; // Remove placeholder text
        }

        // Insert the generated message at the current cursor position
        document.execCommand("insertText", false, lastGeneratedMessage);

        // Hide the 'Insert' button and close the modal
        insertBtn.style.display = "none";
        modal.style.display = "none";
      }
    });

    // Keep the message input area focused while interacting with the modal
    const inputElements = [inputText, generateBtn, insertBtn];
    inputElements.forEach((element) => {
      element.addEventListener("focus", () => {
        if (parentElement) {
          parentElement.setAttribute("data-artdeco-is-focused", "true");
        }
      });
    });

    // Close the modal if I click outside of it
    document.addEventListener("click", (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        modal.style.display === "flex" &&
        !modal.contains(target) &&
        !target.classList.contains("edit-icon")
      ) {
        modal.style.display = "none"; // Hide the modal
        inputText.placeholder = "Your Prompt"; // Reset the placeholder when closing
      }
    });
  },
});
