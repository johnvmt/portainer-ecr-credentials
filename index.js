const AWS = require('aws-sdk');
const PortainerClient = require('portainer-api-client');

const requiredEnvVars = [
	'AWS_ACCESS_KEY_ID',
	'AWS_SECRET_ACCESS_KEY',
	'AWS_REGION',
	'PORTAINER_URL',
	'PORTAINER_USERNAME',
	'PORTAINER_PASSWORD',
	'REGISTRY_ID'
];

requiredEnvVars.forEach(function(requiredEnvVar) {
	if(typeof process.env[requiredEnvVar] !== 'string')
		throw new Error('Missing required Environment Variable "' + requiredEnvVar + '"');
});

const registryId = process.env.REGISTRY_ID;
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const awsRegion = process.env.AWS_REGION;
const registryUrl = registryId + '.dkr.ecr.' + awsRegion + '.amazonaws.com';
const portainerUrl = process.env.PORTAINER_URL;
const portainerUsername = process.env.PORTAINER_USERNAME;
const portainerPassword = process.env.PORTAINER_PASSWORD;

AWS.config.update({
	accessKeyId: awsAccessKeyId,
	secretAccessKey: awsSecretAccessKey,
	region: awsRegion
});

const ecr = new AWS.ECR({
	apiVersion: '2015-09-21'
});

const portainer = new PortainerClient(portainerUrl, portainerUsername, portainerPassword);

updateCredentialsAndLog();
setInterval(updateCredentialsAndLog, 11 * 3600 * 1000); // Update every 11 hours

function updateCredentialsAndLog() {
	updateCredentials()
	.then(function(result) {
		console.log(new Date(), "Update successful");
	})
	.catch(function(error) {
		console.error(new Date(), "Update error", error);
	});
}

async function updateCredentials() {
	return new Promise(async function(resolve, reject) {
		try {
			let registries = await portainer.callApiWithKey('get', '/api/registries');
			let awsCredentials = await ecrAuthorizationToken();

			let registry = registries.filter(function(registry) {
				return registry.URL.toLowerCase() === registryUrl.toLowerCase();
			})[0];

			if(typeof registry === 'undefined') {
				registry = {
					Name: 'ECR-' + registryId,
					URL: registryUrl,
					Authentication: true,
					Username: awsCredentials.username,
					Password: awsCredentials.password
				};

				resolve(await portainer.callApiWithKey('POST', '/api/registries', registry));
			}
			else {
				// get new password here
				registry.Username = awsCredentials.username;
				registry.Password = awsCredentials.password;

				resolve(await portainer.callApiWithKey('PUT', '/api/registries/' + registry.Id, registry));
			}
		}
		catch(error) {
			reject(error);
		}
	});
}

async function ecrAuthorizationToken() {
	let ecrParams = (typeof registryId !== 'undefined' && registryId !== null) ? {registryIds: [registryId]} : {};

	return new Promise(function(resolve, reject) {
		ecr.getAuthorizationToken(ecrParams, function(err, data) {
			if(err)
				reject(err);
			else {
				try {
					let authorizationData = data.authorizationData[0];

					let authorizationTokenDecoded = Buffer.from(authorizationData.authorizationToken, 'base64').toString();
					let authorizationParts = authorizationTokenDecoded.split(':');
					resolve({
						username: authorizationParts[0],
						password: authorizationParts[1]
					});
				}
				catch(err) {
					reject(err);
				}
			}
		});
	});
}