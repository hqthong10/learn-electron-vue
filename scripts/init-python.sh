#!/bin/bash

# 1. Tạo môi trường ảo
python -m venv pythonenv

# 2. Kích hoạt venv
source pythonenv/bin/activate

# 3. Cài thư viện cần thiết
pip install --upgrade pip
pip install -r requirements.txt
