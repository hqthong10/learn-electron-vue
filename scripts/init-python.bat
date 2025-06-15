@echo off
python -m venv pythonenv
call pythonenv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
