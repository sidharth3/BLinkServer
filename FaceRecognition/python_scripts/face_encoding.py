#!/usr/bin/env python3
'''
usage: python filename.py image_path user_name
output: face_encoding array


'''

import face_recognition
import json
import numpy as np
from PIL import Image, ImageDraw
from IPython.display import display
import argparse 


def argParser(): # arg parser
	parser = argparse.ArgumentParser(description ="Process image path")
	parser.add_argument('image_path', type=str, help='Input path of the image')
	# parser.add_argument('user_name', type=str, help='Input name of user')

	return parser.parse_args()

def main():
	arg = argParser()

	# image load and encode
	user_img = face_recognition.load_image_file(arg.image_path)
	user_img_encoding = face_recognition.face_encodings(user_img)[0]
	user_img_encoding_jsoned = user_img_encoding.tolist()

	# print the encoded image
	print(user_img_encoding_jsoned)
	


if __name__=='__main__':
    main()