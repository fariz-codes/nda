# Node Deployment Assistant @ NDA
**Now deploy node projects from an internet browser**

[![npm Downloads](https://img.shields.io/npm/dm/nda-installer.svg?style=flat-square)](https://www.npmjs.com/package/nda-installer)
[![npm Downloads](https://img.shields.io/npm/dy/nda-installer.svg?style=flat-square)](https://www.npmjs.com/package/nda-installer)

## Installation

Install **NDA** as a global package.

```
npm i nda-installer -g
```

## Tested platforms

- Windows, Linux, Mac

## Prerequisite

- As NDA is a browser application, an internet browser is required to be installed in your machine. 

[**Note**] If you are using a linux-OS based machine and you cant install a browser in it, then you can run NDA in your machine on some port & do Port Tunneling (Port Forwarding) to other remote machine where you can access the NDA app in browser.

- As NDA uses ES6 scripts, it is required that your machine should be installed with **NodeJS** version greater than or equal to **4.3.2**.

## About

<img src="https://github.com/fariz-codes/npm-images/blob/master/nda/dashboard.png?raw=true">

**NDA** helps you to deploy your NodeJS projects in an easier way. Once you configure your project with NDA, then you are only one click away from starting or restarting it.

- Once a project is started using NDA, it will collects the project's logs & also monitors the CPU usage & status of the project.

- Since the projects will be started in a **keep alive** mode, closing the browser window or the terminal (from where the NDA is launched) won't stop your NodeJs projects started by NDA.

[**Note**] If the machine is restarted or NDA is stopped, it will stop all the projects started by the NDA.

## How it works

- When you start **NDA**, it will launch a web application in the machine where it's installed.

- From the launched web app, you can handle the deployment of your NodeJS projects.

## Feature: Dashboard

This is the launching page of the NDA.

It provides the options to,

- Edit, Delete, Run, Stop & Restart the projects.
- Add a project.
- See the project logs.
- Stop all projects (when more than one projects are running).

It has the functionality to,

- Monitor the status of running projects & provide alert if the project got crashed.
- Update the CPU usage of the running projects periodically.

## Feature: Add Project

To start deploying your NodeJS projects, goto to the Add Project page by clicking on the (+) button in the dashboard.

- In the Add Project page, provide your project's - name, folder path, start file path, port, environment variables & cron jobs.

- Please check the information provided in the **info** icon against each inputs in the Add Project page to configure your project without successfully.

## Feature: Logs

NDA stores the logs of running projects in a daily basis. To see all the logs available for a project, click the **Logs** icon under the **Actions** column against the corresponding project in the dashboard. It will navigate you to the logs list page.

- The **logs list page** displays the list of logs created on a daily basis.

- It provides the log information like log date, file size & updated time.

- It also provides the options to delete & view the logs of a particular day.

- To view the logs, click on the **Logs** icon against the log file. It will navigate you to the logs page.

- **Logs page** displays the log contents based on the date.

- To avoid overload, logs page is implemented with pagination & lazy load. 

- It displays the logs based on the line count selected in the **dropdown** near the **Fetch** button and it will fetch the next set of records when **scrolled**.

- To fetch logs after a certain line, provide the line count in the **text box** near the **Fetch** button & then click on Fetch.

## Available CLI Commands

- To start NDA in 8055 (NDA's default port)

```
nda run
```

- To start NDA in specific port

```
nda run <port>
Example: nda run 9000
```

- To stop NDA

```
nda sleep
```

- To get running status of NDA

```
nda status
```

- To restart NDA & all the services started by it

```
nda respawn
```

## Receiving Updates

- To install the latest version

```
npm i nda-installer -g
```

- To apply the latest changes

```
nda respawn
```

## CHANGELOG

[See Change Logs](https://github.com/fariz-codes/nda/blob/main/CHANGELOG.md)

## Copyright

<a href="//www.dmca.com/Protection/Status.aspx?ID=eb641eb2-d944-4f08-806d-778e5288c0e3" title="DMCA.com Protection Status" class="dmca-badge"> <img src ="https://images.dmca.com/Badges/dmca_protected_25_120.png?ID=eb641eb2-d944-4f08-806d-778e5288c0e3"  alt="DMCA.com Protection Status" /></a>

## License

NDA is licensed under **GNU AGPL-3.0**

For any queries or support, **reach us** at (mailto:nda.author@gmail.com)