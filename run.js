const spawn = require('child_process').spawn;
const options = require('../package.json').localDev;
const freeport = require('freeport')
console.log(__dirname)

freeport((err, mysqlPort) => {
	freeport((err, xdebugPort) => {
		freeport((err, dockerPort) => {
			dockerPort = dockerPort.toString()
			console.log(dockerPort)

			const docker = spawn('docker', ['run', '--name', options.name, '--env-file', __dirname + '\\env.list',
				'-p', dockerPort + ':80', xdebugPort + ':9000', mysqlPort + ':3306', '-v', __dirname + "\\..:/var/www/html/wp-content/themes/site-theme/",
				'-e', 'WP_URL=localhost:' + dockerPort, options.imageName]);

			docker.stdout.on('data', (data) => {
				console.log(`${data}`);
			});

			docker.stderr.on('data', (data) => {
				console.log(`${data}`);
			});

			docker.on('close', (code) => {
				console.log(`child process exited with code ${code}`);
			});

			var cleanExit = function () {
				docker.kill('SIGINT');
				const dockerExit = spawn('docker', ['stop', options.name])
				dockerExit.stdout.on('data', (data) => {
					console.log(`${data}`);
				});

				dockerExit.stderr.on('data', (data) => {
					console.log(`${data}`);
				});
				dockerExit.on('close', (code) => {
					console.log(`child process exited with code ${code}`);
				});
			};
			process.on('SIGINT', cleanExit); // catch ctrl-c
			process.on('SIGTERM', cleanExit); // catch kill
		})
	})
})