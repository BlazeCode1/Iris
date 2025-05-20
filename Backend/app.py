import time
from fastapi import FastAPI, Body, HTTPException
from fastapi.responses import JSONResponse
from tensorflow.keras import models
import numpy as np
import tensorflow as tf
import base64
from io import BytesIO
import cv2
from PIL import Image
from fastapi.middleware.cors import CORSMiddleware
import matplotlib.pyplot as plt


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the path to the model
path = "./model/model.h5"  # Ensure this path is correct relative to your server's run location

# Load the model
model = models.load_model(path)

def occlusion_sensitivity_map(model, image, original_img, patch_size=20, stride=20, class_index=None):
    """
    Computes occlusion sensitivity by sliding a patch over the image and
    measuring the change in the model's predicted score for a given class.

    Arguments:
    ----------
    model : tf.keras.Model
        The trained model to interpret.
    image : np.array
        Preprocessed input image with shape (1, H, W, 3).
    original_img : np.array
        Resized image in RGB format (H, W, 3) for visualization.
    patch_size : int
        The size of the occluding square patch (e.g., 20 pixels).
    stride : int
        Step size to move the patch each time.
    class_index : int (optional)
        Which class index’s confidence to track. If None, use top predicted class.

    Returns:
    --------
    heatmap : np.array
        A 2D array (H, W) showing the sensitivity scores.
    """
    # Ensure input has a batch dimension
    if len(image.shape) == 3:
        image = np.expand_dims(image, axis=0)

    # Get the original prediction
    preds = model.predict(image)
    if class_index is None:
        class_index = np.argmax(preds[0])
    original_score = preds[0][class_index]

    # Prepare a heatmap to store the drop in score
    _, H, W, C = image.shape
    heatmap = np.zeros((H, W), dtype=np.float32)

    for y in range(0, H, stride):
        for x in range(0, W, stride):
            # Make a copy of the original image
            occluded_image = image.copy()

            # Define patch boundaries
            y1, y2 = y, min(y + patch_size, H)
            x1, x2 = x, min(x + patch_size, W)

            # Occlude the region (e.g., set to 0)
            occluded_image[0, y1:y2, x1:x2, :] = 0.0

            # Predict again
            preds_occ = model.predict(occluded_image)
            occluded_score = preds_occ[0][class_index]

            # Calculate drop in score
            score_drop = original_score - occluded_score

            # Record the drop in the heatmap
            heatmap[y1:y2, x1:x2] += score_drop

    # Normalize heatmap to [0, 1]
    heatmap -= heatmap.min()
    if heatmap.max() > 0:
        heatmap /= heatmap.max()

    # Convert the original image to uint8 for proper visualization
    original_img_uint8 = (original_img * 255).astype(np.uint8)
    heatmap_3ch = cv2.applyColorMap((heatmap*255).astype(np.uint8), cv2.COLORMAP_JET)
    heatmap_3ch = cv2.cvtColor(heatmap_3ch, cv2.COLOR_BGR2RGB)
    blended = cv2.addWeighted(original_img_uint8, 0.6, heatmap_3ch, 0.4, 0)


    # Create a figure with subplots
    fig, axes = plt.subplots(1, 2, figsize=(12, 6))  # 1 row, 2 columns
    fig.suptitle("Occlusion Sensitivity Map for the Results", fontsize=20, fontweight="bold")

    # Plot the original image
    axes[0].imshow(original_img_uint8)
    axes[0].axis("off")
    axes[0].set_title("Original Image", fontsize=14)

    # Plot the heatmap overlay
    axes[1].imshow(blended)
    axes[1].axis("off")
    axes[1].set_title("Regions of Interest Identified by the Model", fontsize=14)

    



# Save the figure as an image file
    output_filename = f"{int(time.time())}.png"  # Using current timestamp as a unique name
    output_path = f"./public/heatmaps/{output_filename}"    
    plt.tight_layout()
    plt.savefig(output_path, bbox_inches="tight")
    output_path = f"/heatmaps/{output_filename}"
    plt.close()  # Close the plot to free memory

    return output_path  



# Function to preprocess and predict
def preprocess_and_predict(image, model):
    """
    Combines all preprocessing steps and predicts the class probabilities and final prediction.
    
    Args:
        image : image
        model : trained model.
    
    Returns:
        dict: Class probabilities and final predicted class.
    """

    # Ensure image is loaded correctly
    if image is None:
        raise ValueError(f"Image not found or invalid path: {image_path}")

    # Step 1: Apply Median Filter
    lab_image = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab_image)
    median_filtered_l = cv2.medianBlur(l, 5)

    # Step 2: Apply CLAHE
    clahe = cv2.createCLAHE(clipLimit=7.0, tileGridSize=(32, 32))
    clahe_l = clahe.apply(median_filtered_l)
    lab_enhanced = cv2.merge((clahe_l, a, b))
    enhanced_image = cv2.cvtColor(lab_enhanced, cv2.COLOR_LAB2BGR)

    # Step 3: Remove Black Background
    gray = cv2.cvtColor(enhanced_image, cv2.COLOR_BGR2GRAY)
    _, binary_mask = cv2.threshold(gray, 30, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(binary_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if contours:
        largest_contour = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest_contour)
        cropped_image = enhanced_image[y:y+h, x:x+w]
        mask = np.zeros_like(cropped_image)
        (center_x, center_y), radius = cv2.minEnclosingCircle(largest_contour)
        center = (int(center_x - x), int(center_y - y))
        cv2.circle(mask, center, int(radius), (255, 255, 255), thickness=-1)
        enhanced_image = cv2.bitwise_and(cropped_image, mask)

    # Step 4: Resize and Normalize
    resized_image = cv2.resize(enhanced_image, (600, 600))
    normalized_image = resized_image / 255.0
    resized_image = cv2.cvtColor(resized_image, cv2.COLOR_BGR2RGB)
    input_image = np.expand_dims(normalized_image, axis=0)

    # Step 5: Predict
    predictions = model.predict(input_image)[0]
    class_names = ["Advanced DR", "Early DR", "Healthy"]
    prediction_dict = {class_names[i]: float(predictions[i]) for i in range(len(class_names))}
    confidence_score = float(np.max(predictions))
    final_prediction = class_names[np.argmax(predictions)]
    



    return {
        "class_probabilities": prediction_dict,
        "final_prediction": final_prediction,
        "resized image": (resized_image * 255).astype(np.uint8),
        "confidence_score": confidence_score,
    }




@app.post("/predict/")
async def predict(image: str = Body(..., embed=True)):
    """
    Predict the class probabilities of an uploaded image sent as a base64 string.
    """
    try:
        if not image:
            raise HTTPException(status_code=422, detail="No image data provided.")
        
        # Decode base64 image
        try:
            image_bytes = base64.b64decode(image)
            image = Image.open(BytesIO(image_bytes))
        except Exception as decode_error:
            raise HTTPException(status_code=422, detail="Invalid Base64 image string.") from decode_error

        # Convert the image to a format that OpenCV can work with
        opencv_image = np.array(image)
        opencv_image = cv2.cvtColor(opencv_image, cv2.COLOR_RGB2BGR)  # Convert RGB to BGR
        
        # Call the preprocessing and prediction function
        prediction_results = preprocess_and_predict(opencv_image, model)
        input_image = np.expand_dims(prediction_results["resized image"]/255.0, axis=0)
        heatmap = occlusion_sensitivity_map(model,input_image, prediction_results["resized image"])

        return JSONResponse(
            content={
                "predicted_class": prediction_results["final_prediction"],
                "class_probabilities": prediction_results["class_probabilities"],
                "confidence_score": prediction_results["confidence_score"],
                "heatmap": heatmap,
            }
        )
    except HTTPException as http_error:
        return JSONResponse(content={"error": http_error.detail}, status_code=http_error.status_code)
    except Exception as e:
        return JSONResponse(content={"error": f"Internal Server Error: {str(e)}"}, status_code=500)
