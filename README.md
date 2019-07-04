# Termometer_example
Example for how to make a IOT connected temperature measurement unit with ESP 8266, AWS and VUE

## Structure

### AWS_Lambda (Backend)
All the lambda functions used in the project.
A image over API-gateway, another over API-gateway stagepart and one over the dynamoDB (Latest-data column is part of the dynamoDB but is not included in the picture).

### Vue_frontend (Frontend)
Frontend made in vue with vuex, axios and vuetify.

### ESP8266	
Code for the microcontroller

## Site
[Frontend hosted on a AWS S3 Bucket](https://iotabbvueaws.s3.amazonaws.com/index.html)

## Explanation video
A video made in swedish where i explain the code.
[Titta på videon](https://web.microsoftstream.com/embed/video/4e425f58-a8e8-4895-a923-fb813450cba0)

