# Myna-mobile

## About

 The Myna-mobile app is a companion app to the Myna-web form builder. This app is used to conduct surveys that are created in Myna-web. The application is built in AngularJS and compiled for Android/iOS devices using Cordova

## Requirements

Android SDK (To build Myna-mobile for Android apps). (Note: Android studio requires Java)

```bash
snap install android-studio
```

Cordova version 8.1.2. (Note: Corodva requires Node.js)

```bash
npm install cordova@8.1.2
```

## Setup

Clone the repository to your local machine.

```bash
git clone this-repo/myna-mobile.git
```

Change to your project's directoy and run the cordova commmand below to run a version of the application in your web browser.


```bash
cd myna-mobile
cordova platform add browser
```

*Note: You can add any other platforms you want to build the application for, like:* `cordova platform add android`

## Development

To run the application in a development environment, use:

```bash
cordova run browser
```

## Build

To build the mobile app run the following command with the platform you'd like to build for (i.e. Android or IOS.)

```bash
cordova build [platform]
```

## Using The Application

When you first run the app, it will prompt you for the URL of the **Myna-web** instance that it will fetch the surveys from as well as a **connection key**. The connection key is shown on the main page of your **Cohort** in Myna-web on the bottom right of the page.

Once this information is entered the app will download all the surveys involved in your Cohort. After that is complete you can log in as an enumerator and get the device location. On the location page, enter and confirm the school code for the school.
