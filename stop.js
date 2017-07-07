const spawn = require('child_process').spawn;
const options = require('../package.json').localDev;
const Docker = require('dockerode')
const isWindows = require('is-windows');
const tar = require('tar-fs')
const docker = (isWindows()) ? new Docker({socketPath: '//./pipe/docker_engine'}) : new Docker({socketPath: '/var/run/docker.sock'});

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
				console.error('Checking if containerIsRunning failed:  Container not found."')
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
	console.log('Creating image', process.cwd() + '\\docker\\')
	let tarStream = tar.pack(process.cwd() + '\\docker\\');

	docker.buildImage(tarStream, {t: options.imageName}, function (err, stream) {

		if(err) console.log(err)
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
	imageExists(options.imageName, (imageDoesExist) => {
		if (!imageDoesExist) {
			createImage(createContainer)
		} else {
			freeport((err, dockerPort) => {
				docker.createContainer({
					Image       : options.imageName,
					name        : options.name,
					Env         : [
						'WP_URL=localhost:' + dockerPort.toString(),
						'WP_TITLE=' + options.wpTitle,
						'WP_ADMIN_USER=' + options.wpAdminUser,
						"WP_ADMIN_PASSWORD=" + options.wpAdminPassword,
						"WP_ADMIN_EMAIL=" + options.wpAdminEmail
					],
					HostConfig  : {
						Binds: [__dirname + "\\..:/var/www/html/wp-content/themes/site-theme/"],
						PortBindings: {'80/tcp': [{'HostPort': dockerPort.toString()}]},
					}
				}, function (err, container) {
					container.start((err, data) => {
						if (err) {
							console.log(err)
						} else {
							console.log(data)
							console.log("Container", options.name, 'is running at localhost:' + dockerPort)
						}

					})
				})
			});

		}
	})


}

containerExists(options.name, (response) => {
	if (!response) {
		console.log('container does not exist')
	} else {
		console.log('container exists')
		constainerIsRunning(options.name, (running, container) => {
			if (running) {
				let theContainer = docker.getContainer(container.Id)
				theContainer.stop((err, data) => {
					if (err) {
						console.log(err)
					} else {
						console.log(data)
						console.log("Container", options.name, 'has stopped')
					}
				})
			} else {
				console.log('container has already stopped')
			}
		})

	}
})






