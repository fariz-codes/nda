# Node Deployment Assistant @ NDA
**Now deploy node projects from an internet browser**

[![npm Downloads](https://img.shields.io/npm/dm/nda-installer.svg?style=flat-square)](https://www.npmjs.com/package/nda-installer)
[![npm Downloads](https://img.shields.io/npm/dy/nda-installer.svg?style=flat-square)](https://www.npmjs.com/package/nda-installer)

## Installation

Install **NDA** as a global package.

```
npm i nda-installer -g
```

## Tested Operating Systems

- Windows 11, Mac Monterey, RHEL 7.9, Ubuntu 20.04, Cent OS 7, Fedora 35

## Prerequisite

Please complete the following prerequisite before installing the NDA

- Install an internet browser.

- Install NodeJS version >= **7.10.1**.

## About

<img src="https://github.com/fariz-codes/npm-images/blob/master/nda/dashboard-legends.png?raw=true" alt="Dashboard page">

**NDA** helps you to deploy your NodeJS projects in an easier way. Once you configure your project with NDA, then you are only one click away from starting or restarting it.

- Once a project is started using NDA, it will collects the project's logs & also monitors the CPU usage & status of the project.

- Since the projects will be started in a **keep alive** mode, closing the browser window or the terminal (from where the NDA is launched) won't stop your NodeJs projects started by NDA.

**Note** If the machine is restarted or NDA is stopped, all the projects started by the NDA will be stopped.

:pushpin: **Start-on-boot** option is added in version 0.3.0. It will help to run NDA on the system boot.

## How it works

- When you start **NDA**, it will launch a web application in the machine where it's installed.

- From the launched web app, you can handle the deployment of your NodeJS projects.

## Demo

Please click [here](https://youtu.be/JdaDegOhaG0) for a detailed explanation video.

## Feature: Dashboard

This is the launching page of the NDA.

It provides the options to,

- Edit, Delete, Run, Stop & Restart the projects.
- Add a project.
- Clone a project.
- See the project logs.
- Stop all projects (when more than one projects are running).

It has the functionality to,

- Monitor the status of running projects & provide alert if the project got crashed.
- Update the CPU usage of the running projects periodically.

## Feature: Configuration

This page will have the configuration options available for the NDA application.

### Start-on-boot

If this is enabled, NDA application will be started during the system startup

### Launch-on-boot

This will be available, only if the `Start-on-boot` option is enabled.

Once this option is enabled, NDA application will be opened in the default internet browser during the system startup.

### Bind SSL Certificate

Using this option, a SSL certificate can be added to the NDA application.

Once enabled, NDA will be launched with https protocol.

## Feature: Add Project

To start deploying your NodeJS projects, goto to the Add Project page by clicking on the (+) button in the dashboard.

- In the Add Project page, provide your project's - name, folder path, start file path, port, environment variables & cron jobs.

- Please check the information provided in the **info** icon against each inputs in the Add Project page to configure your project without successfully.

## Feature: Logs

NDA stores the logs of running projects in a daily basis. To see all the logs available for a project, click the **Logs** icon under the **Actions** column against the corresponding project in the dashboard. It will navigate you to the logs list page.

- The **logs list page** displays the list of log files created on a daily basis.

- It provides the information like date, size & last modified time of the log files.

- It also provides the options to delete or view the logs of a particular day.

- To view the logs, click on the **date** against each log file. It will navigate you to the logs page.

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

- To get the latest version

```
npm update nda-installer -g
```

- To apply the latest changes

```
nda respawn
```

## CHANGELOG

[See Change Logs](https://github.com/fariz-codes/nda/blob/main/CHANGELOG.md)

## Copyright

<a href="https://www.dmca.com/Protection/Status.aspx?id=eb641eb2-d944-4f08-806d-778e5288c0e3&refurl=https://github.com/fariz-codes/nda" title="DMCA.com Protection Status" class="dmca-badge"> <img src ="https://images.dmca.com/Badges/dmca_protected_25_120.png?ID=eb641eb2-d944-4f08-806d-778e5288c0e3"  alt="DMCA.com Protection Status" /></a>

## License

NDA is licensed under **GNU AGPL-3.0**

For any queries or support, **reach us** at (mailto:fariz.codes@gmail.com)