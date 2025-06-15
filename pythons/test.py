import easyocr
import cv2
import numpy as np
import base64
import json
import sys
import re


if __name__ == "__main__":
    reader = easyocr.Reader(['vi', 'en'])
