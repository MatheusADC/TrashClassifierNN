# <img src="https://github.com/user-attachments/assets/caabfdf0-0f9e-44a3-8200-c6579fe87887" alt="description icon" width="28"> Description
The project aims to use a convolutional neural network to classify trash images.

# Website for creating and training neural networks
[Click here](https://teachablemachine.withgoogle.com/)

# Website for obtaining the database
[Click here](https://www.kaggle.com/datasets)

# <sub><img src="https://img.icons8.com/?size=100&id=6Q2SAdhaPhXM&format=png&color=000000" alt="neural network icon" width="34"></sub> Page
![image](https://github.com/user-attachments/assets/bb130435-0673-4fa2-b897-ef8db6a26cb4)

# <sub><img src="https://img.icons8.com/?size=100&id=nuPce-GYYZeC&format=png&color=000000" alt="neural network icon" width="34"></sub> Commands
### Create package.json
```
npm init -y
```
### Install libraries
```
npm install express multer @tensorflow/tfjs-node @teachablemachine/image
```

> [!TIP]
> If the package.json file already contains the libraries, delete the node_modules folder and run the command `npm i`.

### Run server
```
node server.js
```

> [!CAUTION]
> If you encounter the **ERR_DLOPEN_FAILED** error while running the server, reinstall the libraries and run the command `npm audit fix --force`.
> 
> Suggestion: Use node version **20.10.0**.
