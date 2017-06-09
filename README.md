# assets-node-server
Server to provide fast assets to the browser
In this days, it is not needed for MVC any more on the backend.
It is normal to have your frontend project and your backend project separated.
Your backend will provide all your data needs, so why bother having data functionality on the frontend project?
Instead let’s have a frontend server meant for it.
Also, this is meant to create frontend projects that goes away from the SPA pattern. (I will write justifications latter)

# Features 
* Provide static files
* Provide HTML pages
* HTML Layouts/Master Pages
* HTML Components
* Page/Layout Regions
* Sample Admin Template  

# Pending Features 
* Conditional Regions (to deal more easy with the dev, staging and production environments)
* JavaScript and CSS Intelligent Bundles
* File handler and optimizations
* Pictures handler and optimizations
* Fake API for prototyping

# Sample Admin Template  
Thanks to [AdminLTE](https://adminlte.io/) for providing an excellent admin template free to the comunity.
To test our server, we added the template and you will see that it renders fast.
On the menu "Examples/Blank Page" you will see that it will render normally, but it has been changed to take advantage of the layouts and regions functionality. To see it go to the path: /pages/pages/examples/blank.html and the layout: /layouts/template.html

