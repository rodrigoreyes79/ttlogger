TTlogger
========

Time Tracking logging app. 

![TTLogger image]
(https://raw.githubusercontent.com/rodrigoreyes79/ttlogger/master/images/ttlogger.png)

### Update: Mar 12, 2015
Version 0.2 is out and gone are the days of multiple windows!!!

TTLogger now opens only one window and allows you to enter your log for a specific time by selecting it from a select on top of the window. Give it a try!!!

# How it works
The text entered is saved inside the same folder where TTLogger resides. The logged information will be saved as a simple text file.

![Folder image]
(https://raw.githubusercontent.com/rodrigoreyes79/ttlogger/master/images/folder.png)

Inside each file, each entry will start with the time of day the window was initially opened.

![Log file image]
(https://raw.githubusercontent.com/rodrigoreyes79/ttlogger/master/images/log.png)

# Installation
1. Download and install node-webkit on your computer following the instructions at https://github.com/rogerwang/node-webkit#downloads.
2. Make sure to add the node-webkit executable to your path.
3. Download or clone the repository.
4. Go to the src folder and execute "nw ."
5. Optional: Update CronJob configuration at the end of the src/js/app.js file.
