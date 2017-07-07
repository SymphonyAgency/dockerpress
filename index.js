#!/usr/bin/env node
const program = require('commander');
const prompt = require('prompt');
const fs = require('fs')
const path = require('path')
program.version('1.0.0')

const initializeSchema = {
    properties: {
        containerName: {
            message: 'Please enter a unique name for the docker container',
            required: true
        },
        // projectType: {
        // 	message : 'Enter theme (default) or plugin',
        // 	required: false,
        // 	default:'theme'
        // },
        dockerImageName: {
            message: 'Enter the name of the DockerPress image (default: symphonyagency:wordpress)',
            required: false,
            default: 'symphonyagency:wordpress'
        },
        // themeFolderName: {
        // 	message : 'Enter the name of the theme folder.  Note that the default will be erased using some backup apps',
        // 	required: false,
        // 	default:'site-theme'
        // },
        primaryMap: {
            message: 'Enter the primary folder mapping (ex: /wp-content/themes/mytheme)',
            required: false,
            default: false
        },
        siteTitle: {
            message: 'Enter the title for the wordpress site',
            required: false,
            default: 'My WordPress Site'
        },
        wpAdminUser: {
            message: 'Enter the WordPress admin username',
            required: false,
            default: 'developer'
        },
        wpAdminPassword: {
            message: 'Enter the WordPress admin password',
            required: false,
            default: 'password'
        },
        wpAdminEmail: {
            message: 'Enter the WordPress admin Email',
            required: false,
            default: 'developer@symphonyagency.com'
        }
    }
}


function initialize(cmd, options) {
    let configDestintion = path.join(process.cwd(), 'dockerpress.json')
    console.log('Initializing DockerPress')
    prompt.start()
    prompt.get(initializeSchema, function (err, result) {
        console.log(result)
        result.mappings = []
        console.log()
        fs.writeFileSync(configDestintion, JSON.stringify(result, null, 4))
    })
}

function run(cmd, options) {
    require('./setup.js')
}

program
    .command('init')
    .description('Initialize DockerPress')
    .action(initialize)

program
    .command('run')
    .description('Initialize DockerPress')
    .action(run)

program.parse(process.argv);
