"""
ML Inference Service — TAQA Anomaly Criticality Predictor

Serves a trained XGBoost multi-output regression pipeline via FastAPI.
The model predicts three criticality dimensions from French-language anomaly text:
  - Disponibilité  (availability impact)
  - Process Safety (safety impact)
  - Fiabilité Intégrité (reliability/integrity impact)

Criticité is derived as the sum of the three predicted scores.

Endpoint: POST /predict
  Accepts an .xlsx or .csv file, preprocesses text columns, and returns
  per-row predictions alongside the original data.
"""

from io import BytesIO

from fastapi import FastAPI, File, UploadFile
import joblib
import pandas as pd

from unidecode import unidecode
import string
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import nltk
import re

# Download required NLTK data at startup
try:
    nltk.download('stopwords', quiet=True)
    nltk.download('punkt', quiet=True)
    nltk.download('punkt_tab', quiet=True)
except Exception as e:
    print(f"Warning: could not download NLTK data: {e}")

app = FastAPI(
    title="TAQA Anomaly Criticality Predictor",
    description="Predicts criticality scores for industrial equipment anomalies using an XGBoost pipeline.",
    version="1.0.0",
)

model = joblib.load("xgb_multioutput_pipeline_2.pkl")


def preprocess_french(text: str) -> str:
    """
    Clean and tokenize a French-language text field.

    Strips accents, punctuation, stopwords, digits, and single-character tokens
    so the text is ready for TF-IDF vectorisation.
    """
    if pd.isna(text):
        return ""

    try:
        french_stopwords = set(stopwords.words('french'))
    except LookupError:
        french_stopwords = set()

    text = unidecode(text.lower())
    text = text.translate(str.maketrans('', '', string.punctuation))

    try:
        tokens = word_tokenize(text, language='french')
    except LookupError:
        tokens = text.split()

    tokens = [t for t in tokens if t not in french_stopwords and len(t) > 1 and not t.isdigit()]
    return ' '.join(tokens)


def preprocess_column_name(col: str) -> str:
    """
    Normalise a column header to lowercase snake_case with no special characters.
    Used to make uploaded file columns match the pipeline's expected feature names.
    """
    col = col.lower()
    col = unidecode(col)
    col = re.sub(r'[^\w\s]', '', col)
    col = re.sub(r'\s+', '_', col.strip())
    return col


@app.get("/")
def health_check():
    """Simple liveness check."""
    return {"status": "ok"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Run anomaly criticality predictions on an uploaded spreadsheet.

    Accepts .xlsx or .csv files. Each row must contain at minimum:
      - description
      - description_de_lequipement
      - systeme
      - section_proprietaire

    Returns a list of objects, each with:
      - original_data: the raw row values
      - predictions: {Disponibilité, Process Safety, Fiabilité Intégrité, Criticité}
    """
    try:
        content = await file.read()

        if file.filename.endswith('.xlsx'):
            df = pd.read_excel(BytesIO(content))
        elif file.filename.endswith('.csv'):
            df = pd.read_csv(content)
        else:
            return {"error": "File must be .xlsx or .csv format"}

        df.columns = [preprocess_column_name(col) for col in df.columns]
        df.dropna(inplace=True)

        required_cols = [
            "description",
            "description_de_lequipement",
            "systeme",
            "section_proprietaire",
        ]
        if not all(col in df.columns for col in required_cols):
            return {
                "error": (
                    "File must contain the columns: "
                    + ", ".join(required_cols)
                )
            }

        results = []

        for _, row in df.iterrows():
            row_data = row.to_dict()
            pred_df = pd.DataFrame([row_data])

            # Preprocess free-text columns before feeding the pipeline
            pred_df['clean_description'] = pred_df['description'].apply(preprocess_french)
            pred_df['clean_description_equipment'] = pred_df['description_de_lequipement'].apply(preprocess_french)
            pred_df['clean_section_proprietaire'] = pred_df['section_proprietaire'].apply(preprocess_french)

            pred_df = pred_df.drop(
                ['description', 'description_de_lequipement', 'section_proprietaire'],
                axis=1,
            )

            predictions = model.predict(pred_df)

            disponibilite = float(predictions[0][0])
            process_safety = float(predictions[0][1])
            fiabilite_integrite = float(predictions[0][2])

            results.append({
                "original_data": row_data,
                "predictions": {
                    "Disponibilité": disponibilite,
                    "Process Safety": process_safety,
                    "Fiabilité Intégrité": fiabilite_integrite,
                    "Criticité": disponibilite + process_safety + fiabilite_integrite,
                },
            })

        return {"filename": file.filename, "results": results}

    except Exception as e:
        print(e)
        return {"error": str(e)}
