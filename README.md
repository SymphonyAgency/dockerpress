#DockerPress

The purpose of this package is to allow wordpress developers to get a theme
loaded into a docker container and ready for development fast.

## Usage
From within the repo run `npm install -g`.  This will install dockerpress globally.

DockerPress requires that there be a dockerpress.json configuration file in the
 theme directory.  This json file should be added to .gitignore if multiple developers
  will have different configurations.
  
  To create a dockerpress.json file run `dockerpress init`
  
  A series of questions will be asked.  Most notably:
  
  - containerName:  This is the unique docker container name for this project
  - themeFolderName:  This will be the name of the theme folder.
  
The rest of the configurations can easily be left as default.

Note that this process will map your theme repository to the theme folder on the Docker VM.
If you intend to use a backup service to mirror your live site (like Updraft Plus), 
 make sure that you do not restore the theme folder!!!  Attempting to install the theme 
 folder results in a bug where the local theme repository files are deleted.
 
 To create the image, container, and run your development site run : `dockerpress run`
 
 From there I recommend using Kitematic to manage the VM.
   
