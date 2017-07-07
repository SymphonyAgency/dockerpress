const spawn = require('child_process').spawn;
const Docker = require('dockerode')
const isWindows = require('is-windows');
const freeport = require('freeport')
const tar = require('tar-fs')
const path = require('path')

const options = require(path.join(process.cwd(), 'dockerpress.json'));
const docker = (isWindows()) ? new Docker({socketPath: '//./pipe/docker_engine'}) : new Docker({socketPath: '/var/run/docker.sock'});
var optionsMappings = options.mappings
const primaryMap = options.primaryMap
const mappings = optionsMappings.map((inputPath) => {
    let splitPaths = inputPath.split(':')
    if (path.isAbsolute(splitPaths[0])) {
        return inputPath
    } else {
        return path.normalize(path.join(process.cwd(), splitPaths[0])) + ':' + splitPaths[1]
    }
})
console.log('Mapping to:', mappings)
//check if container exists
function containerExists(containerName, callback) {
    console.log('checking if container exists')
    docker.listContainers({
        all: true
    }, (err, containers) => {
        let containerExists = false
        containers.forEach((container) => {
            if (container.Names[0] === '/' + containerName) {
                containerExists = container.Id
            } else {
                containerExists = false
            }
        })
        callback(containerExists)
    })
}

function constainerIsRunning(containerName, callback) {
    docker.listContainers({
        all: true
    }, (err, containers) => {
        containers.forEach((container) => {
            if (container.Names[0] === '/' + containerName) {
                if (container.State === 'running') {
                    callback(true, container)
                } else {
                    callback(false, container)
                }
            } else {
                console.error('Checking if containerIsRunning failed:  Container not found.  Run:  "npm run setup-site again"')
            }
        })
    })
}


function imageExists(imageName, callback) {
    docker.listImages((err, images) => {
        let imageWasFound = false;
        images.forEach((image) => {
            if (image.RepoTags[0] === imageName) {
                imageWasFound = true;
            }
        })
        if (imageWasFound) {
            callback(true)
        } else {
            callback(false)
        }
    })
}
function createImage(callback) {
    let tarStream = tar.pack(__dirname);

    docker.buildImage(tarStream, {t: options.dockerImageName}, function (err, stream) {

        if (err) console.log(err)
        if (err) return;

        stream.pipe(process.stdout, {end: true});

        stream.on('end', function () {
            console.log('image created')
            callback();
        });
    });
}


function createContainer() {
    console.log('creating container')
    imageExists(options.dockerImageName, (imageDoesExist) => {
        if (!imageDoesExist) {
            createImage(createContainer)
        } else {
            freeport((err, mysqlPort) => {
                freeport((err, dockerPort) => {

                    let bindings = (primaryMap)? [process.cwd() +  primaryMap + ':/var/www/html/' + primaryMap] : []
                    bindings = bindings.concat(mappings)
                    docker.createContainer({
                        Image: options.dockerImageName,
                        name: options.containerName,
                        Env: [
                            'WP_URL=localhost:' + dockerPort.toString(),
                            'WP_TITLE=' + options.siteTitle,
                            'WP_ADMIN_USER=' + options.wpAdminUser,
                            "WP_ADMIN_PASSWORD=" + options.wpAdminPassword,
                            "WP_ADMIN_EMAIL=" + options.wpAdminEmail,
                            "WP_THEME_FOLDER=" + options.themeFolderName
                        ],
                        HostConfig: {
                            Binds: bindings,
                            PortBindings: {
                                '80/tcp': [{'HostPort': dockerPort.toString()}],
                                '3306/tcp': [{'HostPort': mysqlPort.toString()}],
                                '9000/tcp': [{'HostPort': "9000"}]
                            },
                        }
                    }, function (err, container) {
                        if (err) {
                            console.error(err)
                        }
                        container.start({
                            Env: [
                                'LOCAL_IP=0.0.0.0',
                            ]
                        }, (err, data) => {
                            if (err) {
                                console.log(err)
                            } else {
                                console.log(data.stream)
                                console.log("Container", options.containerName, 'is running at localhost:' + dockerPort + ' mysql: ' + mysqlPort)
                            }
                            xdebugIPMap(container)
                        })
                    })
                });
            });
        }
    })


}

containerExists(options.containerName, (response) => {
    if (!response) {
        console.log('container does not exist')
        createContainer()
    } else {
        console.log('container exists')
        constainerIsRunning(options.containerName, (running, container) => {
            if (running) {
                console.log('Container is already running', container.Ports)
            } else {
                console.log('creating container')
                let theContainer = docker.getContainer(container.Id)

                theContainer.start( (err, data) => {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log(data)
                        theContainer.inspect((err, data) => {
                            console.log("Container", options.containerName, 'is running at localhost:', data.HostConfig.PortBindings)
                        })
                        xdebugIPMap(theContainer)
                    }
                })

            }
        })

    }
})


function xdebugIPMap(container) {
    console.log('Running xdebugIPMap');
    var address,
        ifaces = require('os').networkInterfaces();
    for (var dev in ifaces) {
        ifaces[dev].filter((details) => details.family === 'IPv4' && details.internal === false ? address = details.address : undefined);
    }


    const options = {
        Cmd: ['sh', '-C', '/xdebug.sh', address],
        AttachStdout: true,
        AttachStderr: true
    }
    container.exec(options, (err, exec) => {
        console.log('executing xdebugIPMap exec')
        if (err) console.log(err)
        exec.start((err, stream) => {
            console.log('Started xdebugIPMap exec')
            if (err) console.log(err)
            stream.setEncoding('utf8');
            stream.pipe(process.stdout);
        })
    })
}



