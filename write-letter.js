import { supabase } from "./supabase-config.js";

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const user = urlParams.get("user");
  const letterIdStr = urlParams.get("id"); // If present, we are in edit mode
  const letterId = letterIdStr ? parseInt(letterIdStr, 10) : null;
  
  if (!user) {
    window.location.href = "main.html";
    return;
  }

  const cancelBtn = document.getElementById("cancelBtn");
  cancelBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (letterId) {
      window.location.href = `view-letter.html?user=${user}&id=${letterId}`;
    } else {
      window.location.href = `letters.html?user=${user}`;
    }
  });

  const form = document.getElementById("writeForm");
  const folderNameInput = document.getElementById("folderName");
  const letterContentInput = document.getElementById("letterContent");
  const imageUploadInput = document.getElementById("imageUpload");
  const imagePreviewContainer = document.getElementById("imagePreviewContainer");
  const folderError = document.getElementById("folderError");
  const submitBtn = document.getElementById("submitBtn");
  const submitStatus = document.getElementById("submitStatus");

  let existingImages = [];

  // If edit mode, load existing data
  if (letterId) {
    try {
      const { data, error } = await supabase
        .from('letters')
        .select('*')
        .eq('id', letterId)
        .single();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        folderNameInput.value = data.folderName || data.foldername || "";
        letterContentInput.value = data.content || "";
        
        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
          existingImages = data.images;
          existingImages.forEach(url => {
            const img = document.createElement("img");
            img.src = url;
            img.className = "image-preview";
            imagePreviewContainer.appendChild(img);
          });
        }
      } else {
        alert("Letter not found!");
        window.location.href = `letters.html?user=${user}`;
      }
    } catch (error) {
      console.error("Error loading letter:", error);
      alert("Error loading letter. Please check the console.");
    }
  }

  // Handle image preview for newly selected files
  imageUploadInput.addEventListener("change", () => {
    folderError.textContent = "";
    // Clear only new previews (keep existing ones if editing)
    const existingImgs = imagePreviewContainer.querySelectorAll("img:not([data-new='true'])");
    imagePreviewContainer.innerHTML = "";
    existingImgs.forEach(img => imagePreviewContainer.appendChild(img));

    const files = imageUploadInput.files;
    
    if (existingImages.length + files.length > 13) {
      folderError.textContent = `You can only upload a maximum of 13 images. You currently have ${existingImages.length} saved and are trying to add ${files.length}.`;
      imageUploadInput.value = ""; // Clear selection
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.className = "image-preview";
        img.setAttribute("data-new", "true");
        imagePreviewContainer.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  });

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    folderError.textContent = "";
    submitStatus.textContent = "Checking folder name...";
    submitBtn.disabled = true;

    const folderName = folderNameInput.value.trim();
    const content = letterContentInput.value.trim();
    const files = imageUploadInput.files;

    if (existingImages.length + files.length > 13) {
      folderError.textContent = "Cannot upload more than 13 images total.";
      submitBtn.disabled = false;
      submitStatus.textContent = "";
      return;
    }

    try {
      // 1. Validate folder name uniqueness
      const { data: existingLetters, error: duplicateError } = await supabase
        .from('letters')
        .select('id')
        .eq('user', user)
        .eq('folderName', folderName);
        
      if (duplicateError) throw duplicateError;
      
      let isDuplicate = false;
      if (existingLetters) {
        existingLetters.forEach((doc) => {
          if (!letterId || doc.id !== letterId) {
            isDuplicate = true;
          }
        });
      }

      if (isDuplicate) {
        folderError.textContent = "This folder name already exists. Please choose a unique name.";
        submitStatus.textContent = "";
        submitBtn.disabled = false;
        return;
      }

      submitStatus.textContent = "Uploading images... this may take a moment.";

      // 2. Upload new images if any
      const newlyUploadedUrls = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
        const filePath = `${user}/${Date.now()}_${safeName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('letter-images')
          .upload(filePath, file);
          
        if (uploadError) {
           console.error("Upload Error:", uploadError);
           throw new Error("Failed to upload image: " + file.name);
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('letter-images')
          .getPublicUrl(filePath);
          
        if (publicUrlData && publicUrlData.publicUrl) {
          newlyUploadedUrls.push(publicUrlData.publicUrl);
        }
      }

      // Combine existing images with newly uploaded ones
      const finalImages = [...existingImages, ...newlyUploadedUrls];

      submitStatus.textContent = "Saving letter...";
      const now = new Date().toISOString();

      // 3. Save to Supabase
      if (letterId) {
        // Update existing document
        const { error: updateError } = await supabase
          .from('letters')
          .update({
            folderName: folderName,
            content: content,
            images: finalImages,
            updated_at: now
          })
          .eq('id', letterId);
          
        if (updateError) throw updateError;
        window.location.href = `view-letter.html?user=${user}&id=${letterId}`;
      } else {
        // Create new document
        const { error: insertError } = await supabase
          .from('letters')
          .insert({
            owner: user,
            folder_Name: folderName,
            content: content,
            images: finalImages,
            created_at: now,
            
          });
          
        if (insertError) throw insertError;
        window.location.href = `letters.html?user=${user}`;
      }
    } catch (error) {
      console.error("Error saving letter:", error);
      submitStatus.textContent = "An error occurred while saving: " + (error.message || "Please try again.");
      submitBtn.disabled = false;
    }
  });
});
