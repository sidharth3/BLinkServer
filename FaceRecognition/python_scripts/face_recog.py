#!/usr/bin/env python3
'''
usage: python filename.py image_path 
output: image with label
		json txt output

Update json_path inside main()

'''

import face_recognition
import json
import numpy as np
from PIL import Image, ImageDraw
from IPython.display import display
import matplotlib.pyplot as plt
import argparse 

def getKey( img_dict, value ):
	for i in img_dict:
		if np.array_equal(img_dict[i], value):
			return i

def argParser(): # arg parser
	parser = argparse.ArgumentParser(description ="Process image path")
	parser.add_argument('image_path', type=str, help='Input path of the selfie')

	return parser.parse_args()

def jsonPrint(connector_ls):
	json_arr = []
	idx = 1
	for person1 in connector_ls[:len(connector_ls)-1]:
		for person2 in connector_ls[idx:]:
			json_arr.append([person1,person2])
		idx+=1
	print(json_arr)



def main():
	json_path = 'face_encoding_library.json'
	connector_ls = []

	arg=argParser()
	#load image
	selfie_img = face_recognition.load_image_file(arg.image_path)
	face_locations = face_recognition.face_locations(selfie_img)
	face_encodings = face_recognition.face_encodings(selfie_img, face_locations)

	# Convert the image to a PIL-format image so that we can draw on top of it with the Pillow library
	pil_img = Image.fromarray(selfie_img)
	draw = ImageDraw.Draw(pil_img)

	#get dictionary
	with open(json_path, 'r') as f:
	    json_text = f.read()
	img_dict =  json.loads(json_text)

	for user_name in img_dict:
		img_dict[user_name] = np.array(img_dict[user_name])

	known_face_encodings = list(img_dict.values())

	# Loop through each face found in the unknown image
	for (top,right,bottom,left), face_encoding in zip(face_locations, face_encodings):
		matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
		name = "Unknown"

		face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
		best_match_idx = np.argmin(face_distances)
		if matches[best_match_idx]:
			name = getKey(img_dict, known_face_encodings[best_match_idx])
			connector_ls.append(name)
		
		# Draw a box around the face using the Pillow module
		draw.rectangle(((left, top), (right, bottom)), outline=(0, 0, 255))

	    # Draw a label with a name below the face
		text_width, text_height = draw.textsize(name)
		draw.rectangle(((left, bottom - text_height - 10), (right, bottom)), fill=(0, 0, 255), outline=(0, 0, 255))
		draw.text((left + 6, bottom - text_height - 5), name, fill=(255, 255, 255, 255))


	# Remove the drawing library from memory as per the Pillow docs
	del draw

	jsonPrint(connector_ls)
	# Display the resulting image UNCOMMENT TO SEE
	# plt.imshow(pil_img)
	# plt.show()

if __name__=='__main__':
    main()