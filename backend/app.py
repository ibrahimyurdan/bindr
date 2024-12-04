import os
import openai
from flask import Flask, request, jsonify
from google.cloud import storage, firestore
from PyPDF2 import PdfReader
import firebase_admin
from firebase_admin import credentials
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime
import re

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend-backend communication

# Load Firebase Admin SDK
cred = credentials.Certificate("firebase-key.json")
firebase_admin.initialize_app(cred, {
    "storageBucket": "bindrproject.firebasestorage.app"
})

# Initialize Firestore client
db = firestore.Client.from_service_account_json("firebase-key.json")

# Get Firebase storage bucket
storage_client = storage.Client.from_service_account_json("firebase-key.json")
bucket = storage_client.bucket("bindrproject.firebasestorage.app")

# Initialize OpenAI API
openai.api_key = os.getenv("OPENAI_API_KEY")


# Route: Ask GPT-4 a question
@app.route('/ask', methods=['POST'])
def ask_gpt():
    data = request.get_json()
    question = data.get('question', "")
    filename = data.get('filename', "")  # Filename associated with the question

    if not question.strip():
        return jsonify({"error": "No question provided."}), 400

    try:
        # Retrieve file content from Firestore if filename is provided
        file_content = ""
        if filename:
            doc_ref = db.collection("documents").document(filename)
            doc = doc_ref.get()
            if doc.exists:
                file_content = doc.to_dict().get("content", "")
            else:
                return jsonify({"error": f"No document found for filename: {filename}"}), 404

        # Combine file content with user question
        prompt = f"Here is the content of the uploaded file:\n{file_content}\n\nQuestion: {question}"

        # Call GPT-4 API
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        answer = response.choices[0].message["content"]
        return jsonify({"response": answer}), 200

    except Exception as e:
        print(f"Error while calling GPT-4: {e}")
        return jsonify({"error": f"An error occurred while contacting GPT-4: {str(e)}"}), 500


# Route: Upload a file and extract its text
@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"error": "No selected file"}), 400

    # Validate file type (PDF only)
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "Only PDF files are allowed."}), 400

    try:
        # Upload file to Firebase Storage
        blob = bucket.blob(file.filename)
        blob.upload_from_file(file)
        blob.make_public()

        # Extract text from PDF
        file.seek(0)  # Reset file pointer
        reader = PdfReader(file)
        extracted_text = " ".join([page.extract_text() or "" for page in reader.pages])

        # Store extracted text in Firestore
        doc_ref = db.collection("documents").document(file.filename)
        doc_ref.set({
            "filename": file.filename,
            "url": blob.public_url,
            "content": extracted_text
        })

        return jsonify({
            "message": "File uploaded and processed successfully",
            "filename": file.filename,
            "url": blob.public_url,
            "extracted_text_preview": extracted_text[:500]  # Send a preview of the text
        }), 200
    except Exception as e:
        print(f"Error occurred during file upload: {e}")
        return jsonify({"error": f"Failed to process the file: {str(e)}"}), 500


# Route: Search documents by keyword
@app.route("/search", methods=["GET"])
def search_documents():
    query = request.args.get("q", "")
    if not query.strip():
        return jsonify({"error": "Query parameter 'q' is required."}), 400

    try:
        # Search Firestore for matching documents
        docs = db.collection("documents").stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            if query.lower() in data.get("content", "").lower():
                snippet = data["content"][:500]  # Return a snippet
                results.append({
                    "filename": data["filename"],
                    "url": data["url"],
                    "snippet": snippet
                })

        return jsonify({"results": results}), 200
    except Exception as e:
        print(f"Error occurred during search: {e}")
        return jsonify({"error": f"Failed to search documents: {str(e)}"}), 500

@app.route("/extract-dates", methods=["POST"])
def extract_dates():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"error": "No selected file"}), 400

    # Validate file type (PDF only)
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "Only PDF files are allowed."}), 400

    try:
        # Extract text from PDF
        file.seek(0)  # Reset file pointer
        reader = PdfReader(file)
        extracted_text = " ".join([page.extract_text() or "" for page in reader.pages])

        # Regex to extract dates (format: MM/DD/YYYY, Month Day, YYYY, etc.)
        date_pattern = r"(\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:,\s+\d{4})?)"
        found_dates = re.findall(date_pattern, extracted_text)

        # Add logic to associate dates with events (basic example)
        events = []
        for date in found_dates:
            events.append({"date": date, "event": "Event description"})  # Placeholder for event text extraction

        return jsonify({"dates": events}), 200
    except Exception as e:
        print(f"Error extracting dates: {e}")
        return jsonify({"error": f"Failed to extract dates: {str(e)}"}), 500

if __name__ == "__main__":
    # Ensure Google Application Credentials are set
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "firebase-key.json"
    app.run(debug=True)
