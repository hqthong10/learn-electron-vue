#!/bin/bash

# 1. Tạo môi trường ảo
python3 -m venv pythonenv

# 2. Kích hoạt venv
source pythonenv/bin/activate

# 3. Cài thư viện cần thiết
pip install --upgrade pip
pip install -r scripts/requirements.txt
