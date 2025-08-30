import argparse
import re
import time
import os
from dotenv import load_dotenv
from google.cloud import vision
from google.cloud import storage


def async_detect_document(gcs_source_uri, gcs_destination_uri):
    """Performs asynchronous OCR from a PDF in GCS."""
    print(f"Starting OCR process for '{gcs_source_uri}'...")

    # Supported mime_types are: 'application/pdf' and 'image/tiff'
    mime_type = "application/pdf"

    # How many pages should be grouped into each json output file.
    batch_size = 5

    client = vision.ImageAnnotatorClient()

    feature = vision.Feature(type_=vision.Feature.Type.DOCUMENT_TEXT_DETECTION)

    gcs_source = vision.GcsSource(uri=gcs_source_uri)
    input_config = vision.InputConfig(gcs_source=gcs_source, mime_type=mime_type)

    gcs_destination = vision.GcsDestination(uri=gcs_destination_uri)
    output_config = vision.OutputConfig(
        gcs_destination=gcs_destination, batch_size=batch_size
    )

    async_request = vision.AsyncAnnotateFileRequest(
        features=[feature], input_config=input_config, output_config=output_config
    )

    operation = client.async_batch_annotate_files(requests=[async_request])

    print("Waiting for the OCR operation to finish...")
    operation.result(timeout=420)
    print("OCR operation finished.")


def write_gcs_to_local_file(bucket_name, gcs_prefix, local_output_file):
    """Writes the content of GCS output files to a local file."""
    print(f"Consolidating results into '{local_output_file}'...")
    storage_client = storage.Client()
    bucket = storage_client.get_bucket(bucket_name)

    # List all blobs that start with the prefix
    blob_list = list(bucket.list_blobs(prefix=gcs_prefix))
    
    with open(local_output_file, "w", encoding="utf-8") as outfile:
        for blob in blob_list:
            # Check if the blob is a json file
            if ".json" in blob.name:
                json_string = blob.download_as_string()
                response = vision.AnnotateFileResponse.from_json(json_string)
                
                # Each page has its own response
                for page_response in response.responses:
                    annotation = page_response.full_text_annotation
                    if annotation:
                        outfile.write(annotation.text)
                        outfile.write("\n\n--- Page Break ---\n\n")

    print("Successfully wrote OCR results to local file.")


def upload_to_gcs(bucket_name, file_path, gcs_filename):
    """Uploads a file to the given GCS bucket."""
    print(f"Uploading '{os.path.basename(file_path)}' to bucket '{bucket_name}'...")
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(gcs_filename)
    blob.upload_from_filename(file_path)
    print("Upload complete.")
    return f"gs://{bucket_name}/{gcs_filename}"


def cleanup_gcs(bucket_name, gcs_prefix, gcs_filename):
    """Removes the uploaded PDF and the OCR output from GCS."""
    print("Cleaning up files from Google Cloud Storage...")
    storage_client = storage.Client()
    bucket = storage_client.get_bucket(bucket_name)
    
    # Delete the source PDF
    bucket.blob(gcs_filename).delete()

    # Delete the output JSON files
    blobs_to_delete = list(bucket.list_blobs(prefix=gcs_prefix))
    for blob in blobs_to_delete:
        blob.delete()
        
    print("Cleanup complete.")


def main():
    """Main function to orchestrate the PDF OCR process."""
    # Load environment variables from a .env file if it exists
    load_dotenv()

    # ---> NEW: Add a check to verify credentials are loaded <---
    if not os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
        print("\n--- ERROR ---")
        print("Could not find the GOOGLE_APPLICATION_CREDENTIALS environment variable.")
        print("Please ensure you have a '.env' file in the same directory as this script.")
        print("The '.env' file should contain the line:")
        print('GOOGLE_APPLICATION_CREDENTIALS="C:\\path\\to\\your\\credentials.json"')
        print("-------------\n")
        return
        
    parser = argparse.ArgumentParser(
        description="Extract text from a PDF using Google Vision API."
    )
    parser.add_argument("pdf_path", help="The local path to the PDF file.")
    parser.add_argument("bucket_name", help="Your Google Cloud Storage bucket name.")
    parser.add_argument("output_file", help="The name for the local output text file.")
    args = parser.parse_args()

    # Generate unique names for GCS objects to avoid collisions
    timestamp = int(time.time())
    pdf_filename = os.path.basename(args.pdf_path)
    gcs_filename = f"ocr-input/{timestamp}-{pdf_filename}"
    gcs_output_prefix = f"ocr-output/{timestamp}-{pdf_filename}/"
    
    gcs_source_uri = upload_to_gcs(args.bucket_name, args.pdf_path, gcs_filename)
    gcs_destination_uri = f"gs://{args.bucket_name}/{gcs_output_prefix}"

    try:
        async_detect_document(gcs_source_uri, gcs_destination_uri)
        write_gcs_to_local_file(args.bucket_name, gcs_output_prefix, args.output_file)
    finally:
        cleanup_gcs(args.bucket_name, gcs_output_prefix, gcs_filename)

if __name__ == "__main__":
    main()
