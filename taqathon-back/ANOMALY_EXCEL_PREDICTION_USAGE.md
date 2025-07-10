# Anomaly Excel Generation and Prediction Usage

This document explains how to use the new anomaly creation endpoints that generate Excel files and send them for ML predictions.

## New Endpoints Added

### 1. Enhanced POST /anomaly
- **URL**: `POST /anomaly?predict=true`
- **Description**: Creates an anomaly with optional ML predictions
- **Query Parameter**: 
  - `predict` (boolean, optional): Set to `true` to enable ML predictions

### 2. NEW POST /anomaly/create-with-prediction
- **URL**: `POST /anomaly/create-with-prediction`
- **Description**: Creates an anomaly with mandatory ML predictions
- **Features**: 
  - Always generates Excel from input data
  - Always sends to ML service for predictions
  - Fails if ML service is unavailable

## How It Works

1. **Data Input**: You provide anomaly data in the standard format
2. **Excel Generation**: The system converts your data to Excel format with these columns:
   - `description`
   - `description_de_lequipement`
   - `systeme`
   - `date_de_detection_de_lanomalie`
   - `section_proprietaire`
   - `num_equipement`
   - `fiabilite_integrite`
   - `disponibilte`
   - `process_safety`
   - `criticite`
3. **ML Prediction**: Excel file is sent to `http://fastapi:3000/predict`
4. **Data Enhancement**: Predictions are added to the anomaly data:
   - `predictedIntegrity`
   - `predictedDisponibility`
   - `predictedProcessSafety`
   - `predictionsData` (full prediction object)
5. **Database Save**: Enhanced anomaly data is saved to database

## Example Usage

### Using the optional prediction endpoint:

```bash
curl -X POST "http://localhost:3000/anomaly?predict=true" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "description": "Pump malfunction detected",
    "equipementDescription": "Main water pump P-001",
    "equipment": "P-001",
    "system": "Water System",
    "service": "Maintenance",
    "detectionDate": "2025-01-15T10:30:00Z",
    "integrity": 7.5,
    "disponibility": 8.0,
    "processSafety": 6.5,
    "criticality": 8.2
  }'
```

### Using the mandatory prediction endpoint:

```bash
curl -X POST "http://localhost:3000/anomaly/create-with-prediction" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "description": "Valve leak detected",
    "equipementDescription": "Control valve V-205",
    "equipment": "V-205",
    "system": "Control System",
    "service": "Operations",
    "detectionDate": "2025-01-15T14:45:00Z",
    "integrity": 6.0,
    "disponibility": 7.5,
    "processSafety": 5.5,
    "criticality": 7.8
  }'
```

## Response Format

Both endpoints return the created anomaly with additional fields:

```json
{
  "id": 123,
  "description": "Pump malfunction detected",
  "equipementDescription": "Main water pump P-001",
  "equipment": "P-001",
  "system": "Water System",
  "service": "Maintenance",
  "detectionDate": "2025-01-15T10:30:00Z",
  "integrity": 7.5,
  "disponibility": 8.0,
  "processSafety": 6.5,
  "criticality": 8.2,
  "predictedIntegrity": 7.8,
  "predictedDisponibility": 8.3,
  "predictedProcessSafety": 6.9,
  "predictionsData": {
    "Fiabilité Intégrité": 7.8,
    "Disponibilité": 8.3,
    "Process Safety": 6.9,
    "Criticité": 8.5
  },
  "predictionUsed": true,
  "excelGenerated": true,
  "createdAt": "2025-01-15T14:45:00Z",
  "updatedAt": "2025-01-15T14:45:00Z"
}
```

## Error Handling

### Optional Prediction Endpoint (`?predict=true`)
- If ML service fails: Creates anomaly without predictions
- Logs warning but continues execution
- Returns `predictionUsed: false`

### Mandatory Prediction Endpoint (`/create-with-prediction`)
- If ML service fails: Returns 400 Bad Request
- If ML service returns error: Returns 400 Bad Request with error message
- Requires ML service to be available

## Integration with Existing `/anomaly-file-submission`

The new functionality reuses the same ML prediction logic as the existing file submission endpoint, ensuring consistency across the API.

## Dependencies

- **xlsx**: For Excel file generation
- **axios**: For HTTP requests to ML service
- **FormData**: For multipart form data to ML service

## Notes

- Excel files are generated in memory and not saved to disk
- The ML service endpoint is configurable (currently: `http://fastapi:3000/predict`)
- All original anomaly creation functionality remains unchanged
- Backward compatibility is maintained
