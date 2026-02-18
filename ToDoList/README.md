### **ToDoList App – Ionic + Angular + Firebase**



Aplicación desarrollada con Ionic 8 + Angular 20 + Firebase Remote Config.

Incluye:

&nbsp;- Feature Flags con Firebase Remote Config

&nbsp;- Almacenamiento local

&nbsp;- Soporte para Android e iOS (Cordova)



##### **Requisitos Previos (Instalación desde cero)**

Todas los requisitos son obligatorios para levantar la aplicación, sigue estos pasos en orden.



###### **Instalar Node.js**

Descargar desde:

👉 https://nodejs.org/

Instalar la versión LTS.

Instalar Ionic CLI: npm install -g @ionic/cli

Instalar Angular CLI: npm install -g @angular/cli



###### **(Opcional para Android) Instalar Android Studio**

Descargar:

👉 https://developer.android.com/studio



**Durante la instalación:**

Instalar Android SDK

Instalar Android SDK Build Tools

Instalar Android SDK Platform



**Agregar variables de entorno:** 

ANDROID\_HOME = C:\\Users\\TU\_USUARIO\\AppData\\Local\\Android\\Sdk

ANDROID\_SDK\_ROOT = C:\\Users\\TU\_USUARIO\\AppData\\Local\\Android\\Sdk



**Clonar el Proyecto:**

git clone https://github.com/davidiosdeveloper/ionic-todolist-challenge.git

cd ToDoList

Instalar Dependencias: npm install



**Ejecutar en Android**

ionic cordova platform add android

ionic cordova build android

ionic cordova run android



**Ejecutar en iOS (Solo Mac, requiere xcode instalado)**

ionic cordova platform add ios

ionic cordova build ios

ionic cordova run ios


**Nota importante**

Solicitar los datos de enviroment antes de iniciar la aplicacion




