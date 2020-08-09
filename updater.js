import AWS from 'aws-sdk';
import PortainerClient from 'portainer-api-client';

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
		throw new Error(`Missing required Environment Variable "${requiredEnvVar}"`);
});

const portainerUrl = process.env.PORTAINER_URL;
const portainerUsername = process.env.PORTAINER_USERNAME;
const portainerPassword = process.env.PORTAINER_PASSWORD;
const registryId = process.env.REGISTRY_ID;
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const awsRegion = process.env.AWS_REGION;
const registryUrl = registryId + '.dkr.ecr.' + awsRegion + '.amazonaws.com';
const registryName = process.env.hasOwnProperty('REGISTRY_NAME') ? process.env.REGISTRY_NAME : 'ECR-' + registryId;

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

async function updateCredentialsAndLog() {
	try {
		await updateCredentials();
		console.log(new Date(), "Update successful");
	}
	catch(error) {
		console.error(new Date(), "Update error", error);
	}
}

async function updateCredentials() {
	let registries = await portainer.callApiWithKey('get', '/api/registries');

	let awsCredentials = await ecrAuthorizationToken();

	let registry = registries.filter(function(registry) {
		return registry.URL.toLowerCase() === registryUrl.toLowerCase();
	})[0];

	if(typeof registry === 'undefined') {
		registry = {
			Name: registryName,
			URL: registryUrl,
			Authentication: true,
			Username: awsCredentials.username,
			Password: awsCredentials.password,
			Type: 1
		};

		return await portainer.callApiWithKey('POST', '/api/registries', registry);
	}
	else {
		// get new password here
		registry.Username = awsCredentials.username;
		registry.Password = awsCredentials.password;

		return await portainer.callApiWithKey('PUT', '/api/registries/' + registry.Id, registry);
	}
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
