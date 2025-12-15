#!/bin/bash

# Script to fetch CSV data from a public Google Sheet and save it to public/data/cap.csv
#
# Usage:
#   ./scripts/fetch-data.sh

SHEET_ID="${1:-${GOOGLE_SHEET_ID}}"
SHEET_URL="https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv"

curl -L -o public/data/cap.csv "$SHEET_URL"